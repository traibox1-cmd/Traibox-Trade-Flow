import { useLocation } from "wouter";
import { Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TradePassportWidget() {
  const [, setLocation] = useLocation();

  return (
    <div className="bg-card border border-border/40 rounded-2xl p-5 shadow-xs h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Trade Passport</h3>
          <p className="text-xs text-muted-foreground/70">Compliance readiness</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground/70">Readiness</span>
          <span className="text-xl font-semibold tabular-nums">72%</span>
        </div>
        <div className="h-1.5 bg-muted/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all"
            style={{ width: "72%" }}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        <span className="text-amber-500 font-medium">3 items</span> missing for full compliance
      </p>

      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2 rounded-xl"
        onClick={() => setLocation("/compliance?tab=passport")}
        data-testid="widget-btn-open-passport"
      >
        Open Passport
        <ChevronRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
