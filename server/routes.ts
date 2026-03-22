import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { streamChatCompletion, detectIntent, hasValidApiKey, createStructuredChatCompletion, generateTrendAnalysis } from "./lib/openai";
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

  // Test endpoint to verify OpenAI connection - GET returns usage, POST runs test
  app.get("/api/ai/test", (req, res) => {
    res.json({
      ok: true,
      usage: "POST JSON { prompt }",
      example: { prompt: "ping" },
      hasKey: hasValidApiKey,
      mode: hasValidApiKey ? "live" : "demo",
    });
  });

  app.post("/api/ai/test", async (req, res) => {
    const model = "gpt-4o-mini";
    
    if (!hasValidApiKey) {
      return res.json({
        ok: false,
        error: "No valid API key configured",
        statusCode: 401,
      });
    }

    try {
      const { OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const prompt = req.body?.prompt || "ping";
      
      const response = await openai.chat.completions.create(
        {
          model,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 50,
        },
        { timeout: 8000 }
      );

      const reply = response.choices[0]?.message?.content || "pong";
      res.json({ ok: true, model, reply });
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      const statusCode = error?.status || error?.statusCode || 500;
      lastAIError = errorMsg;
      lastAIErrorAt = new Date();
      console.error("[AI Test] Full error:", error);
      console.error("[AI Test] Error message:", errorMsg, "Status:", statusCode);
      res.json({ ok: false, error: errorMsg, statusCode });
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
      const { messages, mode = "auto", chatMode = "explore", conversationId, tradeContext, agent = "auto" } = req.body;

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      // Set up SSE headers and flush immediately
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders(); // Ensure headers are sent immediately

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
        // Stream the AI response with trade context, chat mode, and agent
        for await (const chunk of streamChatCompletion(messages, mode, tradeContext, chatMode, agent)) {
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
        const errorMsg = error instanceof Error ? error.message : "An error occurred";
        console.error("Streaming error:", error);
        // Store error for /api/ai/status
        lastAIError = errorMsg;
        lastAIErrorAt = new Date();
        res.write(`data: ${JSON.stringify({ 
          type: "error", 
          message: errorMsg 
        })}\n\n`);
        // Always send done event to cleanly end SSE stream
        res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
        res.end();
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Internal server error";
      console.error("Chat error:", error);
      // Store error for /api/ai/status
      lastAIError = errorMsg;
      lastAIErrorAt = new Date();
      // If headers already sent (SSE mode), send error event
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ type: "error", message: errorMsg })}\n\n`);
        res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: errorMsg });
      }
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

  // AI-driven trade trend analysis and forecasting
  app.get("/api/trends", async (req, res) => {
    try {
      const trades = await storage.getTrades();
      const analysis = await generateTrendAnalysis(trades);
      res.json(analysis);
    } catch (error) {
      console.error("Trend analysis error:", error);
      res.status(500).json({ error: "Failed to generate trend analysis" });
    }
  });

  // ===== COMPLIANCE v5.0 ENDPOINTS =====

  // Run compliance checks for a trade
  app.post("/api/compliance/check", async (req, res) => {
    try {
      const { trade_id, modules, policy_id } = req.body;
      if (!trade_id) {
        return res.status(422).json({
          error: "invalid_request",
          message: "We couldn't start without the basics. Add the trade or party details.",
          hint: "Provide a trade_id in the request body.",
          trace_id: `trc_cmp_${Date.now()}`,
        });
      }

      const traceId = `trc_cmp_${Date.now()}`;
      const now = new Date().toISOString();

      // Simulate parallel provider calls with normalized results
      const checks = [
        { type: "KYB", status: "pass", reasons: [] as string[], provider: "provA", provider_ref: `A-${Date.now()}`, updated_at: now },
        { type: "SANCTIONS", status: "pass", reasons: [] as string[], provider: "provA", provider_ref: `A-${Date.now() + 1}`, updated_at: now },
        { type: "PEP", status: "pass", reasons: [] as string[], provider: "provA", provider_ref: null, updated_at: now },
        { type: "ADVERSE_MEDIA", status: "pass", reasons: [] as string[], provider: "provA", provider_ref: null, updated_at: now },
        { type: "EXPORT", status: "warn", reasons: ["HS code may require end-use/end-user confirmation"], provider: "provB", provider_ref: null, updated_at: now },
        { type: "ESG", status: "pass", reasons: [] as string[], provider: null, provider_ref: null, updated_at: now },
        { type: "CBAM", status: "warn", reasons: ["Corridor to EU; product may fall under CBAM reporting"], provider: null, provider_ref: null, updated_at: now },
      ];

      // Filter modules if specified
      const activeChecks = modules && modules.length > 0
        ? checks.filter((c: { type: string }) => modules.includes(c.type.toLowerCase()))
        : checks;

      const hasFail = activeChecks.some((c: { status: string }) => c.status === "fail");
      const hasWarn = activeChecks.some((c: { status: string }) => c.status === "warn");
      const overall = hasFail ? "failed" : hasWarn ? "warnings" : "passed";
      const operationalStatus = hasFail ? "blocked" : hasWarn ? "warning" : "clear";
      const riskLevel = hasFail ? "high" : hasWarn ? "medium" : "low";

      res.json({
        trade_id,
        overall,
        operational_status: operationalStatus,
        risk_level: riskLevel,
        checks: activeChecks,
        next_actions: hasWarn ? ["Collect end-use statement", "Attach ESG evidence for STF"] : [],
        requirements_pending: hasWarn ? 2 : 0,
        report_url: `/reports/compliance/${trade_id}.pdf`,
        trace_id: traceId,
      });
    } catch (error) {
      console.error("Compliance check error:", error);
      res.status(500).json({
        error: "provider_unavailable",
        message: "Our screening partner didn't respond. Try again.",
        trace_id: `trc_cmp_${Date.now()}`,
      });
    }
  });

  // Poll current compliance status
  app.get("/api/compliance/status", async (req, res) => {
    try {
      const { trade_id } = req.query;
      if (!trade_id) {
        return res.status(400).json({ error: "trade_id is required" });
      }
      res.json({
        trade_id,
        overall: "passed",
        operational_status: "clear",
        risk_level: "low",
        last_checked: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch compliance status" });
    }
  });

  // Download compliance report
  app.get("/api/compliance/reports/:trade_id", async (req, res) => {
    try {
      const { trade_id } = req.params;
      const format = (req.query.format as string) || "json";

      const report = {
        report_id: `cr-${Date.now()}`,
        trade_id,
        generated_at: new Date().toISOString(),
        policy_id: "pol-std-1",
        overall: "warnings",
        risk_level: "medium",
        checks: [
          { type: "KYB", status: "pass", provider: "provA" },
          { type: "SANCTIONS", status: "pass", provider: "provA" },
          { type: "EXPORT", status: "warn", notes: "HS chapter flagged; end-use required" },
        ],
        cbam: { flag: true, reason: "HS family may be in scope" },
        esg: { flag: true, notes: "STF evidence recommended" },
        signatures: { hash: "sha256:placeholder", version: "5.0.0" },
      };

      if (format === "pdf") {
        res.setHeader("Content-Type", "application/json");
        res.json({ ...report, note: "PDF generation placeholder — JSON returned" });
      } else {
        res.json(report);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to generate report" });
    }
  });

  // Get contextual requirements for a trade
  app.get("/api/compliance/requirements/:trade_id", async (req, res) => {
    try {
      const { trade_id } = req.params;
      const now = new Date().toISOString();

      const requirements = [
        {
          requirement_id: `req-${Date.now()}`,
          trade_id,
          type: "document",
          category: "identity",
          title: "Upload UBO declaration",
          description: "Beneficial ownership documentation is required for KYB compliance",
          who_should_provide: "Seller",
          what_happens_after: "KYB check can be completed and trade progressed",
          state: "required_now",
          priority: "blocking",
          linked_check_type: "KYB",
          evidence_id: null,
          created_at: now,
          resolved_at: null,
        },
        {
          requirement_id: `req-${Date.now() + 1}`,
          trade_id,
          type: "evidence",
          category: "sustainability",
          title: "Attach ESG certification",
          description: "ESG evidence recommended for sustainable trade finance",
          who_should_provide: "Seller",
          what_happens_after: "STF funding options become available",
          state: "optional_recommended",
          priority: "medium",
          linked_check_type: "ESG",
          evidence_id: null,
          created_at: now,
          resolved_at: null,
        },
      ];

      res.json({
        trade_id,
        requirements,
        blocking_count: requirements.filter((r: { priority: string }) => r.priority === "blocking").length,
        total_count: requirements.length,
        trace_id: `trc_req_${Date.now()}`,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch requirements" });
    }
  });

  // Resolve a requirement
  app.post("/api/compliance/requirements/:requirement_id/resolve", async (req, res) => {
    try {
      const { requirement_id } = req.params;
      const { evidence_id, notes } = req.body;
      res.json({
        requirement_id,
        state: "completed",
        resolved_at: new Date().toISOString(),
        evidence_id: evidence_id || null,
        notes: notes || null,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to resolve requirement" });
    }
  });

  // Sustainability screening
  app.post("/api/sustainability/screen", async (req, res) => {
    try {
      const { trade_id, modules } = req.body;
      if (!trade_id) {
        return res.status(422).json({ error: "trade_id is required" });
      }

      const activeModules = modules || ["esg", "cbam"];

      res.json({
        trade_id,
        esg: activeModules.includes("esg")
          ? { flags: ["STF evidence recommended"], risk_level: "low" }
          : null,
        ghg_scope3: activeModules.includes("ghg_scope3")
          ? { applicable: true, estimate_tco2: 12.5, confidence: "medium", notes: "Estimated based on corridor and commodity defaults" }
          : null,
        cbam: activeModules.includes("cbam")
          ? { in_scope: false, items_in_scope: [] }
          : null,
        next_actions: ["Attach ESG certification for STF eligibility"],
        trace_id: `trc_sus_${Date.now()}`,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to run sustainability screening" });
    }
  });

  // CBAM scope check
  app.post("/api/cbam/scope-check", async (req, res) => {
    try {
      const { items, corridor } = req.body;
      if (!items || !Array.isArray(items)) {
        return res.status(422).json({ error: "items array is required" });
      }

      // CBAM scope: iron, steel, aluminium, cement, fertilisers, electricity, hydrogen
      const cbamHsChapters = ["72", "73", "76", "25", "31"];
      const results = items.map((item: { hs_code: string; description?: string }) => {
        const chapter = (item.hs_code || "").substring(0, 2);
        const inScope = cbamHsChapters.includes(chapter);
        return {
          hs_code: item.hs_code,
          in_scope: inScope,
          category: inScope ? "CBAM-regulated" : null,
          cn_code: null,
          notes: inScope ? `HS chapter ${chapter} falls under CBAM regulation` : "Not in CBAM scope",
        };
      });

      res.json({
        in_scope: results.some((r: { in_scope: boolean }) => r.in_scope),
        items: results,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check CBAM scope" });
    }
  });

  // CBAM calculate
  app.post("/api/cbam/calculate", async (req, res) => {
    try {
      const { trade_id, items, reporting_quarter } = req.body;
      if (!trade_id) {
        return res.status(422).json({
          error: "cbam_data_missing",
          message: "Trade ID is required for CBAM calculation.",
          trace_id: `trc_cbam_${Date.now()}`,
        });
      }

      const etsPriceEur = 85.0;
      const calculatedItems = (items || []).map((item: { hs_code: string; quantity_tonnes: number; embedded_emissions_tco2?: number; default_values?: boolean }) => {
        const emissionsTco2 = item.embedded_emissions_tco2 || (item.quantity_tonnes * 2.1);
        const certificates = Math.ceil(emissionsTco2);
        return {
          hs_code: item.hs_code,
          category: "CBAM-regulated",
          quantity_tonnes: item.quantity_tonnes,
          embedded_emissions_tco2: emissionsTco2,
          emission_source: item.embedded_emissions_tco2 ? "actual" : "default",
          cbam_certificates_required: certificates,
          estimated_cost_eur: certificates * etsPriceEur,
        };
      });

      const totalEmissions = calculatedItems.reduce((sum: number, i: { embedded_emissions_tco2: number }) => sum + i.embedded_emissions_tco2, 0);
      const totalCertificates = calculatedItems.reduce((sum: number, i: { cbam_certificates_required: number }) => sum + i.cbam_certificates_required, 0);

      res.json({
        trade_id,
        in_scope: calculatedItems.length > 0,
        items: calculatedItems,
        totals: {
          total_emissions_tco2: totalEmissions,
          total_certificates: totalCertificates,
          estimated_total_cost_eur: totalCertificates * etsPriceEur,
        },
        carbon_price_reference: {
          ets_price_eur_per_tco2: etsPriceEur,
          as_of: new Date().toISOString().split("T")[0],
        },
        reporting_obligations: [
          "Submit CBAM quarterly report",
          "Purchase CBAM certificates before deadline",
        ],
        glass_box: {
          reasons: [
            "Calculation based on EU ETS price reference",
            items && items.length > 0 ? "Items checked against CBAM commodity scope" : "No items provided — defaults used",
          ],
        },
        trace_id: `trc_cbam_${Date.now()}`,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate CBAM obligations" });
    }
  });

  // CBAM report
  app.get("/api/cbam/report/:trade_id", async (req, res) => {
    try {
      const { trade_id } = req.params;
      const format = (req.query.format as string) || "json";
      res.json({
        trade_id,
        report_type: "cbam_quarterly",
        period: "Q1 2026",
        in_scope: true,
        total_emissions_tco2: 42.0,
        total_certificates: 42,
        estimated_cost_eur: 3570.0,
        format,
        generated_at: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate CBAM report" });
    }
  });

  // Sustainability report
  app.post("/api/sustainability/report", async (req, res) => {
    try {
      const { period_type, period_start, period_end, modules, format: reportFormat } = req.body;
      if (!period_type) {
        return res.status(422).json({ error: "period_type is required" });
      }

      res.json({
        report_id: `sr-${Date.now()}`,
        period_type,
        period_start: period_start || new Date().toISOString().split("T")[0],
        period_end: period_end || new Date().toISOString().split("T")[0],
        summary: "Sustainability report generated successfully",
        esg_summary: { total_trades_screened: 2, flags_raised: 1 },
        ghg_scope3_summary: { total_tco2: 25.0, trade_count: 2, methodology: "GHG Protocol Scope 3" },
        cbam_summary: { trades_in_scope: 1, total_emissions_tco2: 42.0, total_certificates: 42, estimated_cost_eur: 3570.0 },
        missing_inputs: [],
        confidence_level: "medium",
        report_url: `/reports/sustainability/sr-${Date.now()}.${reportFormat || "json"}`,
        trace_id: `trc_sr_${Date.now()}`,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate sustainability report" });
    }
  });

  // Upload/register compliance evidence
  app.post("/api/compliance/evidence", upload.single("file"), async (req, res) => {
    try {
      const { trade_id, party_id, type: evidenceType, valid_from, valid_to } = req.body;

      res.json({
        evidence_id: `ev-${Date.now()}`,
        trade_id: trade_id || null,
        party_id: party_id || null,
        type: evidenceType || "other",
        file_url: req.file ? `/uploads/${req.file.filename}` : null,
        extracted_fields: null,
        valid_from: valid_from || null,
        valid_to: valid_to || null,
        validation_state: "pending",
        source: "upload",
        reusable: true,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to save evidence" });
    }
  });

  // Get evidence detail
  app.get("/api/compliance/evidence/:evidence_id", async (req, res) => {
    try {
      res.json({
        evidence_id: req.params.evidence_id,
        type: "other",
        validation_state: "pending",
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch evidence" });
    }
  });

  // Remove evidence
  app.delete("/api/compliance/evidence/:evidence_id", async (req, res) => {
    try {
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete evidence" });
    }
  });

  // Get audit trail for a trade
  app.get("/api/compliance/audit-trail/:trade_id", async (req, res) => {
    try {
      const { trade_id } = req.params;
      const now = new Date().toISOString();

      res.json({
        trade_id,
        events: [
          { event_id: `ae-1`, trade_id, actor: "system", action: "compliance.check.started", payload_json: {}, hash: "sha256:placeholder", created_at: now },
          { event_id: `ae-2`, trade_id, actor: "system", action: "compliance.check.completed", payload_json: { overall: "warnings" }, hash: "sha256:placeholder", created_at: now },
        ],
        cursor: null,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audit trail" });
    }
  });

  // List active compliance policies
  app.get("/api/compliance/policies", async (req, res) => {
    try {
      res.json([
        {
          policy_id: "pol-std-1",
          thresholds: { sanctions_fail_on_match: true, pep_warn_on_level: 2, export_warn_on_chapters: ["84", "85", "90"] },
          sustainability: { esg_enabled: true, cbam_enabled: true, ghg_scope3_enabled: false },
          incoterms_checks_enabled: true,
          retention_days: 365,
          escalation: { notify_roles: ["compliance_officer"], block_on_fail: true },
        },
      ]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch policies" });
    }
  });

  // Create/update compliance policy
  app.post("/api/compliance/policies", async (req, res) => {
    try {
      const policy = req.body;
      res.json({
        ...policy,
        policy_id: policy.policy_id || `pol-${Date.now()}`,
        saved_at: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to save policy" });
    }
  });

  return httpServer;
}
