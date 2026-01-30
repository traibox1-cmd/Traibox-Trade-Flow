import { User, Bell, Shield, Palette } from "lucide-react";

export default function Settings() {
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
        </div>
      </div>
    </div>
  );
}
