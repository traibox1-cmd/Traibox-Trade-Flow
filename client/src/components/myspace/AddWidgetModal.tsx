import { Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { WIDGET_REGISTRY, type WidgetId } from "./widgetRegistry";

type Props = {
  open: boolean;
  onClose: () => void;
  activeWidgets: WidgetId[];
  onToggleWidget: (id: WidgetId) => void;
};

export function AddWidgetModal({ open, onClose, activeWidgets, onToggleWidget }: Props) {
  const activeSet = new Set(activeWidgets);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md" data-testid="add-widget-modal">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Customize Trade Console</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground/70">
            Add or remove widgets to personalize your workspace. Drag widgets to reorder them.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 mt-1">
          {WIDGET_REGISTRY.map((widget) => {
            const Icon = widget.icon;
            const isActive = activeSet.has(widget.id);

            return (
              <button
                key={widget.id}
                onClick={() => onToggleWidget(widget.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/40 bg-card hover:border-border hover:bg-accent/30"
                }`}
                data-testid={`widget-toggle-${widget.id}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive ? "bg-primary/10" : "bg-muted/40"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground/60"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium">{widget.label}</p>
                  <p className="text-[11px] text-muted-foreground/60 truncate">{widget.description}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    isActive ? "bg-primary text-primary-foreground" : "border border-border/50"
                  }`}
                >
                  {isActive && <Check className="w-3 h-3" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end mt-2">
          <Button size="sm" onClick={onClose} className="rounded-xl" data-testid="btn-done-widgets">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
