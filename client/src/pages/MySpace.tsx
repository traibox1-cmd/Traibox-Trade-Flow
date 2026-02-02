import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldCheck, Banknote, FileCheck, X } from "lucide-react";

export default function MySpace() {
  const { trades, fundingRequests, partners, notifications, fetchTradesFromAPI, tutorialCompleted, startTutorial } = useAppStore();
  
  useEffect(() => {
    fetchTradesFromAPI();
  }, [fetchTradesFromAPI]);

  // Show tutorial on first visit for new users
  useEffect(() => {
    if (!tutorialCompleted && trades.length === 0) {
      const hasSeenWelcome = localStorage.getItem('traibox-welcome-seen');
      if (!hasSeenWelcome) {
        localStorage.setItem('traibox-welcome-seen', 'true');
        startTutorial();
      }
    }
  }, [tutorialCompleted, trades.length, startTutorial]);

  const [, setLocation] = useLocation();
  const [showHint, setShowHint] = useState(() => {
    const dismissed = localStorage.getItem('traibox-hint-dismissed');
    return !dismissed && trades.length === 0;
  });

  const dismissHint = () => {
    localStorage.setItem('traibox-hint-dismissed', 'true');
    setShowHint(false);
  };

  const activeTrades = trades.filter(t => t.status === 'active').length;
  const pendingActions = notifications.filter(n => n.targetRole === 'operator' && !n.read).length;

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-6 border-b border-border">
        <h1 className="text-2xl font-semibold tracking-tight">My Space</h1>
        <p className="text-sm text-muted-foreground mt-1">Trade workspace overview and active operations</p>
      </div>
      
      <div className="flex-1 overflow-auto p-8 mx-auto max-w-7xl w-full">
        {showHint && trades.length === 0 && (
          <div className="mb-6 bg-primary/5 border border-primary/20 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-2">Get started with TRAIBOX</h3>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span>Create trade in Trade Intelligence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3 h-3 text-primary" />
                    <span>Run compliance checks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Banknote className="w-3 h-3 text-primary" />
                    <span>Request funding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-3 h-3 text-primary" />
                    <span>Generate proof pack</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={dismissHint}
                className="text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label="Dismiss hint"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Active Trades</div>
            <div className="text-3xl font-semibold">{activeTrades}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Pending Actions</div>
            <div className="text-3xl font-semibold">{pendingActions}</div>
          </div>
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Network Partners</div>
            <div className="text-3xl font-semibold">{partners.length}</div>
          </div>
          <div 
            className="bg-card border border-border rounded-xl p-6 cursor-pointer hover:border-primary/30 transition-colors"
            onClick={() => setLocation('/compliance-proofs?tab=passport')}
            data-testid="card-trade-passport"
          >
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <div className="text-muted-foreground text-xs uppercase tracking-wider">Trade Passport</div>
            </div>
            <div className="text-sm font-medium text-yellow-600">Missing items</div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Trades</h2>
          {trades.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-2">No trades yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first trade to start managing international operations
              </p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => setLocation('/intelligence')} data-testid="button-create-trade">
                  Create Trade
                </Button>
                <Button onClick={() => setLocation('/settings')} variant="outline" data-testid="button-load-demo">
                  Load Demo Data
                </Button>
              </div>
            </div>
          ) : (
            trades.slice(0, 5).map((trade) => (
              <button
                key={trade.id}
                onClick={() => setLocation(`/trade/${trade.id}`)}
                className="w-full bg-card border border-border rounded-xl p-4 hover:bg-accent transition-colors text-left"
                data-testid={`trade-card-${trade.id}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{trade.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{trade.corridor}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(trade.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
