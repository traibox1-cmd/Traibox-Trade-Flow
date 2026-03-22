import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { 
  Sparkles, 
  TrendingUp,
  Handshake,
  Banknote,
  ShieldCheck,
  ChevronRight,
  Clock,
  CheckCircle2,
  Package,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type QuickLink = {
  label: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: string;
};

const QUICK_LINKS: QuickLink[] = [
  {
    label: "Trade Intelligence",
    description: "AI assistant for planning and analysis",
    icon: Sparkles,
    href: "/trade-intelligence",
    color: "from-violet-500/20 to-violet-500/5",
  },
  {
    label: "Trade Workspace",
    description: "Manage your active trades",
    icon: TrendingUp,
    href: "/trades",
    color: "from-emerald-500/20 to-emerald-500/5",
  },
  {
    label: "Network",
    description: "Connect with partners",
    icon: Handshake,
    href: "/network",
    color: "from-blue-500/20 to-blue-500/5",
  },
];

function StatCard({ label, value, subValue, icon: Icon, onClick }: {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ElementType;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {onClick && (
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
      {subValue && (
        <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
      )}
    </button>
  );
}

function TradePreview({ trade, onClick }: { trade: any; onClick: () => void }) {
  const statusConfig = {
    active: { color: "bg-emerald-500", label: "Active" },
    planning: { color: "bg-amber-500", label: "Planning" },
    completed: { color: "bg-blue-500", label: "Completed" },
    draft: { color: "bg-gray-500", label: "Draft" },
  };

  const status = statusConfig[trade.status as keyof typeof statusConfig] || statusConfig.draft;

  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-all text-left group w-full"
    >
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full ${status.color}`} />
        <div>
          <p className="font-medium text-foreground group-hover:text-primary transition-colors">{trade.title}</p>
          <p className="text-sm text-muted-foreground">{trade.corridor}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">
          {trade.currency} {trade.value?.toLocaleString()}
        </span>
        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  );
}

export default function MySpace() {
  const [, setLocation] = useLocation();
  const { trades, fundingRequests, partners, complianceRuns } = useAppStore();
  
  const activeTrades = trades.filter(t => t.status === 'active');
  const planningTrades = trades.filter(t => t.status === 'planning');
  const pendingFunding = fundingRequests.filter(f => f.status === 'pending' || f.status === 'reviewing');
  const recentCompliance = complianceRuns.slice(0, 3);

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-6 border-b border-border">
        <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
        <p className="text-muted-foreground mt-1">Here's an overview of your trade operations</p>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Quick Links */}
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-4">Quick Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {QUICK_LINKS.map((link) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setLocation(link.href)}
                  className="flex items-start gap-4 p-5 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all text-left group"
                  data-testid={`quick-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center flex-shrink-0`}>
                    <link.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {link.label}
                      </h3>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{link.description}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Stats Overview */}
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-4">Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Active Trades"
                value={activeTrades.length}
                subValue={`${planningTrades.length} in planning`}
                icon={TrendingUp}
                onClick={() => setLocation("/trades")}
              />
              <StatCard
                label="Network Partners"
                value={partners.length}
                icon={Handshake}
                onClick={() => setLocation("/network")}
              />
              <StatCard
                label="Pending Funding"
                value={pendingFunding.length}
                icon={Banknote}
                onClick={() => setLocation("/finance")}
              />
              <StatCard
                label="Compliance Checks"
                value={complianceRuns.length}
                subValue={`${complianceRuns.filter(c => c.overall === 'passed').length} clear`}
                icon={ShieldCheck}
                onClick={() => setLocation("/compliance")}
              />
            </div>
          </div>

          {/* Recent Trades */}
          {trades.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-muted-foreground">Recent Trades</h2>
                <Button variant="ghost" size="sm" onClick={() => setLocation("/trades")} className="gap-1 text-xs">
                  View all
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </div>
              <div className="space-y-3">
                {trades.slice(0, 3).map((trade) => (
                  <TradePreview
                    key={trade.id}
                    trade={trade}
                    onClick={() => setLocation(`/trade/${trade.id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {trades.length === 0 && (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Get started with your first trade</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Use the AI assistant to plan your first international trade, or load demo data to explore the platform.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={() => setLocation("/trade-intelligence")} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  Start with AI
                </Button>
                <Button variant="outline" onClick={() => setLocation("/settings")}>
                  Load Demo Data
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
