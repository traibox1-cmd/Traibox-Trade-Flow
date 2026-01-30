import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { DollarSign, TrendingUp, Send, Shield, Plus, AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TBChip } from "@/components/tb/TBChip";

type Tab = "payments" | "funding";

export default function Finance() {
  const [location] = useLocation();
  const queryParams = new URLSearchParams(location.split("?")[1] || "");
  const tabParam = queryParams.get("tab") as Tab | null;
  const [activeTab, setActiveTab] = useState<Tab>(tabParam || "payments");
  const { 
    payments, 
    fundingRequests, 
    offers,
    infoRequests,
    trades,
    addPayment, 
    addFundingRequest,
    updateFundingRequest,
    updateInfoRequest,
    updateOffer,
    addNotification,
    addTimelineEvent,
  } = useAppStore();
  
  const [infoResponse, setInfoResponse] = useState<Record<string, string>>({});

  useEffect(() => {
    if (tabParam && (tabParam === "payments" || tabParam === "funding")) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleCreatePayment = () => {
    const defaultTrade = trades[0];
    if (!defaultTrade) {
      alert("Please create a trade first from Trade Intelligence");
      return;
    }
    
    addPayment({
      tradeId: defaultTrade.id,
      amount: 50000,
      currency: "USD",
      beneficiary: "Trade Partner Inc",
      rail: "swift",
      status: "draft",
      notes: "Created from Finance module",
    });
  };

  const handleRequestFunding = () => {
    const defaultTrade = trades[0];
    if (!defaultTrade) {
      alert("Please create a trade first from Trade Intelligence");
      return;
    }
    
    addFundingRequest({
      tradeId: defaultTrade.id,
      amount: 200000,
      type: "lc",
      status: "pending",
      requesterName: "Current User",
      notes: "Funding request from Finance module",
    });
  };

  const handleRespondToInfo = (infoRequestId: string) => {
    const response = infoResponse[infoRequestId]?.trim();
    if (!response) return;

    const infoReq = infoRequests.find(i => i.id === infoRequestId);
    if (!infoReq) return;

    updateInfoRequest(infoRequestId, {
      status: 'provided',
      response,
      respondedAt: new Date(),
    });

    updateFundingRequest(infoReq.fundingRequestId, { status: 'reviewing' });

    addTimelineEvent({
      fundingRequestId: infoReq.fundingRequestId,
      tradeId: infoReq.tradeId,
      type: 'info-provided',
      actor: 'Operator',
      message: `Provided info: ${response.substring(0, 50)}...`,
    });

    addNotification({
      type: 'info-provided',
      targetRole: 'financier',
      tradeId: infoReq.tradeId,
      fundingRequestId: infoReq.fundingRequestId,
      message: `Operator responded to info request`,
    });

    setInfoResponse({ ...infoResponse, [infoRequestId]: '' });
  };

  const handleAcceptOffer = (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;

    updateOffer(offerId, { status: 'accepted' });
    updateFundingRequest(offer.fundingRequestId, { status: 'approved' });

    addTimelineEvent({
      fundingRequestId: offer.fundingRequestId,
      tradeId: offer.tradeId,
      type: 'approved',
      actor: 'Operator',
      message: `Accepted funding offer: ${offer.tenor}d @ ${offer.rate}%`,
    });

    addNotification({
      type: 'approval',
      targetRole: 'financier',
      tradeId: offer.tradeId,
      fundingRequestId: offer.fundingRequestId,
      message: `Operator accepted funding offer`,
    });
  };

  const handleRejectOffer = (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return;

    updateOffer(offerId, { status: 'rejected' });
    updateFundingRequest(offer.fundingRequestId, { status: 'rejected' });

    addTimelineEvent({
      fundingRequestId: offer.fundingRequestId,
      tradeId: offer.tradeId,
      type: 'rejected',
      actor: 'Operator',
      message: `Rejected funding offer: ${offer.tenor}d @ ${offer.rate}%`,
    });

    addNotification({
      type: 'rejection',
      targetRole: 'financier',
      tradeId: offer.tradeId,
      fundingRequestId: offer.fundingRequestId,
      message: `Operator rejected funding offer`,
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusTone = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'reviewing': return 'neutral';
      case 'offered': return 'success';
      case 'info-requested': return 'warn';
      default: return 'neutral';
    }
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
                  <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <Send className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-semibold mb-2">No payments yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">Create payment instructions for trade settlements</p>
                    <Button onClick={handleCreatePayment} size="sm">Create Payment</Button>
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
                <div className="text-3xl font-light text-foreground">{fundingRequests.length}</div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-light text-foreground mb-4">My Funding Requests</h2>
              <div className="space-y-4">
                {fundingRequests.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-semibold mb-2">No funding requests</h3>
                    <p className="text-sm text-muted-foreground mb-4">Request trade financing for letters of credit or factoring</p>
                    <Button onClick={handleRequestFunding} size="sm">Request Funding</Button>
                  </div>
                ) : (
                  fundingRequests.map((request) => {
                    const requestOffers = offers.filter(o => o.fundingRequestId === request.id);
                    const requestInfoReqs = infoRequests.filter(i => i.fundingRequestId === request.id && i.status === 'pending');

                    return (
                      <div key={request.id} className="bg-card border border-border rounded-lg p-4" data-testid={`funding-${request.id}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-foreground font-light">{request.type.toUpperCase()} Request</div>
                          <TBChip tone={getStatusTone(request.status)} dataTestId={`chip-status-${request.id}`}>
                            {request.status}
                          </TBChip>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span>{formatAmount(request.amount)}</span>
                          <span>•</span>
                          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                        </div>

                        {requestInfoReqs.length > 0 && (
                          <div className="mb-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm font-medium text-yellow-500">Information Requested</span>
                            </div>
                            {requestInfoReqs.map((info) => (
                              <div key={info.id} className="space-y-2">
                                <p className="text-sm">{info.message}</p>
                                <Textarea
                                  placeholder="Provide the requested information..."
                                  value={infoResponse[info.id] || ''}
                                  onChange={(e) => setInfoResponse({ ...infoResponse, [info.id]: e.target.value })}
                                  className="min-h-[60px]"
                                  data-testid={`textarea-info-response-${info.id}`}
                                />
                                <Button 
                                  size="sm" 
                                  onClick={() => handleRespondToInfo(info.id)}
                                  data-testid={`button-respond-info-${info.id}`}
                                >
                                  <Send className="w-4 h-4 mr-2" />
                                  Send Response
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {requestOffers.length > 0 && (
                          <div className="mb-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle2 className="h-4 w-4 text-primary" />
                              <span className="text-sm font-medium text-primary">Funding Offer Received</span>
                            </div>
                            {requestOffers.map((offer) => (
                              <div key={offer.id} className="space-y-2">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Tenor:</span> {offer.tenor} days
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Rate:</span> {offer.rate}%
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Fees:</span> ${offer.fees.toLocaleString()}
                                  </div>
                                  {offer.esgTag && (
                                    <div>
                                      <span className="text-muted-foreground">ESG:</span> {offer.esgTag}
                                    </div>
                                  )}
                                </div>
                                {offer.conditions && (
                                  <p className="text-xs text-muted-foreground">{offer.conditions}</p>
                                )}
                                {offer.status === 'proposed' && (
                                  <div className="flex gap-2 pt-2">
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleAcceptOffer(offer.id)}
                                      data-testid={`button-accept-offer-${offer.id}`}
                                    >
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Accept Offer
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="secondary"
                                      onClick={() => handleRejectOffer(offer.id)}
                                      data-testid={`button-reject-offer-${offer.id}`}
                                    >
                                      Decline
                                    </Button>
                                  </div>
                                )}
                                {offer.status !== 'proposed' && (
                                  <div className="text-xs text-muted-foreground pt-2">
                                    Status: {offer.status}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
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
