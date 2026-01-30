import { User, Bell, Shield, Database, Sparkles } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const { loadDemoData, resetDemoData, trades, aiStatus, aiLastChecked, setAIStatus } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-6 border-b border-border">
        <h1 className="text-2xl font-light tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-2xl space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-light text-foreground">Profile</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Display Name</label>
                <input
                  type="text"
                  defaultValue="Trade Operator"
                  className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="operator@traibox.com"
                  className="w-full bg-card border border-border rounded-lg px-4 py-2 text-foreground focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-light text-foreground">Notifications</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: "Trade updates", enabled: true },
                { label: "Compliance alerts", enabled: true },
                { label: "Payment confirmations", enabled: true },
                { label: "Network invitations", enabled: false },
              ].map((setting, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{setting.label}</span>
                  <button
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      setting.enabled ? "bg-blue-500/40" : "bg-accent"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                        setting.enabled ? "translate-x-5" : ""
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-light text-foreground">Security</h2>
            </div>
            <button className="w-full px-4 py-2 bg-card border border-border rounded-lg hover:bg-accent transition-colors text-foreground text-left">
              Change Password
            </button>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-light text-foreground">Demo Data</h2>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {trades.length === 0 
                  ? "Load sample trades, funding requests, and proof packs to explore TRAIBOX features."
                  : `${trades.length} trade(s) currently loaded. Reset to start fresh.`
                }
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setLoading(true);
                    loadDemoData();
                    setTimeout(() => setLoading(false), 500);
                  }}
                  disabled={loading || trades.length > 0}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-load-demo-data"
                >
                  {loading ? "Loading..." : "Load Demo Data"}
                </Button>
                <Button
                  onClick={() => {
                    if (confirm("This will delete all data. Continue?")) {
                      setLoading(true);
                      resetDemoData();
                      setTimeout(() => setLoading(false), 500);
                    }
                  }}
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                  data-testid="button-reset-demo-data"
                >
                  Reset Demo Data
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-lg font-light text-foreground">AI Assistant</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${aiStatus === 'connected' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-foreground font-medium">
                    {aiStatus === 'connected' ? 'Connected' : 'Demo Mode'}
                  </span>
                </div>
              </div>
              {aiLastChecked && (
                <p className="text-xs text-muted-foreground">
                  Last checked: {aiLastChecked.toLocaleTimeString()}
                </p>
              )}
              {aiStatus === 'demo' && (
                <p className="text-xs text-muted-foreground">
                  AI responses are simulated. Connect OpenAI API key for live intelligence.
                </p>
              )}
              <div>
                <Button
                  onClick={async () => {
                    setLoading(true);
                    setTestStatus('testing');
                    try {
                      const response = await fetch('/api/chat/health');
                      const data = await response.json();
                      const newStatus = data.status === 'ok' ? 'connected' : 'demo';
                      setAIStatus(newStatus);
                      setTestStatus('success');
                      setTimeout(() => setTestStatus('idle'), 2000);
                    } catch (error) {
                      setAIStatus('demo');
                      setTestStatus('failed');
                      setTimeout(() => setTestStatus('idle'), 2000);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                  data-testid="button-test-ai-connection"
                >
                  {testStatus === 'testing' && <Sparkles className="w-4 h-4 mr-2 animate-spin" />}
                  {testStatus === 'testing' && "Testing..."}
                  {testStatus === 'success' && "✓ Connection OK"}
                  {testStatus === 'failed' && "✗ Connection Failed"}
                  {testStatus === 'idle' && "Test AI Connection"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
