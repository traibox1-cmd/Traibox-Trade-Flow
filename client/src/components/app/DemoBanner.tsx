"use client";

import { useAuth } from "@/hooks/useAuth";

export function DemoBanner() {
  const { isDemoMode, org } = useAuth();

  if (!isDemoMode) return null;

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2">
      <span className="inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Demo Mode
      </span>
      <span className="hidden sm:inline">— You are exploring {org?.name || "TRAIBOX"} with sample data.</span>
      <a
        href="/onboarding/full"
        className="ml-2 underline hover:no-underline font-semibold"
      >
        Complete onboarding →
      </a>
    </div>
  );
}
