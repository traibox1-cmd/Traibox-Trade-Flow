import { NextRequest, NextResponse } from "next/server";
import { storage } from "@server/storage";

export async function GET() {
  try {
    const conversations = await storage.getConversations();
    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, mode = "auto" } = await request.json();
    const conversation = await storage.createConversation({ title, mode });
    return NextResponse.json(conversation);
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
