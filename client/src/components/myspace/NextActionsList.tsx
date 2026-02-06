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

const PRIORITY_STYLES = {
  high: "bg-red-500/8 text-red-600 dark:text-red-400",
  medium: "bg-amber-500/8 text-amber-600 dark:text-amber-400",
  low: "bg-blue-500/8 text-blue-600 dark:text-blue-400",
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
    <div className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-xs">
      <div className="px-5 py-3.5 border-b border-border/30">
        <h3 className="font-semibold text-[13px] tracking-tight">Next Actions</h3>
      </div>
      <div className="divide-y divide-border/20">
        {nextActions.map((action, index) => {
          const Icon = ICON_MAP[action.type];
          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03, duration: 0.2 }}
              className="flex items-center justify-between px-5 py-3 hover:bg-accent/30 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-muted/40 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-muted-foreground/70 stroke-[1.8]" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-medium truncate">{action.label}</p>
                  <p className="text-[11px] text-muted-foreground/50 truncate">{action.tradeTitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${PRIORITY_STYLES[action.priority]}`}>
                  {action.priority}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity gap-1 h-7 text-xs rounded-lg"
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
