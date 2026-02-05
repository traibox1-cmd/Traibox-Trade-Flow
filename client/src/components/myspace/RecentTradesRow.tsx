import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ChevronRight, MapPin, Calendar } from "lucide-react";
import { useAppStore } from "@/lib/store";

const STATUS_COLORS = {
  planning: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  completed: "bg-blue-500/10 text-blue-600 border-blue-500/30",
};

export function RecentTradesRow() {
  const [, setLocation] = useLocation();
  const { trades } = useAppStore();

  const recentTrades = trades.slice(0, 4);

  if (recentTrades.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center">
        <p className="text-muted-foreground text-sm">No trades yet. Create your first trade above.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm">Recent Trades</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3">
        {recentTrades.map((trade, index) => (
          <motion.button
            key={trade.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setLocation(`/trade/${trade.id}`)}
            className="text-left p-4 bg-muted/30 border border-border rounded-xl hover:border-primary/30 transition-all group"
            data-testid={`trade-card-${trade.id}`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">
                {trade.title}
              </h4>
              <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border flex-shrink-0 ${STATUS_COLORS[trade.status]}`}>
                {trade.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {trade.corridor || "TBD"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {trade.createdAt.toLocaleDateString()}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-semibold">
                {trade.currency} {trade.value.toLocaleString()}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
