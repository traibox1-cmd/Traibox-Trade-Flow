import { LayoutDashboard } from "lucide-react";

export default function CapitalConsole() {
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
          Portfolio view and capital allocation dashboard
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold text-lg">Total Deployed Capital</h3>
          <div className="mt-2 text-3xl font-bold text-primary">$24.5M</div>
          <p className="mt-1 text-sm text-muted-foreground">Across 12 active trades</p>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold text-lg">Available Capital</h3>
          <div className="mt-2 text-3xl font-bold">$15.8M</div>
          <p className="mt-1 text-sm text-muted-foreground">Ready to deploy</p>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold text-lg">Average Return</h3>
          <div className="mt-2 text-3xl font-bold text-green-500">8.2%</div>
          <p className="mt-1 text-sm text-muted-foreground">Annualized</p>
        </div>

        <div className="rounded-2xl border bg-card p-6">
          <h3 className="font-semibold text-lg">Risk Score</h3>
          <div className="mt-2 text-3xl font-bold">2.4</div>
          <p className="mt-1 text-sm text-muted-foreground">Low to moderate</p>
        </div>
      </div>
    </div>
  );
}
