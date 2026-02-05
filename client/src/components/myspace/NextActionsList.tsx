import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight, FileCheck, Banknote, ShieldCheck, CreditCard, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

type NextAction = {
  id: string;
  label: string;
  tradeTitle: string;
  tradeId: string;
  type: "compliance" | "funding" | "payment" | "proof" | "logistics";
  priority: "high" | "medium" | "low";
};

const ICON_MAP = {
  compliance: ShieldCheck,
  funding: Banknote,
  payment: CreditCard,
  proof: FileCheck,
  logistics: Package,
};

const PRIORITY_COLORS = {
  high: "bg-red-500/10 text-red-600 border-red-500/30",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  low: "bg-blue-500/10 text-blue-600 border-blue-500/30",
};

export function NextActionsList() {
  const [, setLocation] = useLocation();
  const { trades } = useAppStore();

  const nextActions: NextAction[] = [
    { id: "1", label: "Run compliance check", tradeTitle: trades[0]?.title || "Coffee Import", tradeId: trades[0]?.id || "1", type: "compliance", priority: "high" },
    { id: "2", label: "Request funding offer", tradeTitle: trades[0]?.title || "Coffee Import", tradeId: trades[0]?.id || "1", type: "funding", priority: "high" },
    { id: "3", label: "Confirm payment terms", tradeTitle: trades[1]?.title || "Cocoa Export", tradeId: trades[1]?.id || "2", type: "payment", priority: "medium" },
    { id: "4", label: "Generate proof pack", tradeTitle: trades[0]?.title || "Coffee Import", tradeId: trades[0]?.id || "1", type: "proof", priority: "low" },
    { id: "5", label: "Track shipment", tradeTitle: trades[1]?.title || "Cocoa Export", tradeId: trades[1]?.id || "2", type: "logistics", priority: "medium" },
  ];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm">Next Actions</h3>
      </div>
      <div className="divide-y divide-border">
        {nextActions.slice(0, 7).map((action, index) => {
          const Icon = ICON_MAP[action.type];
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              className="flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{action.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{action.tradeTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${PRIORITY_COLORS[action.priority]}`}>
                  {action.priority}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity gap-1"
                  onClick={() => setLocation(`/trade/${action.tradeId}`)}
                  data-testid={`action-do-${action.id}`}
                >
                  Do it
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
