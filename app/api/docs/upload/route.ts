import { NextRequest, NextResponse } from "next/server";
import { storage } from "@server/storage";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "uploads");

export async function POST(request: NextRequest) {
  try {
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const tradeId = formData.get("tradeId") as string | null;

    // Validate tradeId if provided
    if (tradeId) {
      const trade = await storage.getTrade(tradeId);
      if (!trade) {
        return NextResponse.json(
          { error: "Trade not found" },
          { status: 404 }
        );
      }
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Write file to disk
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + "-" + file.name;
    const filePath = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(bytes));

    const doc = await storage.createDocument({
      tradeId: tradeId || null,
      filename: file.name,
      mime: file.type,
      size: file.size,
      storagePath: filePath,
    });

    return NextResponse.json({
      docId: doc.id,
      filename: doc.filename,
      mime: doc.mime,
      size: doc.size,
      tradeId: doc.tradeId,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}
