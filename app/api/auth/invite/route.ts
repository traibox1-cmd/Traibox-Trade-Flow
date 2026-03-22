import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes, createHash } from "crypto";
import { storage } from "@server/storage";
import { getSession } from "@server/auth/session";

const inviteSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["finance", "ops"]).default("finance"),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, role } = parsed.data;

    // Check if user already exists in this org
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser && existingUser.orgId === session.orgId) {
      return NextResponse.json(
        { error: "User already exists in this organization" },
        { status: 409 }
      );
    }

    // Generate invite token
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");

    const invite = await storage.createInvite({
      orgId: session.orgId,
      email,
      role,
      tokenHash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Audit log
    await storage.createAuditLog({
      orgId: session.orgId,
      userId: session.userId,
      action: "role_assignment",
      metadata: { invitedEmail: email, role, inviteId: invite.id },
    });

    // In MVP, return the invite link directly (email sending stubbed)
    const origin = request.headers.get("origin") || "http://localhost:3000";
    const inviteLink = `${origin}/onboarding/accept-invite?token=${rawToken}`;

    return NextResponse.json({
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
      },
      inviteLink,
      message: "Invite created. Share this link with the user.",
    });
  } catch (error) {
    console.error("Invite error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
