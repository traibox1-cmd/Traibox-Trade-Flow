import { Banknote } from "lucide-react";

export default function FundingDesk() {
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
          Deal pipeline and funding request management
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {[
          { company: "NordWerk Logistics", amount: "$2.5M", status: "Under Review", risk: "Low" },
          { company: "Aster Mills", amount: "$1.8M", status: "Approved", risk: "Low" },
          { company: "Global Trade Co", amount: "$3.2M", status: "Pending Due Diligence", risk: "Medium" },
        ].map((deal, i) => (
          <div key={i} className="rounded-2xl border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{deal.company}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Funding Request: {deal.amount}</p>
              </div>
              <div className="text-right">
                <div className="inline-flex rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-400">
                  {deal.status}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">Risk: {deal.risk}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
