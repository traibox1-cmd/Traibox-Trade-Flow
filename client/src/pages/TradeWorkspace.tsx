import { useState, useMemo } from "react";
import { useRoute, useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TBCard } from "@/components/tb/TBCard";
import { TBChip } from "@/components/tb/TBChip";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  ClipboardList,
  FileText,
  Banknote,
  CreditCard,
  Package,
  Play,
  Users,
  Globe,
  FileCheck,
  Zap,
  Plus,
  UserPlus,
} from "lucide-react";
import { useAppStore, type TradeTimelineStep } from "@/lib/store";

const TIMELINE_STEPS: { key: TradeTimelineStep; label: string; icon: React.ReactNode }[] = [
  { key: "plan", label: "Plan", icon: <ClipboardList className="h-4 w-4" /> },
  { key: "compliance", label: "Compliance", icon: <FileCheck className="h-4 w-4" /> },
  { key: "funding", label: "Funding", icon: <Banknote className="h-4 w-4" /> },
  { key: "payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
  { key: "proof-pack", label: "Proof Pack", icon: <Package className="h-4 w-4" /> },
];

function getStepIndex(step: TradeTimelineStep): number {
  return TIMELINE_STEPS.findIndex((s) => s.key === step);
}

export default function TradeWorkspace() {
  const [, params] = useRoute("/trade/:id");
  const [, navigate] = useLocation();
  const tradeId = params?.id || "";
  
  const {
    trades,
    complianceRuns,
    fundingRequests,
    payments,
    proofPacks,
    updateTrade,
    addComplianceRun,
    addFundingRequest,
    addPayment,
    addProofPack,
  } = useAppStore();

  const trade = useMemo(() => trades.find((t) => t.id === tradeId), [trades, tradeId]);
  const [inspectorTab, setInspectorTab] = useState("context");

  const tradeComplianceRuns = useMemo(
    () => complianceRuns.filter((r) => r.tradeId === tradeId),
    [complianceRuns, tradeId]
  );
  const tradeFundingRequests = useMemo(
    () => fundingRequests.filter((r) => r.tradeId === tradeId),
    [fundingRequests, tradeId]
  );
  const tradePayments = useMemo(
    () => payments.filter((p) => p.tradeId === tradeId),
    [payments, tradeId]
  );
  const tradeProofPacks = useMemo(
    () => proofPacks.filter((p) => p.tradeId === tradeId),
    [proofPacks, tradeId]
  );

  if (!trade) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <p className="text-muted-foreground mb-4">Trade not found</p>
        <Button variant="secondary" onClick={() => navigate("/intelligence")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Trade Intelligence
        </Button>
      </div>
    );
  }

  const currentStepIndex = getStepIndex(trade.timelineStep);

  const handleRunCompliance = () => {
    addComplianceRun({
      tradeId,
      targetEntity: trade.parties[0]?.name || "Trade Counterparty",
      checks: ["sanctions", "kyc", "restricted-goods", "pep"],
      status: "passed",
      findings: [
        { type: "pass", message: "No sanctions matches found" },
        { type: "pass", message: "KYC documentation verified" },
      ],
    });
    if (currentStepIndex < 1) {
      updateTrade(tradeId, { timelineStep: "compliance" });
    }
  };

  const handleRequestFunding = () => {
    addFundingRequest({
      tradeId,
      amount: trade.value,
      type: "lc",
      status: "pending",
      requesterName: "Current User",
      notes: `Funding for ${trade.title}`,
    });
    if (currentStepIndex < 2) {
      updateTrade(tradeId, { timelineStep: "funding" });
    }
  };

  const handleCreatePayment = () => {
    addPayment({
      tradeId,
      amount: trade.value,
      currency: trade.currency,
      beneficiary: trade.parties.find((p) => p.role === "seller")?.name || "Trade Partner",
      rail: "swift",
      status: "draft",
      notes: `Payment for ${trade.title}`,
    });
    if (currentStepIndex < 3) {
      updateTrade(tradeId, { timelineStep: "payments" });
    }
  };

  const handleGenerateProofPack = () => {
    addProofPack({
      tradeId,
      title: `${trade.title} - Proof Pack`,
      documents: ["Commercial Invoice", "Bill of Lading", "Certificate of Origin", "Inspection Certificate"],
      status: "ready",
    });
    if (currentStepIndex < 4) {
      updateTrade(tradeId, { timelineStep: "proof-pack" });
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-6 border-b border-border">
        <div className="flex items-center gap-3 mb-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/intelligence")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-trade-title">
            {trade.title}
          </h1>
          <TBChip tone={trade.status === "completed" ? "success" : trade.status === "active" ? "neutral" : "warn"} dataTestId="chip-trade-status">
            {trade.status}
          </TBChip>
        </div>
        <p className="text-sm text-muted-foreground ml-10 mb-3">
          {trade.corridor} • {trade.incoterms} • {formatAmount(trade.value, trade.currency)}
        </p>
        <div className="flex items-center gap-2 ml-10">
          <button
            onClick={() => setInspectorTab("parties")}
            className="px-3 py-1 rounded-full bg-background border border-border text-xs hover:bg-accent transition-colors"
            data-testid="chip-quick-parties"
          >
            Parties · {trade.linkedParties.length}
          </button>
          <button
            onClick={() => setInspectorTab("logistics")}
            className={`px-3 py-1 rounded-full border text-xs hover:bg-accent transition-colors ${
              trade.logisticsMilestones.some(m => m.status === 'issue') 
                ? 'bg-red-500/10 border-red-500/30 text-red-500'
                : 'bg-green-500/10 border-green-500/30 text-green-500'
            }`}
            data-testid="chip-quick-logistics"
          >
            Logistics · {trade.logisticsMilestones.some(m => m.status === 'issue') 
              ? `${trade.logisticsMilestones.filter(m => m.status === 'issue').length} issues` 
              : 'On track'}
          </button>
          <button
            onClick={() => navigate("/compliance-proofs?tab=passport")}
            className="px-3 py-1 rounded-full bg-background border border-border text-xs hover:bg-accent transition-colors"
            data-testid="chip-quick-passport"
          >
            Passport: 75%
          </button>
        </div>
      </div>

      <div className="px-8 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between gap-2">
          {TIMELINE_STEPS.map((step, idx) => {
            const isComplete = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const isPending = idx > currentStepIndex;

            return (
              <div key={step.key} className="flex items-center flex-1">
                <motion.div
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                    isComplete
                      ? "bg-green-500/20 text-green-500"
                      : isCurrent
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: isCurrent ? 1.02 : 1 }}
                  data-testid={`timeline-step-${step.key}`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isCurrent ? (
                    <Play className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                  <span className="text-sm font-medium">{step.label}</span>
                </motion.div>
                {idx < TIMELINE_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${isComplete ? "bg-green-500/50" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto p-8">
          <div className="grid gap-6 md:grid-cols-2">
            <TBCard
              title="Run Compliance Check"
              subtitle="Sanctions screening, KYC verification"
              state={tradeComplianceRuns.length > 0 ? "ready" : "idle"}
              icon={<FileCheck className="h-4 w-4" />}
              dataTestId="card-action-compliance"
            >
              <Button onClick={handleRunCompliance} className="w-full" data-testid="button-run-compliance">
                <Zap className="w-4 h-4 mr-2" />
                Run Compliance Check
              </Button>
              {tradeComplianceRuns.length > 0 && (
                <div className="mt-3 text-sm text-muted-foreground">
                  {tradeComplianceRuns.length} check(s) completed
                </div>
              )}
            </TBCard>

            <TBCard
              title="Request Trade Funding"
              subtitle="LC, factoring, supply chain finance"
              state={tradeFundingRequests.length > 0 ? "ready" : "idle"}
              icon={<Banknote className="h-4 w-4" />}
              dataTestId="card-action-funding"
            >
              <Button onClick={handleRequestFunding} className="w-full" data-testid="button-request-funding">
                <Banknote className="w-4 h-4 mr-2" />
                Request Funding
              </Button>
              {tradeFundingRequests.length > 0 && (
                <div className="mt-3 text-sm text-muted-foreground">
                  {tradeFundingRequests.length} request(s) • {tradeFundingRequests[0]?.status}
                </div>
              )}
            </TBCard>

            <TBCard
              title="Create Payment Instruction"
              subtitle="SWIFT, ACH, stablecoin rails"
              state={tradePayments.length > 0 ? "ready" : "idle"}
              icon={<CreditCard className="h-4 w-4" />}
              dataTestId="card-action-payment"
            >
              <Button onClick={handleCreatePayment} className="w-full" data-testid="button-create-payment">
                <CreditCard className="w-4 h-4 mr-2" />
                Create Payment
              </Button>
              {tradePayments.length > 0 && (
                <div className="mt-3 text-sm text-muted-foreground">
                  {tradePayments.length} payment(s) • {tradePayments[0]?.status}
                </div>
              )}
            </TBCard>

            <TBCard
              title="Generate Proof Pack"
              subtitle="Document package for verification"
              state={tradeProofPacks.length > 0 ? "ready" : "idle"}
              icon={<Package className="h-4 w-4" />}
              dataTestId="card-action-proofpack"
            >
              <Button onClick={handleGenerateProofPack} className="w-full" data-testid="button-generate-proofpack">
                <Package className="w-4 h-4 mr-2" />
                Generate Proof Pack
              </Button>
              {tradeProofPacks.length > 0 && (
                <div className="mt-3 text-sm text-muted-foreground">
                  {tradeProofPacks.length} pack(s) • {tradeProofPacks[0]?.status}
                </div>
              )}
            </TBCard>
          </div>
        </div>

        <div className="w-[380px] border-l border-border overflow-auto">
          <Tabs value={inspectorTab} onValueChange={setInspectorTab} className="h-full flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b px-4 py-0 h-12">
              <TabsTrigger value="context" className="text-xs" data-testid="tab-inspector-context">
                Context
              </TabsTrigger>
              <TabsTrigger value="parties" className="text-xs" data-testid="tab-inspector-parties">
                Parties
              </TabsTrigger>
              <TabsTrigger value="documents" className="text-xs" data-testid="tab-inspector-documents">
                Documents
              </TabsTrigger>
              <TabsTrigger value="logistics" className="text-xs" data-testid="tab-inspector-logistics">
                Logistics
              </TabsTrigger>
              <TabsTrigger value="actions" className="text-xs" data-testid="tab-inspector-actions">
                Actions
              </TabsTrigger>
              <TabsTrigger value="evidence" className="text-xs" data-testid="tab-inspector-evidence">
                Evidence
              </TabsTrigger>
            </TabsList>

            <TabsContent value="context" className="flex-1 p-4 mt-0" data-testid="panel-inspector-context">
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">Parties</div>
                  {trade.parties.map((party, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2 p-2 rounded-lg border bg-background/60">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{party.name}</div>
                        <div className="text-xs text-muted-foreground">{party.role} • {party.region}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">Goods</div>
                  <div className="p-2 rounded-lg border bg-background/60 text-sm">{trade.goods}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">Corridor</div>
                  <div className="flex items-center gap-2 p-2 rounded-lg border bg-background/60">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{trade.corridor}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">Terms</div>
                  <div className="p-2 rounded-lg border bg-background/60 text-sm">{trade.incoterms}</div>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="text-xs text-muted-foreground mb-2">
                    <span className="font-medium">Jump to:</span>{" "}
                    <button 
                      onClick={() => setInspectorTab("parties")} 
                      className="text-primary hover:underline"
                      data-testid="link-jump-parties"
                    >
                      Parties
                    </button>
                    {" · "}
                    <button 
                      onClick={() => setInspectorTab("documents")} 
                      className="text-primary hover:underline"
                      data-testid="link-jump-documents"
                    >
                      Documents
                    </button>
                    {" · "}
                    <button 
                      onClick={() => setInspectorTab("logistics")} 
                      className="text-primary hover:underline"
                      data-testid="link-jump-logistics"
                    >
                      Logistics
                    </button>
                    {" · "}
                    <button 
                      onClick={() => setInspectorTab("evidence")} 
                      className="text-primary hover:underline"
                      data-testid="link-jump-evidence"
                    >
                      Evidence
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="parties" className="flex-1 p-4 mt-0" data-testid="panel-inspector-parties">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">Linked Parties from Network</div>
                      <div className="text-[10px] text-muted-foreground">Role in this trade</div>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      <UserPlus className="w-3 h-3 mr-1" />
                      Link
                    </Button>
                  </div>
                  {trade.linkedParties.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No linked partners. Use My Network to link trade parties and assign roles.</p>
                  ) : (
                    <div className="space-y-2">
                      {trade.linkedParties.map((lp, idx) => (
                        <div key={idx} className="p-2 rounded-lg border bg-background/60">
                          <div className="text-sm font-medium">Partner {lp.partnerId}</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {lp.roles.map((role, ridx) => (
                              <div key={ridx} className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                {role}
                              </div>
                            ))}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-1">
                            See full capabilities in My Network
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">Trade Parties</div>
                  {trade.parties.map((party, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2 p-2 rounded-lg border bg-background/60">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{party.name}</div>
                        <div className="text-xs text-muted-foreground">{party.role} • {party.region}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="flex-1 p-4 mt-0" data-testid="panel-inspector-documents">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-medium text-muted-foreground">Uploaded Documents</div>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    Upload
                  </Button>
                </div>
                {trade.uploadedDocuments.length === 0 && trade.documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No documents attached yet.</p>
                ) : (
                  <>
                    {trade.uploadedDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-2 p-2 rounded-lg border bg-background/60">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{doc.name}</div>
                          <div className="text-xs text-muted-foreground">{new Date(doc.uploadedAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                    {trade.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg border bg-background/60">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{doc}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="logistics" className="flex-1 p-4 mt-0" data-testid="panel-inspector-logistics">
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-3">Milestones</div>
                  <div className="space-y-2">
                    {trade.logisticsMilestones.map((milestone) => (
                      <div key={milestone.key} className="flex items-start gap-2 p-2 rounded-lg border bg-background/60">
                        <div className={`mt-0.5 w-2 h-2 rounded-full ${
                          milestone.status === 'confirmed' ? 'bg-green-500' : 
                          milestone.status === 'issue' ? 'bg-red-500' : 'bg-muted-foreground/30'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{milestone.label}</div>
                          {milestone.timestamp && (
                            <div className="text-xs text-muted-foreground">
                              {new Date(milestone.timestamp).toLocaleDateString()}
                            </div>
                          )}
                          {milestone.notes && (
                            <div className="text-xs text-muted-foreground mt-1">{milestone.notes}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {trade.logisticsEvents.length > 0 && (
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">Recent Events</div>
                    <div className="space-y-1">
                      {trade.logisticsEvents.slice(0, 5).map((event) => (
                        <div key={event.id} className="text-xs p-2 rounded border bg-background/60">
                          <div className="font-medium">{event.description}</div>
                          <div className="text-muted-foreground text-[10px] mt-0.5">
                            {new Date(event.timestamp).toLocaleString()} • {event.source}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="actions" className="flex-1 p-4 mt-0" data-testid="panel-inspector-actions">
              <div className="space-y-2">
                {tradeComplianceRuns.map((run) => (
                  <div key={run.id} className="p-2 rounded-lg border bg-background/60">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Compliance Check</span>
                      <TBChip tone={run.status === "passed" ? "success" : run.status === "failed" ? "error" : "warn"} dataTestId={`chip-compliance-${run.id}`}>
                        {run.status}
                      </TBChip>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{new Date(run.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
                {tradeFundingRequests.map((req) => (
                  <div key={req.id} className="p-2 rounded-lg border bg-background/60">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Funding Request</span>
                      <TBChip tone={req.status === "approved" ? "success" : req.status === "rejected" ? "error" : "warn"} dataTestId={`chip-funding-${req.id}`}>
                        {req.status}
                      </TBChip>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{formatAmount(req.amount, trade.currency)}</div>
                  </div>
                ))}
                {tradePayments.map((pmt) => (
                  <div key={pmt.id} className="p-2 rounded-lg border bg-background/60">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Payment</span>
                      <TBChip tone={pmt.status === "completed" ? "success" : pmt.status === "failed" ? "error" : "warn"} dataTestId={`chip-payment-${pmt.id}`}>
                        {pmt.status}
                      </TBChip>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{formatAmount(pmt.amount, pmt.currency)}</div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="evidence" className="flex-1 p-4 mt-0" data-testid="panel-inspector-evidence">
              <div className="space-y-2">
                {tradeProofPacks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No proof packs generated yet.</p>
                ) : (
                  tradeProofPacks.map((pack) => (
                    <div key={pack.id} className="p-3 rounded-lg border bg-background/60">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{pack.title}</span>
                        <TBChip tone={pack.status === "verified" ? "success" : pack.status === "ready" ? "neutral" : "warn"} dataTestId={`chip-proof-${pack.id}`}>
                          {pack.status}
                        </TBChip>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {pack.documents.length} documents • {new Date(pack.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
