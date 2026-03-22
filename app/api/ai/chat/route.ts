import { NextRequest, NextResponse } from "next/server";
import {
  hasValidApiKey,
  createStructuredChatCompletion,
} from "@server/lib/openai";
import { storage } from "@server/storage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode = "explore", tradeId, agent, messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    let tradeContext: Record<string, unknown> | null = null;

    // Trade Mode: load trade context
    if (mode === "trade") {
      if (!tradeId) {
        return NextResponse.json({
          assistant_text:
            "To use Trade Mode, you need to select or create a trade first. Would you like to create a new trade or select an existing one?",
          actions: [
            { type: "create_trade", label: "Create New Trade" },
            { type: "select_trade", label: "Select Existing Trade" },
          ],
          meta: {
            mode,
            agent,
            tradeId: null,
            aiMode: hasValidApiKey ? "live" : "demo",
          },
        });
      }

      const trade = await storage.getTrade(tradeId);
      if (!trade) {
        return NextResponse.json(
          { error: "Trade not found" },
          { status: 404 }
        );
      }

      const tradeParties = await storage.getTradeParties(tradeId);
      const tradeDocs = await storage.getTradeDocuments(tradeId);

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
        parties: tradeParties.map((tp) => ({
          name: tp.party.name,
          type: tp.party.type,
          roles: tp.roles,
        })),
        documents: tradeDocs.map((d) => d.filename),
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

    let response: Record<string, unknown>;
    let aiMode: "live" | "demo" = "demo";

    try {
      response = await createStructuredChatCompletion(
        messages,
        mode,
        tradeContext,
        mode
      );
      aiMode = hasValidApiKey ? "live" : "demo";
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error";
      console.error("AI error, using fallback:", errorMsg);

      response = {
        assistant_text: tradeContext
          ? `I'm currently processing your request for the trade "${(tradeContext as { title?: string }).title}" (${(tradeContext as { origin?: string }).origin} → ${(tradeContext as { destination?: string }).destination}, ${(tradeContext as { currency?: string }).currency} ${(tradeContext as { value?: unknown }).value}). The AI service is temporarily unavailable, but I can help you with basic trade management tasks.`
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

    return NextResponse.json({
      ...response,
      meta: { mode, agent, tradeId, aiMode },
    });
  } catch (error) {
    console.error("Chat endpoint error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
