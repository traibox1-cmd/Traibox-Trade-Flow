import { NextRequest, NextResponse } from "next/server";
import {
  streamChatCompletion,
  detectIntent,
} from "@server/lib/openai";
import { storage } from "@server/storage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      messages,
      mode = "auto",
      chatMode = "explore",
      conversationId,
      tradeContext,
      agent = "auto",
    } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";
        let streamingStarted = false;

        // Send "thinking" event
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "thinking" })}\n\n`
          )
        );

        // Heartbeat
        const heartbeatInterval = setInterval(() => {
          if (!streamingStarted) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "heartbeat" })}\n\n`
              )
            );
          }
        }, 2000);

        try {
          for await (const chunk of streamChatCompletion(
            messages,
            mode,
            tradeContext,
            chatMode,
            agent
          )) {
            streamingStarted = true;
            clearInterval(heartbeatInterval);
            fullResponse += chunk;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "token",
                  content: chunk,
                })}\n\n`
              )
            );
          }

          // Detect intents
          const lastUserMessage = messages[messages.length - 1];
          let detectedIntents: string[] = [];
          if (lastUserMessage?.role === "user") {
            detectedIntents = detectIntent(
              lastUserMessage.content,
              mode
            );
          }

          // Save to database
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

          clearInterval(heartbeatInterval);

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "done",
                intents: detectedIntents,
              })}\n\n`
            )
          );
        } catch (error) {
          clearInterval(heartbeatInterval);
          const errorMsg =
            error instanceof Error
              ? error.message
              : "An error occurred";
          console.error("Streaming error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                message: errorMsg,
              })}\n\n`
            )
          );
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "done" })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Internal server error";
    console.error("Chat stream error:", error);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
