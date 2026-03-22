import { NextResponse } from "next/server";
import { hasValidApiKey } from "@server/lib/openai";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    mode: hasValidApiKey ? "live" : "demo",
  });
}
