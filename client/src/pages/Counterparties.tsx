import { Building2 } from "lucide-react";

export default function Counterparties() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2">
          <div
            className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 border border-primary/15"
            aria-hidden="true"
          >
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <h1
            className="font-semibold text-2xl tracking-tight md:text-3xl"
            data-testid="text-title-counterparties"
          >
            Counterparties
          </h1>
        </div>
        <p className="text-sm text-muted-foreground" data-testid="text-subtitle-counterparties">
          Credit profiles and relationship management
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {[
          { name: "NordWerk Logistics", credit: "AAA", exposure: "$2.5M", trades: 8 },
          { name: "Aster Mills", credit: "AA", exposure: "$1.8M", trades: 5 },
          { name: "Kijani Cooperative", credit: "A", exposure: "$0.9M", trades: 3 },
        ].map((party, i) => (
          <div key={i} className="rounded-2xl border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg">{party.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Credit Rating: {party.credit} • {party.trades} active trades
                </p>
              </div>
              <div className="text-right">
                <div className="font-semibold">{party.exposure}</div>
                <div className="text-sm text-muted-foreground">Total Exposure</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
