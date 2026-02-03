import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Widget, WidgetConfig, WidgetSize } from "@/components/dashboard/Widget";
import { StatsWidget, ActivityWidget, ChartWidget, ListWidget } from "@/components/dashboard/widgets";
import { 
  Sparkles, 
  ShieldCheck, 
  Plus, 
  Settings2, 
  Check, 
  RotateCcw,
  AlertCircle,
  FileCheck,
  Banknote,
  Users,
  ChevronRight,
  Package,
  ClipboardCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const DASHBOARD_STORAGE_KEY = "traibox-dashboard-config";

interface DashboardConfig {
  widgets: WidgetConfig[];
  version: number;
}

const defaultWidgets: WidgetConfig[] = [
  { id: "trade-volume", type: "chart-trades", title: "Trade Volume", size: "medium", visible: true },
  { id: "funding-status", type: "chart-funding", title: "Funding Status", size: "medium", visible: true },
  { id: "activity-feed", type: "activity", title: "Recent Activity", size: "medium", visible: true },
  { id: "network-stats", type: "stats-network", title: "Network", size: "small", visible: true },
];

const availableWidgets: { type: string; title: string; defaultSize: WidgetSize }[] = [
  { type: "chart-trades", title: "Trade Volume Chart", defaultSize: "medium" },
  { type: "activity", title: "Activity Feed", defaultSize: "medium" },
  { type: "chart-funding", title: "Funding Status", defaultSize: "medium" },
  { type: "stats-compliance", title: "Compliance Summary", defaultSize: "small" },
  { type: "stats-network", title: "Network Stats", defaultSize: "small" },
  { type: "chart-payments", title: "Payments Chart", defaultSize: "medium" },
  { type: "list-partners", title: "Top Partners", defaultSize: "small" },
];

export default function MySpace() {
  const { 
    trades, 
    fundingRequests, 
    payments, 
    partners, 
    complianceRuns, 
    proofPacks, 
    notifications, 
    fetchTradesFromAPI, 
    loadDemoData,
    tutorialCompleted, 
    startTutorial 
  } = useAppStore();
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [isEditingWidgets, setIsEditingWidgets] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [config, setConfig] = useState<DashboardConfig>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(DASHBOARD_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return { widgets: defaultWidgets, version: 1 };
        }
      }
    }
    return { widgets: defaultWidgets, version: 1 };
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchTradesFromAPI();
  }, [fetchTradesFromAPI]);

  useEffect(() => {
    if (!tutorialCompleted && trades.length === 0) {
      const hasSeenWelcome = localStorage.getItem('traibox-welcome-seen');
      if (!hasSeenWelcome) {
        localStorage.setItem('traibox-welcome-seen', 'true');
        startTutorial();
      }
    }
  }, [tutorialCompleted, trades.length, startTutorial]);

  useEffect(() => {
    localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const activeTrades = trades.filter(t => t.status === 'active').length;
  const pendingActions = notifications.filter(n => n.targetRole === 'operator' && !n.read).length;
  const alertCount = notifications.filter(n => (n.type === 'rejection' || n.type === 'info-request') && !n.read).length;
  
  const passportStatus = useMemo(() => {
    const hasProofPack = proofPacks.some(p => p.status === 'ready');
    const passedCompliance = complianceRuns.filter(r => r.status === 'passed').length;
    if (hasProofPack && passedCompliance > 0) {
      return { label: "Ready", color: "text-emerald-600", bg: "bg-emerald-500/10" };
    }
    return { label: "Missing items", color: "text-amber-600", bg: "bg-amber-500/10" };
  }, [proofPacks, complianceRuns]);

  const nextActions = useMemo(() => {
    const actions: { id: string; label: string; description: string; icon: any; href: string; priority: "high" | "medium" | "low" }[] = [];
    
    const needsCompliance = complianceRuns.filter(r => r.status === 'failed' || r.status === 'pending').length > 0;
    const pendingFunding = fundingRequests.filter(r => r.status === 'pending' || r.status === 'info-requested').length;
    const draftProofPacks = proofPacks.filter(p => p.status === 'draft').length;
    
    if (trades.length === 0) {
      actions.push({
        id: "create-trade",
        label: "Create your first trade",
        description: "Start by creating a trade in Trade Intelligence",
        icon: Plus,
        href: "/intelligence",
        priority: "high"
      });
    }
    
    if (needsCompliance) {
      actions.push({
        id: "run-compliance",
        label: "Run compliance checks",
        description: `${complianceRuns.filter(r => r.status === 'failed' || r.status === 'pending').length} checks need attention`,
        icon: ClipboardCheck,
        href: "/compliance?tab=checks",
        priority: "high"
      });
    }
    
    if (passportStatus.label === "Missing items") {
      actions.push({
        id: "complete-passport",
        label: "Complete Trade Passport",
        description: "Add missing identity documents",
        icon: ShieldCheck,
        href: "/compliance?tab=passport",
        priority: "high"
      });
    }
    
    if (pendingFunding > 0) {
      actions.push({
        id: "check-funding",
        label: "Check funding requests",
        description: `${pendingFunding} request${pendingFunding > 1 ? 's' : ''} pending`,
        icon: Banknote,
        href: "/finance?tab=funding",
        priority: "medium"
      });
    }
    
    if (draftProofPacks > 0) {
      actions.push({
        id: "finalize-proofs",
        label: "Finalize proof packs",
        description: `${draftProofPacks} draft${draftProofPacks > 1 ? 's' : ''} ready to complete`,
        icon: FileCheck,
        href: "/compliance?tab=proof-packs",
        priority: "medium"
      });
    }
    
    if (partners.length < 3) {
      actions.push({
        id: "grow-network",
        label: "Grow your network",
        description: "Invite trade partners to collaborate",
        icon: Users,
        href: "/network?tab=invites",
        priority: "low"
      });
    }
    
    return actions.slice(0, 5);
  }, [trades, complianceRuns, fundingRequests, proofPacks, partners, passportStatus]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setConfig((prev) => {
        const oldIndex = prev.widgets.findIndex((w) => w.id === active.id);
        const newIndex = prev.widgets.findIndex((w) => w.id === over.id);
        return {
          ...prev,
          widgets: arrayMove(prev.widgets, oldIndex, newIndex),
        };
      });
    }
  };

  const handleRemoveWidget = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) =>
        w.id === id ? { ...w, visible: false } : w
      ),
    }));
  };

  const handleResizeWidget = (id: string, size: WidgetSize) => {
    setConfig((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) =>
        w.id === id ? { ...w, size } : w
      ),
    }));
  };

  const handleAddWidget = (type: string) => {
    const widgetDef = availableWidgets.find((w) => w.type === type);
    if (!widgetDef) return;

    const existingWidget = config.widgets.find((w) => w.type === type);
    if (existingWidget) {
      setConfig((prev) => ({
        ...prev,
        widgets: prev.widgets.map((w) =>
          w.id === existingWidget.id ? { ...w, visible: true } : w
        ),
      }));
    } else {
      const newWidget: WidgetConfig = {
        id: `${type}-${Date.now()}`,
        type,
        title: widgetDef.title,
        size: widgetDef.defaultSize,
        visible: true,
      };
      setConfig((prev) => ({
        ...prev,
        widgets: [...prev.widgets, newWidget],
      }));
    }
    setShowAddWidget(false);
  };

  const handleResetLayout = () => {
    setConfig({ widgets: defaultWidgets, version: 1 });
  };

  const handleLoadDemo = () => {
    loadDemoData();
    toast({
      title: "Demo data loaded",
      description: "Sample trades, partners, and compliance data are now available.",
    });
  };

  const visibleWidgets = config.widgets.filter((w) => w.visible);

  const tradeVolumeData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((name, i) => ({
      name,
      volume: Math.floor(50000 + Math.random() * 150000 + i * 20000),
    }));
  }, []);

  const fundingData = useMemo(() => {
    const pending = fundingRequests.filter((r) => r.status === "pending" || r.status === "reviewing" || r.status === "info-requested").length;
    const approved = fundingRequests.filter((r) => r.status === "approved" || r.status === "offered").length;
    const rejected = fundingRequests.filter((r) => r.status === "rejected").length;
    return [
      { name: "Pending", value: pending || 2 },
      { name: "Approved", value: approved || 3 },
      { name: "Rejected", value: rejected || 1 },
    ];
  }, [fundingRequests]);

  const paymentData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((name) => ({
      name,
      amount: Math.floor(10000 + Math.random() * 50000),
    }));
  }, []);

  const recentActivity = useMemo(() => {
    const activities: any[] = [];
    
    trades.slice(0, 3).forEach((trade) => {
      activities.push({
        id: `trade-${trade.id}`,
        type: "trade",
        title: trade.title,
        description: trade.corridor,
        timestamp: trade.createdAt,
        status: trade.status === "active" ? "success" : "pending",
      });
    });

    payments.slice(0, 2).forEach((payment) => {
      activities.push({
        id: `payment-${payment.id}`,
        type: "payment",
        title: `Payment: $${payment.amount.toLocaleString()}`,
        description: payment.rail,
        timestamp: payment.createdAt,
        status: payment.status === "completed" ? "success" : "pending",
      });
    });

    return activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 5);
  }, [trades, payments]);

  const renderWidgetContent = (widget: WidgetConfig) => {
    switch (widget.type) {
      case "chart-trades":
        return <ChartWidget type="area" data={tradeVolumeData} dataKey="volume" height={180} />;

      case "activity":
        return <ActivityWidget activities={recentActivity} maxItems={5} />;

      case "chart-funding":
        return <ChartWidget type="pie" data={fundingData} dataKey="value" height={180} />;

      case "stats-compliance":
        const passedRuns = complianceRuns.filter((r) => r.status === "passed").length;
        return (
          <StatsWidget
            columns={2}
            stats={[
              { label: "Checks Run", value: complianceRuns.length },
              { label: "Passed", value: passedRuns },
              { label: "Proof Packs", value: proofPacks.length },
              { label: "Ready", value: proofPacks.filter((p) => p.status === "ready").length },
            ]}
          />
        );

      case "stats-network":
        return (
          <StatsWidget
            columns={2}
            stats={[
              { label: "Partners", value: partners.length },
              { label: "Connected", value: partners.filter((p) => p.connectionStatus === "connected").length },
            ]}
          />
        );

      case "chart-payments":
        return <ChartWidget type="bar" data={paymentData} dataKey="amount" height={180} />;

      case "list-partners":
        return (
          <ListWidget
            items={partners.slice(0, 4).map((partner) => ({
              id: partner.id,
              title: partner.name,
              subtitle: partner.canActAs.join(", ") || partner.region,
              status: partner.connectionStatus === "connected" ? "active" : "pending",
            }))}
            emptyMessage="No partners"
          />
        );

      default:
        return <div className="text-muted-foreground text-sm">Unknown widget type</div>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-6 border-b border-border">
        <h1 className="text-2xl font-semibold tracking-tight">My Space</h1>
        <p className="text-sm text-muted-foreground mt-1">Your trade workspace and operations hub</p>
      </div>
      
      <div className="flex-1 overflow-auto p-8 mx-auto max-w-7xl w-full space-y-8">
        {/* Primary CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            size="lg" 
            onClick={() => setLocation('/intelligence')} 
            className="gap-2"
            data-testid="button-new-trade"
          >
            <Plus className="w-4 h-4" />
            New Trade
          </Button>
          {trades.length === 0 && (
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handleLoadDemo}
              className="gap-2"
              data-testid="button-load-demo-data"
            >
              <Package className="w-4 h-4" />
              Load Demo Data
            </Button>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Active Trades</div>
            <div className="text-3xl font-semibold">{activeTrades}</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Pending Actions</div>
            <div className="text-3xl font-semibold">{pendingActions}</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-3 h-3 text-muted-foreground" />
              <div className="text-muted-foreground text-xs uppercase tracking-wider">Alerts</div>
            </div>
            <div className="text-3xl font-semibold">{alertCount}</div>
          </div>
          <div 
            className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-primary/30 transition-colors"
            onClick={() => setLocation('/compliance?tab=passport')}
            data-testid="card-trade-passport"
          >
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-3 h-3 text-primary" />
              <div className="text-muted-foreground text-xs uppercase tracking-wider">Trade Passport</div>
            </div>
            <div className={cn("text-sm font-medium inline-flex items-center px-2 py-0.5 rounded-full", passportStatus.bg, passportStatus.color)}>
              {passportStatus.label}
            </div>
          </div>
        </div>

        {/* Next Actions */}
        {nextActions.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Next Actions</h2>
            <div className="space-y-2">
              {nextActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => setLocation(action.href)}
                  className="w-full bg-card border border-border rounded-xl p-4 hover:bg-accent hover:border-primary/20 transition-colors text-left flex items-center gap-4 group"
                  data-testid={`action-${action.id}`}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    action.priority === "high" ? "bg-amber-500/10 text-amber-600" :
                    action.priority === "medium" ? "bg-blue-500/10 text-blue-600" :
                    "bg-muted text-muted-foreground"
                  )}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{action.label}</div>
                    <div className="text-xs text-muted-foreground truncate">{action.description}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Trades */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Recent Trades</h2>
          {trades.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-2">No trades yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first trade to start managing international operations
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {trades.slice(0, 5).map((trade) => (
                <button
                  key={trade.id}
                  onClick={() => setLocation(`/intelligence?tradeId=${trade.id}`)}
                  className="w-full bg-card border border-border rounded-xl p-4 hover:bg-accent hover:border-primary/20 transition-colors text-left group"
                  data-testid={`trade-card-${trade.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold">{trade.title}</div>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          trade.status === 'active' ? "bg-emerald-500/10 text-emerald-600" :
                          trade.status === 'planning' ? "bg-amber-500/10 text-amber-600" :
                          "bg-blue-500/10 text-blue-600"
                        )}>
                          {trade.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{trade.corridor}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium">${Number(trade.value).toLocaleString()}</div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Overview Section with Widgets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Overview</h2>
            <div className="flex items-center gap-2">
              {isEditingWidgets ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetLayout}
                    className="gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddWidget(!showAddWidget)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Widget
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsEditingWidgets(false)}
                    className="gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Done
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingWidgets(true)}
                  className="gap-2"
                  data-testid="button-customize"
                >
                  <Settings2 className="w-4 h-4" />
                  Customize
                </Button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showAddWidget && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl border bg-card/60"
              >
                <div className="text-sm font-medium mb-3">Add Widget</div>
                <div className="flex flex-wrap gap-2">
                  {availableWidgets.map((widget) => {
                    const isVisible = config.widgets.some(
                      (w) => w.type === widget.type && w.visible
                    );
                    return (
                      <button
                        key={widget.type}
                        onClick={() => handleAddWidget(widget.type)}
                        disabled={isVisible}
                        className={cn(
                          "px-3 py-2 rounded-lg text-sm transition-colors",
                          isVisible
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : "bg-accent hover:bg-accent/80"
                        )}
                      >
                        {widget.title}
                        {isVisible && " ✓"}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={visibleWidgets.map((w) => w.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {visibleWidgets.map((widget) => (
                  <Widget
                    key={widget.id}
                    id={widget.id}
                    title={widget.title}
                    size={widget.size}
                    isEditing={isEditingWidgets}
                    onRemove={() => handleRemoveWidget(widget.id)}
                    onResize={(size) => handleResizeWidget(widget.id, size)}
                  >
                    {renderWidgetContent(widget)}
                  </Widget>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {visibleWidgets.length === 0 && (
            <div className="text-center py-8 bg-card border border-border rounded-xl">
              <div className="text-muted-foreground mb-4">No widgets in your overview</div>
              <Button onClick={() => { setIsEditingWidgets(true); setShowAddWidget(true); }}>
                Add Widgets
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
