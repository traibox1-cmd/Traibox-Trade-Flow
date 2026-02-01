import { useMemo, useState, useEffect, useCallback } from "react";
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
  const [run, setRun] = useState<"idle" | "running" | "done">("idle");
  const { complianceRuns, proofPacks, trades, addComplianceRun, addProofPack } = useAppStore();
  
  const validTabs = ["checks", "reports", "proofs", "anchoring", "passport", "track-trace"];
  
  // Read tab from browser URL (wouter's useLocation doesn't include query string)
  const getTabFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    return validTabs.includes(tab || "") ? tab! : "checks";
  }, []);
  
  const [activeTab, setActiveTab] = useState<string>(getTabFromUrl);

  // Sync URL when tab changes via UI clicks
  const handleTabChange = useCallback((newTab: string) => {
    setActiveTab(newTab);
    // Update URL without full navigation (keeps scroll position)
    const newUrl = newTab === "checks" ? "/compliance" : `/compliance?tab=${newTab}`;
    window.history.replaceState(null, "", newUrl);
  }, []);

  // Listen for URL changes (popstate for back/forward, and re-check on mount)
  useEffect(() => {
    const handleUrlChange = () => {
      setActiveTab(getTabFromUrl());
    };
    
    window.addEventListener("popstate", handleUrlChange);
    // Also check immediately in case we navigated here with a tab param
    handleUrlChange();
    
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, [getTabFromUrl]);

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
        <Tabs value={activeTab} onValueChange={handleTabChange} data-testid="tabs-compliance">
          <TabsList className="w-full justify-start" data-testid="tabslist-compliance">
            <TabsTrigger value="checks" data-testid="tab-checks">
              Checks & Findings
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">
              Reports
            </TabsTrigger>
            <TabsTrigger value="proofs" data-testid="tab-proofs">
              Proof Packs
            </TabsTrigger>
            <TabsTrigger value="anchoring" data-testid="tab-anchoring">
              Verification & Anchoring
            </TabsTrigger>
            <TabsTrigger value="passport" data-testid="tab-passport">
              Trade Passport
            </TabsTrigger>
            <TabsTrigger value="track-trace" data-testid="tab-track-trace">
              Track & Trace
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

          <TabsContent value="anchoring" className="mt-4" data-testid="panel-anchoring">
            <TBCard
              title="Verification & Anchoring"
              subtitle="Document verification and blockchain anchoring"
              state="idle"
              icon={<ShieldCheck className="h-4 w-4" />}
              dataTestId="card-anchoring"
            >
              <div className="space-y-4">
                <div className="rounded-2xl border bg-background/60 p-4">
                  <div className="text-sm font-medium mb-3">Document Verification</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Bill of Lading</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-600 rounded">Verified</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                        <span className="text-sm">Commercial Invoice</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-600 rounded">Verified</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm">Certificate of Origin</span>
                      </div>
                      <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-600 rounded">Pending</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border bg-background/60 p-4">
                  <div className="text-sm font-medium mb-3">Blockchain Anchoring</div>
                  <div className="text-sm text-muted-foreground mb-3">
                    Anchor document hashes to an immutable ledger for tamper-proof verification.
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                      <span className="text-sm">Last anchor</span>
                      <span className="text-xs text-muted-foreground">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                      <span className="text-sm">Documents anchored</span>
                      <span className="text-xs font-medium">5</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="secondary" size="sm" className="h-8">
                      Anchor Documents
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                      View Proof
                    </Button>
                  </div>
                </div>
              </div>
            </TBCard>
          </TabsContent>

          <TabsContent value="track-trace" className="mt-4" data-testid="panel-track-trace">
            <TBCard
              title="Track & Trace"
              subtitle="Logistics tracking and shipment visibility"
              state="idle"
              icon={<Package className="h-4 w-4" />}
              dataTestId="card-track-trace"
            >
              <div className="space-y-4">
                <div className="rounded-2xl border bg-background/60 p-4">
                  <div className="text-sm font-medium mb-3">Provider Connection</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <span className="text-sm">Not connected</span>
                    </div>
                    <Button variant="secondary" size="sm" className="h-8">
                      Connect Provider
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl border bg-background/60 p-4">
                  <div className="text-sm font-medium mb-3">Milestone Timeline</div>
                  <div className="space-y-3">
                    {[
                      { key: "booked", label: "Booking Confirmed", status: "confirmed" },
                      { key: "pickup", label: "Goods Picked Up", status: "confirmed" },
                      { key: "export-cleared", label: "Export Cleared", status: "confirmed" },
                      { key: "in-transit", label: "In Transit", status: "pending" },
                      { key: "import-cleared", label: "Import Cleared", status: "pending" },
                      { key: "delivered", label: "Delivered / POD", status: "pending" },
                    ].map((milestone) => (
                      <div key={milestone.key} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          milestone.status === "confirmed" 
                            ? "bg-green-500/20 text-green-600" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {milestone.status === "confirmed" ? "✓" : "○"}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{milestone.label}</div>
                          {milestone.status === "confirmed" && (
                            <div className="text-xs text-muted-foreground">Completed</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    View detailed logistics tracking from the Trade Workspace Logistics tab.
                  </div>
                </div>
              </div>
            </TBCard>
          </TabsContent>

          <TabsContent value="passport" className="mt-4" data-testid="panel-passport">
            <div className="space-y-4">
              <TBCard
                title="Trade Passport"
                subtitle="Identity, compliance status, and shareable verification credentials"
                state="warn"
                icon={<BadgeCheck className="h-4 w-4" />}
                dataTestId="card-passport-panel"
              >
                <div className="space-y-4">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs font-semibold mb-1">Missing information</div>
                        <ul className="text-xs text-muted-foreground space-y-0.5">
                          <li>• Beneficial ownership declaration</li>
                          <li>• ESG compliance report</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">Company Identity (KYB)</div>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted/30 rounded-lg">
                      <div>
                        <div className="text-[10px] text-muted-foreground">Company Name</div>
                        <div className="text-xs font-medium">Global Trade Solutions Ltd</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-muted-foreground">Registration No.</div>
                        <div className="text-xs font-medium">GB123456789</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">Beneficial Ownership (UBO)</div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-2">UBO declaration pending submission</div>
                      <Button size="sm" variant="outline" className="h-7 text-xs">
                        Upload Declaration
                      </Button>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">Compliance Status</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <span className="text-xs font-medium">KYC/KYB</span>
                        <div className="px-1.5 py-0.5 bg-green-500/20 text-green-600 text-[10px] rounded">Complete</div>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <span className="text-xs font-medium">AML</span>
                        <div className="px-1.5 py-0.5 bg-green-500/20 text-green-600 text-[10px] rounded">Clear</div>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <span className="text-xs font-medium">UBO</span>
                        <div className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-600 text-[10px] rounded">Pending</div>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <span className="text-xs font-medium">ESG</span>
                        <div className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-600 text-[10px] rounded">Pending</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">Evidence & Proof Packs</div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="text-xs text-muted-foreground">
                        {proofPacks.length} proof pack(s) linked • {complianceRuns.length} compliance check(s)
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">Share Controls</div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
                        Internal Only
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
                        Trade Parties
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-xs flex-1">
                        Financiers
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Button variant="secondary" size="sm" className="h-8 flex-1">
                      <Download className="mr-2 h-3 w-3" />
                      Export PDF
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 flex-1" onClick={() => window.location.href = '/trade-passport'} data-testid="button-view-full-passport">
                      View Full Passport
                    </Button>
                  </div>
                </div>
              </TBCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
