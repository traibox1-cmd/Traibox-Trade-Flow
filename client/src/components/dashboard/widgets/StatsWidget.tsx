import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatItem {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
}

interface StatsWidgetProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
}

export function StatsWidget({ stats, columns = 2 }: StatsWidgetProps) {
  return (
    <div className={cn(
      "grid gap-4",
      columns === 2 && "grid-cols-2",
      columns === 3 && "grid-cols-3",
      columns === 4 && "grid-cols-2 md:grid-cols-4"
    )}>
      {stats.map((stat, idx) => (
        <div key={idx} className="space-y-1">
          <div className="text-2xl font-light tracking-tight">{stat.value}</div>
          <div className="text-xs text-muted-foreground">{stat.label}</div>
          {stat.change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-xs",
              stat.change > 0 && "text-green-600",
              stat.change < 0 && "text-red-600",
              stat.change === 0 && "text-muted-foreground"
            )}>
              {stat.change > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : stat.change < 0 ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              <span>{Math.abs(stat.change)}% {stat.changeLabel || "vs last period"}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
