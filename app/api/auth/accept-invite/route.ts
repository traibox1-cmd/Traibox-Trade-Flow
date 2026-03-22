import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { storage } from "@server/storage";
import { createSessionToken, setSessionCookie } from "@server/auth/session";
import { checkRateLimit } from "@server/auth/rate-limit";

const acceptInviteSchema = z.object({
  token: z.string().min(1, "Invite token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = checkRateLimit(`accept-invite:${ip}`);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = acceptInviteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { token, password, name } = parsed.data;
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const invite = await storage.getInviteByToken(tokenHash);
    if (!invite) {
      return NextResponse.json({ error: "Invalid invite token" }, { status: 404 });
    }

    if (invite.acceptedAt) {
      return NextResponse.json({ error: "Invite has already been used" }, { status: 400 });
    }

    if (new Date() > invite.expiresAt) {
      return NextResponse.json({ error: "Invite has expired" }, { status: 400 });
    }

    // Check if user already exists
    const existing = await storage.getUserByEmail(invite.email);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const org = await storage.getOrg(invite.orgId);
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const user = await storage.createUser({
      orgId: invite.orgId,
      email: invite.email,
      name: name || null,
      role: invite.role,
      passwordHash,
      onboardingStatus: org.onboardingStatus === "full_complete" ? "full_complete" : "quick_complete",
    });

    await storage.acceptInvite(invite.id);

    await storage.createAuditLog({
      orgId: invite.orgId,
      userId: user.id,
      action: "signup",
      metadata: { method: "invite", inviteId: invite.id, role: invite.role },
    });

    const sessionToken = await createSessionToken({
      userId: user.id,
      orgId: org.id,
      role: user.role,
      email: user.email,
      onboardingStatus: user.onboardingStatus,
      orgOnboardingStatus: org.onboardingStatus,
    });
    await setSessionCookie(sessionToken);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        onboardingStatus: user.onboardingStatus,
      },
      org: {
        id: org.id,
        name: org.name,
        onboardingStatus: org.onboardingStatus,
      },
      redirectTo: "/dashboard",
    });
  } catch (error) {
    console.error("Accept invite error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
