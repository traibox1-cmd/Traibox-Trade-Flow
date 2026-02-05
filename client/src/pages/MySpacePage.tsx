import { NewTradeComposer } from "@/components/myspace/NewTradeComposer";
import { KpiStrip } from "@/components/myspace/KpiStrip";
import { NextActionsList } from "@/components/myspace/NextActionsList";
import { RecentTradesRow } from "@/components/myspace/RecentTradesRow";
import { TradeTable } from "@/components/myspace/TradeTable";
import { ActionDrawer } from "@/components/shell/ActionDrawer";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function PassportReadinessCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <h3 className="font-semibold">Trade Passport</h3>
          <p className="text-sm text-muted-foreground">Your compliance readiness</p>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Readiness Score</span>
          <span className="text-2xl font-semibold">72%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: "72%" }} />
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground mb-4">
        <span className="text-amber-500 font-medium">3 items</span> missing for full compliance
      </div>
      
      <Button variant="outline" className="w-full gap-2" disabled>
        Open Trade Passport
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

function DrawerContent() {
  return (
    <div className="space-y-4">
      <PassportReadinessCard />
      
      <div className="bg-card border border-border rounded-xl p-4">
        <h4 className="font-semibold text-sm mb-3">Quick Links</h4>
        <div className="space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-2 text-sm" disabled>
            View All Trades
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-sm" disabled>
            Network Directory
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 text-sm" disabled>
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
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Hero: New Trade Composer */}
          <NewTradeComposer />

          {/* KPI Strip */}
          <KpiStrip />

          {/* Work Board: Actions + Recent Trades */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NextActionsList />
            <RecentTradesRow />
          </div>

          {/* Trade Table */}
          <TradeTable />

          {/* Passport Card - visible on smaller screens */}
          {!isDesktop && (
            <PassportReadinessCard />
          )}
        </div>
      </div>

      {/* Right Action Drawer - desktop only */}
      {isDesktop && (
        <ActionDrawer title="Quick Actions">
          <DrawerContent />
        </ActionDrawer>
      )}
    </div>
  );
}
