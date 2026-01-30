import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { DollarSign, TrendingUp, Send, Shield } from "lucide-react";

type Tab = "payments" | "funding";

export default function Finance() {
  const [location] = useLocation();
  const queryParams = new URLSearchParams(location.split("?")[1] || "");
  const tabParam = queryParams.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam || "payments");

  useEffect(() => {
    if (tabParam && (tabParam === "payments" || tabParam === "funding")) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-6 border-b border-border">
        <h1 className="text-2xl font-light tracking-tight text-foreground">Finance</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage payments and funding operations</p>
      </div>

      <div className="border-b border-border">
        <div className="px-8 flex gap-6">
          <button
            data-testid="tab-payments"
            onClick={() => setActiveTab("payments")}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === "payments"
                ? "border-blue-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-muted-foreground"
            }`}
          >
            Payments
          </button>
          <button
            data-testid="tab-funding"
            onClick={() => setActiveTab("funding")}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === "funding"
                ? "border-blue-500 text-foreground"
                : "border-transparent text-muted-foreground hover:text-muted-foreground"
            }`}
          >
            Funding
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        {activeTab === "payments" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Total Outbound</div>
                <div className="text-3xl font-light text-foreground">$1.2M</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Pending Payments</div>
                <div className="text-3xl font-light text-foreground">$340K</div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-light text-foreground mb-4">Payment Routes</h2>
              <div className="space-y-3">
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="text-foreground font-light">Traditional Banking</div>
                        <div className="text-xs text-muted-foreground">SWIFT, ACH, Wire transfers</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">Primary</div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="text-foreground font-light">Stablecoin Rail (XDC Network)</div>
                        <div className="text-xs text-muted-foreground">Alternative for faster settlement</div>
                      </div>
                    </div>
                    <div className="text-xs text-blue-400">Optional</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-light text-foreground mb-4">Recent Payments</h2>
              <div className="space-y-3">
                {[
                  { to: "Acme Corp", amount: "$50,000", status: "Completed", date: "2 days ago" },
                  { to: "Global Traders Inc", amount: "$125,000", status: "Pending", date: "1 day ago" },
                  { to: "EU Export Partners", amount: "$75,000", status: "Processing", date: "3 hours ago" },
                ].map((payment, i) => (
                  <div key={i} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-foreground font-light">{payment.to}</div>
                        <div className="text-sm text-muted-foreground mt-1">{payment.amount} • {payment.date}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs ${
                        payment.status === "Completed" ? "bg-green-500/20 text-green-400" :
                        payment.status === "Pending" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-blue-500/20 text-blue-400"
                      }`}>
                        {payment.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "funding" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Available Credit</div>
                <div className="text-3xl font-light text-foreground">$500K</div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="text-muted-foreground text-xs uppercase tracking-wider mb-2">Active Requests</div>
                <div className="text-3xl font-light text-foreground">2</div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-light text-foreground mb-4">Funding Requests</h2>
              <div className="space-y-3">
                {[
                  { trade: "Cotton Shipment #1045", amount: "$200,000", status: "Approved", lender: "Trade Finance Co" },
                  { trade: "Textile Order #1046", amount: "$150,000", status: "Under Review", lender: "Global Capital" },
                ].map((request, i) => (
                  <div key={i} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-foreground font-light">{request.trade}</div>
                      <div className={`px-3 py-1 rounded-full text-xs ${
                        request.status === "Approved" ? "bg-green-500/20 text-green-400" :
                        "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {request.status}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{request.amount}</span>
                      <span>•</span>
                      <span>{request.lender}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              data-testid="button-request-funding"
              className="w-full py-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Request New Funding
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
