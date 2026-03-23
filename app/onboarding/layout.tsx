import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TRAIBOX - Quick Onboarding",
};

export default function OnboardingQuickLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
