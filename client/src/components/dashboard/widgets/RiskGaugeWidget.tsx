import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface RiskGaugeWidgetProps {
  score: number;
  maxScore?: number;
  label?: string;
  categories?: { name: string; level: "low" | "medium" | "high"; score: number }[];
}

export function RiskGaugeWidget({ score, maxScore = 100, label = "Portfolio Risk Score", categories = [] }: RiskGaugeWidgetProps) {
  const percentage = Math.min((score / maxScore) * 100, 100);
  const riskLevel = percentage < 35 ? "low" : percentage < 65 ? "medium" : "high";

  const riskColors = {
    low: { stroke: "#22c55e", bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", label: "Low Risk" },
    medium: { stroke: "#f59e0b", bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", label: "Medium Risk" },
    high: { stroke: "#ef4444", bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", label: "High Risk" },
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference * 0.75;

  const defaultCategories = categories.length > 0 ? categories : [
    { name: "Credit", level: "low" as const, score: 22 },
    { name: "Country", level: "medium" as const, score: 48 },
    { name: "Compliance", level: "low" as const, score: 15 },
    { name: "Operational", level: "high" as const, score: 71 },
  ];

  return (
    <div className="flex flex-col items-center gap-4" data-testid="widget-risk-gauge">
      <div className="relative w-32 h-24">
        <svg viewBox="0 0 100 65" className="w-full h-full">
          <path
            d="M 5 60 A 45 45 0 0 1 95 60"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 5 60 A 45 45 0 0 1 95 60"
            fill="none"
            stroke={riskColors[riskLevel].stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.5}`}
            strokeDashoffset={circumference * 0.5 * (1 - percentage / 100)}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
          <span className="text-2xl font-bold tabular-nums">{score}</span>
          <span className="text-[10px] text-muted-foreground/60">{label}</span>
        </div>
      </div>

      <span className={cn("px-2.5 py-1 text-[11px] font-semibold rounded-full", riskColors[riskLevel].bg, riskColors[riskLevel].text)}>
        {riskColors[riskLevel].label}
      </span>

      <div className="w-full space-y-2">
        {defaultCategories.map((cat) => (
          <div key={cat.name} className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground/60 w-20">{cat.name}</span>
            <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700",
                  cat.level === "low" && "bg-emerald-500",
                  cat.level === "medium" && "bg-amber-500",
                  cat.level === "high" && "bg-red-500"
                )}
                style={{ width: `${cat.score}%` }}
              />
            </div>
            <span className="text-[11px] font-medium tabular-nums w-8 text-right">{cat.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
