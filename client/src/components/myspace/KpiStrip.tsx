import { motion } from "framer-motion";
import { TrendingUp, Clock, AlertTriangle, Shield } from "lucide-react";
import { useAppStore } from "@/lib/store";

type KpiItem = {
  id: string;
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
};

export function KpiStrip() {
  const { trades } = useAppStore();

  const activeTrades = trades.filter(t => t.status === "active").length;
  const planningTrades = trades.filter(t => t.status === "planning").length;

  const kpis: KpiItem[] = [
    { id: "active", label: "Active Trades", value: activeTrades, icon: TrendingUp, color: "text-emerald-500" },
    { id: "pending", label: "Pending Actions", value: planningTrades + 3, icon: Clock, color: "text-amber-500" },
    { id: "alerts", label: "Alerts", value: 2, icon: AlertTriangle, color: "text-red-500" },
    { id: "passport", label: "Passport Ready", value: "72%", icon: Shield, color: "text-blue-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <motion.button
            key={kpi.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card border border-border rounded-xl p-4 text-left hover:border-primary/30 transition-all group"
            data-testid={`kpi-${kpi.id}`}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <p className="text-2xl font-semibold">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
          </motion.button>
        );
      })}
    </div>
  );
}
