import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { storage } from "@server/storage";
import { getSession } from "@server/auth/session";
import { canSetNegotiationLimits, checkOperationGating } from "@server/auth/rbac";

const financePolicySchema = z.object({
  maxNegotiationAmount: z.number().positive().optional(),
  maxSinglePaymentAmount: z.number().positive().optional(),
  currenciesAllowed: z.array(z.string()).optional(),
  approvalRules: z.object({
    singleApprover: z.boolean().default(true),
  }).optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const org = await storage.getOrg(session.orgId);
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({
      policy: org.financePolicyJson || {
        maxNegotiationAmount: null,
        maxSinglePaymentAmount: null,
        currenciesAllowed: ["USD", "EUR", "GBP"],
        approvalRules: { singleApprover: true },
      },
    });
  } catch (error) {
    console.error("Get finance policy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!canSetNegotiationLimits({ role: session.role })) {
      return NextResponse.json(
        { error: "Only finance or admin role can set finance policies" },
        { status: 403 }
      );
    }

    const org = await storage.getOrg(session.orgId);
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const gating = checkOperationGating(org, "set_negotiation_limit");
    if (!gating.allowed) {
      return NextResponse.json({ error: gating.reason }, { status: 403 });
    }

    const body = await request.json();
    const parsed = financePolicySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await storage.updateOrg(session.orgId, {
      financePolicyJson: parsed.data,
    });

    await storage.createAuditLog({
      orgId: session.orgId,
      userId: session.userId,
      action: "policy_update",
      metadata: { policy: parsed.data },
    });

    return NextResponse.json({ success: true, policy: parsed.data });
  } catch (error) {
    console.error("Set finance policy error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
