import { NextRequest, NextResponse } from "next/server";
import { storage } from "@server/storage";
import { createSessionToken, setSessionCookie } from "@server/auth/session";
import speakeasy from "speakeasy";
import { z } from "zod";

const verify2faSchema = z.object({
  email: z.string().email(),
  token: z.string().length(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verify2faSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid data" }, { status: 400 });

    const { email, token } = parsed.data;
    const user = await storage.getUserByEmail(email);
    if (!user || !user.isTwoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ error: "2FA not properly configured or not enabled" }, { status: 400 });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
    });

    if (!verified) {
      return NextResponse.json({ error: "Invalid 2FA code" }, { status: 401 });
    }

    const org = await storage.getOrg(user.orgId);
    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 500 });

    // Actualizamos último login y creamos sesión completa
    await storage.updateUser(user.id, { lastLoginAt: new Date() });
    
    const sessionToken = await createSessionToken({
      userId: user.id,
      orgId: org.id,
      role: user.role,
      email: user.email,
      onboardingStatus: user.onboardingStatus,
      orgOnboardingStatus: org.onboardingStatus,
    });
    
    await setSessionCookie(sessionToken);

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
