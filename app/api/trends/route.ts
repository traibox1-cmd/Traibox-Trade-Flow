import { NextResponse } from "next/server";
import { storage } from "@server/storage";
import { generateTrendAnalysis } from "@server/lib/openai";

export async function GET() {
  try {
    const trades = await storage.getTrades();
    const analysis = await generateTrendAnalysis(trades);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Trend analysis error:", error);
    return NextResponse.json(
      { error: "Failed to generate trend analysis" },
      { status: 500 }
    );
  }
}
