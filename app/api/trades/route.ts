import { NextRequest, NextResponse } from "next/server";
import { storage } from "@server/storage";

export async function GET() {
  try {
    const trades = await storage.getTrades();
    return NextResponse.json(trades);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch trades" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const trade = await storage.createTrade(body);
    return NextResponse.json(trade);
  } catch (error) {
    console.error("Create trade error:", error);
    return NextResponse.json(
      { error: "Failed to create trade" },
      { status: 500 }
    );
  }
}
