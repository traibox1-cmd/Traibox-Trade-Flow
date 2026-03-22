import { NextRequest, NextResponse } from "next/server";
import { storage } from "@server/storage";
import { getSession } from "@server/auth/session";
import { canApprovePayment, checkOperationGating } from "@server/auth/rbac";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!canApprovePayment({ role: session.role })) {
      return NextResponse.json(
        { error: "Only finance or admin role can approve payments" },
        { status: 403 }
      );
    }

    const org = await storage.getOrg(session.orgId);
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const gating = checkOperationGating(org, "payment_approval");
    if (!gating.allowed) {
      return NextResponse.json({ error: gating.reason }, { status: 403 });
    }

    const { id: paymentId } = await params;

    // Audit log for the approval
    await storage.createAuditLog({
      orgId: session.orgId,
      userId: session.userId,
      action: "payment_approval",
      metadata: { paymentId, status: "approved" },
    });

    return NextResponse.json({
      success: true,
      paymentId,
      status: "approved",
      approvedBy: session.userId,
      approvedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Payment approval error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
