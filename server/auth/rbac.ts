import type { User, Org } from "@shared/schema";

export type UserRole = "ops" | "finance" | "admin";
export type OrgOnboardingStatus = "demo_active" | "full_incomplete" | "full_complete";
export type UserOnboardingStatus = "quick_complete" | "full_incomplete" | "full_complete";

export type Module = 
  | "trades" 
  | "parties" 
  | "compliance" 
  | "proofs" 
  | "finance" 
  | "payments" 
  | "finance_approval"
  | "negotiation_limits"
  | "settings";

const MODULE_ACCESS: Record<UserRole, Module[]> = {
  ops: ["trades", "parties", "compliance", "proofs", "finance", "payments", "settings"],
  finance: ["trades", "parties", "compliance", "proofs", "finance", "payments", "finance_approval", "negotiation_limits", "settings"],
  admin: ["trades", "parties", "compliance", "proofs", "finance", "payments", "finance_approval", "negotiation_limits", "settings"],
};

export function requireRole(user: { role: string }, requiredRole: UserRole): boolean {
  if (user.role === "admin") return true;
  return user.role === requiredRole;
}

export function canAccess(user: { role: string }, module: Module): boolean {
  const role = user.role as UserRole;
  const allowed = MODULE_ACCESS[role];
  if (!allowed) return false;
  return allowed.includes(module);
}

export function canApprovePayment(user: { role: string }): boolean {
  return user.role === "finance" || user.role === "admin";
}

export function canSetNegotiationLimits(user: { role: string }): boolean {
  return user.role === "finance" || user.role === "admin";
}

export function isOrgFullyOnboarded(org: { onboardingStatus: string }): boolean {
  return org.onboardingStatus === "full_complete";
}

export function isDemoMode(org: { onboardingStatus: string }): boolean {
  return org.onboardingStatus === "demo_active";
}

export interface GatingResult {
  allowed: boolean;
  reason?: string;
}

export function checkOperationGating(
  org: { onboardingStatus: string },
  action: "payment_approval" | "set_negotiation_limit" | "formal_operation"
): GatingResult {
  if (org.onboardingStatus !== "full_complete") {
    return {
      allowed: false,
      reason: `Organization must complete full onboarding before ${action.replace(/_/g, " ")}. Current status: ${org.onboardingStatus}`,
    };
  }
  return { allowed: true };
}
