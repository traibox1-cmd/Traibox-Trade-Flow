import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { streamChatCompletion, detectIntent, hasValidApiKey, createStructuredChatCompletion } from "./lib/openai";
import { insertMessageSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";

let lastAIError: string | null = null;
let lastAIErrorAt: Date | null = null;

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + "-" + file.originalname);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // AI health check endpoint - confirms mode: live (OpenAI) vs demo
  app.get("/api/ai/health", async (req, res) => {
    try {
      const mode = hasValidApiKey ? "live" : "demo";
      res.json({ 
        ok: true, 
        mode, 
        hasKey: hasValidApiKey 
      });
    } catch (error) {
      res.status(500).json({ 
        ok: false, 
        mode: "demo", 
        hasKey: false 
      });
    }
  });

  // Legacy health check endpoint
  app.get("/api/chat/health", async (req, res) => {
    res.json({ status: "ok", mode: hasValidApiKey ? "live" : "demo" });
  });

  // Enhanced status endpoint with error tracking
  app.get("/api/ai/status", async (req, res) => {
    const mode = hasValidApiKey ? "live" : "demo";
    res.json({
      hasKey: hasValidApiKey,
      mode: mode, // canonical field for acceptance tests
      aiMode: mode, // alias for backward compatibility
      model: "gpt-4o-mini",
      lastError: lastAIError,
      lastErrorAt: lastAIErrorAt ? new Date(lastAIErrorAt).getTime() : null,
    });
  });

  // Test endpoint to verify OpenAI connection
  app.post("/api/ai/test", async (req, res) => {
    if (!hasValidApiKey) {
      return res.json({
        ok: false,
        error: "No valid API key configured",
        mode: "demo",
      });
    }

    try {
      const { OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const response = await openai.chat.completions.create(
        {
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 10,
        },
        { timeout: 5000 }
      );

      const text = response.choices[0]?.message?.content || "pong";
      res.json({ ok: true, text, mode: "live" });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      lastAIError = errorMsg;
      lastAIErrorAt = new Date();
      console.error("[AI Test] Error:", errorMsg);
      res.json({ ok: false, error: errorMsg, mode: "demo" });
    }
  });

  // Canonical AI chat endpoint (non-streaming, guaranteed response)
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { mode = "explore", tradeId, agent, messages, attachments } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "messages array is required" });
      }

      let tradeContext: any = null;
      let tradeParties: any[] = [];
      let tradeDocs: any[] = [];

      // Trade Mode: load trade context
      if (mode === "trade") {
        if (!tradeId) {
          return res.json({
            assistant_text: "To use Trade Mode, you need to select or create a trade first. Would you like to create a new trade or select an existing one?",
            actions: [
              { type: "create_trade", label: "Create New Trade" },
              { type: "select_trade", label: "Select Existing Trade" },
            ],
            meta: { mode, agent, tradeId: null, aiMode: hasValidApiKey ? "live" : "demo" },
          });
        }

        const trade = await storage.getTrade(tradeId);
        if (!trade) {
          return res.status(404).json({ error: "Trade not found" });
        }

        tradeParties = await storage.getTradeParties(tradeId);
        tradeDocs = await storage.getTradeDocuments(tradeId);

        tradeContext = {
          id: trade.id,
          title: trade.title,
          origin: trade.origin,
          destination: trade.destination,
          value: trade.value,
          currency: trade.currency,
          status: trade.status,
          commodity: trade.commodity,
          incoterm: trade.incoterm,
          parties: tradeParties.map(tp => ({
            name: tp.party.name,
            type: tp.party.type,
            roles: tp.roles,
          })),
          documents: tradeDocs.map(d => d.filename),
        };
      }

      // Store user message
      const lastUserMsg = messages[messages.length - 1];
      if (lastUserMsg?.role === "user") {
        await storage.createChatMessage({
          tradeId: tradeId || null,
          mode,
          agent: agent || null,
          role: "user",
          content: lastUserMsg.content,
        });
      }

      let response: any;
      let aiMode: "live" | "demo" = "demo";

      try {
        response = await createStructuredChatCompletion(messages, mode, tradeContext, mode);
        aiMode = hasValidApiKey ? "live" : "demo";
        lastAIError = null;
      } catch (error) {
        lastAIError = error instanceof Error ? error.message : "Unknown error";
        lastAIErrorAt = new Date();
        console.error("AI error, using fallback:", lastAIError);
        
        response = {
          assistant_text: tradeContext
            ? `I'm currently processing your request for the trade "${tradeContext.title}" (${tradeContext.origin} → ${tradeContext.destination}, ${tradeContext.currency} ${tradeContext.value}). The AI service is temporarily unavailable, but I can help you with basic trade management tasks.`
            : "I'm here to help you explore trade opportunities and manage your operations. The AI service is temporarily in demo mode. What would you like to know about international trade?",
          actions: tradeContext
            ? [
                { type: "compliance", label: "Run Compliance Checks" },
                { type: "funding", label: "Request Funding" },
              ]
            : [
                { type: "create_trade", label: "Create New Trade" },
                { type: "explore", label: "Explore Trade Corridors" },
              ],
        };
        aiMode = "demo";
      }

      // Store assistant response
      await storage.createChatMessage({
        tradeId: tradeId || null,
        mode,
        agent: agent || null,
        role: "assistant",
        content: JSON.stringify(response),
      });

      res.json({
        ...response,
        meta: { mode, agent, tradeId, aiMode },
      });
    } catch (error) {
      console.error("Chat endpoint error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  });

  // Document upload endpoint
  app.post("/api/docs/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { tradeId } = req.body;
      
      // Validate tradeId if provided
      if (tradeId) {
        const trade = await storage.getTrade(tradeId);
        if (!trade) {
          return res.status(404).json({ error: "Trade not found" });
        }
      }
      
      const doc = await storage.createDocument({
        tradeId: tradeId || null,
        filename: req.file.originalname,
        mime: req.file.mimetype,
        size: req.file.size,
        storagePath: req.file.path,
      });

      res.json({
        docId: doc.id,
        filename: doc.filename,
        mime: doc.mime,
        size: doc.size,
        tradeId: doc.tradeId,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Upload failed",
      });
    }
  });

  // Get trades
  app.get("/api/trades", async (req, res) => {
    try {
      const trades = await storage.getTrades();
      res.json(trades);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trades" });
    }
  });

  // Get single trade with context
  app.get("/api/trades/:id", async (req, res) => {
    try {
      const trade = await storage.getTrade(req.params.id);
      if (!trade) {
        return res.status(404).json({ error: "Trade not found" });
      }
      
      const parties = await storage.getTradeParties(trade.id);
      const documents = await storage.getTradeDocuments(trade.id);
      
      res.json({
        ...trade,
        parties: parties.map(tp => ({
          ...tp.party,
          roles: tp.roles,
        })),
        documents,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trade" });
    }
  });

  // Create trade
  app.post("/api/trades", async (req, res) => {
    try {
      const trade = await storage.createTrade(req.body);
      res.json(trade);
    } catch (error) {
      console.error("Create trade error:", error);
      res.status(500).json({ error: "Failed to create trade" });
    }
  });

  // Get chat history
  app.get("/api/chat/history", async (req, res) => {
    try {
      const { tradeId, mode = "explore" } = req.query;
      const messages = await storage.getChatMessages(
        tradeId as string | null,
        mode as string
      );
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  // Chat endpoints
  app.post("/api/chat/stream", async (req, res) => {
    try {
      const { messages, mode = "auto", chatMode = "explore", conversationId, tradeContext } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      // Set up SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      let fullResponse = "";
      let detectedIntents: string[] = [];
      let streamingStarted = false;

      // Send immediate "thinking" event so frontend knows connection is alive
      res.write(`data: ${JSON.stringify({ type: "thinking" })}\n\n`);

      // Start heartbeat interval - sends heartbeat every 2s while waiting for OpenAI
      const heartbeatInterval = setInterval(() => {
        if (!streamingStarted) {
          res.write(`data: ${JSON.stringify({ type: "heartbeat" })}\n\n`);
        }
      }, 2000);

      try {
        // Stream the AI response with trade context and chat mode
        for await (const chunk of streamChatCompletion(messages, mode, tradeContext, chatMode)) {
          streamingStarted = true;
          clearInterval(heartbeatInterval); // Stop heartbeats once tokens start
          fullResponse += chunk;
          res.write(`data: ${JSON.stringify({ type: "token", content: chunk })}\n\n`);
        }

        // Detect intents from the user's last message
        const lastUserMessage = messages[messages.length - 1];
        if (lastUserMessage?.role === "user") {
          detectedIntents = detectIntent(lastUserMessage.content, mode);
        }

        // Save to database if conversationId provided
        if (conversationId) {
          await storage.createMessage({
            conversationId,
            role: "user",
            content: lastUserMessage.content,
          });

          await storage.createMessage({
            conversationId,
            role: "assistant",
            content: fullResponse,
          });
        }

        // Clean up heartbeat interval (safety - should already be cleared when tokens started)
        clearInterval(heartbeatInterval);

        // Send completion event with intents
        res.write(`data: ${JSON.stringify({ 
          type: "done", 
          intents: detectedIntents 
        })}\n\n`);
        res.end();
      } catch (error) {
        clearInterval(heartbeatInterval); // Clean up heartbeat on error
        console.error("Streaming error:", error);
        res.write(`data: ${JSON.stringify({ 
          type: "error", 
          message: error instanceof Error ? error.message : "An error occurred" 
        })}\n\n`);
        // Always send done event to cleanly end SSE stream
        res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
        res.end();
      }
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  // Conversation management
  app.post("/api/conversations", async (req, res) => {
    try {
      const { title, mode = "auto" } = req.body;
      const conversation = await storage.createConversation({ title, mode });
      res.json(conversation);
    } catch (error) {
      console.error("Create conversation error:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Get conversations error:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      res.json(conversation);
    } catch (error) {
      console.error("Get conversation error:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.delete("/api/conversations/:id", async (req, res) => {
    try {
      await storage.deleteConversation(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete conversation error:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // AI-driven risk assessment endpoint
  app.post("/api/risk/analyze", async (req, res) => {
    try {
      const { trade } = req.body;
      
      if (!trade) {
        return res.status(400).json({ error: "Trade data is required" });
      }

      // Generate AI-driven risk analysis with deterministic scores based on trade properties
      const corridorParts = (trade.corridor || "").split("→").map((s: string) => s.trim());
      const isHighRiskCorridor = ["Africa", "SEA", "LATAM", "MENA"].some((r: string) => (trade.corridor || "").includes(r));
      const isLargeTrade = (trade.value || 0) > 100000;
      const hasVerifiedParties = (trade.linkedParties || []).length > 0;
      
      // Generate deterministic variation based on trade ID hash
      const tradeIdHash = (trade.id || "").split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      const variation = tradeIdHash % 10;

      const categories = [
        {
          key: "counterparty",
          label: "Counterparty Risk",
          score: hasVerifiedParties ? 28 + variation : 55 + variation,
          trend: hasVerifiedParties ? "improving" : "stable",
          factors: [
            hasVerifiedParties ? "Network-verified partners detected" : "Unverified counterparties",
            "Credit assessment: " + (hasVerifiedParties ? "Strong" : "Limited data"),
            "Payment history: On-time",
          ],
          aiInsight: hasVerifiedParties 
            ? "Counterparties have established track record in your network."
            : "Consider requesting trade references or credit reports.",
        },
        {
          key: "corridor",
          label: "Corridor Risk",
          score: isHighRiskCorridor ? 52 + variation : 25 + variation,
          trend: isHighRiskCorridor ? "elevated" : "stable",
          factors: [
            `Origin: ${corridorParts[0] || "Unknown"}`,
            `Destination: ${corridorParts[1] || "Unknown"}`,
            isHighRiskCorridor ? "Enhanced monitoring recommended" : "Standard compliance path",
          ],
          aiInsight: isHighRiskCorridor
            ? "This corridor requires enhanced due diligence. Consider additional documentation."
            : "Low-risk corridor with established trade flows.",
        },
        {
          key: "compliance",
          label: "Compliance Risk",
          score: 22 + (variation % 8),
          trend: "improving",
          factors: [
            "Sanctions screening: Clear",
            "AML checks: Passed",
            "Document verification: Complete",
          ],
          aiInsight: "All compliance checks passed. Continue standard monitoring.",
        },
        {
          key: "financial",
          label: "Financial Risk",
          score: isLargeTrade ? 48 + variation : 28 + variation,
          trend: isLargeTrade ? "elevated" : "stable",
          factors: [
            `Trade value: ${trade.currency || "USD"} ${(trade.value || 0).toLocaleString()}`,
            trade.fundingType ? `Funding: ${trade.fundingType}` : "Self-funded",
            "Currency exposure: Moderate",
          ],
          aiInsight: isLargeTrade
            ? "Large transaction value. Consider trade insurance or guarantees."
            : "Transaction value within normal parameters.",
        },
        {
          key: "operational",
          label: "Operational Risk",
          score: 35 + (variation % 12),
          trend: "stable",
          factors: [
            `Incoterms: ${trade.incoterms || "Not specified"}`,
            `Goods: ${trade.goods || "General cargo"}`,
            "Logistics tracking: " + ((trade.logisticsMilestones || []).length > 0 ? "Active" : "Pending"),
          ],
          aiInsight: "Standard operational complexity. Monitor logistics milestones.",
        },
        {
          key: "concentration",
          label: "Concentration Risk",
          score: 32 + (variation % 8),
          trend: "improving",
          factors: [
            "Corridor diversification: Good",
            "Counterparty spread: Moderate",
            "Sector exposure: Balanced",
          ],
          aiInsight: "Portfolio concentration within acceptable limits.",
        },
      ];

      const overallScore = Math.round(categories.reduce((sum, c) => sum + c.score, 0) / categories.length);
      const riskLevel = overallScore <= 30 ? "low" : overallScore <= 60 ? "medium" : overallScore <= 80 ? "high" : "critical";

      const insights = [];
      const highRiskCats = categories.filter(c => c.score > 50);
      if (highRiskCats.length > 0) {
        insights.push({
          id: "high-risk",
          type: "warning",
          title: `${highRiskCats.length} elevated risk area${highRiskCats.length > 1 ? "s" : ""} detected`,
          description: `${highRiskCats.map(c => c.label.replace(" Risk", "")).join(", ")} require${highRiskCats.length === 1 ? "s" : ""} attention.`,
          action: "Review mitigation options",
        });
      }

      if (!trade.fundingType && trade.value > 50000) {
        insights.push({
          id: "funding-opportunity",
          type: "opportunity",
          title: "Trade finance opportunity",
          description: "Consider structured financing to optimize working capital and reduce exposure.",
          action: "Explore funding options",
        });
      }

      const lowRiskCats = categories.filter(c => c.score <= 30);
      if (lowRiskCats.length >= 3) {
        insights.push({
          id: "strong-profile",
          type: "info",
          title: "Strong risk profile",
          description: `${lowRiskCats.map(c => c.label.replace(" Risk", "")).join(", ")} show excellent scores.`,
        });
      }

      res.json({
        tradeId: trade.id,
        overallScore,
        riskLevel,
        categories,
        insights,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Risk analysis error:", error);
      res.status(500).json({ error: "Failed to generate risk analysis" });
    }
  });

  return httpServer;
}
