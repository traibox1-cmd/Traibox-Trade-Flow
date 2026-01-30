import { useState } from "react";
import { Banknote, CheckCircle2, XCircle, AlertCircle, FileText, DollarSign, Clock, MessageSquare, Send } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TBChip } from "@/components/tb/TBChip";

type ActionMode = null | 'info' | 'propose' | 'approve' | 'reject';

export default function FundingDesk() {
  const { 
    fundingRequests, 
    trades,
    infoRequests,
    offers,
    timelineEvents,
    updateFundingRequest,
    addInfoRequest,
    addOffer,
    addNotification,
    addTimelineEvent,
  } = useAppStore();
  
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [infoMessage, setInfoMessage] = useState("");
  const [offerData, setOfferData] = useState({
    tenor: 60,
    rate: 2.5,
    fees: 5000,
    conditions: "",
    esgTag: "",
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleRequestInfo = (requestId: string) => {
    if (!infoMessage.trim()) return;

    const request = fundingRequests.find(r => r.id === requestId);
    if (!request) return;

    addInfoRequest({
      fundingRequestId: requestId,
      tradeId: request.tradeId,
      requestedBy: "Financier",
      message: infoMessage,
      status: "pending",
    });

    updateFundingRequest(requestId, { 
      status: "info-requested",
      reviewedBy: "Financier",
      reviewedAt: new Date(),
    });

    addTimelineEvent({
      fundingRequestId: requestId,
      tradeId: request.tradeId,
      type: "info-requested",
      actor: "Financier",
      message: `Requested: ${infoMessage}`,
    });

    addNotification({
      type: "info-request",
      targetRole: "operator",
      tradeId: request.tradeId,
      fundingRequestId: requestId,
      message: `Info requested for funding request: ${infoMessage}`,
    });

    setInfoMessage("");
    setActionMode(null);
  };

  const handleProposeTerms = (requestId: string) => {
    const request = fundingRequests.find(r => r.id === requestId);
    if (!request) return;

    addOffer({
      fundingRequestId: requestId,
      tradeId: request.tradeId,
      tenor: offerData.tenor,
      rate: offerData.rate,
      fees: offerData.fees,
      conditions: offerData.conditions,
      esgTag: offerData.esgTag || undefined,
      status: "proposed",
      proposedBy: "Financier",
    });

    updateFundingRequest(requestId, { 
      status: "offered",
      reviewedBy: "Financier",
      reviewedAt: new Date(),
    });

    addTimelineEvent({
      fundingRequestId: requestId,
      tradeId: request.tradeId,
      type: "offer-proposed",
      actor: "Financier",
      message: `Offered: ${offerData.tenor}d @ ${offerData.rate}% + $${offerData.fees}`,
    });

    addNotification({
      type: "offer",
      targetRole: "operator",
      tradeId: request.tradeId,
      fundingRequestId: requestId,
      message: `New funding offer: ${offerData.tenor} days @ ${offerData.rate}%`,
    });

    setOfferData({ tenor: 60, rate: 2.5, fees: 5000, conditions: "", esgTag: "" });
    setActionMode(null);
  };

  const handleApprove = (requestId: string) => {
    const request = fundingRequests.find(r => r.id === requestId);
    if (!request) return;

    updateFundingRequest(requestId, { 
      status: "approved",
      reviewedBy: "Financier",
      reviewedAt: new Date(),
    });

    addTimelineEvent({
      fundingRequestId: requestId,
      tradeId: request.tradeId,
      type: "approved",
      actor: "Financier",
      message: "Funding request approved",
    });

    addNotification({
      type: "approval",
      targetRole: "operator",
      tradeId: request.tradeId,
      fundingRequestId: requestId,
      message: `Funding request approved: ${formatAmount(request.amount)}`,
    });

    setActionMode(null);
  };

  const handleReject = (requestId: string) => {
    const request = fundingRequests.find(r => r.id === requestId);
    if (!request) return;

    updateFundingRequest(requestId, { 
      status: "rejected",
      reviewedBy: "Financier",
      reviewedAt: new Date(),
    });

    addTimelineEvent({
      fundingRequestId: requestId,
      tradeId: request.tradeId,
      type: "rejected",
      actor: "Financier",
      message: "Funding request rejected",
    });

    addNotification({
      type: "rejection",
      targetRole: "operator",
      tradeId: request.tradeId,
      fundingRequestId: requestId,
      message: "Funding request rejected",
    });

    setActionMode(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'reviewing': return 'neutral';
      case 'offered': return 'success';
      case 'info-requested': return 'warn';
      default: return 'neutral';
    }
  };

  const pendingRequests = fundingRequests.filter(r => r.status === 'pending' || r.status === 'reviewing');
  const activeRequests = fundingRequests.filter(r => r.status === 'info-requested' || r.status === 'offered');
  const completedRequests = fundingRequests.filter(r => r.status === 'approved' || r.status === 'rejected');

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Banknote className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-title-funding-desk">
            Funding Desk
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Review and manage funding requests</p>
      </div>

      <div className="flex-1 overflow-auto p-8">
        {fundingRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Banknote className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No funding requests yet</p>
          </div>
        ) : (
          <div className="space-y-8 max-w-5xl mx-auto">
            {pendingRequests.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-4">Pending Review ({pendingRequests.length})</h2>
                <div className="space-y-4">
                  {pendingRequests.map((request) => {
                    const trade = request.tradeId ? trades.find(t => t.id === request.tradeId) : null;
                    const requestInfoReqs = infoRequests.filter(i => i.fundingRequestId === request.id);
                    const requestTimeline = timelineEvents.filter(e => e.fundingRequestId === request.id);

                    return (
                      <div key={request.id} className="rounded-2xl border bg-card p-6" data-testid={`funding-request-${request.id}`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{request.requesterName}</h3>
                              <TBChip tone={getStatusColor(request.status)} dataTestId={`chip-status-${request.id}`}>
                                {request.status}
                              </TBChip>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {request.type.toUpperCase()} • {formatAmount(request.amount)} • {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                            {trade && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Trade: {trade.corridor} • {trade.goods} • {trade.incoterms}
                              </p>
                            )}
                            {request.notes && (
                              <p className="mt-2 text-sm">{request.notes}</p>
                            )}
                          </div>
                        </div>

                        {requestTimeline.length > 0 && (
                          <div className="mb-4 p-3 rounded-xl bg-muted/50">
                            <div className="text-xs font-medium text-muted-foreground mb-2">Timeline</div>
                            <div className="space-y-1">
                              {requestTimeline.map((event) => (
                                <div key={event.id} className="text-xs text-muted-foreground">
                                  <span className="font-medium">{event.actor}</span>: {event.message}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {selectedRequest === request.id && actionMode === 'info' ? (
                          <div className="space-y-3 pt-4 border-t">
                            <Textarea
                              placeholder="What information do you need?"
                              value={infoMessage}
                              onChange={(e) => setInfoMessage(e.target.value)}
                              className="min-h-[80px]"
                              data-testid="textarea-info-message"
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleRequestInfo(request.id)} data-testid="button-send-info-request">
                                <Send className="w-4 h-4 mr-2" />
                                Send Request
                              </Button>
                              <Button size="sm" variant="secondary" onClick={() => setActionMode(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : selectedRequest === request.id && actionMode === 'propose' ? (
                          <div className="space-y-3 pt-4 border-t">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-medium text-muted-foreground">Tenor (days)</label>
                                <Input
                                  type="number"
                                  value={offerData.tenor}
                                  onChange={(e) => setOfferData({ ...offerData, tenor: parseInt(e.target.value) })}
                                  data-testid="input-tenor"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-muted-foreground">Rate (%)</label>
                                <Input
                                  type="number"
                                  step="0.1"
                                  value={offerData.rate}
                                  onChange={(e) => setOfferData({ ...offerData, rate: parseFloat(e.target.value) })}
                                  data-testid="input-rate"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-muted-foreground">Fees ($)</label>
                                <Input
                                  type="number"
                                  value={offerData.fees}
                                  onChange={(e) => setOfferData({ ...offerData, fees: parseInt(e.target.value) })}
                                  data-testid="input-fees"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-muted-foreground">ESG Tag (optional)</label>
                                <Input
                                  placeholder="e.g., Green"
                                  value={offerData.esgTag}
                                  onChange={(e) => setOfferData({ ...offerData, esgTag: e.target.value })}
                                  data-testid="input-esg-tag"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Conditions</label>
                              <Textarea
                                placeholder="Terms and conditions..."
                                value={offerData.conditions}
                                onChange={(e) => setOfferData({ ...offerData, conditions: e.target.value })}
                                className="min-h-[60px]"
                                data-testid="textarea-conditions"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleProposeTerms(request.id)} data-testid="button-send-offer">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Send Offer
                              </Button>
                              <Button size="sm" variant="secondary" onClick={() => setActionMode(null)}>
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-2 pt-4 border-t">
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => {
                                setSelectedRequest(request.id);
                                setActionMode('info');
                              }}
                              data-testid={`request-info-${request.id}`}
                            >
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Request Info
                            </Button>
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => {
                                setSelectedRequest(request.id);
                                setActionMode('propose');
                              }}
                              data-testid={`propose-terms-${request.id}`}
                            >
                              <DollarSign className="w-4 h-4 mr-2" />
                              Propose Terms
                            </Button>
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => handleApprove(request.id)}
                              data-testid={`approve-${request.id}`}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleReject(request.id)}
                              data-testid={`reject-${request.id}`}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeRequests.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-4">Active ({activeRequests.length})</h2>
                <div className="space-y-4">
                  {activeRequests.map((request) => {
                    const trade = request.tradeId ? trades.find(t => t.id === request.tradeId) : null;
                    const requestOffers = offers.filter(o => o.fundingRequestId === request.id);
                    const requestInfoReqs = infoRequests.filter(i => i.fundingRequestId === request.id);

                    return (
                      <div key={request.id} className="rounded-2xl border bg-card p-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{request.requesterName}</h3>
                          <TBChip tone={getStatusColor(request.status)} dataTestId={`chip-active-${request.id}`}>
                            {request.status}
                          </TBChip>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {formatAmount(request.amount)} • {request.type.toUpperCase()}
                        </p>
                        {requestOffers.length > 0 && (
                          <div className="text-sm p-2 rounded-lg bg-primary/10 text-primary">
                            Offer sent: {requestOffers[0].tenor}d @ {requestOffers[0].rate}%
                          </div>
                        )}
                        {requestInfoReqs.length > 0 && (
                          <div className="text-sm p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                            Awaiting info: {requestInfoReqs[0].message}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {completedRequests.length > 0 && (
              <div>
                <h2 className="font-semibold text-lg mb-4">Completed ({completedRequests.length})</h2>
                <div className="space-y-4">
                  {completedRequests.map((request) => (
                    <div key={request.id} className="rounded-2xl border bg-muted/50 p-6 opacity-75">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{request.requesterName}</h3>
                          <p className="text-sm text-muted-foreground">{formatAmount(request.amount)}</p>
                        </div>
                        <TBChip tone={getStatusColor(request.status)} dataTestId={`chip-completed-${request.id}`}>
                          {request.status}
                        </TBChip>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
