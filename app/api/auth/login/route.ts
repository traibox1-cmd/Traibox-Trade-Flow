import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { storage } from "@server/storage";
import { createSessionToken, setSessionCookie } from "@server/auth/session";
import { checkRateLimit } from "@server/auth/rate-limit";
import { dbAwareErrorResponse } from "@server/lib/db-errors";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = checkRateLimit(`login:${ip}`);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.retryAfterMs || 60000) / 1000)) } }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // SI 2FA ESTA HABILITADO, BLOQUEAR ACCESO DIRECTO Y REQUERIR OTP
    if (user.isTwoFactorEnabled && user.twoFactorSecret) {
      return NextResponse.json(
        { requires2FA: true, message: "Please enter your 2FA code" },
        { status: 403 }
      );
    }

    const org = await storage.getOrg(user.orgId);
    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 500 }
      );
    }

    // Update last login
    await storage.updateUser(user.id, { lastLoginAt: new Date() });

    // Audit log
    await storage.createAuditLog({
      orgId: org.id,
      userId: user.id,
      action: "login",
      metadata: { email },
    });

    // Create session
    const token = await createSessionToken({
      userId: user.id,
      orgId: org.id,
      role: user.role,
      email: user.email,
      onboardingStatus: user.onboardingStatus,
      orgOnboardingStatus: org.onboardingStatus,
    });
    await setSessionCookie(token);

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
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return dbAwareErrorResponse(error);
  }
}
