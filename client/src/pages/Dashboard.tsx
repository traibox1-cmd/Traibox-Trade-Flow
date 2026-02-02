import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
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
import { motion } from "framer-motion";
import { Widget, WidgetConfig, WidgetSize } from "@/components/dashboard/Widget";
import { StatsWidget, ActivityWidget, ChartWidget, ListWidget } from "@/components/dashboard/widgets";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Settings2, Plus, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const DASHBOARD_STORAGE_KEY = "traibox-dashboard-config";

interface DashboardConfig {
  widgets: WidgetConfig[];
  version: number;
}

const defaultWidgets: WidgetConfig[] = [
  { id: "overview-stats", type: "stats-overview", title: "Portfolio Overview", size: "full", visible: true },
  { id: "trade-volume", type: "chart-trades", title: "Trade Volume", size: "medium", visible: true },
  { id: "recent-trades", type: "list-trades", title: "Recent Trades", size: "medium", visible: true },
  { id: "activity-feed", type: "activity", title: "Recent Activity", size: "medium", visible: true },
  { id: "funding-status", type: "chart-funding", title: "Funding Status", size: "medium", visible: true },
  { id: "compliance-summary", type: "stats-compliance", title: "Compliance Summary", size: "small", visible: true },
  { id: "network-stats", type: "stats-network", title: "Network", size: "small", visible: true },
];

const availableWidgets: { type: string; title: string; defaultSize: WidgetSize }[] = [
  { type: "stats-overview", title: "Portfolio Overview", defaultSize: "full" },
  { type: "chart-trades", title: "Trade Volume Chart", defaultSize: "medium" },
  { type: "list-trades", title: "Recent Trades", defaultSize: "medium" },
  { type: "activity", title: "Activity Feed", defaultSize: "medium" },
  { type: "chart-funding", title: "Funding Status", defaultSize: "medium" },
  { type: "stats-compliance", title: "Compliance Summary", defaultSize: "small" },
  { type: "stats-network", title: "Network Stats", defaultSize: "small" },
  { type: "chart-payments", title: "Payments Chart", defaultSize: "medium" },
  { type: "list-partners", title: "Top Partners", defaultSize: "small" },
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
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

  const { trades, fundingRequests, payments, partners, complianceRuns, proofPacks, notifications } = useAppStore();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(config));
  }, [config]);

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
      case "stats-overview":
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
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your personalized trade workspace overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
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
                onClick={() => setIsEditing(false)}
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
              onClick={() => setIsEditing(true)}
              className="gap-2"
              data-testid="button-customize-dashboard"
            >
              <Settings2 className="w-4 h-4" />
              Customize
            </Button>
          )}
        </div>
      </div>

      {showAddWidget && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl border bg-card/60"
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
                isEditing={isEditing}
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
        <div className="text-center py-16">
          <div className="text-muted-foreground mb-4">No widgets on your dashboard</div>
          <Button onClick={() => { setIsEditing(true); setShowAddWidget(true); }}>
            Add Widgets
          </Button>
        </div>
      )}
    </div>
  );
}
