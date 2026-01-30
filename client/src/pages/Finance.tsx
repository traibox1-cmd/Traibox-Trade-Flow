import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { DollarSign, TrendingUp, Send, Shield, Plus } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

type Tab = "payments" | "funding";

export default function Finance() {
  const [location] = useLocation();
  const queryParams = new URLSearchParams(location.split("?")[1] || "");
  const tabParam = queryParams.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam || "payments");
  const { payments, fundingRequests, addPayment, addFundingRequest } = useAppStore();

  useEffect(() => {
    if (tabParam && (tabParam === "payments" || tabParam === "funding")) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleCreatePayment = () => {
    addPayment({
      amount: 50000,
      currency: "USD",
      beneficiary: "Trade Partner Inc",
      rail: "swift",
      status: "draft",
      notes: "Created from Finance module",
    });
  };

  const handleRequestFunding = () => {
    addFundingRequest({
      amount: 200000,
      type: "lc",
      status: "pending",
      requesterName: "Current User",
      notes: "Funding request from Finance module",
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-light text-foreground">Recent Payments</h2>
                <Button size="sm" onClick={handleCreatePayment} data-testid="button-create-payment">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Payment
                </Button>
              </div>
              <div className="space-y-3">
                {payments.length === 0 ? (
                  <div className="bg-card border border-border rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">No payments yet. Create a payment to get started.</p>
                  </div>
                ) : (
                  payments.map((payment) => (
                    <div key={payment.id} className="bg-card border border-border rounded-lg p-4" data-testid={`payment-${payment.id}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-foreground font-light">{payment.beneficiary}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {formatAmount(payment.amount)} • {payment.rail.toUpperCase()} • {new Date(payment.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs ${
                          payment.status === "completed" ? "bg-green-500/20 text-green-400" :
                          payment.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                          payment.status === "failed" ? "bg-red-500/20 text-red-400" :
                          "bg-blue-500/20 text-blue-400"
                        }`}>
                          {payment.status}
                        </div>
                      </div>
                    </div>
                  ))
                )}
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
              <h2 className="text-lg font-light text-foreground mb-4">My Funding Requests</h2>
              <div className="space-y-3">
                {fundingRequests.length === 0 ? (
                  <div className="bg-card border border-border rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">No funding requests yet. Submit a request to get started.</p>
                  </div>
                ) : (
                  fundingRequests.map((request) => (
                    <div key={request.id} className="bg-card border border-border rounded-lg p-4" data-testid={`funding-${request.id}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-foreground font-light">{request.type.toUpperCase()} Request</div>
                        <div className={`px-3 py-1 rounded-full text-xs ${
                          request.status === "approved" ? "bg-green-500/20 text-green-400" :
                          request.status === "rejected" ? "bg-red-500/20 text-red-400" :
                          request.status === "reviewing" ? "bg-blue-500/20 text-blue-400" :
                          "bg-yellow-500/20 text-yellow-400"
                        }`}>
                          {request.status}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatAmount(request.amount)}</span>
                        <span>•</span>
                        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Button
              onClick={handleRequestFunding}
              data-testid="button-request-funding"
              className="w-full"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Request New Funding
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
