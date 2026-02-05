import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Plus,
  Search,
  FileText,
  Banknote,
  ShieldCheck,
  MapPin,
  Calendar,
  DollarSign,
  ChevronRight,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore, type Trade } from "@/lib/store";

type TabId = "all" | "active" | "planning" | "completed";

const TABS: { id: TabId; label: string }[] = [
  { id: "all", label: "All Trades" },
  { id: "active", label: "Active" },
  { id: "planning", label: "Planning" },
  { id: "completed", label: "Completed" },
];

function TradeCard({ trade, onClick }: { trade: Trade; onClick: () => void }) {
  const statusConfig = {
    active: { color: "text-emerald-600 bg-emerald-50", icon: CheckCircle2, label: "Active" },
    planning: { color: "text-amber-600 bg-amber-50", icon: Clock, label: "Planning" },
    completed: { color: "text-blue-600 bg-blue-50", icon: CheckCircle2, label: "Completed" },
    draft: { color: "text-gray-600 bg-gray-50", icon: FileText, label: "Draft" },
  };

  const status = statusConfig[trade.status as keyof typeof statusConfig] || statusConfig.draft;
  const StatusIcon = status.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="w-full text-left bg-card border border-border rounded-xl p-5 hover:border-primary/30 hover:shadow-sm transition-all group"
      data-testid={`trade-card-${trade.id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {trade.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{trade.goods}</p>
        </div>
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{trade.corridor}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <DollarSign className="w-4 h-4" />
          <span>{trade.currency} {trade.value?.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{trade.incoterms || "TBD"}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-3">
          {trade.parties && trade.parties.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {trade.parties.length} {trade.parties.length === 1 ? "party" : "parties"}
            </span>
          )}
          {trade.documents && trade.documents.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {trade.documents.length} {trade.documents.length === 1 ? "document" : "documents"}
            </span>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </motion.button>
  );
}

function QuickAction({ icon: Icon, label, description, onClick, testId }: {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
  testId: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 hover:shadow-sm transition-all text-left group"
      data-testid={testId}
    >
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">{label}</h4>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </button>
  );
}

export default function Trades() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { trades } = useAppStore();

  const filteredTrades = trades.filter((trade) => {
    const matchesSearch = trade.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          trade.goods?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          trade.corridor?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    return matchesSearch && trade.status === activeTab;
  });

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Trade Workspace</h1>
              <p className="text-sm text-muted-foreground">Manage your trades, compliance, and financing</p>
            </div>
          </div>
          
          <Button
            onClick={() => setLocation("/trade-intelligence")}
            className="gap-2"
            data-testid="btn-new-trade"
          >
            <Plus className="w-4 h-4" />
            New Trade
          </Button>
        </div>

        {/* Search and Tabs */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search trades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              data-testid="input-search-trades"
            />
          </div>
          
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`tab-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">No trades yet</h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Start by creating a new trade or use the AI assistant to plan your first international trade.
            </p>
            <Button onClick={() => setLocation("/trade-intelligence")} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Trade
            </Button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickAction
                  icon={Banknote}
                  label="Finance"
                  description="Manage payments and funding requests"
                  onClick={() => setLocation("/finance")}
                  testId="action-finance"
                />
                <QuickAction
                  icon={ShieldCheck}
                  label="Compliance"
                  description="Run checks and manage proof packs"
                  onClick={() => setLocation("/compliance")}
                  testId="action-compliance"
                />
                <QuickAction
                  icon={FileText}
                  label="Documents"
                  description="Upload and manage trade documents"
                  onClick={() => {}}
                  testId="action-documents"
                />
              </div>
            </div>

            {/* Trades Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-muted-foreground">
                  {filteredTrades.length} {filteredTrades.length === 1 ? "trade" : "trades"}
                </h2>
              </div>
              
              {filteredTrades.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No trades match your search</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredTrades.map((trade) => (
                    <TradeCard
                      key={trade.id}
                      trade={trade}
                      onClick={() => setLocation(`/trade/${trade.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
