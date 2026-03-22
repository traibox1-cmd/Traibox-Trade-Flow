import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { storage } from "@server/storage";
import { getSession } from "@server/auth/session";
import { canApprovePayment, checkOperationGating } from "@server/auth/rbac";

const rejectSchema = z.object({
  reason: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!canApprovePayment({ role: session.role })) {
      return NextResponse.json(
        { error: "Only finance or admin role can reject payments" },
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
    const body = await request.json().catch(() => ({}));
    const parsed = rejectSchema.safeParse(body);
    const reason = parsed.success ? parsed.data.reason : undefined;

    await storage.createAuditLog({
      orgId: session.orgId,
      userId: session.userId,
      action: "payment_rejection",
      metadata: { paymentId, status: "rejected", reason },
    });

    return NextResponse.json({
      success: true,
      paymentId,
      status: "rejected",
      rejectedBy: session.userId,
      rejectedAt: new Date().toISOString(),
      reason,
    });
  } catch (error) {
    console.error("Payment rejection error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
