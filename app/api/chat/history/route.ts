import { NextRequest, NextResponse } from "next/server";
import { storage } from "@server/storage";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tradeId = searchParams.get("tradeId");
    const mode = searchParams.get("mode") || "explore";
    const messages = await storage.getChatMessages(tradeId, mode);
    return NextResponse.json(messages);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}
