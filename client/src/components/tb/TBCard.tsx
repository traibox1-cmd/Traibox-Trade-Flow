import React from "react";
import { cn } from "@/lib/utils";
import { Loader2, TriangleAlert, XCircle } from "lucide-react";

export type TBCardState = "idle" | "loading" | "ready" | "warn" | "error";

function stateStyles(state: TBCardState) {
  switch (state) {
    case "loading":
      return {
        ring: "ring-1 ring-primary/15",
        badge: "bg-primary/10 border-primary/20 text-primary",
      };
    case "ready":
      return {
        ring: "ring-1 ring-emerald-500/15",
        badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300",
      };
    case "warn":
      return {
        ring: "ring-1 ring-amber-500/15",
        badge: "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-300",
      };
    case "error":
      return {
        ring: "ring-1 ring-red-500/15",
        badge: "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300",
      };
    default:
      return {
        ring: "",
        badge: "bg-muted/60 border-border text-muted-foreground",
      };
  }
}

export function TBCard({
  title,
  subtitle,
  state,
  icon,
  children,
  className,
  dataTestId,
}: {
  title: string;
  subtitle?: string;
  state: TBCardState;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  dataTestId: string;
}) {
  const s = stateStyles(state);

  return (
    <section
      className={cn(
        "noise relative rounded-3xl border bg-card/60 p-4 md:p-5 shadow-sm transition-colors",
        "hover:bg-card",
        s.ring,
        className,
      )}
      data-testid={dataTestId}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {icon ? (
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border bg-background/60"
                aria-hidden="true"
              >
                <span className="text-primary">{icon}</span>
              </span>
            ) : null}
            <div className="min-w-0">
              <h2 className="truncate font-medium" data-testid={`${dataTestId}-title`}>
                {title}
              </h2>
              {subtitle ? (
                <p
                  className="mt-0.5 text-sm text-muted-foreground"
                  data-testid={`${dataTestId}-subtitle`}
                >
                  {subtitle}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px]",
            s.badge,
          )}
          data-testid={`${dataTestId}-state`}
          aria-label={`Card state: ${state}`}
        >
          {state === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          {state === "warn" ? <TriangleAlert className="h-3.5 w-3.5" /> : null}
          {state === "error" ? <XCircle className="h-3.5 w-3.5" /> : null}
          <span className="capitalize">{state}</span>
        </div>
      </header>

      <div className="mt-4" data-testid={`${dataTestId}-body`}>
        {children}
      </div>
    </section>
  );
}
