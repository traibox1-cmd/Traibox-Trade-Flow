import { useMemo, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TBCard } from "../components/tb/TBCard";
import { TBChip } from "../components/tb/TBChip";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  BadgeCheck,
  ClipboardList,
  FileText,
  ShieldCheck,
  Sparkles,
  Package,
  Download,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

type Check = {
  id: string;
  name: string;
  status: "passed" | "needs_review" | "blocked";
  note: string;
};

const checks: Check[] = [
  {
    id: "c1",
    name: "Sanctions screening",
    status: "passed",
    note: "No matches for parties and vessels in the trade scope.",
  },
  {
    id: "c2",
    name: "KYC completeness",
    status: "needs_review",
    note: "Missing shipper UBO declaration and proof of address.",
  },
  {
    id: "c3",
    name: "Restricted goods policy",
    status: "passed",
    note: "HS codes classified as low risk for corridor.",
  },
  {
    id: "c4",
    name: "PEP / adverse media",
    status: "passed",
    note: "No material hits in configured sources.",
  },
];

export default function CompliancePage() {
  const [location] = useLocation();
  const queryParams = new URLSearchParams(location.split("?")[1] || "");
  const tabParam = queryParams.get("tab");
  const [run, setRun] = useState<"idle" | "running" | "done">("idle");
  const [activeTab, setActiveTab] = useState<string>(tabParam || "checks");
  const { complianceRuns, proofPacks, trades, addComplianceRun, addProofPack } = useAppStore();

  useEffect(() => {
    if (tabParam === "checks" || tabParam === "proofs" || tabParam === "reports") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const summary = useMemo(() => {
    const passed = checks.filter((c) => c.status === "passed").length;
    const needs = checks.filter((c) => c.status === "needs_review").length;
    const blocked = checks.filter((c) => c.status === "blocked").length;
    return { passed, needs, blocked };
  }, []);

  const handleRunChecks = () => {
    const defaultTrade = trades[0];
    if (!defaultTrade) {
      alert("Please create a trade first from Trade Intelligence");
      return;
    }
    
    setRun("running");
    setTimeout(() => {
      addComplianceRun({
        tradeId: defaultTrade.id,
        targetEntity: "Trade Counterparty",
        checks: ["sanctions", "kyc", "restricted-goods", "pep"],
        status: "passed",
        findings: [
          { type: "pass", message: "No sanctions matches found" },
          { type: "pass", message: "KYC documentation verified" },
        ],
      });
      setRun("done");
    }, 900);
  };

  const handleGenerateProofPack = () => {
    const defaultTrade = trades[0];
    if (!defaultTrade) {
      alert("Please create a trade first from Trade Intelligence");
      return;
    }
    
    addProofPack({
      tradeId: defaultTrade.id,
      title: `Compliance Pack ${new Date().toLocaleDateString()}`,
      documents: ["Commercial Invoice", "Bill of Lading", "Certificate of Origin", "Inspection Certificate"],
      status: "ready",
    });
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <div
              className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 border border-primary/15"
              aria-hidden="true"
            >
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <h1
              className="font-serif text-2xl tracking-tight md:text-3xl"
              data-testid="text-title-compliance"
            >
              Compliance
            </h1>
          </div>
          <p
            className="text-sm text-muted-foreground"
            data-testid="text-subtitle-compliance"
          >
            Checks, findings, actions, and reports—evidence-ready by design.
          </p>
        </div>
        <Button
          className="h-9"
          onClick={handleRunChecks}
          data-testid="button-run-checks"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Run checks
        </Button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <TBCard
          title="Status"
          subtitle="Trade scope"
          state={summary.needs ? "warn" : "ready"}
          icon={<ClipboardList className="h-4 w-4" />}
          dataTestId="card-compliance-status"
        >
          <div className="flex items-center gap-2">
            <TBChip tone="success" dataTestId="chip-passed">
              {summary.passed} passed
            </TBChip>
            <TBChip tone="warn" dataTestId="chip-needs">
              {summary.needs} needs review
            </TBChip>
          </div>
          <div className="mt-2 text-sm text-muted-foreground" data-testid="text-run-state">
            {run === "idle"
              ? "Ready to run."
              : run === "running"
                ? "Running checks…"
                : "Completed. Findings are scoped to this trade."}
          </div>
        </TBCard>

        <TBCard
          title="Findings"
          subtitle="Actionable signals"
          state={summary.needs ? "warn" : "ready"}
          icon={<AlertTriangle className="h-4 w-4" />}
          dataTestId="card-findings"
        >
          <div className="text-sm" data-testid="text-findings">
            {summary.needs ? "1 item requires verification." : "No findings."}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Default posture is conservative: stop, explain, and collect evidence.
          </div>
        </TBCard>

        <TBCard
          title="Reports"
          subtitle="Exportable"
          state="idle"
          icon={<FileText className="h-4 w-4" />}
          dataTestId="card-reports"
        >
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" className="h-8" data-testid="button-export-pdf">
              Export PDF
            </Button>
            <Button variant="secondary" className="h-8" data-testid="button-export-json">
              Export JSON
            </Button>
          </div>
        </TBCard>
      </div>

      <div className="mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} data-testid="tabs-compliance">
          <TabsList className="w-full justify-start" data-testid="tabslist-compliance">
            <TabsTrigger value="checks" data-testid="tab-checks">
              Checks
            </TabsTrigger>
            <TabsTrigger value="proofs" data-testid="tab-proofs">
              Proof Packs
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="checks" className="mt-4" data-testid="panel-checks">
            <TBCard
              title="Checks"
              subtitle="What ran and why"
              state={run === "running" ? "loading" : summary.needs ? "warn" : "ready"}
              icon={<ShieldCheck className="h-4 w-4" />}
              dataTestId="card-checks"
            >
              <div className="grid gap-3">
                {checks.map((c) => {
                  const tone =
                    c.status === "passed"
                      ? "success"
                      : c.status === "needs_review"
                        ? "warn"
                        : "error";
                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                      className="rounded-2xl border bg-background/60 p-4"
                      data-testid={`row-check-${c.id}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium" data-testid={`text-check-name-${c.id}`}>
                            {c.name}
                          </div>
                          <div
                            className="mt-1 text-sm text-muted-foreground"
                            data-testid={`text-check-note-${c.id}`}
                          >
                            {c.note}
                          </div>
                        </div>
                        <TBChip tone={tone as any} dataTestId={`chip-check-status-${c.id}`}>
                          {c.status === "passed"
                            ? "Passed"
                            : c.status === "needs_review"
                              ? "Needs review"
                              : "Blocked"}
                        </TBChip>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <Separator className="my-4" />

              <div className="grid gap-2">
                <div className="text-xs font-medium">Suggested actions</div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" className="h-8" data-testid="button-request-ubo">
                    Request UBO declaration
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-8"
                    data-testid="button-request-address"
                  >
                    Request proof of address
                  </Button>
                </div>
              </div>
            </TBCard>
          </TabsContent>

          <TabsContent value="proofs" className="mt-4" data-testid="panel-proofs">
            <TBCard
              title="Proof Packs"
              subtitle="Documentation packages ready for verification"
              state="idle"
              icon={<Package className="h-4 w-4" />}
              dataTestId="card-proofs"
            >
              <div className="mb-4">
                <Button onClick={handleGenerateProofPack} data-testid="button-generate-proof">
                  <Package className="mr-2 h-4 w-4" />
                  Generate New Proof Pack
                </Button>
              </div>

              {proofPacks.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No proof packs generated yet. Click "Generate New Proof Pack" to create one.
                </div>
              ) : (
                <div className="grid gap-3">
                  {proofPacks.map((pack) => (
                    <div
                      key={pack.id}
                      className="rounded-2xl border bg-background/60 p-4"
                      data-testid={`proof-pack-${pack.id}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-medium">{pack.title}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {pack.documents.length} documents • {new Date(pack.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <TBChip 
                          tone={pack.status === 'verified' ? 'success' : pack.status === 'ready' ? 'neutral' : 'warn'} 
                          dataTestId={`chip-proof-status-${pack.id}`}
                        >
                          {pack.status}
                        </TBChip>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <div className="font-medium mb-1">Documents:</div>
                        <div className="flex flex-wrap gap-2">
                          {pack.documents.map((doc, idx) => (
                            <span key={idx} className="text-xs bg-background border rounded px-2 py-1">{doc}</span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button variant="secondary" size="sm">
                          <Download className="w-3 h-3 mr-2" />
                          Download
                        </Button>
                        <Button variant="secondary" size="sm">
                          <FileText className="w-3 h-3 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TBCard>
          </TabsContent>

          <TabsContent value="reports" className="mt-4" data-testid="panel-reports">
            <TBCard
              title="Actions"
              subtitle="Intents that produce evidence"
              state="idle"
              icon={<BadgeCheck className="h-4 w-4" />}
              dataTestId="card-actions"
            >
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { title: "Create verification request", desc: "Scoped request with deadline" },
                  { title: "Escalate to compliance", desc: "Add reviewer and rationale" },
                  { title: "Record decision", desc: "Approve with notes and policy refs" },
                  { title: "Generate report", desc: "Export evidence bundle" },
                ].map((a) => (
                  <div
                    key={a.title}
                    className="rounded-2xl border bg-background/60 p-4"
                    data-testid={`card-action-${a.title
                      .replace(/\s+/g, "-")
                      .toLowerCase()}`}
                  >
                    <div className="font-medium">{a.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground">{a.desc}</div>
                    <Button
                      variant="secondary"
                      className="mt-3 h-8"
                      data-testid={`button-action-${a.title
                        .replace(/\s+/g, "-")
                        .toLowerCase()}`}
                    >
                      Open
                    </Button>
                  </div>
                ))}
              </div>
            </TBCard>
          </TabsContent>

          <TabsContent value="reports" className="mt-4" data-testid="panel-reports">
            <TBCard
              title="Reports"
              subtitle="Audit-ready exports"
              state="idle"
              icon={<FileText className="h-4 w-4" />}
              dataTestId="card-reports-panel"
            >
              <div
                className="rounded-2xl border bg-background/60 p-4"
                data-testid="empty-reports"
              >
                <div className="text-sm font-medium">No saved reports yet</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Generate a report after checks complete, or from within a trade workspace.
                </div>
              </div>
            </TBCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
