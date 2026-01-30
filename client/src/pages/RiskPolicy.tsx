import { useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle, Info, FileText } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { TBChip } from "@/components/tb/TBChip";

type CheckStatus = 'pass' | 'warn' | 'needs-info';
type RiskCheckItem = {
  id: string;
  label: string;
  status: CheckStatus;
  details: string;
};

export default function RiskPolicy() {
  const { fundingRequests, trades, addInfoRequest, addNotification } = useAppStore();
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, RiskCheckItem[]>>({});

  const selectedRequest = selectedRequestId ? fundingRequests.find(r => r.id === selectedRequestId) : null;
  const selectedTrade = selectedRequest?.tradeId ? trades.find(t => t.id === selectedRequest.tradeId) : null;

  const getDefaultChecks = (requestId: string): RiskCheckItem[] => [
    {
      id: `${requestId}-kyb`,
      label: "KYB Status",
      status: "pass",
      details: "Know Your Business verification completed",
    },
    {
      id: `${requestId}-sanctions`,
      label: "Sanctions Check",
      status: "pass",
      details: "No matches in sanctions lists",
    },
    {
      id: `${requestId}-corridor`,
      label: "Corridor Risk",
      status: "warn",
      details: "Medium risk corridor - enhanced monitoring recommended",
    },
    {
      id: `${requestId}-goods`,
      label: "Goods Risk",
      status: "pass",
      details: "Standard commodity classification",
    },
    {
      id: `${requestId}-aml`,
      label: "AML Flags",
      status: "pass",
      details: "No anti-money laundering concerns",
    },
    {
      id: `${requestId}-esg`,
      label: "ESG Compliance",
      status: "pass",
      details: "Environmental and social governance standards met",
    },
  ];

  const currentChecks = selectedRequestId ? (checks[selectedRequestId] || getDefaultChecks(selectedRequestId)) : [];

  const toggleCheckStatus = (checkId: string) => {
    if (!selectedRequestId) return;

    const requestChecks = checks[selectedRequestId] || getDefaultChecks(selectedRequestId);
    const updatedChecks = requestChecks.map(check => {
      if (check.id === checkId) {
        const newStatus: CheckStatus = 
          check.status === 'pass' ? 'warn' :
          check.status === 'warn' ? 'needs-info' : 'pass';
        
        if (newStatus === 'needs-info') {
          const request = fundingRequests.find(r => r.id === selectedRequestId);
          if (request) {
            addInfoRequest({
              fundingRequestId: selectedRequestId,
              tradeId: request.tradeId,
              requestedBy: "Financier - Risk Team",
              message: `Additional information needed for ${check.label}: ${check.details}`,
              status: "pending",
            });

            addNotification({
              type: "info-request",
              targetRole: "operator",
              tradeId: request.tradeId,
              fundingRequestId: selectedRequestId,
              message: `Risk check requires info: ${check.label}`,
            });
          }
        }

        return { ...check, status: newStatus };
      }
      return check;
    });

    setChecks({ ...checks, [selectedRequestId]: updatedChecks });
  };

  const getStatusIcon = (status: CheckStatus) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warn': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'needs-info': return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusTone = (status: CheckStatus) => {
    switch (status) {
      case 'pass': return 'success';
      case 'warn': return 'warn';
      case 'needs-info': return 'neutral';
    }
  };

  const passCount = currentChecks.filter(c => c.status === 'pass').length;
  const warnCount = currentChecks.filter(c => c.status === 'warn').length;
  const needsInfoCount = currentChecks.filter(c => c.status === 'needs-info').length;

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-6 border-b border-border">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-title-risk-policy">
            Risk & Policy
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Compliance and risk assessment checklist</p>
      </div>

      <div className="flex-1 overflow-auto p-8">
        {fundingRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No funding requests to assess</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Select Request to Review</label>
              <div className="grid gap-2">
                {fundingRequests.map((request) => (
                  <button
                    key={request.id}
                    onClick={() => setSelectedRequestId(request.id)}
                    className={`p-4 rounded-xl border text-left transition-colors ${
                      selectedRequestId === request.id
                        ? 'bg-primary/10 border-primary'
                        : 'bg-card hover:bg-accent'
                    }`}
                    data-testid={`select-request-${request.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{request.requesterName}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.type.toUpperCase()} • ${request.amount.toLocaleString()}
                        </div>
                      </div>
                      <TBChip tone="neutral" dataTestId={`chip-request-${request.id}`}>
                        {request.status}
                      </TBChip>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {selectedRequest && (
              <>
                {selectedTrade && (
                  <div className="rounded-2xl border bg-card p-6">
                    <h3 className="font-semibold mb-4">Trade Context</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Corridor</div>
                        <div className="font-medium">{selectedTrade.corridor}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Goods</div>
                        <div className="font-medium">{selectedTrade.goods}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Value</div>
                        <div className="font-medium">${selectedTrade.value.toLocaleString()} {selectedTrade.currency}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Incoterms</div>
                        <div className="font-medium">{selectedTrade.incoterms}</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border bg-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold">Risk Checklist</h3>
                    <div className="flex gap-2 text-sm">
                      <span className="text-green-500 font-medium">{passCount} Pass</span>
                      <span className="text-yellow-500 font-medium">{warnCount} Warn</span>
                      <span className="text-blue-500 font-medium">{needsInfoCount} Need Info</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {currentChecks.map((check) => (
                      <div
                        key={check.id}
                        className="p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors"
                        data-testid={`check-item-${check.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusIcon(check.status)}
                              <span className="font-medium">{check.label}</span>
                            </div>
                            <p className="text-sm text-muted-foreground ml-7">{check.details}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <TBChip tone={getStatusTone(check.status)} dataTestId={`chip-${check.id}`}>
                              {check.status}
                            </TBChip>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => toggleCheckStatus(check.id)}
                              data-testid={`toggle-${check.id}`}
                            >
                              Toggle
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border bg-muted/50 p-6">
                  <h4 className="font-medium text-sm text-muted-foreground mb-3">Guidelines</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Click <strong>Toggle</strong> to cycle through: Pass → Warn → Needs Info → Pass</li>
                    <li>• Setting to <strong>Needs Info</strong> automatically sends an info request to the Operator</li>
                    <li>• All checks must be <strong>Pass</strong> or <strong>Warn</strong> before approval</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
