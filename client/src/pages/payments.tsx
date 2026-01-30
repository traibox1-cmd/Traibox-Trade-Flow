import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TBCard } from "../components/tb/TBCard";
import { TBChip } from "../components/tb/TBChip";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Banknote,
  FileCheck2,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type RouteQuote = {
  id: string;
  rail: string;
  eta: string;
  fees: string;
  fx: string;
  stance: "best" | "fast" | "safe";
};

const routes: RouteQuote[] = [
  {
    id: "r1",
    rail: "Bank transfer (local)",
    eta: "T+0",
    fees: "0.25%",
    fx: "mid + 18bps",
    stance: "best",
  },
  {
    id: "r2",
    rail: "SWIFT (MT103)",
    eta: "T+1",
    fees: "0.35%",
    fx: "mid + 22bps",
    stance: "safe",
  },
  {
    id: "r3",
    rail: "Smart contract escrow",
    eta: "T+0",
    fees: "0.60%",
    fx: "n/a",
    stance: "fast",
  },
];

export default function PaymentsPage() {
  const [amount, setAmount] = useState("240000");
  const best = useMemo(() => routes[0], []);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <div
              className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 border border-primary/15"
              aria-hidden="true"
            >
              <Landmark className="h-4 w-4 text-primary" />
            </div>
            <h1
              className="font-serif text-2xl tracking-tight md:text-3xl"
              data-testid="text-title-payments"
            >
              Payments
            </h1>
          </div>
          <p className="text-sm text-muted-foreground" data-testid="text-subtitle-payments">
            Pay/collect flows with settlement tools—intent first, evidence always.
          </p>
        </div>
        <Button className="h-9" data-testid="button-new-payment">
          <Sparkles className="mr-2 h-4 w-4" />
          New payment
        </Button>
      </div>

      <div className="mt-4">
        <Tabs defaultValue="pay" data-testid="tabs-payments">
          <TabsList className="w-full justify-start" data-testid="tabslist-payments">
            <TabsTrigger value="pay" data-testid="tab-pay">
              Pay
            </TabsTrigger>
            <TabsTrigger value="collect" data-testid="tab-collect">
              Collect
            </TabsTrigger>
            <TabsTrigger value="settlement" data-testid="tab-settlement">
              Settlement tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pay" className="mt-4" data-testid="panel-pay">
            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <TBCard
                  title="Pay"
                  subtitle="Create a payment intent"
                  state="idle"
                  icon={<Banknote className="h-4 w-4" />}
                  dataTestId="card-pay-intent"
                >
                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <div className="text-xs font-medium" data-testid="text-pay-amount">
                        Amount
                      </div>
                      <Input
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        data-testid="input-pay-amount"
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="text-xs font-medium" data-testid="text-beneficiary">
                        Beneficiary
                      </div>
                      <Input defaultValue="Aster Mills" data-testid="input-beneficiary" />
                    </div>

                    <div
                      className="rounded-2xl border bg-background/60 p-4"
                      data-testid="callout-safety"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Safety posture</div>
                        <TBChip tone="success" dataTestId="chip-safety">
                          Low risk
                        </TBChip>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Beneficiary screened, payment intent will be captured in the proof pack.
                      </div>
                    </div>

                    <Button className="h-9" data-testid="button-quote-routes">
                      Get route quotes
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TBCard>
              </div>

              <div className="lg:col-span-7">
                <TBCard
                  title="Route quotes"
                  subtitle="Compare rails"
                  state="ready"
                  icon={<ShieldCheck className="h-4 w-4" />}
                  dataTestId="card-route-quotes"
                >
                  <div className="grid gap-3">
                    {routes.map((r) => {
                      const tone =
                        r.stance === "best"
                          ? "success"
                          : r.stance === "safe"
                            ? "neutral"
                            : "warn";

                      return (
                        <motion.div
                          key={r.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.18 }}
                          className={`rounded-2xl border bg-background/60 p-4 ${
                            r.id === best.id ? "ring-1 ring-primary/20" : ""
                          }`}
                          data-testid={`card-route-${r.id}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <div
                                  className="font-medium"
                                  data-testid={`text-route-rail-${r.id}`}
                                >
                                  {r.rail}
                                </div>
                                <TBChip tone={tone as any} dataTestId={`chip-route-${r.id}`}>
                                  {r.stance === "best"
                                    ? "Best"
                                    : r.stance === "safe"
                                      ? "Safe"
                                      : "Fast"}
                                </TBChip>
                              </div>
                              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                <div
                                  className="rounded-xl border bg-card/60 p-2"
                                  data-testid={`text-route-eta-${r.id}`}
                                >
                                  <div className="text-xs text-muted-foreground">ETA</div>
                                  <div className="font-medium">{r.eta}</div>
                                </div>
                                <div
                                  className="rounded-xl border bg-card/60 p-2"
                                  data-testid={`text-route-fees-${r.id}`}
                                >
                                  <div className="text-xs text-muted-foreground">Fees</div>
                                  <div className="font-medium">{r.fees}</div>
                                </div>
                                <div
                                  className="rounded-xl border bg-card/60 p-2"
                                  data-testid={`text-route-fx-${r.id}`}
                                >
                                  <div className="text-xs text-muted-foreground">FX</div>
                                  <div className="font-medium">{r.fx}</div>
                                </div>
                                <div
                                  className="rounded-xl border bg-card/60 p-2"
                                  data-testid={`text-route-evidence-${r.id}`}
                                >
                                  <div className="text-xs text-muted-foreground">Evidence</div>
                                  <div className="font-medium">Receipt</div>
                                </div>
                              </div>
                            </div>
                            <Button
                              className="h-8"
                              data-testid={`button-select-route-${r.id}`}
                            >
                              Select
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <Separator className="my-4" />

                  <div
                    className="rounded-2xl border bg-background/60 p-4"
                    data-testid="callout-best-route"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">Recommended route</div>
                      <TBChip tone="success" dataTestId="chip-best-route">
                        {best.rail}
                      </TBChip>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Chosen for low friction + strong auditability in this corridor.
                    </div>
                  </div>
                </TBCard>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="collect" className="mt-4" data-testid="panel-collect">
            <TBCard
              title="Collect"
              subtitle="Create a collection intent"
              state="idle"
              icon={<FileCheck2 className="h-4 w-4" />}
              dataTestId="card-collect"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <div
                  className="rounded-2xl border bg-background/60 p-4"
                  data-testid="card-collect-invoice"
                >
                  <div className="font-medium">Invoice</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Issue invoice with evidence references.
                  </div>
                  <Button
                    variant="secondary"
                    className="mt-3 h-8"
                    data-testid="button-create-invoice"
                  >
                    Create
                  </Button>
                </div>
                <div
                  className="rounded-2xl border bg-background/60 p-4"
                  data-testid="card-collect-reminder"
                >
                  <div className="font-medium">Reminders</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Send intent-first reminders with context.
                  </div>
                  <Button
                    variant="secondary"
                    className="mt-3 h-8"
                    data-testid="button-send-reminder"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </TBCard>
          </TabsContent>

          <TabsContent value="settlement" className="mt-4" data-testid="panel-settlement">
            <TBCard
              title="Settlement tools"
              subtitle="Escrow and smart contracts, intent-first"
              state="idle"
              icon={<LockKeyhole className="h-4 w-4" />}
              dataTestId="card-settlement"
            >
              <div className="grid gap-3 md:grid-cols-2">
                <div
                  className="rounded-2xl border bg-background/60 p-4"
                  data-testid="card-escrow"
                >
                  <div className="font-medium">Escrow</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Define release conditions and attach evidence.
                  </div>
                  <Button className="mt-3 h-8" data-testid="button-create-escrow">
                    Create escrow intent
                  </Button>
                </div>
                <div
                  className="rounded-2xl border bg-background/60 p-4"
                  data-testid="card-smart-contract"
                >
                  <div className="font-medium">Smart contracts</div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Intent-first templates for automated settlement.
                  </div>
                  <Button
                    variant="secondary"
                    className="mt-3 h-8"
                    data-testid="button-browse-templates"
                  >
                    Browse templates
                  </Button>
                </div>
              </div>
            </TBCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
