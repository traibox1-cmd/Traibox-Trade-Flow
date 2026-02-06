import { motion } from "framer-motion";
import { TrendingUp, Clock, AlertTriangle, Shield } from "lucide-react";
import { useAppStore } from "@/lib/store";

type KpiItem = {
  id: string;
  label: string;
  value: number | string;
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
};

export function KpiStrip() {
  const { trades } = useAppStore();

  const activeTrades = trades.filter(t => t.status === "active").length;
  const planningTrades = trades.filter(t => t.status === "planning").length;

  const kpis: KpiItem[] = [
    { id: "active", label: "Active Trades", value: activeTrades, icon: TrendingUp, gradient: "from-emerald-500/10 to-emerald-500/[0.02]", iconColor: "text-emerald-500" },
    { id: "pending", label: "Pending Actions", value: planningTrades + 3, icon: Clock, gradient: "from-amber-500/10 to-amber-500/[0.02]", iconColor: "text-amber-500" },
    { id: "alerts", label: "Alerts", value: 2, icon: AlertTriangle, gradient: "from-red-500/10 to-red-500/[0.02]", iconColor: "text-red-500" },
    { id: "passport", label: "Passport Ready", value: "72%", icon: Shield, gradient: "from-blue-500/10 to-blue-500/[0.02]", iconColor: "text-blue-500" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <motion.button
            key={kpi.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.25 }}
            className="bg-card border border-border/40 rounded-2xl p-4 text-left hover:border-primary/20 transition-all group shadow-xs"
            data-testid={`kpi-${kpi.id}`}
          >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${kpi.gradient} flex items-center justify-center mb-3`}>
              <Icon className={`w-[18px] h-[18px] ${kpi.iconColor} stroke-[1.8]`} />
            </div>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">{kpi.value}</p>
            <p className="text-[11px] text-muted-foreground/60 mt-0.5">{kpi.label}</p>
          </motion.button>
        );
      })}
    </div>
  );
}
