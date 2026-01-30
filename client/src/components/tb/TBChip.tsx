import React from "react";
import { cn } from "@/lib/utils";

export type TBChipTone = "neutral" | "success" | "warn" | "error";

export function TBChip({
  tone,
  children,
  className,
  dataTestId,
}: {
  tone: TBChipTone;
  children: React.ReactNode;
  className?: string;
  dataTestId: string;
}) {
  const toneCls =
    tone === "success"
      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
      : tone === "warn"
        ? "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300"
        : tone === "error"
          ? "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300"
          : "bg-muted/60 border-border text-muted-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] leading-none",
        toneCls,
        className,
      )}
      data-testid={dataTestId}
    >
      {children}
    </span>
  );
}
