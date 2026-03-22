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
  Leaf,
  Calculator,
  Info,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { RiskAssessmentContent } from "./RiskAssessment";

// ─── CBAM Panel ──────────────────────────────────────────────────────────────

type CBAMScopeItem = {
  hs_code: string;
  in_scope: boolean;
  category: string | null;
  cn_code: string | null;
  notes: string;
};

type CBAMCalcItem = {
  hs_code: string;
  category: string;
  quantity_tonnes: number;
  embedded_emissions_tco2: number;
  emission_source: "actual" | "default" | "mixed";
  cbam_certificates_required: number | null;
  estimated_cost_eur: number | null;
};

type CBAMCalculation = {
  trade_id: string;
  in_scope: boolean;
  items: CBAMCalcItem[];
  totals: {
    total_emissions_tco2: number;
    total_certificates: number | null;
    estimated_total_cost_eur: number | null;
  };
  carbon_price_reference: { ets_price_eur_per_tco2: number; as_of: string };
  reporting_obligations: string[];
  glass_box: { reasons: string[] };
  trace_id: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  cement: "Cement",
  iron_steel: "Iron & Steel",
  aluminium: "Aluminium",
  fertilisers: "Fertilisers",
  electricity: "Electricity",
  hydrogen: "Hydrogen",
};

function CBAMPanel() {
  const { trades } = useAppStore();

  // Scope check state
  const [hsInput, setHsInput] = useState("7208, 7601, 2523");
  const [corridorInput, setCorridorInput] = useState("CN → EU");
  const [scopeResult, setScopeResult] = useState<{ in_scope: boolean; items: CBAMScopeItem[] } | null>(null);
  const [scopeLoading, setScopeLoading] = useState(false);
  const [scopeError, setScopeError] = useState<string | null>(null);

  // Calculation state
  const [calcTradeId, setCalcTradeId] = useState(trades[0]?.id ?? "");
  const [calcItems, setCalcItems] = useState(
    `[{"hs_code":"7208","quantity_tonnes":500,"origin_country":"CN"},{"hs_code":"7601","quantity_tonnes":200,"origin_country":"CN"}]`
  );
  const [calcResult, setCalcResult] = useState<CBAMCalculation | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  // Report state
  const [reportTradeId, setReportTradeId] = useState(trades[0]?.id ?? "");
  const [reportResult, setReportResult] = useState<Record<string, unknown> | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const handleScopeCheck = async () => {
    setScopeLoading(true);
    setScopeError(null);
    setScopeResult(null);
    try {
      const codes = hsInput
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((hs_code) => ({ hs_code }));

      const res = await fetch("/api/cbam/scope-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: codes, corridor: corridorInput || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scope check failed");
      setScopeResult(data);
    } catch (err) {
      setScopeError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setScopeLoading(false);
    }
  };

  const handleCalculate = async () => {
    setCalcLoading(true);
    setCalcError(null);
    setCalcResult(null);
    try {
      let items;
      try {
        items = JSON.parse(calcItems);
      } catch {
        throw new Error("Invalid JSON in items field");
      }
      const res = await fetch("/api/cbam/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trade_id: calcTradeId || "demo", items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Calculation failed");
      setCalcResult(data);
    } catch (err) {
      setCalcError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setCalcLoading(false);
    }
  };

  const handleReport = async () => {
    setReportLoading(true);
    setReportError(null);
    setReportResult(null);
    try {
      const id = reportTradeId || trades[0]?.id;
      if (!id) throw new Error("No trade selected");
      const res = await fetch(`/api/cbam/report/${id}?format=json`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Report generation failed");
      setReportResult(data);
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="cbam-panel">
      {/* Header card */}
      <TBCard
        title="Sustainability & CBAM"
        subtitle="Carbon Border Adjustment Mechanism — EU Regulation 2023/956"
        state="idle"
        icon={<Leaf className="h-4 w-4" />}
        dataTestId="card-cbam-header"
      >
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            CBAM places a carbon price on imports of certain goods from outside the EU to prevent
            carbon leakage. In-scope goods: <strong>cement, iron/steel, aluminium, fertilisers,
            electricity, hydrogen</strong>.
          </p>
          <p className="text-xs">
            Transitional period: Oct 2023 – Dec 2025 (reporting only). Full obligations from 1 Jan 2026.
          </p>
        </div>
      </TBCard>

      {/* Scope Check */}
      <TBCard
        title="HS Code Scope Check"
        subtitle="Check whether your goods fall within CBAM scope"
        state={scopeLoading ? "loading" : scopeResult ? (scopeResult.in_scope ? "warn" : "ready") : "idle"}
        icon={<ShieldCheck className="h-4 w-4" />}
        dataTestId="card-cbam-scope"
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">HS Codes (comma-separated)</label>
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={hsInput}
              onChange={(e) => setHsInput(e.target.value)}
              placeholder="e.g. 7208, 7601, 2523"
              data-testid="input-cbam-hs-codes"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Trade corridor (optional)</label>
            <input
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={corridorInput}
              onChange={(e) => setCorridorInput(e.target.value)}
              placeholder="e.g. CN → EU"
              data-testid="input-cbam-corridor"
            />
          </div>
          <Button
            className="h-8"
            onClick={handleScopeCheck}
            disabled={scopeLoading}
            data-testid="button-cbam-scope-check"
          >
            {scopeLoading ? "Checking…" : "Check Scope"}
          </Button>

          {scopeError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600" data-testid="cbam-scope-error">
              {scopeError}
            </div>
          )}

          {scopeResult && (
            <div className="space-y-2" data-testid="cbam-scope-result">
              <div className="flex items-center gap-2">
                <TBChip tone={scopeResult.in_scope ? "warn" : "success"} dataTestId="chip-cbam-in-scope">
                  {scopeResult.in_scope ? "In CBAM scope" : "Out of scope"}
                </TBChip>
              </div>
              <div className="grid gap-2">
                {scopeResult.items.map((item) => (
                  <div
                    key={item.hs_code}
                    className="rounded-xl border bg-background/60 p-3"
                    data-testid={`cbam-scope-item-${item.hs_code}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-medium">HS {item.hs_code}</div>
                        {item.category && (
                          <div className="text-xs text-muted-foreground">
                            {CATEGORY_LABELS[item.category] ?? item.category}
                            {item.cn_code && ` · CN ${item.cn_code}`}
                          </div>
                        )}
                        <div className="mt-1 text-xs text-muted-foreground">{item.notes}</div>
                      </div>
                      <TBChip
                        tone={item.in_scope ? "warn" : "neutral"}
                        dataTestId={`chip-scope-${item.hs_code}`}
                      >
                        {item.in_scope ? "In scope" : "Out of scope"}
                      </TBChip>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </TBCard>

      {/* CBAM Calculate */}
      <TBCard
        title="CBAM Obligation Calculator"
        subtitle="Calculate embedded emissions and certificate requirements"
        state={calcLoading ? "loading" : calcResult ? "ready" : "idle"}
        icon={<Calculator className="h-4 w-4" />}
        dataTestId="card-cbam-calculate"
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Trade ID</label>
            <select
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={calcTradeId}
              onChange={(e) => setCalcTradeId(e.target.value)}
              data-testid="select-cbam-trade"
            >
              <option value="">— no trade (demo) —</option>
              {trades.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Items (JSON array)</label>
            <textarea
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
              rows={4}
              value={calcItems}
              onChange={(e) => setCalcItems(e.target.value)}
              data-testid="textarea-cbam-items"
            />
            <div className="mt-1 text-xs text-muted-foreground">
              Fields: hs_code, quantity_tonnes, origin_country (ISO 2), embedded_emissions_tco2 (optional)
            </div>
          </div>
          <Button
            className="h-8"
            onClick={handleCalculate}
            disabled={calcLoading}
            data-testid="button-cbam-calculate"
          >
            {calcLoading ? "Calculating…" : "Calculate CBAM"}
          </Button>

          {calcError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600" data-testid="cbam-calc-error">
              {calcError}
            </div>
          )}

          {calcResult && (
            <div className="space-y-4" data-testid="cbam-calc-result">
              <Separator />

              {/* Totals */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border bg-background/60 p-3 text-center">
                  <div className="text-xs text-muted-foreground">Total Emissions</div>
                  <div className="mt-1 text-lg font-semibold" data-testid="cbam-total-emissions">
                    {calcResult.totals.total_emissions_tco2.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">tCO₂e</div>
                </div>
                <div className="rounded-xl border bg-background/60 p-3 text-center">
                  <div className="text-xs text-muted-foreground">Certificates Required</div>
                  <div className="mt-1 text-lg font-semibold" data-testid="cbam-total-certs">
                    {calcResult.totals.total_certificates != null
                      ? calcResult.totals.total_certificates.toFixed(2)
                      : "—"}
                  </div>
                  <div className="text-[10px] text-muted-foreground">tCO₂e equiv.</div>
                </div>
                <div className="rounded-xl border bg-background/60 p-3 text-center">
                  <div className="text-xs text-muted-foreground">Est. Cost</div>
                  <div className="mt-1 text-lg font-semibold" data-testid="cbam-total-cost">
                    {calcResult.totals.estimated_total_cost_eur != null
                      ? `€${calcResult.totals.estimated_total_cost_eur.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                      : "—"}
                  </div>
                  <div className="text-[10px] text-muted-foreground">EUR (indicative)</div>
                </div>
              </div>

              {/* Items */}
              {calcResult.items.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Item breakdown</div>
                  {calcResult.items.map((item, idx) => (
                    <div key={idx} className="rounded-xl border bg-background/60 p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-sm font-medium">HS {item.hs_code}</div>
                        <TBChip
                          tone={item.emission_source === "actual" ? "success" : "neutral"}
                          dataTestId={`chip-emission-source-${idx}`}
                        >
                          {item.emission_source === "actual" ? "Actual data" : "EU default"}
                        </TBChip>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 text-xs text-muted-foreground">
                        <div>Category: <span className="text-foreground">{CATEGORY_LABELS[item.category] ?? item.category}</span></div>
                        <div>Quantity: <span className="text-foreground">{item.quantity_tonnes.toLocaleString()} t</span></div>
                        <div>Embedded emissions: <span className="text-foreground">{item.embedded_emissions_tco2.toFixed(4)} tCO₂e</span></div>
                        <div>Certs required: <span className="text-foreground">{item.cbam_certificates_required?.toFixed(4) ?? "—"}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Carbon price */}
              <div className="rounded-xl border bg-muted/30 p-3">
                <div className="text-xs font-medium mb-1">Carbon price reference</div>
                <div className="text-xs text-muted-foreground">
                  EU ETS: <strong>€{calcResult.carbon_price_reference.ets_price_eur_per_tco2}/tCO₂e</strong>
                  {" · "}as of {calcResult.carbon_price_reference.as_of}
                </div>
              </div>

              {/* Reporting obligations */}
              {calcResult.reporting_obligations.length > 0 && (
                <div className="rounded-xl border bg-background/60 p-3">
                  <div className="text-xs font-medium mb-2">Reporting obligations</div>
                  <ul className="space-y-1">
                    {calcResult.reporting_obligations.map((o, i) => (
                      <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                        <span className="mt-0.5 shrink-0">•</span>
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Glass box */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                  <div className="text-xs font-medium text-blue-700">Glass-box explanation</div>
                </div>
                <ul className="space-y-1">
                  {calcResult.glass_box.reasons.map((r, i) => (
                    <li key={i} className="text-xs text-muted-foreground">{r}</li>
                  ))}
                </ul>
                <div className="mt-2 text-[10px] text-muted-foreground">trace_id: {calcResult.trace_id}</div>
              </div>
            </div>
          )}
        </div>
      </TBCard>

      {/* Quarterly Report */}
      <TBCard
        title="Quarterly Report"
        subtitle="Download CBAM quarterly contribution for EU Registry submission"
        state={reportLoading ? "loading" : reportResult ? "ready" : "idle"}
        icon={<FileText className="h-4 w-4" />}
        dataTestId="card-cbam-report"
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Trade</label>
            <select
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={reportTradeId}
              onChange={(e) => setReportTradeId(e.target.value)}
              data-testid="select-cbam-report-trade"
            >
              <option value="">— select a trade —</option>
              {trades.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button
              className="h-8"
              onClick={handleReport}
              disabled={reportLoading || !reportTradeId}
              data-testid="button-cbam-report"
            >
              {reportLoading ? "Generating…" : "Generate Report"}
            </Button>
            {reportResult && (
              <Button
                variant="secondary"
                className="h-8"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(reportResult, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `cbam-report-${reportTradeId}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                data-testid="button-cbam-report-download"
              >
                <Download className="mr-2 h-3.5 w-3.5" />
                Download JSON
              </Button>
            )}
          </div>

          {reportError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600" data-testid="cbam-report-error">
              {reportError}
            </div>
          )}

          {reportResult && (
            <div className="rounded-xl border bg-background/60 p-3 space-y-2" data-testid="cbam-report-result">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">{String(reportResult.trade_title)}</div>
                <TBChip tone="neutral" dataTestId="chip-report-status">
                  {String(reportResult.status)}
                </TBChip>
              </div>
              <div className="text-xs text-muted-foreground">Quarter: {String(reportResult.reporting_quarter)}</div>
              <div className="text-xs text-muted-foreground">{String(reportResult.note)}</div>
              {Array.isArray(reportResult.instructions) && (
                <ul className="space-y-1 pt-1 border-t border-border">
                  {(reportResult.instructions as string[]).map((inst, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2">
                      <span className="shrink-0">•</span>
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </TBCard>
    </div>
  );
}

// ─── End CBAM Panel ───────────────────────────────────────────────────────────

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
  
  const validTabs = ["checks", "reports", "proof-packs", "verification", "passport", "track", "risk", "sustainability"];
  
  // Read tab from browser URL (wouter's useLocation doesn't include query string)
  const getTabFromUrl = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    // Handle legacy tab names
    if (tab === "proofs") return "proof-packs";
    if (tab === "anchoring") return "verification";
    if (tab === "track-trace") return "track";
    if (tab === "risk-assessment") return "risk";
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
            <TabsTrigger value="proof-packs" data-testid="tab-proof-packs">
              Proof Packs
            </TabsTrigger>
            <TabsTrigger value="verification" data-testid="tab-verification">
              Verification & Anchoring
            </TabsTrigger>
            <TabsTrigger value="passport" data-testid="tab-passport">
              Trade Passport
            </TabsTrigger>
            <TabsTrigger value="track" data-testid="tab-track">
              Track & Trace
            </TabsTrigger>
            <TabsTrigger value="risk" data-testid="tab-risk">
              Risk Assessment
            </TabsTrigger>
            <TabsTrigger value="sustainability" data-testid="tab-sustainability">
              Sustainability & CBAM
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

          <TabsContent value="proof-packs" className="mt-4" data-testid="panel-proof-packs">
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
              title="Compliance Reports"
              subtitle="Compliance check results and audit-ready exports"
              state="idle"
              icon={<FileText className="h-4 w-4" />}
              dataTestId="card-reports-panel"
            >
              {complianceRuns.length === 0 ? (
                <div
                  className="rounded-2xl border bg-background/60 p-4"
                  data-testid="empty-reports"
                >
                  <div className="text-sm font-medium">No compliance reports yet</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Run compliance checks from the Checks tab or load demo data to see sample reports.
                  </div>
                </div>
              ) : (
                <div className="space-y-3" data-testid="reports-list">
                  {complianceRuns.map((run) => {
                    const passedCount = run.findings.filter(f => f.type === 'pass').length;
                    const warnCount = run.findings.filter(f => f.type === 'warn').length;
                    const failCount = run.findings.filter(f => f.type === 'fail').length;
                    const trade = trades.find(t => t.id === run.tradeId);
                    
                    return (
                      <div
                        key={run.id}
                        className="rounded-xl border bg-background/60 p-4"
                        data-testid={`report-${run.id}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-medium text-sm">{run.targetEntity}</div>
                            <div className="text-xs text-muted-foreground">
                              {trade ? trade.title : 'Unknown Trade'} • {new Date(run.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            run.status === 'passed' 
                              ? 'bg-green-500/20 text-green-600' 
                              : run.status === 'failed'
                              ? 'bg-red-500/20 text-red-600'
                              : 'bg-yellow-500/20 text-yellow-600'
                          }`}>
                            {run.status === 'passed' ? 'Passed' : run.status === 'failed' ? 'Failed' : 'Pending'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-3 text-xs">
                          <span className="flex items-center gap-1">
                            <BadgeCheck className="w-3 h-3 text-green-600" />
                            {passedCount} passed
                          </span>
                          {warnCount > 0 && (
                            <span className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-yellow-600" />
                              {warnCount} warnings
                            </span>
                          )}
                          {failCount > 0 && (
                            <span className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-red-600" />
                              {failCount} failed
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          {run.findings.slice(0, 4).map((finding, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              {finding.type === 'pass' && <BadgeCheck className="w-3 h-3 text-green-600" />}
                              {finding.type === 'warn' && <AlertTriangle className="w-3 h-3 text-yellow-600" />}
                              {finding.type === 'fail' && <AlertTriangle className="w-3 h-3 text-red-600" />}
                              <span className="text-muted-foreground">{finding.message}</span>
                            </div>
                          ))}
                          {run.findings.length > 4 && (
                            <div className="text-xs text-muted-foreground pl-5">
                              +{run.findings.length - 4} more findings
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TBCard>
          </TabsContent>

          <TabsContent value="verification" className="mt-4" data-testid="panel-verification">
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

          <TabsContent value="track" className="mt-4" data-testid="panel-track">
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

          <TabsContent value="risk" className="mt-4" data-testid="panel-risk">
            <RiskAssessmentContent />
          </TabsContent>

          <TabsContent value="sustainability" className="mt-4" data-testid="panel-sustainability">
            <CBAMPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
