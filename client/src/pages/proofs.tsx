import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TBCard } from "../components/tb/TBCard";
import { TBChip } from "../components/tb/TBChip";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  BadgeCheck,
  FileLock2,
  Fingerprint,
  Link2,
  Receipt,
  Sparkles,
} from "lucide-react";

export default function ProofsPage() {
  const [anchor, setAnchor] = useState(false);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <div
              className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 border border-primary/15"
              aria-hidden="true"
            >
              <FileLock2 className="h-4 w-4 text-primary" />
            </div>
            <h1
              className="font-serif text-2xl tracking-tight md:text-3xl"
              data-testid="text-title-proofs"
            >
              Proofs
            </h1>
          </div>
          <p className="text-sm text-muted-foreground" data-testid="text-subtitle-proofs">
            Generate proof packs, verify receipts, optionally anchor for permanence.
          </p>
        </div>
        <Button className="h-9" data-testid="button-generate-pack">
          <Sparkles className="mr-2 h-4 w-4" />
          Generate pack
        </Button>
      </div>

      <div className="mt-4">
        <Tabs defaultValue="packs" data-testid="tabs-proofs">
          <TabsList className="w-full justify-start" data-testid="tabslist-proofs">
            <TabsTrigger value="packs" data-testid="tab-packs">
              Proof packs
            </TabsTrigger>
            <TabsTrigger value="verify" data-testid="tab-verify">
              Verify
            </TabsTrigger>
            <TabsTrigger value="anchoring" data-testid="tab-anchoring">
              Anchoring
            </TabsTrigger>
          </TabsList>

          <TabsContent value="packs" className="mt-4" data-testid="panel-packs">
            <TBCard
              title="Proof pack"
              subtitle="Evidence bundle for a trade"
              state="ready"
              icon={<BadgeCheck className="h-4 w-4" />}
              dataTestId="card-proofpack"
            >
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { label: "Trade plan", tone: "success" },
                  { label: "Compliance", tone: "success" },
                  { label: "Funding", tone: "neutral" },
                  { label: "Payment receipt", tone: "neutral" },
                  { label: "Shipment", tone: "warn" },
                  { label: "Signatures", tone: "success" },
                ].map((i) => (
                  <div
                    key={i.label}
                    className="rounded-2xl border bg-background/60 p-4"
                    data-testid={`card-pack-item-${i.label
                      .replace(/\s+/g, "-")
                      .toLowerCase()}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{i.label}</div>
                      <TBChip
                        tone={i.tone as any}
                        dataTestId={`chip-pack-${i.label
                          .replace(/\s+/g, "-")
                          .toLowerCase()}`}
                      >
                        {i.tone === "success"
                          ? "Ready"
                          : i.tone === "warn"
                            ? "Missing"
                            : "Draft"}
                      </TBChip>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Auto-generated, then confirmed by humans.
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" className="h-8" data-testid="button-download-pack">
                  Download
                </Button>
                <Button variant="secondary" className="h-8" data-testid="button-share-pack">
                  Share (scoped)
                </Button>
                <Button className="h-8" data-testid="button-verify-pack">
                  Verify
                </Button>
              </div>
            </TBCard>
          </TabsContent>

          <TabsContent value="verify" className="mt-4" data-testid="panel-verify">
            <TBCard
              title="Verification"
              subtitle="Paste a receipt hash or URL"
              state="idle"
              icon={<Fingerprint className="h-4 w-4" />}
              dataTestId="card-verify"
            >
              <div className="flex items-center gap-2">
                <Input
                  placeholder="e.g. tbx://receipt/9f3a…"
                  data-testid="input-receipt"
                />
                <Button data-testid="button-verify">Verify</Button>
              </div>
              <div className="mt-4 rounded-2xl border bg-background/60 p-4" data-testid="verify-result">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Result</div>
                  <TBChip tone="success" dataTestId="chip-verified">
                    Verified
                  </TBChip>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Receipt matches the proof pack digest. Scope and timestamps are consistent.
                </div>
              </div>
            </TBCard>
          </TabsContent>

          <TabsContent value="anchoring" className="mt-4" data-testid="panel-anchoring">
            <TBCard
              title="Anchoring"
              subtitle="Optional permanence"
              state="idle"
              icon={<Link2 className="h-4 w-4" />}
              dataTestId="card-anchoring"
            >
              <div
                className="rounded-2xl border bg-background/60 p-4"
                data-testid="callout-anchor"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Anchor receipts</div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Anchoring writes a tamper-evident receipt reference. Optional, reversible, and explicit.
                    </div>
                  </div>
                  <Button
                    variant={anchor ? "secondary" : "default"}
                    className="h-8"
                    onClick={() => setAnchor((v) => !v)}
                    data-testid="button-toggle-anchor"
                  >
                    {anchor ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div>

              {anchor ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 rounded-2xl border bg-background/60 p-4"
                  data-testid="card-anchoring-receipt"
                >
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-primary" />
                    <div className="text-sm font-medium">Anchoring receipt</div>
                    <TBChip tone="success" dataTestId="chip-anchored">
                      Anchored
                    </TBChip>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    tx: 0x7b3c…e19a · network: testnet · timestamp: 2026-01-30 10:14 UTC
                  </div>
                </motion.div>
              ) : null}
            </TBCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
