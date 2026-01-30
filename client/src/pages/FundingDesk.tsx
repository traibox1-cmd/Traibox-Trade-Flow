import { Banknote, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export default function FundingDesk() {
  const { fundingRequests, updateFundingRequest } = useAppStore();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const handleAction = (id: string, action: 'approve' | 'reject' | 'info') => {
    if (action === 'approve') {
      updateFundingRequest(id, { status: 'approved' });
    } else if (action === 'reject') {
      updateFundingRequest(id, { status: 'rejected' });
    } else {
      updateFundingRequest(id, { status: 'reviewing' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400';
      case 'rejected': return 'bg-red-500/20 text-red-400';
      case 'reviewing': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2">
          <div
            className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 border border-primary/15"
            aria-hidden="true"
          >
            <Banknote className="h-4 w-4 text-primary" />
          </div>
          <h1
            className="font-semibold text-2xl tracking-tight md:text-3xl"
            data-testid="text-title-funding-desk"
          >
            Funding Desk
          </h1>
        </div>
        <p className="text-sm text-muted-foreground" data-testid="text-subtitle-funding-desk">
          Review and manage funding requests from operators
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {fundingRequests.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center">
            <Banknote className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No funding requests yet. Requests from operators will appear here.</p>
          </div>
        ) : (
          fundingRequests.map((request) => (
            <div key={request.id} className="rounded-2xl border bg-card p-6" data-testid={`funding-request-${request.id}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{request.requesterName}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {request.type.toUpperCase()} • {formatAmount(request.amount)}
                  </p>
                  {request.notes && (
                    <p className="mt-2 text-sm text-muted-foreground">{request.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <div className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {request.status === 'pending' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => handleAction(request.id, 'approve')}
                    data-testid={`approve-${request.id}`}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => handleAction(request.id, 'info')}
                    data-testid={`request-info-${request.id}`}
                  >
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Request Info
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleAction(request.id, 'reject')}
                    data-testid={`reject-${request.id}`}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
