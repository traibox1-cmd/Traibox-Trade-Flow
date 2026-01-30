import { LayoutDashboard, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function CapitalConsole() {
  const { fundingRequests } = useAppStore();

  const pendingRequests = fundingRequests.filter(r => r.status === 'pending').length;
  const totalRequested = fundingRequests.reduce((sum, r) => sum + r.amount, 0);
  const approvedAmount = fundingRequests
    .filter(r => r.status === 'approved')
    .reduce((sum, r) => sum + r.amount, 0);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2">
          <div
            className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 border border-primary/15"
            aria-hidden="true"
          >
            <LayoutDashboard className="h-4 w-4 text-primary" />
          </div>
          <h1
            className="font-semibold text-2xl tracking-tight md:text-3xl"
            data-testid="text-title-capital-console"
          >
            Capital Console
          </h1>
        </div>
        <p className="text-sm text-muted-foreground" data-testid="text-subtitle-capital-console">
          Live dashboard of funding requests and portfolio metrics
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="h-4 w-4" />
            <h3 className="font-medium text-sm">Pending Requests</h3>
          </div>
          <div className="text-3xl font-bold text-primary">{pendingRequests}</div>
          <p className="mt-1 text-xs text-muted-foreground">Awaiting review</p>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <TrendingUp className="h-4 w-4" />
            <h3 className="font-medium text-sm">Total Requested</h3>
          </div>
          <div className="text-3xl font-bold">{formatAmount(totalRequested)}</div>
          <p className="mt-1 text-xs text-muted-foreground">All requests</p>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <DollarSign className="h-4 w-4" />
            <h3 className="font-medium text-sm">Approved</h3>
          </div>
          <div className="text-3xl font-bold text-green-500">{formatAmount(approvedAmount)}</div>
          <p className="mt-1 text-xs text-muted-foreground">Deployed capital</p>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <AlertTriangle className="h-4 w-4" />
            <h3 className="font-medium text-sm">Portfolio Risk</h3>
          </div>
          <div className="text-3xl font-bold">Low</div>
          <p className="mt-1 text-xs text-muted-foreground">Current assessment</p>
        </div>
      </div>

      {fundingRequests.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold text-lg mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {fundingRequests.slice(0, 5).map((request) => (
              <div key={request.id} className="rounded-xl border bg-card p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{request.requesterName}</p>
                  <p className="text-sm text-muted-foreground">{request.type.toUpperCase()} • {formatAmount(request.amount)}</p>
                </div>
                <div className={`text-xs font-medium px-3 py-1 rounded-full ${
                  request.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                  request.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                  request.status === 'reviewing' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {request.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
