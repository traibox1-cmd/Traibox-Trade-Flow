import React from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: "trade" | "payment" | "compliance" | "network" | "funding";
  title: string;
  description?: string;
  timestamp: Date | string;
  status?: "success" | "warning" | "error" | "pending";
}

interface ActivityWidgetProps {
  activities: ActivityItem[];
  maxItems?: number;
}

const statusColors = {
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
  pending: "bg-blue-500",
};

const typeIcons: Record<ActivityItem["type"], string> = {
  trade: "📦",
  payment: "💰",
  compliance: "✓",
  network: "🤝",
  funding: "🏦",
};

export function ActivityWidget({ activities, maxItems = 5 }: ActivityWidgetProps) {
  const items = activities.slice(0, maxItems);

  if (items.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center text-sm">
            {typeIcons[item.type]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">{item.title}</span>
              {item.status && (
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full flex-shrink-0",
                  statusColors[item.status]
                )} />
              )}
            </div>
            {item.description && (
              <div className="text-xs text-muted-foreground truncate">
                {item.description}
              </div>
            )}
            <div className="text-[10px] text-muted-foreground/70 mt-0.5">
              {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
