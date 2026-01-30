import { FileCheck } from "lucide-react";

export default function Evidence() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2">
          <div
            className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 border border-primary/15"
            aria-hidden="true"
          >
            <FileCheck className="h-4 w-4 text-primary" />
          </div>
          <h1
            className="font-semibold text-2xl tracking-tight md:text-3xl"
            data-testid="text-title-evidence"
          >
            Evidence
          </h1>
        </div>
        <p className="text-sm text-muted-foreground" data-testid="text-subtitle-evidence">
          Due diligence documentation and verification
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {[
          { type: "KYC Documents", status: "Verified", company: "NordWerk Logistics" },
          { type: "Financial Statements", status: "Under Review", company: "Aster Mills" },
          { type: "Trade License", status: "Verified", company: "Kijani Cooperative" },
        ].map((doc, i) => (
          <div key={i} className="rounded-2xl border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{doc.type}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{doc.company}</p>
              </div>
              <div
                className={`inline-flex rounded-full px-3 py-1 text-xs ${
                  doc.status === "Verified"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
                }`}
              >
                {doc.status}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
