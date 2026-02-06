import { useLocation } from "wouter";
import { NewTradeComposer } from "@/components/myspace/NewTradeComposer";
import { KpiStrip } from "@/components/myspace/KpiStrip";
import { NextActionsList } from "@/components/myspace/NextActionsList";
import { RecentTradesRow } from "@/components/myspace/RecentTradesRow";
import { TradeTable } from "@/components/myspace/TradeTable";
import { ActionDrawer } from "@/components/shell/ActionDrawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Shield, ChevronRight, Globe, Sparkles, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function PassportReadinessCard() {
  const [, setLocation] = useLocation();
  return (
    <div className="bg-card border border-border/40 rounded-2xl p-5 shadow-xs">
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
          <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all" style={{ width: "72%" }} />
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
        data-testid="btn-open-passport"
      >
        Open Passport
        <ChevronRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

function DrawerContent() {
  const [, setLocation] = useLocation();
  return (
    <div className="space-y-4">
      <PassportReadinessCard />

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

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6 space-y-6 pb-24 md:pb-6">
          <NewTradeComposer />
          <KpiStrip />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <NextActionsList />
            <RecentTradesRow />
          </div>
          <TradeTable />
          {!isDesktop && <PassportReadinessCard />}
        </div>
      </div>

      {isDesktop && (
        <ActionDrawer title="Quick Actions">
          <DrawerContent />
        </ActionDrawer>
      )}
    </div>
  );
}
