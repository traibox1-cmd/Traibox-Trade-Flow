import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight, MapPin, Calendar } from "lucide-react";
import { useAppStore } from "@/lib/store";

const STATUS_STYLES = {
  planning: "bg-amber-500/8 text-amber-600 dark:text-amber-400",
  active: "bg-emerald-500/8 text-emerald-600 dark:text-emerald-400",
  completed: "bg-blue-500/8 text-blue-600 dark:text-blue-400",
};

export function RecentTradesRow() {
  const [, setLocation] = useLocation();
  const { trades } = useAppStore();
  const recentTrades = trades.slice(0, 4);

  if (recentTrades.length === 0) {
    return (
      <div className="bg-card border border-border/40 rounded-2xl p-8 text-center shadow-xs">
        <p className="text-muted-foreground/60 text-sm">No trades yet. Create your first trade above.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-xs">
      <div className="px-5 py-3.5 border-b border-border/30">
        <h3 className="font-semibold text-[13px] tracking-tight">Recent Trades</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3">
        {recentTrades.map((trade, index) => (
          <motion.button
            key={trade.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.2 }}
            onClick={() => setLocation(`/trade/${trade.id}`)}
            className="text-left p-4 bg-muted/20 border border-border/30 rounded-xl hover:border-primary/20 hover:bg-accent/20 transition-all group"
            data-testid={`trade-card-${trade.id}`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-[13px] group-hover:text-primary transition-colors line-clamp-1">
                {trade.title}
              </h4>
              <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full flex-shrink-0 ml-2 ${STATUS_STYLES[trade.status]}`}>
                {trade.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground/50">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {trade.corridor || "TBD"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {trade.createdAt.toLocaleDateString()}
              </span>
            </div>
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-sm font-semibold tabular-nums">
                {trade.currency} {trade.value.toLocaleString()}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
