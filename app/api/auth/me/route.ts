import { NextResponse } from "next/server";
import { getSession } from "@server/auth/session";
import { storage } from "@server/storage";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await storage.getUser(session.userId);
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const org = await storage.getOrg(user.orgId);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        onboardingStatus: user.onboardingStatus,
        lastLoginAt: user.lastLoginAt,
      },
      org: org ? {
        id: org.id,
        name: org.name,
        onboardingStatus: org.onboardingStatus,
        demoSeeded: org.demoSeeded,
        financePolicyJson: org.financePolicyJson,
      } : null,
    });
  } catch (error) {
    console.error("Get session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
