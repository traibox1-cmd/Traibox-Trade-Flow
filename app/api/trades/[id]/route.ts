import { NextRequest, NextResponse } from "next/server";
import { storage } from "@server/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trade = await storage.getTrade(id);
    if (!trade) {
      return NextResponse.json(
        { error: "Trade not found" },
        { status: 404 }
      );
    }

    const parties = await storage.getTradeParties(trade.id);
    const documents = await storage.getTradeDocuments(trade.id);

    return NextResponse.json({
      ...trade,
      parties: parties.map((tp) => ({
        ...tp.party,
        roles: tp.roles,
      })),
      documents,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch trade" },
      { status: 500 }
    );
  }
}
