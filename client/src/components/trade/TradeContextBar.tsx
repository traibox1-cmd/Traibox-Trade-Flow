import { useLocation } from "wouter";
import { MapPin, Clock, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore, type Trade } from "@/lib/store";

const STAGE_COLORS = {
  plan: "bg-blue-500/10 text-blue-600",
  compliance: "bg-amber-500/10 text-amber-600",
  funding: "bg-purple-500/10 text-purple-600",
  payments: "bg-emerald-500/10 text-emerald-600",
  "proof-pack": "bg-cyan-500/10 text-cyan-600",
};

interface TradeContextBarProps {
  trade: Trade | null;
}

export function TradeContextBar({ trade }: TradeContextBarProps) {
  const [, setLocation] = useLocation();

  if (!trade) {
    return (
      <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-muted/30">
        <div className="text-sm text-muted-foreground">
          No trade selected. Create or select a trade to get started.
        </div>
        <Button size="sm" className="gap-2" onClick={() => setLocation("/space")}>
          <Plus className="w-4 h-4" />
          New Trade
        </Button>
      </div>
    );
  }

  return (
    <div className="h-14 border-b border-border flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 hover:bg-accent rounded-lg px-2 py-1 -mx-2 transition-colors">
          <h2 className="font-semibold">{trade.title}</h2>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
        
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            {trade.corridor || "TBD"}
          </span>
          
          <span className={`px-2 py-0.5 text-xs font-medium rounded-lg ${STAGE_COLORS[trade.timelineStep]}`}>
            {trade.timelineStep}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="w-3.5 h-3.5" />
        Updated {trade.createdAt.toLocaleDateString()}
      </div>
    </div>
  );
}
