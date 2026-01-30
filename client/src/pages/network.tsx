import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TBCard } from "../components/tb/TBCard";
import { TBChip } from "../components/tb/TBChip";
import {
  BadgeCheck,
  Globe,
  Handshake,
  Lock,
  Puzzle,
  Sparkles,
  Swords,
  UserPlus,
} from "lucide-react";

type Partner = {
  id: string;
  name: string;
  region: string;
  capabilities: string[];
  trust: "verified" | "partner" | "new";
  visibility: "private" | "shared";
};

const partners: Partner[] = [
  {
    id: "p1",
    name: "NordWerk Logistics",
    region: "EU",
    capabilities: ["Forwarding", "Customs", "Trade docs"],
    trust: "verified",
    visibility: "private",
  },
  {
    id: "p2",
    name: "Aster Mills",
    region: "SEA",
    capabilities: ["Manufacturing", "QA", "Insurance"],
    trust: "partner",
    visibility: "shared",
  },
  {
    id: "p3",
    name: "Kijani Cooperative",
    region: "Africa",
    capabilities: ["Aggregation", "Fulfillment", "Local compliance"],
    trust: "new",
    visibility: "private",
  },
];

function PartnerCard({ p }: { p: Partner }) {
  const tone =
    p.trust === "verified"
      ? "success"
      : p.trust === "partner"
        ? "neutral"
        : "warn";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="rounded-2xl border bg-card/60 p-4 hover:bg-card transition-colors"
      data-testid={`card-partner-${p.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div
              className="font-medium truncate"
              data-testid={`text-partner-name-${p.id}`}
            >
              {p.name}
            </div>
            <TBChip tone={tone as any} dataTestId={`chip-partner-trust-${p.id}`}>
              {p.trust === "verified"
                ? "Verified"
                : p.trust === "partner"
                  ? "Partner"
                  : "New"}
            </TBChip>
          </div>
          <div
            className="mt-1 text-xs text-muted-foreground"
            data-testid={`text-partner-region-${p.id}`}
          >
            {p.region}
          </div>
          <div
            className="mt-3 flex flex-wrap gap-2"
            data-testid={`list-partner-caps-${p.id}`}
          >
            {p.capabilities.map((c) => (
              <div
                key={c}
                className="rounded-full border bg-background/70 px-2.5 py-1 text-[11px]"
              >
                {c}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div
            className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
            data-testid={`text-partner-visibility-${p.id}`}
          >
            <Lock className="h-3.5 w-3.5" />
            {p.visibility === "private" ? "Private" : "Shared"}
          </div>
          <Button size="sm" className="h-8" data-testid={`button-connect-${p.id}`}>
            Connect
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function NetworkPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return partners;
    return partners.filter((p) => p.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <div
              className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 border border-primary/15"
              aria-hidden="true"
            >
              <Handshake className="h-4 w-4 text-primary" />
            </div>
            <h1
              className="font-serif text-2xl tracking-tight md:text-3xl"
              data-testid="text-title-network"
            >
              My Network
            </h1>
          </div>
          <p className="text-sm text-muted-foreground" data-testid="text-subtitle-network">
            Private-by-default partners, integrations, and matchmaking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="h-9" data-testid="button-import">
            <Puzzle className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button className="h-9" data-testid="button-invite">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <Tabs defaultValue="directory" data-testid="tabs-network">
          <TabsList className="w-full justify-start" data-testid="tabslist-network">
            <TabsTrigger value="directory" data-testid="tab-directory">
              Directory
            </TabsTrigger>
            <TabsTrigger value="integrations" data-testid="tab-integrations">
              Integrations
            </TabsTrigger>
            <TabsTrigger value="invites" data-testid="tab-invites">
              Invites
            </TabsTrigger>
            <TabsTrigger value="matchmaking" data-testid="tab-matchmaking">
              Matchmaking
            </TabsTrigger>
            <TabsTrigger value="challenges" data-testid="tab-challenges">
              Challenges
            </TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="mt-4" data-testid="panel-directory">
            <TBCard
              title="Directory"
              subtitle="A calm view into your trusted graph"
              state="idle"
              icon={<Globe className="h-4 w-4" />}
              dataTestId="card-directory"
            >
              <div className="flex items-center gap-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search partners…"
                  data-testid="input-partner-search"
                />
                <Button variant="secondary" data-testid="button-add-partner">
                  Add
                </Button>
              </div>

              <div className="mt-4 grid gap-3">
                {filtered.map((p) => (
                  <PartnerCard key={p.id} p={p} />
                ))}
              </div>

              <div
                className="mt-5 rounded-2xl border bg-background/60 p-4"
                data-testid="callout-privacy"
              >
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <div className="text-sm font-medium">Visibility cues</div>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Everything is private by default. Share a partner only when you explicitly invite them into a trade.
                </div>
              </div>
            </TBCard>
          </TabsContent>

          <TabsContent value="integrations" className="mt-4" data-testid="panel-integrations">
            <TBCard
              title="Integrations"
              subtitle="Connect tools you already trust"
              state="idle"
              icon={<Puzzle className="h-4 w-4" />}
              dataTestId="card-integrations"
            >
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { name: "Document vault", desc: "Bring your own DMS" },
                  { name: "Sanctions screening", desc: "Policy-aligned providers" },
                  { name: "Bank rails", desc: "SWIFT / local" },
                  { name: "E-sign", desc: "Audit-ready signatures" },
                ].map((i) => (
                  <div
                    key={i.name}
                    className="rounded-2xl border bg-background/60 p-4"
                    data-testid={`card-integration-${i.name
                      .replace(/\s+/g, "-")
                      .toLowerCase()}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium">{i.name}</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {i.desc}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8"
                        data-testid={`button-connect-${i.name
                          .replace(/\s+/g, "-")
                          .toLowerCase()}`}
                      >
                        Connect
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TBCard>
          </TabsContent>

          <TabsContent value="invites" className="mt-4" data-testid="panel-invites">
            <TBCard
              title="Invites"
              subtitle="Grant access with intent"
              state="idle"
              icon={<UserPlus className="h-4 w-4" />}
              dataTestId="card-invites"
            >
              <div
                className="rounded-2xl border bg-background/60 p-4"
                data-testid="empty-invites"
              >
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  <div className="text-sm font-medium">No pending invites</div>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Invitations are scoped to a trade, and can be revoked at any time.
                </div>
              </div>
            </TBCard>
          </TabsContent>

          <TabsContent value="matchmaking" className="mt-4" data-testid="panel-matchmaking">
            <TBCard
              title="Matchmaking"
              subtitle="Get paired with partners who can execute"
              state="ready"
              icon={<Sparkles className="h-4 w-4" />}
              dataTestId="card-matchmaking"
            >
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { name: "Forwarder in VN", note: "SEA corridor, verified" },
                  { name: "LC advising bank", note: "SG-based, fast settlement" },
                  { name: "Cargo insurer", note: "Evidence-first policy" },
                  { name: "Trade finance desk", note: "Invoice factoring" },
                ].map((m) => (
                  <div
                    key={m.name}
                    className="rounded-2xl border bg-background/60 p-4"
                    data-testid={`card-match-${m.name
                      .replace(/\s+/g, "-")
                      .toLowerCase()}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium">{m.name}</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {m.note}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        className="h-8"
                        data-testid={`button-request-${m.name
                          .replace(/\s+/g, "-")
                          .toLowerCase()}`}
                      >
                        Request
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="mt-4 rounded-2xl border bg-background/60 p-4"
                data-testid="callout-private-default"
              >
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <div className="text-sm font-medium">Private-by-default</div>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Matchmaking uses your intent signals—not your data exhaust. You control what’s shared.
                </div>
              </div>
            </TBCard>
          </TabsContent>

          <TabsContent value="challenges" className="mt-4" data-testid="panel-challenges">
            <TBCard
              title="Challenges"
              subtitle="Turn readiness into a competitive edge"
              state="idle"
              icon={<Swords className="h-4 w-4" />}
              dataTestId="card-challenges"
            >
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { title: "KYC completeness", reward: "Faster onboarding" },
                  { title: "Evidence hygiene", reward: "Lower counterparty friction" },
                  { title: "Compliance clean runs", reward: "Higher trust tier" },
                  { title: "Settlement speed", reward: "Lower fees" },
                ].map((c) => (
                  <div
                    key={c.title}
                    className="rounded-2xl border bg-background/60 p-4"
                    data-testid={`card-challenge-${c.title
                      .replace(/\s+/g, "-")
                      .toLowerCase()}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium">{c.title}</div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          Reward: {c.reward}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8"
                        data-testid={`button-view-${c.title
                          .replace(/\s+/g, "-")
                          .toLowerCase()}`}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TBCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
