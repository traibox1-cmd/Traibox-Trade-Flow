import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

const STAGE_CTA: Record<string, string> = {
  plan: "Generate Plan",
  compliance: "Run Checks",
  funding: "Request Offer",
  payments: "Create Payment",
  "proof-pack": "Generate Proof",
};

const STATUS_STYLES: Record<string, string> = {
  planning: "bg-amber-500/8 text-amber-600 dark:text-amber-400",
  active: "bg-emerald-500/8 text-emerald-600 dark:text-emerald-400",
  completed: "bg-blue-500/8 text-blue-600 dark:text-blue-400",
};

export function TradeTable() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"active" | "pending">("active");
  const { trades } = useAppStore();

  const filteredTrades = trades.filter(t =>
    activeTab === "active" ? t.status === "active" : t.status === "planning"
  );

  return (
    <div className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-xs">
      <div className="flex items-center gap-1 px-5 py-3 border-b border-border/30">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-colors ${
            activeTab === "active" ? "bg-primary/8 text-primary" : "text-muted-foreground/60 hover:text-foreground"
          }`}
          data-testid="tab-active"
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-3.5 py-1.5 text-[13px] font-medium rounded-lg transition-colors ${
            activeTab === "pending" ? "bg-primary/8 text-primary" : "text-muted-foreground/60 hover:text-foreground"
          }`}
          data-testid="tab-pending"
        >
          Pending
        </button>
      </div>

      {filteredTrades.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-muted-foreground/50 text-sm">
            No {activeTab} trades yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/20">
              <tr className="text-[11px] text-muted-foreground/50 uppercase tracking-wide">
                <th className="text-left px-5 py-2.5 font-medium">Trade</th>
                <th className="text-left px-5 py-2.5 font-medium hidden md:table-cell">Corridor</th>
                <th className="text-left px-5 py-2.5 font-medium">Stage</th>
                <th className="text-left px-5 py-2.5 font-medium hidden lg:table-cell">Updated</th>
                <th className="text-right px-5 py-2.5 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filteredTrades.map((trade, index) => (
                <motion.tr
                  key={trade.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-accent/20 transition-colors cursor-pointer"
                  onClick={() => setLocation(`/trade/${trade.id}`)}
                  data-testid={`row-trade-${trade.id}`}
                >
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-[13px]">{trade.title}</div>
                    <div className="text-[11px] text-muted-foreground/40">{trade.goods || "—"}</div>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-muted-foreground hidden md:table-cell">{trade.corridor || "TBD"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-1 text-[11px] font-medium rounded-lg ${STATUS_STYLES[trade.status]}`}>
                      {trade.timelineStep}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-muted-foreground/50 hidden lg:table-cell">
                    {trade.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 h-7 text-xs rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/trade/${trade.id}`);
                      }}
                      data-testid={`cta-trade-${trade.id}`}
                    >
                      {STAGE_CTA[trade.timelineStep] || "View"}
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
