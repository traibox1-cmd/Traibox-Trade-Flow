import { useMemo, useState } from "react";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TBCard } from "../components/tb/TBCard";
import { TBChip } from "../components/tb/TBChip";
import {
  BadgeCheck,
  Bot,
  CheckCircle2,
  CreditCard,
  FileLock2,
  FileText,
  Fingerprint,
  HandCoins,
  Info,
  Landmark,
  Loader2,
  ShieldCheck,
} from "lucide-react";

function TradeChat() {
  const [draft, setDraft] = useState("");
  const [items, setItems] = useState([
    {
      id: "a",
      role: "assistant" as const,
      text: "I’ve assembled a Trade Plan and flagged missing items. Next: confirm Incoterms and upload shipper KYC to unlock compliance + funding offers.",
    },
    {
      id: "b",
      role: "user" as const,
      text: "Confirm Incoterms are FOB. We’ll upload UBO + proof of address today.",
    },
    {
      id: "c",
      role: "assistant" as const,
      text: "Great. I’ll run the compliance check and prepare a funding comparison. I’ll also draft the payment route quote and keep receipts evidence-linked.",
    },
  ]);

  const controls = [
    { label: "Run compliance", testId: "button-control-compliance" },
    { label: "Compare funding", testId: "button-control-funding" },
    { label: "Quote payment route", testId: "button-control-quote" },
    { label: "Generate proof pack", testId: "button-control-proof" },
  ];

  return (
    <div
      className="rounded-3xl border bg-card/60 p-4 md:p-6"
      data-testid="panel-trade-chat"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 border border-primary/15"
            aria-hidden="true"
          >
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="text-sm font-medium" data-testid="text-chat-title">
              TRAIBOX
            </div>
            <div className="text-xs text-muted-foreground" data-testid="text-chat-subtitle">
              Chat + controllers
            </div>
          </div>
        </div>
        <TBChip tone="success" dataTestId="chip-trade-private">
          Private
        </TBChip>
      </div>

      <div className="mt-4 flex flex-wrap gap-2" data-testid="row-chat-controls">
        {controls.map((c) => (
          <Button
            key={c.label}
            variant="secondary"
            className="h-8 rounded-full"
            data-testid={c.testId}
          >
            {c.label}
          </Button>
        ))}
      </div>

      <div className="mt-4 grid gap-3" data-testid="list-chat">
        {items.map((m) => {
          const isA = m.role === "assistant";
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className={`max-w-[92%] rounded-2xl border px-4 py-3 text-sm leading-relaxed ${
                isA
                  ? "bg-background/70"
                  : "bg-primary text-primary-foreground border-primary/20 ml-auto"
              }`}
              data-testid={`message-${m.id}`}
            >
              {m.text}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask or instruct…"
          data-testid="input-trade-chat"
        />
        <Button
          onClick={() => {
            if (!draft.trim()) return;
            setItems((p) => [
              ...p,
              { id: String(Date.now()), role: "user" as const, text: draft },
            ]);
            setDraft("");
          }}
          data-testid="button-trade-send"
        >
          Send
        </Button>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  tone,
  testId,
}: {
  label: string;
  value: string;
  tone: "neutral" | "success" | "warn" | "error";
  testId: string;
}) {
  return (
    <div className="rounded-xl border bg-card/60 p-3" data-testid={testId}>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-center justify-between">
        <div className="font-medium">{value}</div>
        <TBChip tone={tone as any} dataTestId={`${testId}-chip`}>
          {tone === "success"
            ? "OK"
            : tone === "warn"
              ? "Review"
              : tone === "error"
                ? "Stop"
                : "Info"}
        </TBChip>
      </div>
    </div>
  );
}

export default function TradeWorkspacePage() {
  const params = useParams();
  const tradeId = params?.id || "T-1042";

  const [sca, setSca] = useState<"idle" | "approved">("idle");
  const [executing, setExecuting] = useState(false);

  const cards = useMemo(
    () => [
      {
        key: "plan",
        title: "Trade Plan",
        state: "ready" as const,
        icon: <FileText className="h-4 w-4" />,
        body: (
          <div className="grid gap-3">
            <div className="grid gap-2 md:grid-cols-3">
              <Metric label="Corridor" value="SG → VN" tone="neutral" testId="metric-corridor" />
              <Metric label="Amount" value="USD 240,000" tone="neutral" testId="metric-amount" />
              <Metric label="Incoterms" value="FOB" tone="success" testId="metric-incoterms" />
            </div>
            <div className="rounded-2xl border bg-background/60 p-4" data-testid="card-plan-summary">
              <div className="text-sm font-medium">Milestones</div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                {[
                  "Confirm documents",
                  "Run compliance",
                  "Select funding",
                  "Quote payment",
                  "Execute + receipt",
                  "Generate proof pack",
                ].map((m) => (
                  <div
                    key={m}
                    className="rounded-xl border bg-card/60 p-2"
                    data-testid={`chip-milestone-${m.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "missing",
        title: "Missing Info",
        state: "warn" as const,
        icon: <Info className="h-4 w-4" />,
        body: (
          <div className="grid gap-3">
            <div className="rounded-2xl border bg-background/60 p-4" data-testid="card-missing-ubo">
              <div className="flex items-center justify-between">
                <div className="font-medium">UBO declaration</div>
                <TBChip tone="warn" dataTestId="chip-missing-ubo">
                  Required
                </TBChip>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">Needed to pass KYC completeness.</div>
              <Button variant="secondary" className="mt-3 h-8" data-testid="button-upload-ubo">
                Upload
              </Button>
            </div>
            <div className="rounded-2xl border bg-background/60 p-4" data-testid="card-missing-address">
              <div className="flex items-center justify-between">
                <div className="font-medium">Proof of address</div>
                <TBChip tone="warn" dataTestId="chip-missing-address">
                  Required
                </TBChip>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">Recent utility bill or bank statement.</div>
              <Button variant="secondary" className="mt-3 h-8" data-testid="button-upload-address">
                Upload
              </Button>
            </div>
          </div>
        ),
      },
      {
        key: "compliance",
        title: "Compliance Result",
        state: "warn" as const,
        icon: <ShieldCheck className="h-4 w-4" />,
        body: (
          <div className="grid gap-3">
            <div
              className="rounded-2xl border bg-background/60 p-4"
              data-testid="card-compliance-summary"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">Summary</div>
                <TBChip tone="warn" dataTestId="chip-compliance">
                  Needs review
                </TBChip>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                1 item requires verification. No sanctions matches.
              </div>
            </div>
            <div
              className="rounded-2xl border bg-background/60 p-4"
              data-testid="card-compliance-actions"
            >
              <div className="text-sm font-medium">Actions</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button variant="secondary" className="h-8" data-testid="button-request-ubo-trade">
                  Request UBO
                </Button>
                <Button
                  variant="secondary"
                  className="h-8"
                  data-testid="button-request-address-trade"
                >
                  Request address
                </Button>
                <Button className="h-8" data-testid="button-record-decision">
                  Record decision
                </Button>
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "funding",
        title: "Funding Offers",
        state: "ready" as const,
        icon: <HandCoins className="h-4 w-4" />,
        body: (
          <div className="grid gap-3">
            {[
              {
                id: "of1",
                name: "Harbor Capital",
                apr: "9.8%",
                speed: "Same day",
                collateral: "Invoice + proof pack",
                stance: "Recommended",
              },
              {
                id: "of2",
                name: "Atlas Trade Finance",
                apr: "11.2%",
                speed: "48 hours",
                collateral: "LC advising",
                stance: "Standard",
              },
            ].map((o) => (
              <div
                key={o.id}
                className="rounded-2xl border bg-background/60 p-4"
                data-testid={`card-trade-offer-${o.id}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium" data-testid={`text-trade-offer-name-${o.id}`}>
                        {o.name}
                      </div>
                      <TBChip
                        tone={o.stance === "Recommended" ? "success" : "neutral"}
                        dataTestId={`chip-trade-offer-stance-${o.id}`}
                      >
                        {o.stance}
                      </TBChip>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div
                        className="rounded-xl border bg-card/60 p-2"
                        data-testid={`text-trade-offer-apr-${o.id}`}
                      >
                        <div className="text-xs text-muted-foreground">APR</div>
                        <div className="font-medium">{o.apr}</div>
                      </div>
                      <div
                        className="rounded-xl border bg-card/60 p-2"
                        data-testid={`text-trade-offer-speed-${o.id}`}
                      >
                        <div className="text-xs text-muted-foreground">Speed</div>
                        <div className="font-medium">{o.speed}</div>
                      </div>
                    </div>
                    <div
                      className="mt-2 text-sm text-muted-foreground"
                      data-testid={`text-trade-offer-collateral-${o.id}`}
                    >
                      Collateral: <span className="text-foreground/80">{o.collateral}</span>
                    </div>
                  </div>
                  <Button className="h-8" data-testid={`button-select-offer-${o.id}`}>
                    Select
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ),
      },
      {
        key: "quote",
        title: "Payment Route Quote",
        state: "ready" as const,
        icon: <Landmark className="h-4 w-4" />,
        body: (
          <div className="grid gap-3">
            <div className="rounded-2xl border bg-background/60 p-4" data-testid="card-quote-best">
              <div className="flex items-center justify-between">
                <div className="font-medium">Recommended route</div>
                <TBChip tone="success" dataTestId="chip-quote-best">
                  Bank transfer (local)
                </TBChip>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl border bg-card/60 p-2" data-testid="text-quote-eta">
                  <div className="text-xs text-muted-foreground">ETA</div>
                  <div className="font-medium">T+0</div>
                </div>
                <div className="rounded-xl border bg-card/60 p-2" data-testid="text-quote-fees">
                  <div className="text-xs text-muted-foreground">Fees</div>
                  <div className="font-medium">0.25%</div>
                </div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Evidence: payment intent + receipt will be added to the proof pack.
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "execute",
        title: "Execute Payment",
        state: executing
          ? ("loading" as const)
          : sca === "approved"
            ? ("ready" as const)
            : ("idle" as const),
        icon: <CreditCard className="h-4 w-4" />,
        body: (
          <div className="grid gap-3">
            <div className="rounded-2xl border bg-background/60 p-4" data-testid="card-execute-summary">
              <div className="flex items-center justify-between">
                <div className="font-medium">Payment intent</div>
                <TBChip
                  tone={sca === "approved" ? "success" : "neutral"}
                  dataTestId="chip-sca"
                >
                  {sca === "approved" ? "SCA complete" : "SCA pending"}
                </TBChip>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                USD 240,000 → Aster Mills · route: local bank
              </div>
            </div>

            {sca !== "approved" ? (
              <div className="rounded-2xl border bg-background/60 p-4" data-testid="card-sca">
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-primary" />
                  <div className="text-sm font-medium">Mock SCA step</div>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Confirm this execution. This is a prototype—no money moves.
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    className="h-8"
                    onClick={() => setSca("approved")}
                    data-testid="button-approve-sca"
                  >
                    Approve
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-8"
                    onClick={() => setSca("idle")}
                    data-testid="button-cancel-sca"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : null}

            <Button
              className="h-9"
              disabled={sca !== "approved" || executing}
              onClick={() => {
                setExecuting(true);
                window.setTimeout(() => setExecuting(false), 900);
              }}
              data-testid="button-execute"
            >
              {executing ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Executing…
                </span>
              ) : (
                "Execute payment"
              )}
            </Button>
          </div>
        ),
      },
      {
        key: "tracker",
        title: "Status Tracker",
        state: executing
          ? ("loading" as const)
          : sca === "approved"
            ? ("ready" as const)
            : ("idle" as const),
        icon: <CheckCircle2 className="h-4 w-4" />,
        body: (
          <div className="grid gap-3">
            {[
              { id: "s1", label: "Compliance scope", status: "ok" },
              { id: "s2", label: "Funding selected", status: "ok" },
              {
                id: "s3",
                label: "Payment authorized",
                status: sca === "approved" ? "ok" : "pending",
              },
              { id: "s4", label: "Receipt captured", status: "pending" },
            ].map((s) => (
              <div
                key={s.id}
                className="rounded-2xl border bg-background/60 p-4"
                data-testid={`row-status-${s.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium" data-testid={`text-status-label-${s.id}`}>
                    {s.label}
                  </div>
                  <TBChip tone={s.status === "ok" ? "success" : "neutral"} dataTestId={`chip-status-${s.id}`}>
                    {s.status === "ok" ? "Done" : "Pending"}
                  </TBChip>
                </div>
              </div>
            ))}
          </div>
        ),
      },
      {
        key: "proof",
        title: "Proof Pack / Verify",
        state: "ready" as const,
        icon: <FileLock2 className="h-4 w-4" />,
        body: (
          <div className="grid gap-3">
            <div className="rounded-2xl border bg-background/60 p-4" data-testid="card-proofpack-summary">
              <div className="flex items-center justify-between">
                <div className="font-medium">Proof pack</div>
                <TBChip tone="success" dataTestId="chip-proofpack">
                  Ready
                </TBChip>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Includes: plan, compliance run, funding selection, payment intent, receipt, and signatures.
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  className="h-8"
                  data-testid="button-download-proofpack"
                >
                  Download
                </Button>
                <Button className="h-8" data-testid="button-verify-proofpack">
                  Verify
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border bg-background/60 p-4" data-testid="card-verify-receipt">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-primary" />
                <div className="text-sm font-medium">Verification receipt</div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                digest: tbx_dg_9f3a… · verified: 2026-01-30 10:14 UTC
              </div>
            </div>
          </div>
        ),
      },
    ],
    [executing, sca],
  );

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
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
                data-testid="text-title-trade"
              >
                Trade Workspace
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-mono text-xs text-muted-foreground" data-testid="text-trade-id">
                {tradeId}
              </div>
              <TBChip tone="neutral" dataTestId="chip-corridor">
                SG → VN
              </TBChip>
              <TBChip tone="success" dataTestId="chip-trust">
                Trust tier A
              </TBChip>
              <TBChip tone="neutral" dataTestId="chip-private">
                Private
              </TBChip>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" className="h-9" data-testid="button-add-doc">
              <FileText className="mr-2 h-4 w-4" />
              Add document
            </Button>
            <Button className="h-9" data-testid="button-run-trade">
              Run next step
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <TradeChat />
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-3" data-testid="stack-cards">
              {cards.map((c) => (
                <motion.div
                  key={c.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <TBCard
                    title={c.title}
                    subtitle="Golden path"
                    state={c.state}
                    icon={c.icon}
                    dataTestId={`card-${c.key}`}
                  >
                    {c.body}
                  </TBCard>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        <div className="rounded-3xl border bg-card/60 p-4 md:p-6" data-testid="panel-rightdrawer-tabs">
          <Tabs defaultValue="context" data-testid="tabs-rightdrawer">
            <TabsList className="w-full justify-start" data-testid="tabslist-rightdrawer">
              <TabsTrigger value="context" data-testid="tab-context">
                Context
              </TabsTrigger>
              <TabsTrigger value="documents" data-testid="tab-documents">
                Documents
              </TabsTrigger>
              <TabsTrigger value="actions" data-testid="tab-actions">
                Actions
              </TabsTrigger>
              <TabsTrigger value="evidence" data-testid="tab-evidence">
                Evidence
              </TabsTrigger>
            </TabsList>

            <TabsContent value="context" className="mt-4" data-testid="panel-context">
              <div className="grid gap-3 md:grid-cols-3">
                <Metric label="Counterparty" value="Aster Mills" tone="neutral" testId="metric-counterparty" />
                <Metric label="Risk" value="Low" tone="success" testId="metric-risk" />
                <Metric label="Documents" value="8" tone="neutral" testId="metric-docs" />
              </div>
            </TabsContent>

            <TabsContent value="documents" className="mt-4" data-testid="panel-documents">
              <div className="grid gap-2">
                {[
                  { name: "Commercial Invoice", status: "ready" },
                  { name: "Packing List", status: "ready" },
                  { name: "UBO Declaration", status: "missing" },
                ].map((d) => (
                  <div
                    key={d.name}
                    className="rounded-2xl border bg-background/60 p-4"
                    data-testid={`row-doc-${d.name.replace(/\s+/g, "-").toLowerCase()}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{d.name}</div>
                      <TBChip
                        tone={d.status === "ready" ? "success" : "warn"}
                        dataTestId={`chip-doc-${d.name.replace(/\s+/g, "-").toLowerCase()}`}
                      >
                        {d.status === "ready" ? "Ready" : "Missing"}
                      </TBChip>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="actions" className="mt-4" data-testid="panel-actions">
              <div className="flex flex-wrap gap-2">
                <Button className="h-8" data-testid="button-action-request-docs">
                  Request docs
                </Button>
                <Button
                  variant="secondary"
                  className="h-8"
                  data-testid="button-action-escalate"
                >
                  Escalate
                </Button>
                <Button variant="secondary" className="h-8" data-testid="button-action-export">
                  Export
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="evidence" className="mt-4" data-testid="panel-evidence">
              <div className="grid gap-3 md:grid-cols-2">
                <div
                  className="rounded-2xl border bg-background/60 p-4"
                  data-testid="card-evidence-proofpack"
                >
                  <div className="flex items-center gap-2">
                    <FileLock2 className="h-4 w-4 text-primary" />
                    <div className="font-medium">Proof pack</div>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">digest: tbx_dg_9f3a…</div>
                </div>
                <div
                  className="rounded-2xl border bg-background/60 p-4"
                  data-testid="card-evidence-payment"
                >
                  <div className="flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-primary" />
                    <div className="font-medium">Payment receipt</div>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">receipt: tbx://receipt/9f3a…</div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
