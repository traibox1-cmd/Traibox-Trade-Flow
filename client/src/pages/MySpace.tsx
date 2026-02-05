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
  Banknote, 
  FileCheck, 
  Plus,
  AlertCircle,
  Clock,
  ChevronRight,
  Pencil,
  RotateCcw,
  Check,
  ArrowRight,
  TrendingUp,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  { type: "chart-trades", title: "Trade Volume", defaultSize: "medium" },
  { type: "activity", title: "Activity Feed", defaultSize: "medium" },
  { type: "chart-funding", title: "Funding Status", defaultSize: "medium" },
  { type: "stats-compliance", title: "Compliance", defaultSize: "small" },
  { type: "stats-network", title: "Network", defaultSize: "small" },
  { type: "chart-payments", title: "Payments", defaultSize: "medium" },
  { type: "list-partners", title: "Partners", defaultSize: "small" },
];

type NextAction = {
  id: string;
  type: 'funding' | 'compliance' | 'proof-pack' | 'info-request';
  title: string;
  subtitle: string;
  urgent?: boolean;
  href: string;
};

export default function MySpace() {
  const { 
    trades, 
    fundingRequests, 
    partners, 
    notifications, 
    complianceRuns,
    proofPacks,
    infoRequests,
    payments,
    fetchTradesFromAPI, 
    tutorialCompleted, 
    startTutorial 
  } = useAppStore();
  
  const [, setLocation] = useLocation();
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // KPI calculations
  const activeTrades = trades.filter(t => t.status === 'active').length;
  const pendingActions = notifications.filter(n => n.targetRole === 'operator' && !n.read).length;
  const alerts = complianceRuns.filter(r => r.status === 'failed').length + 
    fundingRequests.filter(r => r.status === 'info-requested').length;
  const passportReadiness = trades.length > 0 ? Math.round(
    (complianceRuns.filter(r => r.status === 'passed').length / Math.max(complianceRuns.length, 1)) * 100
  ) : 0;

  // Build Next Actions from real data
  const nextActions = useMemo<NextAction[]>(() => {
    const actions: NextAction[] = [];

    infoRequests.filter(r => r.status === 'pending').slice(0, 2).forEach(req => {
      const trade = trades.find(t => t.id === req.tradeId);
      actions.push({
        id: req.id,
        type: 'info-request',
        title: `Respond to info request`,
        subtitle: trade?.title || 'Funding inquiry',
        urgent: true,
        href: '/finance?tab=funding'
      });
    });

    fundingRequests.filter(r => r.status === 'offered').slice(0, 2).forEach(req => {
      const trade = trades.find(t => t.id === req.tradeId);
      actions.push({
        id: req.id,
        type: 'funding',
        title: `Review funding offer`,
        subtitle: `$${req.amount.toLocaleString()} - ${trade?.title || 'Trade'}`,
        href: '/finance?tab=funding'
      });
    });

    complianceRuns.filter(r => r.status === 'failed').slice(0, 2).forEach(run => {
      const trade = trades.find(t => t.id === run.tradeId);
      actions.push({
        id: run.id,
        type: 'compliance',
        title: `Fix compliance issues`,
        subtitle: trade?.title || run.targetEntity,
        urgent: true,
        href: '/compliance?tab=checks'
      });
    });

    proofPacks.filter(p => p.status === 'draft').slice(0, 2).forEach(pack => {
      const trade = trades.find(t => t.id === pack.tradeId);
      actions.push({
        id: pack.id,
        type: 'proof-pack',
        title: `Complete proof pack`,
        subtitle: trade?.title || pack.title,
        href: '/compliance?tab=proof-packs'
      });
    });

    if (actions.length === 0) {
      return [
        { id: 'demo-1', type: 'compliance', title: 'Run first compliance check', subtitle: 'Get started with KYC/AML', href: '/compliance?tab=checks' },
        { id: 'demo-2', type: 'funding', title: 'Explore funding options', subtitle: 'LC, factoring, supply-chain finance', href: '/finance?tab=funding' },
        { id: 'demo-3', type: 'proof-pack', title: 'Create a proof pack', subtitle: 'Bundle trade documents', href: '/compliance?tab=proof-packs' }
      ];
    }

    return actions.slice(0, 5);
  }, [trades, fundingRequests, complianceRuns, proofPacks, infoRequests]);

  const recentTrades = trades.slice(0, 4);

  // Widget handlers
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setConfig((prev) => {
        const oldIndex = prev.widgets.findIndex((w) => w.id === active.id);
        const newIndex = prev.widgets.findIndex((w) => w.id === over.id);
        return { ...prev, widgets: arrayMove(prev.widgets, oldIndex, newIndex) };
      });
    }
  };

  const handleRemoveWidget = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) => w.id === id ? { ...w, visible: false } : w),
    }));
  };

  const handleResizeWidget = (id: string, size: WidgetSize) => {
    setConfig((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) => w.id === id ? { ...w, size } : w),
    }));
  };

  const handleAddWidget = (type: string) => {
    const widgetDef = availableWidgets.find((w) => w.type === type);
    if (!widgetDef) return;

    const existingWidget = config.widgets.find((w) => w.type === type);
    if (existingWidget) {
      setConfig((prev) => ({
        ...prev,
        widgets: prev.widgets.map((w) => w.id === existingWidget.id ? { ...w, visible: true } : w),
      }));
    } else {
      const newWidget: WidgetConfig = {
        id: `${type}-${Date.now()}`,
        type,
        title: widgetDef.title,
        size: widgetDef.defaultSize,
        visible: true,
      };
      setConfig((prev) => ({ ...prev, widgets: [...prev.widgets, newWidget] }));
    }
    setShowAddWidget(false);
  };

  const handleResetLayout = () => {
    setConfig({ widgets: defaultWidgets, version: 1 });
  };

  const visibleWidgets = config.widgets.filter((w) => w.visible);

  // Chart data
  const tradeVolumeData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((name, i) => ({ name, volume: Math.floor(50000 + Math.random() * 150000 + i * 20000) }));
  }, []);

  const fundingData = useMemo(() => {
    const pending = fundingRequests.filter((r) => ["pending", "reviewing", "info-requested"].includes(r.status)).length;
    const approved = fundingRequests.filter((r) => ["approved", "offered"].includes(r.status)).length;
    const rejected = fundingRequests.filter((r) => r.status === "rejected").length;
    return [
      { name: "Pending", value: pending || 2 },
      { name: "Approved", value: approved || 3 },
      { name: "Rejected", value: rejected || 1 },
    ];
  }, [fundingRequests]);

  const paymentData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    return months.map((name) => ({ name, amount: Math.floor(10000 + Math.random() * 50000) }));
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
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
  }, [trades, payments]);

  const renderWidgetContent = (widget: WidgetConfig) => {
    switch (widget.type) {
      case "chart-trades":
        return <ChartWidget type="area" data={tradeVolumeData} dataKey="volume" height={160} />;
      case "activity":
        return <ActivityWidget activities={recentActivity} maxItems={4} />;
      case "chart-funding":
        return <ChartWidget type="pie" data={fundingData} dataKey="value" height={160} />;
      case "stats-compliance":
        const passedRuns = complianceRuns.filter((r) => r.status === "passed").length;
        return (
          <StatsWidget
            columns={2}
            stats={[
              { label: "Checks", value: complianceRuns.length },
              { label: "Passed", value: passedRuns },
              { label: "Packs", value: proofPacks.length },
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
        return <ChartWidget type="bar" data={paymentData} dataKey="amount" height={160} />;
      case "list-partners":
        return (
          <ListWidget
            items={partners.slice(0, 3).map((partner) => ({
              id: partner.id,
              title: partner.name,
              subtitle: partner.canActAs.join(", ") || partner.region,
              status: partner.connectionStatus === "connected" ? "active" : "pending",
            }))}
            emptyMessage="No partners"
          />
        );
      default:
        return <div className="text-muted-foreground text-sm">Unknown widget</div>;
    }
  };

  const getActionIcon = (type: NextAction['type']) => {
    switch (type) {
      case 'funding': return <Banknote className="w-4 h-4" />;
      case 'compliance': return <ShieldCheck className="w-4 h-4" />;
      case 'proof-pack': return <FileCheck className="w-4 h-4" />;
      case 'info-request': return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Premium Header */}
      <div className="px-8 py-6 border-b border-border/50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-2xl font-light tracking-tight">
              {getTimeGreeting()}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Welcome to your trade command center</p>
          </div>
          <Button
            size="lg"
            onClick={() => setLocation('/trade-intelligence')}
            className="gap-2 px-6 shadow-lg hover:shadow-xl transition-shadow"
            data-testid="button-new-trade"
          >
            <Plus className="w-5 h-5" />
            New Trade
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="px-8 py-6 mx-auto max-w-7xl space-y-6">
          
          {/* KPI Cards - Glassmorphism style */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 hover:border-primary/20 transition-all hover:shadow-lg"
              data-testid="kpi-active-trades"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-y-10 translate-x-10" />
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider mb-3">
                <TrendingUp className="w-3.5 h-3.5" />
                Active Trades
              </div>
              <div className="text-4xl font-light" data-testid="value-active-trades">{activeTrades}</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 hover:border-primary/20 transition-all hover:shadow-lg"
              data-testid="kpi-pending-actions"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/5 to-transparent rounded-full -translate-y-10 translate-x-10" />
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider mb-3">
                <Clock className="w-3.5 h-3.5" />
                Pending
              </div>
              <div className="text-4xl font-light" data-testid="value-pending-actions">{pendingActions}</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 hover:border-primary/20 transition-all hover:shadow-lg"
              data-testid="kpi-alerts"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-red-500/5 to-transparent rounded-full -translate-y-10 translate-x-10" />
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider mb-3">
                <Zap className="w-3.5 h-3.5" />
                Alerts
                {alerts > 0 && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
              </div>
              <div className={cn("text-4xl font-light", alerts > 0 && "text-red-500")} data-testid="value-alerts">{alerts}</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 cursor-pointer hover:border-primary/30 transition-all hover:shadow-lg"
              onClick={() => setLocation('/compliance?tab=passport')}
              data-testid="card-trade-passport"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-full -translate-y-10 translate-x-10" />
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium uppercase tracking-wider mb-3">
                <ShieldCheck className="w-3.5 h-3.5" />
                Passport
              </div>
              <div className={cn(
                "text-4xl font-light",
                passportReadiness >= 80 ? "text-emerald-500" : passportReadiness >= 50 ? "text-amber-500" : "text-red-500"
              )} data-testid="value-passport-readiness">
                {passportReadiness}%
              </div>
            </motion.div>
          </div>

          {/* Dashboard Widgets - Always Visible */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Dashboard</h2>
              <div className="flex items-center gap-2">
                {isEditingWidgets ? (
                  <>
                    <button
                      onClick={handleResetLayout}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                      data-testid="button-reset-widgets"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </button>
                    <button
                      onClick={() => setShowAddWidget(!showAddWidget)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                      data-testid="button-add-widget"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                    <button
                      onClick={() => { setIsEditingWidgets(false); setShowAddWidget(false); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      data-testid="button-done-editing"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Done
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditingWidgets(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                    data-testid="button-edit-widgets"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
              </div>
            </div>

            <AnimatePresence>
              {showAddWidget && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-2 p-4 rounded-xl border border-dashed border-border bg-muted/30">
                    {availableWidgets.map((widget) => {
                      const isVisible = config.widgets.some((w) => w.type === widget.type && w.visible);
                      return (
                        <button
                          key={widget.type}
                          onClick={() => handleAddWidget(widget.type)}
                          disabled={isVisible}
                          className={cn(
                            "px-3 py-2 rounded-lg text-xs font-medium transition-all",
                            isVisible 
                              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50" 
                              : "bg-background border border-border hover:border-primary/30 hover:shadow-sm"
                          )}
                          data-testid={`button-add-widget-${widget.type}`}
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

            {visibleWidgets.length > 0 ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={visibleWidgets.map((w) => w.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {visibleWidgets.map((widget, index) => (
                      <motion.div
                        key={widget.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Widget
                          id={widget.id}
                          title={widget.title}
                          size={widget.size}
                          isEditing={isEditingWidgets}
                          onRemove={() => handleRemoveWidget(widget.id)}
                          onResize={(size) => handleResizeWidget(widget.id, size)}
                        >
                          {renderWidgetContent(widget)}
                        </Widget>
                      </motion.div>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-center py-12 rounded-2xl border border-dashed border-border bg-muted/20">
                <p className="text-sm text-muted-foreground mb-3">No widgets added</p>
                <Button variant="outline" size="sm" onClick={() => { setIsEditingWidgets(true); setShowAddWidget(true); }} data-testid="button-add-widgets-empty">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Widgets
                </Button>
              </div>
            )}
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/compliance?tab=checks')}
              className="gap-2 rounded-full"
              data-testid="button-run-compliance"
            >
              <ShieldCheck className="w-4 h-4" />
              Run Compliance
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/finance?tab=funding')}
              className="gap-2 rounded-full"
              data-testid="button-request-funding"
            >
              <Banknote className="w-4 h-4" />
              Request Funding
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/compliance?tab=proof-packs')}
              className="gap-2 rounded-full"
              data-testid="button-generate-proof"
            >
              <FileCheck className="w-4 h-4" />
              Generate Proof Pack
            </Button>
          </div>

          {/* Two-column: Next Actions + Continue */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Next Actions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Next Actions
                </h2>
                <span className="text-xs text-muted-foreground/60">{nextActions.length}</span>
              </div>
              <div className="space-y-2">
                {nextActions.map((action, index) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setLocation(action.href)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3.5 rounded-xl border bg-card/60 backdrop-blur-sm text-left transition-all hover:bg-accent hover:shadow-md group",
                      action.urgent && "border-red-200/50 bg-red-50/30 dark:border-red-900/20 dark:bg-red-950/20"
                    )}
                    data-testid={`action-${action.id}`}
                  >
                    <div className={cn(
                      "p-2 rounded-lg transition-colors",
                      action.urgent 
                        ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400" 
                        : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                    )}>
                      {getActionIcon(action.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{action.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{action.subtitle}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Continue Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Continue
                </h2>
                {recentTrades.length > 0 && (
                  <button 
                    onClick={() => setLocation('/trade-intelligence')}
                    className="text-xs text-muted-foreground/60 hover:text-primary transition-colors"
                    data-testid="link-view-all-trades"
                  >
                    View all
                  </button>
                )}
              </div>
              {recentTrades.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
                  <Sparkles className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                  <h3 className="font-medium mb-1">No trades yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first trade to get started
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button onClick={() => setLocation('/trade-intelligence')} size="sm" data-testid="button-create-first-trade">
                      Create Trade
                    </Button>
                    <Button onClick={() => setLocation('/settings')} variant="outline" size="sm" data-testid="button-load-demo-myspace">
                      Load Demo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentTrades.map((trade, index) => (
                    <motion.button
                      key={trade.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setLocation(`/trade-intelligence?trade=${trade.id}`)}
                      className="w-full flex items-center gap-3 p-3.5 rounded-xl border bg-card/60 backdrop-blur-sm text-left transition-all hover:bg-accent hover:shadow-md group"
                      data-testid={`continue-trade-${trade.id}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{trade.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{trade.corridor}</div>
                      </div>
                      <div className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider",
                        trade.status === 'active' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        trade.status === 'planning' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                      )}>
                        {trade.status}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
