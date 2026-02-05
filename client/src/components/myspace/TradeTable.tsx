import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

const STAGE_CTA = {
  plan: "Generate Plan",
  compliance: "Run Checks",
  funding: "Request Offer",
  payments: "Create Payment",
  "proof-pack": "Generate Proof",
};

const STATUS_COLORS = {
  planning: "bg-amber-500/10 text-amber-600",
  active: "bg-emerald-500/10 text-emerald-600",
  completed: "bg-blue-500/10 text-blue-600",
};

export function TradeTable() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"active" | "pending">("active");
  const { trades } = useAppStore();

  const filteredTrades = trades.filter(t => 
    activeTab === "active" ? t.status === "active" : t.status === "planning"
  );

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-1 px-4 py-3 border-b border-border">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "active" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
          data-testid="tab-active"
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
            activeTab === "pending" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
          data-testid="tab-pending"
        >
          Pending
        </button>
      </div>

      {filteredTrades.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-muted-foreground text-sm">
            No {activeTab} trades yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr className="text-xs text-muted-foreground">
                <th className="text-left px-4 py-3 font-medium">Trade</th>
                <th className="text-left px-4 py-3 font-medium">Corridor</th>
                <th className="text-left px-4 py-3 font-medium">Stage</th>
                <th className="text-left px-4 py-3 font-medium">Updated</th>
                <th className="text-right px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTrades.map((trade, index) => (
                <motion.tr
                  key={trade.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => setLocation(`/trade/${trade.id}`)}
                  data-testid={`row-trade-${trade.id}`}
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm">{trade.title}</div>
                    <div className="text-xs text-muted-foreground">{trade.goods || "—"}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{trade.corridor || "TBD"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${STATUS_COLORS[trade.status]}`}>
                      {trade.timelineStep}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {trade.createdAt.toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/trade/${trade.id}`);
                      }}
                      data-testid={`cta-trade-${trade.id}`}
                    >
                      {STAGE_CTA[trade.timelineStep]}
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
