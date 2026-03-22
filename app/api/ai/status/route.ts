import { NextResponse } from "next/server";
import { hasValidApiKey } from "@server/lib/openai";

let lastAIError: string | null = null;
let lastAIErrorAt: Date | null = null;

// Expose setters for other route handlers
export function setLastAIError(error: string | null) {
  lastAIError = error;
  lastAIErrorAt = error ? new Date() : null;
}

export function getLastAIError() {
  return { lastAIError, lastAIErrorAt };
}

export async function GET() {
  const mode = hasValidApiKey ? "live" : "demo";
  return NextResponse.json({
    hasKey: hasValidApiKey,
    mode,
    aiMode: mode,
    model: "gpt-4o-mini",
    lastError: lastAIError,
    lastErrorAt: lastAIErrorAt ? new Date(lastAIErrorAt).getTime() : null,
  });
}
