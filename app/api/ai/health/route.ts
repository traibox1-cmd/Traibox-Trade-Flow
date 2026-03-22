import { NextResponse } from "next/server";
import { hasValidApiKey } from "@server/lib/openai";

export async function GET() {
  try {
    const mode = hasValidApiKey ? "live" : "demo";
    return NextResponse.json({
      ok: true,
      mode,
      hasKey: hasValidApiKey,
    });
  } catch {
    return NextResponse.json(
      { ok: false, mode: "demo", hasKey: false },
      { status: 500 }
    );
  }
}
