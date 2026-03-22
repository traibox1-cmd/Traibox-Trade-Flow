import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { Widget, WidgetConfig, WidgetSize } from "@/components/dashboard/Widget";
import {
  StatsWidget,
  ActivityWidget,
  ChartWidget,
  ListWidget,
  RiskGaugeWidget,
  PassportWidget,
  MarketPulseWidget,
  TradeFlowWidget,
  CountdownWidget,
} from "@/components/dashboard/widgets";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Settings2,
  Plus,
  RotateCcw,
  Check,
  X,
  BarChart3,
  TrendingUp,
  Shield,
  Activity,
  Globe,
  Timer,
  Layers,
  CreditCard,
  Users,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DASHBOARD_STORAGE_KEY = "traibox-dashboard-config-v2";

interface DashboardConfig {
  widgets: WidgetConfig[];
  version: number;
}

type WidgetDef = {
  type: string;
  title: string;
  defaultSize: WidgetSize;
  description: string;
  icon: React.ElementType;
  category: "overview" | "analytics" | "monitoring" | "compliance";
  liveIndicator?: boolean;
};

const availableWidgets: WidgetDef[] = [
  { type: "stats-overview", title: "Portfolio Overview", defaultSize: "full", description: "Key metrics at a glance", icon: Layers, category: "overview" },
  { type: "chart-trades", title: "Trade Volume", defaultSize: "medium", description: "Trade volume over time", icon: BarChart3, category: "analytics" },
  { type: "list-trades", title: "Recent Trades", defaultSize: "medium", description: "Latest trades with quick access", icon: TrendingUp, category: "overview" },
  { type: "activity", title: "Activity Feed", defaultSize: "medium", description: "Recent actions and events", icon: Activity, category: "monitoring", liveIndicator: true },
  { type: "chart-funding", title: "Funding Status", defaultSize: "medium", description: "Funding pipeline breakdown", icon: CreditCard, category: "analytics" },
  { type: "stats-compliance", title: "Compliance Summary", defaultSize: "small", description: "Checks and proof packs status", icon: Shield, category: "compliance" },
  { type: "stats-network", title: "Network Stats", defaultSize: "small", description: "Partner connectivity", icon: Users, category: "overview" },
  { type: "chart-payments", title: "Payments Chart", defaultSize: "medium", description: "Payment trends over months", icon: CreditCard, category: "analytics" },
  { type: "list-partners", title: "Top Partners", defaultSize: "small", description: "Key trading partners", icon: Users, category: "overview" },
  { type: "risk-gauge", title: "Risk Score", defaultSize: "medium", description: "Portfolio risk assessment gauge", icon: AlertTriangle, category: "compliance" },
  { type: "passport", title: "Trade Passport", defaultSize: "medium", description: "Compliance readiness status", icon: Shield, category: "compliance" },
  { type: "market-pulse", title: "Market Pulse", defaultSize: "medium", description: "Live FX rates and commodities", icon: Globe, category: "monitoring", liveIndicator: true },
  { type: "trade-flow", title: "Trade Corridors", defaultSize: "medium", description: "Active trade flow visualization", icon: TrendingUp, category: "analytics" },
  { type: "countdown", title: "Deadlines", defaultSize: "medium", description: "Upcoming deadlines and milestones", icon: Timer, category: "monitoring", liveIndicator: true },
];

const CATEGORY_LABELS: Record<string, string> = {
  overview: "Overview",
  analytics: "Analytics",
  monitoring: "Real-time Monitoring",
  compliance: "Compliance & Risk",
};

const defaultWidgets: WidgetConfig[] = [
  { id: "overview-stats", type: "stats-overview", title: "Portfolio Overview", size: "full", visible: true },
  { id: "trade-volume", type: "chart-trades", title: "Trade Volume", size: "medium", visible: true },
  { id: "market-pulse", type: "market-pulse", title: "Market Pulse", size: "medium", visible: true },
  { id: "recent-trades", type: "list-trades", title: "Recent Trades", size: "medium", visible: true },
  { id: "activity-feed", type: "activity", title: "Recent Activity", size: "medium", visible: true },
  { id: "risk-gauge", type: "risk-gauge", title: "Risk Score", size: "medium", visible: true },
  { id: "trade-flow", type: "trade-flow", title: "Trade Corridors", size: "medium", visible: true },
  { id: "countdown", type: "countdown", title: "Deadlines", size: "medium", visible: true },
  { id: "passport", type: "passport", title: "Trade Passport", size: "medium", visible: true },
  { id: "funding-status", type: "chart-funding", title: "Funding Status", size: "medium", visible: true },
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState<string>("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [config, setConfig] = useState<DashboardConfig>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(DASHBOARD_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return { widgets: defaultWidgets, version: 2 };
        }
      }
    }
    return { widgets: defaultWidgets, version: 2 };
  });

  const { trades, fundingRequests, payments, partners, complianceRuns, proofPacks, notifications } = useAppStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setConfig((prev) => {
        const oldIndex = prev.widgets.findIndex((w) => w.id === active.id);
        const newIndex = prev.widgets.findIndex((w) => w.id === over.id);
        return { ...prev, widgets: arrayMove(prev.widgets, oldIndex, newIndex) };
      });
    }
  };

  const handleRemoveWidget = useCallback((id: string) => {
    setConfig((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) => (w.id === id ? { ...w, visible: false } : w)),
    }));
  }, []);

  const handleResizeWidget = useCallback((id: string, size: WidgetSize) => {
    setConfig((prev) => ({
      ...prev,
      widgets: prev.widgets.map((w) => (w.id === id ? { ...w, size } : w)),
    }));
  }, []);

  const handleAddWidget = useCallback((type: string) => {
    const widgetDef = availableWidgets.find((w) => w.type === type);
    if (!widgetDef) return;

    const existingWidget = config.widgets.find((w) => w.type === type);
    if (existingWidget) {
      setConfig((prev) => ({
        ...prev,
        widgets: prev.widgets.map((w) => (w.id === existingWidget.id ? { ...w, visible: true } : w)),
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
  }, [config.widgets]);

  const handleResetLayout = () => {
    setConfig({ widgets: defaultWidgets, version: 2 });
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
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
  }, [trades, payments]);

  const getWidgetDef = (type: string) => availableWidgets.find((w) => w.type === type);

  const renderWidgetContent = (widget: WidgetConfig) => {
    switch (widget.type) {
      case "stats-overview": {
        const totalValue = trades.reduce((sum, t) => sum + Number(t.value || 0), 0);
        const activeTrades = trades.filter((t) => t.status === "active").length;
        return (
          <StatsWidget
            columns={4}
            stats={[
              { label: "Total Trades", value: trades.length, change: 12 },
              { label: "Active Trades", value: activeTrades },
              { label: "Total Value", value: `$${(totalValue / 1000).toFixed(0)}K` },
              { label: "Pending Actions", value: notifications.filter((n) => !n.read).length },
            ]}
          />
        );
      }
      case "chart-trades":
        return <ChartWidget type="area" data={tradeVolumeData} dataKey="volume" height={180} />;
      case "list-trades":
        return (
          <ListWidget
            items={trades.slice(0, 5).map((trade) => ({
              id: trade.id,
              title: trade.title,
              subtitle: trade.corridor,
              value: `$${Number(trade.value).toLocaleString()}`,
              status: trade.status as any,
              onClick: () => setLocation(`/trade/${trade.id}`),
            }))}
            emptyMessage="No trades yet"
          />
        );
      case "activity":
        return <ActivityWidget activities={recentActivity} maxItems={5} />;
      case "chart-funding":
        return <ChartWidget type="pie" data={fundingData} dataKey="value" height={180} />;
      case "stats-compliance": {
        const passedRuns = complianceRuns.filter((r) => r.overall === "passed").length;
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
      }
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
      case "risk-gauge":
        return <RiskGaugeWidget score={42} />;
      case "passport":
        return <PassportWidget readiness={72} />;
      case "market-pulse":
        return <MarketPulseWidget />;
      case "trade-flow":
        return <TradeFlowWidget />;
      case "countdown":
        return <CountdownWidget />;
      default:
        return <div className="text-muted-foreground text-sm">Unknown widget type</div>;
    }
  };

  const filteredGalleryWidgets =
    galleryFilter === "all"
      ? availableWidgets
      : availableWidgets.filter((w) => w.category === galleryFilter);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8 pb-24 md:pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-[13px] text-muted-foreground/60 mt-0.5">
              Your personalized trade workspace &middot; {visibleWidgets.length} widgets
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetLayout}
                  className="gap-2 rounded-xl"
                  data-testid="button-reset-dashboard"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGallery(true)}
                  className="gap-2 rounded-xl"
                  data-testid="button-add-widget"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Widget
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsEditing(false)}
                  className="gap-2 rounded-xl"
                  data-testid="button-done-editing"
                >
                  <Check className="w-3.5 h-3.5" />
                  Done
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="gap-2 rounded-xl"
                data-testid="button-customize-dashboard"
              >
                <Settings2 className="w-3.5 h-3.5" />
                Customize
              </Button>
            )}
          </div>
        </div>

        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 px-4 py-3 bg-primary/[0.04] border border-primary/15 rounded-2xl flex items-center gap-3"
          >
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-[12px] text-muted-foreground">
              <span className="font-medium text-foreground">Edit mode active.</span> Drag widgets to reorder, resize them, or add new ones from the gallery.
            </p>
          </motion.div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={visibleWidgets.map((w) => w.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {visibleWidgets.map((widget) => {
                const def = getWidgetDef(widget.type);
                const Icon = def?.icon;
                return (
                  <Widget
                    key={widget.id}
                    id={widget.id}
                    title={widget.title}
                    size={widget.size}
                    isEditing={isEditing}
                    onRemove={() => handleRemoveWidget(widget.id)}
                    onResize={(size) => handleResizeWidget(widget.id, size)}
                    icon={Icon ? <Icon className="w-4 h-4" /> : undefined}
                    liveIndicator={def?.liveIndicator}
                  >
                    {renderWidgetContent(widget)}
                  </Widget>
                );
              })}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeId ? (
              <div className="rounded-2xl border border-primary/30 bg-card/90 backdrop-blur-xl shadow-xl p-6 opacity-90">
                <div className="text-sm font-medium text-primary">
                  {visibleWidgets.find((w) => w.id === activeId)?.title}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {visibleWidgets.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-muted/40 flex items-center justify-center mb-4">
              <Layers className="w-7 h-7 text-muted-foreground/40" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No widgets yet</h3>
            <p className="text-muted-foreground/60 text-sm mb-4">Add widgets to build your custom dashboard</p>
            <Button onClick={() => { setIsEditing(true); setShowGallery(true); }} className="gap-2 rounded-xl" data-testid="button-add-first-widget">
              <Plus className="w-4 h-4" />
              Add Widgets
            </Button>
          </div>
        )}

        <AnimatePresence>
          {showGallery && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                onClick={() => setShowGallery(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed inset-4 md:inset-x-auto md:inset-y-8 md:left-1/2 md:-translate-x-1/2 md:w-[680px] md:max-h-[80vh] bg-card border border-border/40 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
                data-testid="widget-gallery"
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
                  <div>
                    <h2 className="font-semibold text-base tracking-tight">Widget Gallery</h2>
                    <p className="text-[12px] text-muted-foreground/60 mt-0.5">
                      {availableWidgets.length} widgets available
                    </p>
                  </div>
                  <button
                    onClick={() => setShowGallery(false)}
                    className="p-2 hover:bg-accent/60 rounded-xl transition-colors"
                    data-testid="close-gallery"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 px-6 py-3 border-b border-border/20 overflow-x-auto">
                  {["all", ...Object.keys(CATEGORY_LABELS)].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setGalleryFilter(cat)}
                      className={cn(
                        "px-3 py-1.5 text-[12px] font-medium rounded-lg transition-colors whitespace-nowrap",
                        galleryFilter === cat
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground/60 hover:text-foreground hover:bg-accent/40"
                      )}
                      data-testid={`gallery-filter-${cat}`}
                    >
                      {cat === "all" ? "All" : CATEGORY_LABELS[cat]}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredGalleryWidgets.map((widget) => {
                      const isActive = config.widgets.some((w) => w.type === widget.type && w.visible);
                      const Icon = widget.icon;
                      return (
                        <button
                          key={widget.type}
                          onClick={() => {
                            if (!isActive) handleAddWidget(widget.type);
                          }}
                          disabled={isActive}
                          className={cn(
                            "text-left p-4 rounded-xl border transition-all group",
                            isActive
                              ? "bg-primary/[0.03] border-primary/20 cursor-default"
                              : "border-border/30 hover:border-primary/30 hover:bg-accent/20 cursor-pointer"
                          )}
                          data-testid={`gallery-widget-${widget.type}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                              isActive ? "bg-primary/10 text-primary" : "bg-muted/40 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                            )}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-semibold truncate">{widget.title}</span>
                                {widget.liveIndicator && (
                                  <span className="text-[9px] text-emerald-500 font-medium flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                    Live
                                  </span>
                                )}
                                {isActive && (
                                  <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">
                                    Added
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground/50 mt-0.5 line-clamp-1">{widget.description}</p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[10px] text-muted-foreground/40 bg-muted/30 px-1.5 py-0.5 rounded">
                                  {widget.defaultSize}
                                </span>
                                <span className="text-[10px] text-muted-foreground/40 bg-muted/30 px-1.5 py-0.5 rounded capitalize">
                                  {widget.category}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
