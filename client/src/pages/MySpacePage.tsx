import { useState, useCallback } from "react";
import { Plus, Settings2, Globe, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { NewTradeComposer } from "@/components/myspace/NewTradeComposer";
import { WidgetGrid } from "@/components/myspace/WidgetGrid";
import { AddWidgetModal } from "@/components/myspace/AddWidgetModal";
import { ActionDrawer } from "@/components/shell/ActionDrawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  type WidgetId,
  loadWidgetPreferences,
  saveWidgetPreferences,
} from "@/components/myspace/widgetRegistry";

function DrawerContent() {
  const [, setLocation] = useLocation();
  return (
    <div className="space-y-4">
      <div className="bg-card border border-border/40 rounded-2xl p-4 shadow-xs">
        <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wide mb-3">Quick Links</h4>
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2.5 text-[13px] h-9 rounded-xl"
            onClick={() => setLocation("/trade")}
          >
            <Sparkles className="w-4 h-4 text-muted-foreground" />
            Trade Intelligence
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2.5 text-[13px] h-9 rounded-xl"
            onClick={() => setLocation("/network")}
          >
            <Globe className="w-4 h-4 text-muted-foreground" />
            Network Directory
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2.5 text-[13px] h-9 rounded-xl"
            onClick={() => setLocation("/settings")}
          >
            <Settings2 className="w-4 h-4 text-muted-foreground" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MySpacePage() {
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const [widgetOrder, setWidgetOrder] = useState<WidgetId[]>(loadWidgetPreferences);
  const [showAddWidget, setShowAddWidget] = useState(false);

  const handleReorder = useCallback((newOrder: WidgetId[]) => {
    setWidgetOrder(newOrder);
    saveWidgetPreferences(newOrder);
  }, []);

  const handleRemove = useCallback((id: WidgetId) => {
    setWidgetOrder((prev) => {
      const next = prev.filter((w) => w !== id);
      saveWidgetPreferences(next);
      return next;
    });
  }, []);

  const handleToggleWidget = useCallback((id: WidgetId) => {
    setWidgetOrder((prev) => {
      const next = prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id];
      saveWidgetPreferences(next);
      return next;
    });
  }, []);

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-6 pb-24 md:pb-6">
          {/* Fixed: New Trade composer always at top */}
          <NewTradeComposer />

          {/* My Space section header with customize button */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">My Space</h2>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl h-8 text-xs"
              onClick={() => setShowAddWidget(true)}
              data-testid="btn-add-widget"
            >
              <Plus className="w-3.5 h-3.5" />
              Customize
            </Button>
          </div>

          {/* Widget grid — draggable and customizable */}
          {widgetOrder.length > 0 ? (
            <WidgetGrid
              widgetOrder={widgetOrder}
              onReorder={handleReorder}
              onRemove={handleRemove}
            />
          ) : (
            <div className="bg-card border border-dashed border-border/60 rounded-2xl p-10 text-center">
              <p className="text-muted-foreground/60 text-sm mb-3">
                Your space is empty. Add widgets to get started.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-xl"
                onClick={() => setShowAddWidget(true)}
                data-testid="btn-add-widget-empty"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Widgets
              </Button>
            </div>
          )}
        </div>
      </div>

      {isDesktop && (
        <ActionDrawer title="Quick Actions">
          <DrawerContent />
        </ActionDrawer>
      )}

      <AddWidgetModal
        open={showAddWidget}
        onClose={() => setShowAddWidget(false)}
        activeWidgets={widgetOrder}
        onToggleWidget={handleToggleWidget}
      />
    </div>
  );
}
