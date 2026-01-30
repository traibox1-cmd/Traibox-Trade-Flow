import { useState, useMemo } from "react";
import { LayoutDashboard, TrendingUp, DollarSign, AlertTriangle, Search, Filter, X, FileText, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TBChip } from "@/components/tb/TBChip";

type FilterState = {
  status: string[];
  corridorSearch: string;
  minAmount: number;
  maxAmount: number;
};

export default function CapitalConsole() {
  const { fundingRequests, trades, offers, infoRequests, timelineEvents } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    corridorSearch: "",
    minAmount: 0,
    maxAmount: Infinity,
  });
  const [showFilters, setShowFilters] = useState(false);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredRequests = useMemo(() => {
    return fundingRequests.filter((req) => {
      const matchesSearch = searchQuery === "" || 
        req.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filters.status.length === 0 || filters.status.includes(req.status);
      const matchesCorridor = filters.corridorSearch === "" || req.corridor?.toLowerCase().includes(filters.corridorSearch.toLowerCase());
      const matchesAmount = req.amount >= filters.minAmount && req.amount <= filters.maxAmount;

      return matchesSearch && matchesStatus && matchesCorridor && matchesAmount;
    });
  }, [fundingRequests, searchQuery, filters]);

  const kpis = useMemo(() => {
    const pending = fundingRequests.filter(r => r.status === 'pending').length;
    const reviewing = fundingRequests.filter(r => r.status === 'reviewing').length;
    const infoRequested = fundingRequests.filter(r => r.status === 'info-requested').length;
    const offered = fundingRequests.filter(r => r.status === 'offered').length;
    const approved = fundingRequests.filter(r => r.status === 'approved').length;
    const totalRequested = fundingRequests.reduce((sum, r) => sum + r.amount, 0);
    const approvedAmount = fundingRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.amount, 0);

    return { pending, reviewing, infoRequested, offered, approved, totalRequested, approvedAmount };
  }, [fundingRequests]);

  const selectedRequestData = useMemo(() => {
    if (!selectedRequest) return null;
    const request = fundingRequests.find(r => r.id === selectedRequest);
    if (!request) return null;

    const trade = request.tradeId ? trades.find(t => t.id === request.tradeId) : null;
    const requestOffers = offers.filter(o => o.fundingRequestId === request.id);
    const requestInfoReqs = infoRequests.filter(i => i.fundingRequestId === request.id);
    const requestTimeline = timelineEvents.filter(e => e.fundingRequestId === request.id);

    return { request, trade, offers: requestOffers, infoRequests: requestInfoReqs, timeline: requestTimeline };
  }, [selectedRequest, fundingRequests, trades, offers, infoRequests, timelineEvents]);

  const toggleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status) 
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
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

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-title-capital-console">
                Capital Console
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Funding queue and portfolio metrics</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-4 border-b border-border bg-muted/30">
        <div className="grid gap-4 md:grid-cols-5">
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-3 w-3" />
              <span className="text-xs font-medium">Pending Review</span>
            </div>
            <div className="text-2xl font-bold text-primary">{kpis.pending + kpis.reviewing}</div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertTriangle className="h-3 w-3" />
              <span className="text-xs font-medium">Info Requested</span>
            </div>
            <div className="text-2xl font-bold text-yellow-500">{kpis.infoRequested}</div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle2 className="h-3 w-3" />
              <span className="text-xs font-medium">Approved</span>
            </div>
            <div className="text-2xl font-bold text-green-500">{kpis.approved}</div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-3 w-3" />
              <span className="text-xs font-medium">Total Deployed</span>
            </div>
            <div className="text-lg font-bold">{formatAmount(kpis.approvedAmount)}</div>
          </div>
          <div className="rounded-xl border bg-card p-4 cursor-pointer hover:border-primary/30 transition-colors" onClick={() => window.location.href = '/trade-passport'} data-testid="card-trade-passport-financier">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FileText className="h-3 w-3" />
              <span className="text-xs font-medium">Trade Passport</span>
            </div>
            <div className="text-sm font-medium text-yellow-600">Missing items</div>
          </div>
        </div>
      </div>

      <div className="px-8 py-4 border-b border-border flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests by name, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-requests"
          />
        </div>
        <Button
          variant={showFilters ? "default" : "secondary"}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          data-testid="button-toggle-filters"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {showFilters && (
        <div className="px-8 py-4 border-b border-border bg-muted/20">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-2">Status:</span>
            {['pending', 'reviewing', 'info-requested', 'offered', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => toggleStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filters.status.includes(status)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:bg-accent'
                }`}
                data-testid={`filter-status-${status}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className={`flex-1 overflow-auto p-6 ${selectedRequest ? 'w-1/2' : 'w-full'}`}>
          <div className="space-y-3">
            {filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No funding requests match your filters</p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div
                  key={request.id}
                  onClick={() => setSelectedRequest(request.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                    selectedRequest === request.id
                      ? 'bg-primary/10 border-primary'
                      : 'bg-card hover:bg-accent'
                  }`}
                  data-testid={`request-card-${request.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{request.requesterName}</span>
                        <TBChip tone={getStatusColor(request.status)} dataTestId={`chip-status-${request.id}`}>
                          {request.status}
                        </TBChip>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {request.type.toUpperCase()} • {formatAmount(request.amount)} • {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                      {request.corridor && (
                        <p className="text-xs text-muted-foreground mt-1">Corridor: {request.corridor}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedRequest && selectedRequestData && (
          <div className="w-1/2 border-l border-border overflow-auto bg-muted/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Request Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRequest(null)}
                  data-testid="button-close-drawer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border bg-card p-4">
                  <h4 className="font-medium mb-2">Request Overview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Requester:</span>
                      <span className="font-medium">{selectedRequestData.request.requesterName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-medium">{formatAmount(selectedRequestData.request.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{selectedRequestData.request.type.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <TBChip tone={getStatusColor(selectedRequestData.request.status)} dataTestId="chip-drawer-status">
                        {selectedRequestData.request.status}
                      </TBChip>
                    </div>
                  </div>
                </div>

                {selectedRequestData.trade && (
                  <div className="rounded-xl border bg-card p-4">
                    <h4 className="font-medium mb-2">Trade Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Title:</span>
                        <span className="font-medium">{selectedRequestData.trade.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Corridor:</span>
                        <span className="font-medium">{selectedRequestData.trade.corridor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Goods:</span>
                        <span className="font-medium">{selectedRequestData.trade.goods}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Incoterms:</span>
                        <span className="font-medium">{selectedRequestData.trade.incoterms}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedRequestData.offers.length > 0 && (
                  <div className="rounded-xl border bg-card p-4">
                    <h4 className="font-medium mb-2">Offers ({selectedRequestData.offers.length})</h4>
                    <div className="space-y-2">
                      {selectedRequestData.offers.map((offer) => (
                        <div key={offer.id} className="text-sm p-2 rounded-lg bg-accent">
                          <div className="font-medium">{offer.tenor} days • {offer.rate}% rate • ${offer.fees} fees</div>
                          <div className="text-xs text-muted-foreground">Status: {offer.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRequestData.infoRequests.length > 0 && (
                  <div className="rounded-xl border bg-card p-4">
                    <h4 className="font-medium mb-2">Info Requests ({selectedRequestData.infoRequests.length})</h4>
                    <div className="space-y-2">
                      {selectedRequestData.infoRequests.map((info) => (
                        <div key={info.id} className="text-sm p-2 rounded-lg bg-accent">
                          <div className="font-medium">{info.message}</div>
                          <div className="text-xs text-muted-foreground">Status: {info.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" data-testid="button-view-funding-desk">
                    Review in Funding Desk →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
