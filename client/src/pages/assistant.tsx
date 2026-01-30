import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TBCard } from "../components/tb/TBCard";
import { TBChip } from "../components/tb/TBChip";
import {
  ArrowRight,
  Bot,
  FileSearch,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const seed: Msg[] = [
  {
    id: "m1",
    role: "assistant",
    text: "Share the corridor, counterparties, amount, and your preferred settlement method. I’ll assemble a Trade Plan and list what’s missing.",
  },
  {
    id: "m2",
    role: "user",
    text: "SG → VN, Aster Mills, USD 240k. We want to pay via bank transfer if possible.",
  },
  {
    id: "m3",
    role: "assistant",
    text: "Great. I’ll propose a plan, then run a compliance pre-check and funding options. I’ll also generate a proof pack baseline so execution stays audit-ready.",
  },
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>(seed);
  const [draft, setDraft] = useState("");

  const suggestions = useMemo(
    () => [
      "Generate a trade plan",
      "What compliance checks will run?",
      "Compare funding offers",
      "Quote best payment route",
    ],
    [],
  );

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2">
                <div
                  className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 border border-primary/15"
                  aria-hidden="true"
                >
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <h1
                  className="font-serif text-2xl tracking-tight md:text-3xl"
                  data-testid="text-title-assistant"
                >
                  Trade Assistant
                </h1>
              </div>
              <p
                className="text-sm text-muted-foreground"
                data-testid="text-subtitle-assistant"
              >
                Perplexity-like chat with controllers and an evidence-aware card
                stack.
              </p>
            </div>

            <Link href="/trade/T-1042">
              <Button className="h-9" data-testid="button-open-golden-trade">
                Open golden path
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="mt-4 rounded-3xl border bg-card/60 p-4 md:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <TBChip tone="neutral" dataTestId="chip-mode">
                AI-first
              </TBChip>
              <TBChip tone="success" dataTestId="chip-safety">
                Safety-first
              </TBChip>
              <TBChip tone="neutral" dataTestId="chip-private">
                Private-by-default
              </TBChip>
            </div>

            <div className="mt-4 grid gap-3">
              {messages.map((m) => {
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

            <div className="mt-5 flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <Button
                  key={s}
                  variant="secondary"
                  className="h-8 rounded-full"
                  onClick={() => setDraft(s)}
                  data-testid={`button-suggest-${s
                    .replace(/\s+/g, "-")
                    .toLowerCase()}`}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {s}
                </Button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask TRAIBOX…"
                data-testid="input-assistant"
              />
              <Button
                onClick={() => {
                  if (!draft.trim()) return;
                  const next: Msg = {
                    id: `m${messages.length + 1}`,
                    role: "user",
                    text: draft,
                  };
                  setMessages((p) => [...p, next]);
                  setDraft("");
                }}
                data-testid="button-send"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Send
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <TBCard
            title="Card stack preview"
            subtitle="What the assistant is building"
            state="ready"
            icon={<FileSearch className="h-4 w-4" />}
            dataTestId="card-preview-stack"
          >
            <div className="grid gap-3">
              <div className="rounded-2xl border bg-background/60 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Trade Plan</div>
                  <TBChip tone="success" dataTestId="chip-plan">
                    Ready
                  </TBChip>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Corridor, parties, docs, incoterms, and milestones.
                </div>
              </div>

              <div className="rounded-2xl border bg-background/60 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Compliance Result</div>
                  <TBChip tone="warn" dataTestId="chip-kyc">
                    Needs review
                  </TBChip>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Screening + policy checks with actionable findings.
                </div>
              </div>

              <div className="rounded-2xl border bg-background/60 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Payment Route Quote</div>
                  <TBChip tone="neutral" dataTestId="chip-quote">
                    Draft
                  </TBChip>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Lowest cost route with settlement options.
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2">
              <div className="text-xs font-medium">Controllers</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  className="h-8"
                  data-testid="button-run-precheck"
                >
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Run pre-check
                </Button>
                <Button
                  variant="secondary"
                  className="h-8"
                  data-testid="button-generate-proofpack"
                >
                  Generate proof pack
                </Button>
              </div>
            </div>
          </TBCard>
        </div>
      </div>
    </div>
  );
}
