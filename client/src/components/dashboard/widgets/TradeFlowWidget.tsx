import { cn } from "@/lib/utils";

interface FlowItem {
  from: string;
  to: string;
  value: number;
  goods: string;
  status: "active" | "planning" | "completed";
}

interface TradeFlowWidgetProps {
  flows?: FlowItem[];
}

const STATUS_DOT: Record<string, string> = {
  active: "bg-emerald-500",
  planning: "bg-amber-500",
  completed: "bg-blue-500",
};

export function TradeFlowWidget({ flows }: TradeFlowWidgetProps) {
  const defaultFlows: FlowItem[] = flows || [
    { from: "Kenya", to: "EU", value: 250000, goods: "Coffee Beans", status: "active" },
    { from: "US", to: "Singapore", value: 450000, goods: "Medical Equipment", status: "active" },
    { from: "Brazil", to: "China", value: 180000, goods: "Soybeans", status: "planning" },
    { from: "India", to: "UAE", value: 320000, goods: "Textiles", status: "completed" },
  ];

  const totalValue = defaultFlows.reduce((sum, f) => sum + f.value, 0);

  return (
    <div className="space-y-4" data-testid="widget-trade-flow">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground/60">Total Flow</span>
        <span className="text-lg font-semibold tabular-nums">${(totalValue / 1000).toFixed(0)}K</span>
      </div>

      <div className="space-y-2.5">
        {defaultFlows.map((flow, i) => {
          const pct = (flow.value / totalValue) * 100;
          return (
            <div key={i} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[flow.status])} />
                  <span className="text-[12px] font-medium">{flow.from}</span>
                  <span className="text-[10px] text-muted-foreground/40">→</span>
                  <span className="text-[12px] font-medium">{flow.to}</span>
                </div>
                <span className="text-[11px] text-muted-foreground tabular-nums">${(flow.value / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted/40 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-700",
                      flow.status === "active" && "bg-gradient-to-r from-emerald-500 to-emerald-400",
                      flow.status === "planning" && "bg-gradient-to-r from-amber-500 to-amber-400",
                      flow.status === "completed" && "bg-gradient-to-r from-blue-500 to-blue-400"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground/40 w-12">{flow.goods}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 pt-1 border-t border-border/20">
        {Object.entries({ active: "Active", planning: "Planning", completed: "Done" }).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
            <span className={cn("w-2 h-2 rounded-full", STATUS_DOT[key])} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
