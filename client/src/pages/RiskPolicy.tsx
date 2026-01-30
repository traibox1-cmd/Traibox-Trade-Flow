import { AlertTriangle } from "lucide-react";

export default function RiskPolicy() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2">
          <div
            className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 border border-primary/15"
            aria-hidden="true"
          >
            <AlertTriangle className="h-4 w-4 text-primary" />
          </div>
          <h1
            className="font-semibold text-2xl tracking-tight md:text-3xl"
            data-testid="text-title-risk-policy"
          >
            Risk & Policy
          </h1>
        </div>
        <p className="text-sm text-muted-foreground" data-testid="text-subtitle-risk-policy">
          Risk limits, exposure checks, and policy compliance
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold text-lg">Exposure Limits</h3>
          <div className="mt-4 space-y-3">
            <div>
              <div className="flex justify-between text-sm">
                <span>Single Counterparty</span>
                <span className="text-muted-foreground">$5M max</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm">
                <span>Geographic Region</span>
                <span className="text-muted-foreground">$10M max</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold text-lg">Policy Alerts</h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-lg bg-yellow-500/10 p-3 text-sm">
              <div className="font-medium text-yellow-500">1 Warning</div>
              <div className="text-muted-foreground">Approaching concentration limit</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
