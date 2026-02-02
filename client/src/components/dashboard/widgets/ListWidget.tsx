import React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface ListItem {
  id: string;
  title: string;
  subtitle?: string;
  value?: string | number;
  status?: "active" | "pending" | "completed" | "failed";
  onClick?: () => void;
}

interface ListWidgetProps {
  items: ListItem[];
  maxItems?: number;
  emptyMessage?: string;
}

const statusColors = {
  active: "bg-blue-500",
  pending: "bg-yellow-500",
  completed: "bg-green-500",
  failed: "bg-red-500",
};

export function ListWidget({ items, maxItems = 5, emptyMessage = "No items" }: ListWidgetProps) {
  const displayItems = items.slice(0, maxItems);

  if (displayItems.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {displayItems.map((item) => (
        <button
          key={item.id}
          onClick={item.onClick}
          className={cn(
            "w-full flex items-center justify-between p-3 rounded-xl transition-colors text-left",
            item.onClick
              ? "hover:bg-accent/50 cursor-pointer"
              : "cursor-default"
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            {item.status && (
              <span className={cn(
                "w-2 h-2 rounded-full flex-shrink-0",
                statusColors[item.status]
              )} />
            )}
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{item.title}</div>
              {item.subtitle && (
                <div className="text-xs text-muted-foreground truncate">
                  {item.subtitle}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {item.value && (
              <span className="text-sm font-medium">{item.value}</span>
            )}
            {item.onClick && (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
