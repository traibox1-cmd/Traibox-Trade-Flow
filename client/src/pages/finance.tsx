import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TBCard } from "../components/tb/TBCard";
import { TBChip } from "../components/tb/TBChip";
import { Separator } from "@/components/ui/separator";
import { Banknote, Scale, Sparkles } from "lucide-react";
import { useRole } from "@/components/app/role";

type Offer = {
  id: string;
  provider: string;
  apr: string;
  tenor: string;
  fees: string;
  speed: string;
  collateral: string;
  stance: "recommended" | "neutral" | "cautious";
};

const offers: Offer[] = [
  {
    id: "o1",
    provider: "Harbor Capital",
    apr: "9.8%",
    tenor: "60 days",
    fees: "0.6%",
    speed: "Same day",
    collateral: "Invoice + proof pack",
    stance: "recommended",
  },
  {
    id: "o2",
    provider: "Atlas Trade Finance",
    apr: "11.2%",
    tenor: "90 days",
    fees: "0.4%",
    speed: "48 hours",
    collateral: "LC advising",
    stance: "neutral",
  },
  {
    id: "o3",
    provider: "BridgeDesk",
    apr: "13.9%",
    tenor: "45 days",
    fees: "0.9%",
    speed: "Instant",
    collateral: "Cash reserve",
    stance: "cautious",
  },
];

export default function FinancePage() {
  const { role } = useRole();
  const [amount, setAmount] = useState("240000");
  const [currency, setCurrency] = useState("USD");

  const best = useMemo(() => offers[0], []);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <div
              className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 border border-primary/15"
              aria-hidden="true"
            >
              <Banknote className="h-4 w-4 text-primary" />
            </div>
            <h1
              className="font-serif text-2xl tracking-tight md:text-3xl"
              data-testid="text-title-finance"
            >
              {role === "financier" ? "Funding Desk" : "Finance"}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground" data-testid="text-subtitle-finance">
            Request funding, compare offers, and keep it evidence-linked.
          </p>
        </div>
        <Button className="h-9" data-testid="button-request-funding">
          <Sparkles className="mr-2 h-4 w-4" />
          {role === "financier" ? "Review requests" : "Request funding"}
        </Button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <TBCard
            title="Funding request"
            subtitle="Intent-first, minimal fields"
            state="idle"
            icon={<Scale className="h-4 w-4" />}
            dataTestId="card-funding-request"
          >
            <div className="grid gap-3">
              <div className="grid gap-2">
                <div className="text-xs font-medium" data-testid="text-amount-label">
                  Amount
                </div>
                <div className="flex gap-2">
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    data-testid="input-amount"
                  />
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-[120px]" data-testid="select-currency">
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD" data-testid="option-usd">
                        USD
                      </SelectItem>
                      <SelectItem value="EUR" data-testid="option-eur">
                        EUR
                      </SelectItem>
                      <SelectItem value="SGD" data-testid="option-sgd">
                        SGD
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="text-xs font-medium" data-testid="text-purpose-label">
                  Purpose
                </div>
                <Input defaultValue="Supplier payment" data-testid="input-purpose" />
              </div>

              <div
                className="rounded-2xl border bg-background/60 p-4"
                data-testid="callout-evidence"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Evidence linkage</div>
                  <TBChip tone="success" dataTestId="chip-evidence-linked">
                    Linked
                  </TBChip>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Offers reference the trade plan, compliance run, and proof pack baseline.
                </div>
              </div>

              <Button className="h-9" data-testid="button-submit-request">
                Submit request
              </Button>
            </div>
          </TBCard>
        </div>

        <div className="lg:col-span-7">
          <TBCard
            title="Offers"
            subtitle="Compare across price, speed, and collateral"
            state="ready"
            icon={<Banknote className="h-4 w-4" />}
            dataTestId="card-offers"
          >
            <div className="grid gap-3">
              {offers.map((o) => {
                const tone =
                  o.stance === "recommended"
                    ? "success"
                    : o.stance === "cautious"
                      ? "warn"
                      : "neutral";

                return (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className={`rounded-2xl border bg-background/60 p-4 ${
                      o.id === best.id ? "ring-1 ring-primary/20" : ""
                    }`}
                    data-testid={`card-offer-${o.id}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <div
                            className="font-medium"
                            data-testid={`text-offer-provider-${o.id}`}
                          >
                            {o.provider}
                          </div>
                          <TBChip tone={tone as any} dataTestId={`chip-offer-stance-${o.id}`}>
                            {o.stance === "recommended"
                              ? "Recommended"
                              : o.stance === "cautious"
                                ? "Cautious"
                                : "Standard"}
                          </TBChip>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                          <div
                            className="rounded-xl border bg-card/60 p-2"
                            data-testid={`text-offer-apr-${o.id}`}
                          >
                            <div className="text-xs text-muted-foreground">APR</div>
                            <div className="font-medium">{o.apr}</div>
                          </div>
                          <div
                            className="rounded-xl border bg-card/60 p-2"
                            data-testid={`text-offer-tenor-${o.id}`}
                          >
                            <div className="text-xs text-muted-foreground">Tenor</div>
                            <div className="font-medium">{o.tenor}</div>
                          </div>
                          <div
                            className="rounded-xl border bg-card/60 p-2"
                            data-testid={`text-offer-fees-${o.id}`}
                          >
                            <div className="text-xs text-muted-foreground">Fees</div>
                            <div className="font-medium">{o.fees}</div>
                          </div>
                          <div
                            className="rounded-xl border bg-card/60 p-2"
                            data-testid={`text-offer-speed-${o.id}`}
                          >
                            <div className="text-xs text-muted-foreground">Speed</div>
                            <div className="font-medium">{o.speed}</div>
                          </div>
                        </div>
                        <div
                          className="mt-2 text-sm text-muted-foreground"
                          data-testid={`text-offer-collateral-${o.id}`}
                        >
                          Collateral: <span className="text-foreground/80">{o.collateral}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          className="h-8"
                          data-testid={`button-compare-${o.id}`}
                        >
                          Compare
                        </Button>
                        <Button className="h-8" data-testid={`button-select-${o.id}`}>
                          Select
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <Separator className="my-4" />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium" data-testid="text-best-offer-title">
                  Best fit
                </div>
                <div className="text-sm text-muted-foreground" data-testid="text-best-offer-caption">
                  Recommended based on compliance posture + proof completeness.
                </div>
              </div>
              <TBChip tone="success" dataTestId="chip-best-fit">
                {best.provider}
              </TBChip>
            </div>
          </TBCard>
        </div>
      </div>
    </div>
  );
}
