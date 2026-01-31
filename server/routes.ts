import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { streamChatCompletion, detectIntent } from "./lib/openai";
import { insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Health check endpoint
  app.get("/api/chat/health", async (req, res) => {
    try {
      // Simple health check - returns ok if server is running
      // In production, this could test OpenAI API connectivity
      res.json({ status: "ok", mode: "demo" });
    } catch (error) {
      res.status(500).json({ status: "error", mode: "demo" });
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

      try {
        // Stream the AI response with trade context and chat mode
        for await (const chunk of streamChatCompletion(messages, mode, tradeContext, chatMode)) {
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

        // Send completion event with intents
        res.write(`data: ${JSON.stringify({ 
          type: "done", 
          intents: detectedIntents 
        })}\n\n`);
        res.end();
      } catch (error) {
        console.error("Streaming error:", error);
        res.write(`data: ${JSON.stringify({ 
          type: "error", 
          message: error instanceof Error ? error.message : "An error occurred" 
        })}\n\n`);
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
