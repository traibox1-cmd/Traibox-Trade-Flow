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
  
  // Chat endpoints
  app.post("/api/chat/stream", async (req, res) => {
    try {
      const { messages, mode = "auto", conversationId } = req.body;

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
        // Stream the AI response
        for await (const chunk of streamChatCompletion(messages, mode)) {
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

  return httpServer;
}
