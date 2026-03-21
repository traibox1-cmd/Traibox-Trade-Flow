import { Link } from "wouter";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { TBCard } from "../components/tb/TBCard";
import { TBChip } from "../components/tb/TBChip";
import { useRole } from "@/components/app/role";
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  FolderKey,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

type Trade = {
  id: string;
  title: string;
  counterpart: string;
  corridor: string;
  amount: string;
  status: "active" | "needs_attention" | "ready";
  updatedAt: string;
  timeline: { label: string; state: "done" | "now" | "next" }[];
};

const trades: Trade[] = [
  {
    id: "T-1042",
    title: "Textiles · LC-backed",
    counterpart: "Aster Mills (VN)",
    corridor: "SG → VN",
    amount: "USD 240,000",
    status: "needs_attention",
    updatedAt: "12m ago",
    timeline: [
      { label: "Plan", state: "done" },
      { label: "Missing info", state: "now" },
      { label: "Compliance", state: "next" },
      { label: "Funding", state: "next" },
      { label: "Payment", state: "next" },
      { label: "Proofs", state: "next" },
    ],
  },
  {
    id: "T-1031",
    title: "Machinery spares",
    counterpart: "NordWerk (DE)",
    corridor: "DE → AE",
    amount: "EUR 78,500",
    status: "active",
    updatedAt: "2h ago",
    timeline: [
      { label: "Plan", state: "done" },
      { label: "Compliance", state: "done" },
      { label: "Funding", state: "now" },
      { label: "Payment", state: "next" },
      { label: "Proofs", state: "next" },
    ],
  },
  {
    id: "T-1008",
    title: "Agri inputs",
    counterpart: "Kijani Co-op (KE)",
    corridor: "IN → KE",
    amount: "USD 54,900",
    status: "ready",
    updatedAt: "yesterday",
    timeline: [
      { label: "Plan", state: "done" },
      { label: "Compliance", state: "done" },
      { label: "Funding", state: "done" },
      { label: "Payment", state: "done" },
      { label: "Proofs", state: "now" },
    ],
  },
];

function MiniTimeline({
  items,
  testId,
}: {
  items: Trade["timeline"];
  testId: string;
}) {
  return (
    <div
      className="mt-4 grid grid-cols-6 gap-1"
      data-testid={testId}
      aria-label="Trade timeline"
    >
      {items.map((s, idx) => {
        const base =
          "rounded-md px-2 py-1 text-[11px] leading-none border transition-colors";
        const cls =
          s.state === "done"
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
            : s.state === "now"
              ? "bg-primary/10 border-primary/20 text-primary"
              : "bg-muted/60 border-border text-muted-foreground";
        return (
          <div
            key={`${s.label}-${idx}`}
            className={`${base} ${cls}`}
            data-testid={`chip-timeline-${idx}`}
          >
            {s.label}
          </div>
        );
      })}
    </div>
  );
}

export default function SpacePage() {
  const { role } = useRole();

  const needsAttention = trades
    .filter((t) => t.status === "needs_attention")
    .slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2">
                <div
                  className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 border border-primary/15"
                  aria-hidden="true"
                >
                  <Briefcase className="h-4 w-4 text-primary" />
                </div>
                <h1
                  className="font-serif text-2xl tracking-tight md:text-3xl"
                  data-testid="text-title-space"
                >
                  {role === "financier" ? "Capital Console" : "Trade Console"}
                </h1>
              </div>
              <p
                className="text-sm text-muted-foreground text-balance"
                data-testid="text-subtitle-space"
              >
                {role === "financier"
                  ? "Monitor opportunities, respond to requests, and track execution with evidence-ready proofs."
                  : "A calm, trust-first workspace for active trades—powered by chat + cards."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                className="h-9"
                data-testid="button-new-trade"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                New trade
              </Button>
              <Button className="h-9" data-testid="button-open-assistant">
                Trade Assistant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <TBCard
              title="Trust posture"
              subtitle="Operational readiness"
              state="ready"
              icon={<CheckCircle2 className="h-4 w-4" />}
              dataTestId="card-trust-posture"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-medium" data-testid="text-trust-score">
                    Score 92
                  </div>
                  <div
                    className="text-xs text-muted-foreground"
                    data-testid="text-trust-score-caption"
                  >
                    Low risk profile, evidence complete.
                  </div>
                </div>
                <TBChip tone="success" dataTestId="chip-trust-ok">
                  Green
                </TBChip>
              </div>
            </TBCard>

            <TBCard
              title="Active trades"
              subtitle="In motion"
              state="idle"
              icon={<Clock className="h-4 w-4" />}
              dataTestId="card-active-trades"
            >
              <div
                className="flex items-baseline justify-between"
                data-testid="text-active-trades"
              >
                <div className="text-3xl font-semibold tracking-tight">
                  {trades.length}
                </div>
                <div className="text-xs text-muted-foreground">Updated now</div>
              </div>
            </TBCard>

            <TBCard
              title="Evidence"
              subtitle="Proof packs"
              state="idle"
              icon={<FolderKey className="h-4 w-4" />}
              dataTestId="card-evidence"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-medium" data-testid="text-proof-packs">
                    6 packs
                  </div>
                  <div
                    className="text-xs text-muted-foreground"
                    data-testid="text-proof-packs-caption"
                  >
                    Verifiable receipts for counterparties.
                  </div>
                </div>
                <Badge variant="secondary" data-testid="badge-privacy-default">
                  Private by default
                </Badge>
              </div>
            </TBCard>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <TBCard
              title="Active trades"
              subtitle="Open one to continue the golden path"
              state="idle"
              icon={<CalendarClock className="h-4 w-4" />}
              dataTestId="card-active-trades-list"
            >
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search by ID, corridor, counterparty…"
                  data-testid="input-trade-search"
                />
                <Button variant="secondary" data-testid="button-filter-trades">
                  Filter
                </Button>
              </div>

              <div className="mt-4 grid gap-3">
                {trades.map((t) => {
                  const tone =
                    t.status === "needs_attention"
                      ? "warn"
                      : t.status === "ready"
                        ? "success"
                        : "neutral";

                  return (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="rounded-2xl border bg-card/60 hover:bg-card transition-colors"
                      data-testid={`row-trade-${t.id}`}
                    >
                      <div className="flex flex-col gap-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div
                                className="font-mono text-xs text-muted-foreground"
                                data-testid={`text-trade-id-${t.id}`}
                              >
                                {t.id}
                              </div>
                              <TBChip
                                tone={tone as any}
                                dataTestId={`chip-trade-status-${t.id}`}
                              >
                                {t.status === "needs_attention"
                                  ? "Needs attention"
                                  : t.status === "ready"
                                    ? "Ready"
                                    : "Active"}
                              </TBChip>
                              <span
                                className="text-xs text-muted-foreground"
                                data-testid={`text-trade-updated-${t.id}`}
                              >
                                {t.updatedAt}
                              </span>
                            </div>
                            <div
                              className="mt-1 truncate font-medium"
                              data-testid={`text-trade-title-${t.id}`}
                            >
                              {t.title}
                            </div>
                            <div
                              className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground"
                              data-testid={`text-trade-meta-${t.id}`}
                            >
                              <span>{t.counterpart}</span>
                              <span aria-hidden="true">•</span>
                              <span>{t.corridor}</span>
                              <span aria-hidden="true">•</span>
                              <span className="font-medium text-foreground/80">
                                {t.amount}
                              </span>
                            </div>
                          </div>

                          <Link href={`/trade/${encodeURIComponent(t.id)}`}>
                            <Button
                              size="sm"
                              className="h-8"
                              data-testid={`button-open-trade-${t.id}`}
                            >
                              Open
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>

                        <MiniTimeline
                          items={t.timeline}
                          testId={`timeline-${t.id}`}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </TBCard>
          </div>

          <div className="lg:col-span-4">
            <TBCard
              title="Needs attention"
              subtitle="Triage the top three"
              state={needsAttention.length ? "warn" : "ready"}
              icon={<TriangleAlert className="h-4 w-4" />}
              dataTestId="card-needs-attention"
            >
              <div className="grid gap-3">
                {needsAttention.length ? (
                  needsAttention.map((t) => (
                    <div
                      key={t.id}
                      className="rounded-xl border bg-background/60 p-3"
                      data-testid={`card-attention-${t.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-mono text-xs text-muted-foreground">
                            {t.id}
                          </div>
                          <div className="mt-1 truncate font-medium">
                            Missing shipper KYC + Incoterms
                          </div>
                        </div>
                        <Link href={`/trade/${encodeURIComponent(t.id)}`}>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8"
                            data-testid={`button-fix-${t.id}`}
                          >
                            Fix
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className="rounded-xl border bg-background/60 p-3 text-sm text-muted-foreground"
                    data-testid="text-no-attention"
                  >
                    All clear. Keep shipping.
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="grid gap-2">
                <div className="text-xs font-medium" data-testid="text-quick-actions">
                  Quick actions
                </div>
                <div className="grid gap-2">
                  <Button
                    variant="secondary"
                    className="justify-start"
                    data-testid="button-upload-docs"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Upload documents
                  </Button>
                  <Button
                    variant="secondary"
                    className="justify-start"
                    data-testid="button-run-compliance"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Run compliance check
                  </Button>
                </div>
              </div>
            </TBCard>
          </div>
        </div>
      </div>
    </div>
  );
}
