import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { storage } from "@server/storage";
import { createSessionToken, setSessionCookie } from "@server/auth/session";
import { checkRateLimit } from "@server/auth/rate-limit";

const signupQuickSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const rl = checkRateLimit(`signup:${ip}`);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.retryAfterMs || 60000) / 1000)) } }
      );
    }

    const body = await request.json();
    const parsed = signupQuickSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password, firstName, lastName, companyName } = parsed.data;

    // Check if user already exists
    const existing = await storage.getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create org
    const orgName = companyName || `${firstName || "My"}'s Organization`;
    const org = await storage.createOrg({
      name: orgName,
      onboardingStatus: "demo_active",
      demoSeeded: false,
    });

    // Create user
    const displayName = [firstName, lastName].filter(Boolean).join(" ") || undefined;
    const user = await storage.createUser({
      orgId: org.id,
      email,
      name: displayName,
      role: "ops",
      passwordHash,
      onboardingStatus: "quick_complete",
    });

    // Audit log
    await storage.createAuditLog({
      orgId: org.id,
      userId: user.id,
      action: "signup",
      metadata: { method: "quick", email },
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
      redirectTo: "/dashboard?mode=demo",
    });
  } catch (error) {
    console.error("Quick signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
