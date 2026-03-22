import { NextRequest, NextResponse } from "next/server";
import { hasValidApiKey } from "@server/lib/openai";

export async function GET() {
  return NextResponse.json({
    ok: true,
    usage: "POST JSON { prompt }",
    example: { prompt: "ping" },
    hasKey: hasValidApiKey,
    mode: hasValidApiKey ? "live" : "demo",
  });
}

export async function POST(request: NextRequest) {
  const model = "gpt-4o-mini";

  if (!hasValidApiKey) {
    return NextResponse.json({
      ok: false,
      error: "No valid API key configured",
      statusCode: 401,
    });
  }

  try {
    const { OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const body = await request.json();
    const prompt = body?.prompt || "ping";

    const response = await openai.chat.completions.create(
      {
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 50,
      },
      { timeout: 8000 }
    );

    const reply = response.choices[0]?.message?.content || "pong";
    return NextResponse.json({ ok: true, model, reply });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Unknown error";
    const statusCode =
      (error as { status?: number })?.status ||
      (error as { statusCode?: number })?.statusCode ||
      500;
    console.error("[AI Test] Error:", errorMsg, "Status:", statusCode);
    return NextResponse.json({ ok: false, error: errorMsg, statusCode });
  }
}
