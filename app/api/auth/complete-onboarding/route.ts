import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { storage } from "@server/storage";
import { getSession, createSessionToken, setSessionCookie } from "@server/auth/session";

const completeOnboardingSchema = z.object({
  // Company details
  legalName: z.string().min(1, "Legal name is required"),
  country: z.string().min(1, "Country is required"),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  taxId: z.string().optional(),
  industry: z.string().optional(),
  // User profile
  fullName: z.string().min(1, "Full name is required"),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
  // Preferences
  defaultCurrency: z.string().optional(),
  corridorsOfInterest: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = completeOnboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Update org
    await storage.updateOrg(session.orgId, {
      legalName: data.legalName,
      country: data.country,
      taxId: data.taxId ?? null,
      addressJson: data.address ?? null,
      onboardingStatus: "full_complete",
    });

    // Update user
    await storage.updateUser(session.userId, {
      name: data.fullName,
      onboardingStatus: "full_complete",
    });

    // Audit log
    await storage.createAuditLog({
      orgId: session.orgId,
      userId: session.userId,
      action: "onboarding_complete",
      metadata: { method: "full" },
    });

    // Refresh session token with updated statuses
    const token = await createSessionToken({
      userId: session.userId,
      orgId: session.orgId,
      role: session.role,
      email: session.email,
      onboardingStatus: "full_complete",
      orgOnboardingStatus: "full_complete",
    });
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    console.error("Complete onboarding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
