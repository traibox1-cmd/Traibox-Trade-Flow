import { useLocation } from "wouter";
import { Globe, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

export function NetworkWidget() {
  const [, setLocation] = useLocation();
  const { partners } = useAppStore();

  const connected = partners.filter((p) => p.connectionStatus === "connected");
  const pending = partners.filter((p) => p.connectionStatus === "pending");

  return (
    <div className="bg-card border border-border/40 rounded-2xl p-5 shadow-xs h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <Globe className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Network</h3>
          <p className="text-xs text-muted-foreground/70">Connected partners</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-semibold tabular-nums">{connected.length}</p>
          <p className="text-[11px] text-muted-foreground/60">Connected</p>
        </div>
        <div className="h-8 w-px bg-border/40" />
        <div className="text-center">
          <p className="text-2xl font-semibold tabular-nums">{pending.length}</p>
          <p className="text-[11px] text-muted-foreground/60">Pending</p>
        </div>
        <div className="h-8 w-px bg-border/40" />
        <div className="text-center">
          <p className="text-2xl font-semibold tabular-nums">{partners.length}</p>
          <p className="text-[11px] text-muted-foreground/60">Total</p>
        </div>
      </div>

      {connected.slice(0, 2).map((partner) => (
        <div
          key={partner.id}
          className="flex items-center gap-2.5 py-2 border-t border-border/20"
        >
          <div className="w-7 h-7 rounded-lg bg-muted/40 flex items-center justify-center flex-shrink-0">
            <Users className="w-3.5 h-3.5 text-muted-foreground/70" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-medium truncate">{partner.name}</p>
            <p className="text-[10px] text-muted-foreground/50">{partner.region}</p>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/8 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
            {partner.trust}
          </span>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2 rounded-xl mt-3"
        onClick={() => setLocation("/network")}
        data-testid="widget-btn-open-network"
      >
        View Network
        <ChevronRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
