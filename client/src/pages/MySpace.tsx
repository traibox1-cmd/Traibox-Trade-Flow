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
  Settings2,
  RotateCcw,
  Check,
  X,
  ArrowRight
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
  { type: "chart-trades", title: "Trade Volume Chart", defaultSize: "medium" },
  { type: "activity", title: "Activity Feed", defaultSize: "medium" },
  { type: "chart-funding", title: "Funding Status", defaultSize: "medium" },
  { type: "stats-compliance", title: "Compliance Summary", defaultSize: "small" },
  { type: "stats-network", title: "Network Stats", defaultSize: "small" },
  { type: "chart-payments", title: "Payments Chart", defaultSize: "medium" },
  { type: "list-partners", title: "Top Partners", defaultSize: "small" },
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
  const [showWidgets, setShowWidgets] = useState(false);
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

    // Info requests needing response
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

    // Funding offers to review
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

    // Compliance runs needing review
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

    // Draft proof packs to complete
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

    // If no real actions, show demo items
    if (actions.length === 0) {
      return [
        {
          id: 'demo-1',
          type: 'compliance',
          title: 'Run first compliance check',
          subtitle: 'Get started with KYC/AML',
          href: '/compliance?tab=checks'
        },
        {
          id: 'demo-2',
          type: 'funding',
          title: 'Explore funding options',
          subtitle: 'LC, factoring, supply-chain finance',
          href: '/finance?tab=funding'
        },
        {
          id: 'demo-3',
          type: 'proof-pack',
          title: 'Create a proof pack',
          subtitle: 'Bundle trade documents',
          href: '/compliance?tab=proof-packs'
        }
      ];
    }

    return actions.slice(0, 7);
  }, [trades, fundingRequests, complianceRuns, proofPacks, infoRequests]);

  // Recent trades for Continue section
  const recentTrades = trades.slice(0, 5);

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

  const getActionIcon = (type: NextAction['type']) => {
    switch (type) {
      case 'funding': return <Banknote className="w-4 h-4" />;
      case 'compliance': return <ShieldCheck className="w-4 h-4" />;
      case 'proof-pack': return <FileCheck className="w-4 h-4" />;
      case 'info-request': return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-6 border-b border-border">
        <h1 className="text-2xl font-semibold tracking-tight">My Space</h1>
        <p className="text-sm text-muted-foreground mt-1">Your trade workspace home</p>
      </div>
      
      <div className="flex-1 overflow-auto p-8 mx-auto max-w-7xl w-full space-y-8">
        {/* Hero CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="lg"
            onClick={() => setLocation('/intelligence')}
            className="gap-2 px-6"
            data-testid="button-new-trade"
          >
            <Plus className="w-5 h-5" />
            New Trade
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation('/compliance?tab=checks')}
            className="gap-2"
            data-testid="button-run-compliance"
          >
            <ShieldCheck className="w-4 h-4" />
            Run Compliance
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation('/finance?tab=funding')}
            className="gap-2"
            data-testid="button-request-funding"
          >
            <Banknote className="w-4 h-4" />
            Request Funding
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation('/compliance?tab=proof-packs')}
            className="gap-2"
            data-testid="button-generate-proof"
          >
            <FileCheck className="w-4 h-4" />
            Generate Proof Pack
          </Button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm" data-testid="kpi-active-trades">
            <div className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Active Trades</div>
            <div className="text-3xl font-semibold" data-testid="value-active-trades">{activeTrades}</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm" data-testid="kpi-pending-actions">
            <div className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Pending Actions</div>
            <div className="text-3xl font-semibold" data-testid="value-pending-actions">{pendingActions}</div>
          </div>
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm" data-testid="kpi-alerts">
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2">
              <span>Alerts</span>
              {alerts > 0 && <span className="w-2 h-2 rounded-full bg-red-500" />}
            </div>
            <div className={cn("text-3xl font-semibold", alerts > 0 && "text-red-600")} data-testid="value-alerts">{alerts}</div>
          </div>
          <div 
            className="bg-card border border-border rounded-2xl p-5 shadow-sm cursor-pointer hover:border-primary/30 transition-colors"
            onClick={() => setLocation('/compliance?tab=passport')}
            data-testid="card-trade-passport"
          >
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <div className="text-muted-foreground text-xs uppercase tracking-wider">Passport Readiness</div>
            </div>
            <div className={cn(
              "text-3xl font-semibold",
              passportReadiness >= 80 ? "text-emerald-600" : passportReadiness >= 50 ? "text-amber-600" : "text-red-600"
            )} data-testid="value-passport-readiness">
              {passportReadiness}%
            </div>
          </div>
        </div>

        {/* Two-column layout for Next Actions and Continue */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Next Actions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Next Actions
              </h2>
              <span className="text-xs text-muted-foreground">{nextActions.length} items</span>
            </div>
            <div className="space-y-2">
              {nextActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => setLocation(action.href)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border bg-card text-left transition-colors hover:bg-accent",
                    action.urgent && "border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10"
                  )}
                  data-testid={`action-${action.id}`}
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    action.urgent ? "bg-red-100 text-red-600 dark:bg-red-900/30" : "bg-muted text-muted-foreground"
                  )}>
                    {getActionIcon(action.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{action.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{action.subtitle}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Continue Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                Continue
              </h2>
              {recentTrades.length > 0 && (
                <button 
                  onClick={() => setLocation('/intelligence')}
                  className="text-xs text-primary hover:underline"
                >
                  View all
                </button>
              )}
            </div>
            {recentTrades.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-6 text-center">
                <Sparkles className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">No trades yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first trade to get started
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => setLocation('/intelligence')} data-testid="button-create-first-trade">
                    Create Trade
                  </Button>
                  <Button onClick={() => setLocation('/settings')} variant="outline" data-testid="button-load-demo-myspace">
                    Load Demo Data
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTrades.map((trade) => (
                  <button
                    key={trade.id}
                    onClick={() => {
                      // Navigate to Trade Intelligence with this trade selected
                      setLocation(`/intelligence?trade=${trade.id}`);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border bg-card text-left transition-colors hover:bg-accent"
                    data-testid={`continue-trade-${trade.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{trade.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{trade.corridor}</div>
                    </div>
                    <div className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      trade.status === 'active' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                      trade.status === 'planning' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    )}>
                      {trade.status}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Customize Widgets Section */}
        <div className="pt-4 border-t border-border">
          <button
            onClick={() => setShowWidgets(!showWidgets)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-customize-toggle"
          >
            <Settings2 className="w-4 h-4" />
            {showWidgets ? 'Hide Widgets' : 'Customize Dashboard'}
            <ChevronRight className={cn("w-4 h-4 transition-transform", showWidgets && "rotate-90")} />
          </button>

          <AnimatePresence>
            {showWidgets && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-4">
                  <div className="flex items-center gap-2">
                    {isEditingWidgets ? (
                      <>
                        <Button variant="outline" size="sm" onClick={handleResetLayout} className="gap-2">
                          <RotateCcw className="w-4 h-4" />
                          Reset
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowAddWidget(!showAddWidget)} className="gap-2">
                          <Plus className="w-4 h-4" />
                          Add Widget
                        </Button>
                        <Button size="sm" onClick={() => setIsEditingWidgets(false)} className="gap-2">
                          <Check className="w-4 h-4" />
                          Done
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setIsEditingWidgets(true)} className="gap-2" data-testid="button-edit-widgets">
                        <Settings2 className="w-4 h-4" />
                        Edit Widgets
                      </Button>
                    )}
                  </div>

                  {showAddWidget && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl border bg-card/60"
                    >
                      <div className="text-sm font-medium mb-3">Add Widget</div>
                      <div className="flex flex-wrap gap-2">
                        {availableWidgets.map((widget) => {
                          const isVisible = config.widgets.some((w) => w.type === widget.type && w.visible);
                          return (
                            <button
                              key={widget.type}
                              onClick={() => handleAddWidget(widget.type)}
                              disabled={isVisible}
                              className={cn(
                                "px-3 py-2 rounded-lg text-sm transition-colors",
                                isVisible ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-accent hover:bg-accent/80"
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

                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
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
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="mb-3">No widgets added</p>
                      <Button onClick={() => { setIsEditingWidgets(true); setShowAddWidget(true); }}>
                        Add Widgets
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
