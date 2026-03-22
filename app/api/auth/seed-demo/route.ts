import { NextResponse } from "next/server";
import { getSession } from "@server/auth/session";
import { seedDemoDataForOrg } from "@server/auth/demo-seeder";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (session.orgOnboardingStatus !== "demo_active") {
      return NextResponse.json({ seeded: false, reason: "Not in demo mode" });
    }

    const seeded = await seedDemoDataForOrg(session.orgId);
    return NextResponse.json({ seeded });
  } catch (error) {
    console.error("Demo seed error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
