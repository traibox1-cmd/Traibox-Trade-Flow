import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Sparkles,
  UserPlus,
  Plus,
  Mail,
  CheckCircle2,
  X,
  Check,
  Building2,
  Users,
  Network,
  Search,
  MapPin,
  ArrowRight,
  Layers,
  Zap,
  Shield,
  Link2,
  ExternalLink,
  Star,
  Clock,
  Send,
  Inbox,
  Factory,
  Briefcase,
  Truck,
  CreditCard,
  Upload,
} from "lucide-react";
import { useAppStore, type Partner, type PartnerRole, ALL_PARTNER_ROLES, type NetworkGroup } from "@/lib/store";

// --- Helpers ---

function trustTone(trust: Partner["trust"]): "success" | "neutral" | "warn" {
  return trust === "verified" ? "success" : trust === "partner" ? "neutral" : "warn";
}

function trustLabel(trust: Partner["trust"]) {
  return trust === "verified" ? "Verified" : trust === "partner" ? "Partner" : "New";
}

function typeIcon(type?: Partner["type"]) {
  if (type === "counterparty") return <Handshake className="h-3.5 w-3.5" />;
  if (type === "participant") return <Briefcase className="h-3.5 w-3.5" />;
  return <Building2 className="h-3.5 w-3.5" />;
}

function themeIcon(theme: NetworkGroup["theme"]) {
  if (theme === "geography") return <Globe className="h-4 w-4" />;
  if (theme === "industry") return <Factory className="h-4 w-4" />;
  if (theme === "corridor") return <Truck className="h-4 w-4" />;
  return <Layers className="h-4 w-4" />;
}

function roleIcon(role: PartnerRole) {
  const map: Record<PartnerRole, React.ReactNode> = {
    Buyer: <Briefcase className="h-3 w-3" />,
    Supplier: <Factory className="h-3 w-3" />,
    Financier: <CreditCard className="h-3 w-3" />,
    Logistics: <Truck className="h-3 w-3" />,
    Customs: <Shield className="h-3 w-3" />,
    Insurance: <Shield className="h-3 w-3" />,
    Broker: <Link2 className="h-3 w-3" />,
    "Auditor/Certifier": <BadgeCheck className="h-3 w-3" />,
  };
  return map[role] ?? null;
}

// --- Party Card ---

function PartyCard({
  p,
  onConnect,
  onEditCapabilities,
}: {
  p: Partner;
  onConnect: (id: string) => void;
  onEditCapabilities: (p: Partner) => void;
}) {
  const tone = trustTone(p.trust);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="rounded-2xl border bg-card/60 p-4 hover:bg-card transition-colors"
      data-testid={`card-partner-${p.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium truncate" data-testid={`text-partner-name-${p.id}`}>{p.name}</span>
            <TBChip tone={tone} dataTestId={`chip-partner-trust-${p.id}`}>{trustLabel(p.trust)}</TBChip>
            {p.tradePassportReady && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/8 px-2 py-0.5 text-[10px] text-emerald-600 dark:text-emerald-400" data-testid={`chip-passport-${p.id}`}>
                <BadgeCheck className="h-3 w-3" />
                Passport ready
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1" data-testid={`text-partner-region-${p.id}`}>
              <MapPin className="h-3 w-3" />
              {p.country ?? p.region}
            </span>
            {p.industry && (
              <span className="inline-flex items-center gap-1">
                {typeIcon(p.type)}
                {p.industry}
              </span>
            )}
          </div>
          {p.canActAs && p.canActAs.length > 0 && (
            <div className="mt-2.5" data-testid={`list-partner-roles-${p.id}`}>
              <div className="text-[10px] text-muted-foreground mb-1.5">Can act as</div>
              <div className="flex flex-wrap gap-1.5">
                {p.canActAs.map((role) => (
                  <span key={role} className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-medium" data-testid={`chip-role-${p.id}-${role}`}>
                    {roleIcon(role)}{role}
                  </span>
                ))}
              </div>
            </div>
          )}
          {p.capabilities.length > 0 && (
            <div className="mt-2" data-testid={`list-partner-caps-${p.id}`}>
              <div className="text-[10px] text-muted-foreground mb-1.5">Services</div>
              <div className="flex flex-wrap gap-1.5">
                {p.capabilities.map((c) => (
                  <span key={c} className="rounded-full border bg-background/70 px-2 py-0.5 text-[10px]">{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground" data-testid={`text-partner-visibility-${p.id}`}>
            <Lock className="h-3.5 w-3.5" />
            {p.visibility === "private" ? "Private" : "Shared"}
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-8 text-xs px-2" onClick={() => onEditCapabilities(p)} data-testid={`button-edit-capabilities-${p.id}`}>
              Edit
            </Button>
            <Button size="sm" className="h-8" onClick={() => onConnect(p.id)} disabled={p.connectionStatus === "connected"} data-testid={`button-connect-${p.id}`}>
              {p.connectionStatus === "connected" ? (<><CheckCircle2 className="w-3 h-3 mr-1" />Connected</>) : p.connectionStatus === "pending" ? "Pending…" : "Connect"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Network Group Card ---

function NetworkGroupCard({ ng, onJoin, onOpen }: { ng: NetworkGroup; onJoin: (id: string) => void; onOpen: (ng: NetworkGroup) => void; }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}
      className="rounded-2xl border bg-card/60 p-4 hover:bg-card transition-colors" data-testid={`card-network-${ng.id}`}>
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary">
          {themeIcon(ng.theme)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium" data-testid={`text-network-name-${ng.id}`}>{ng.name}</span>
            {ng.isOwner && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[10px] font-medium">
                <Star className="h-3 w-3" />Owner
              </span>
            )}
            {ng.isMember && !ng.isOwner && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/8 border border-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-medium">
                <Check className="h-3 w-3" />Member
              </span>
            )}
            <span className="rounded-full border bg-background/60 px-2 py-0.5 text-[10px] capitalize">{ng.theme}</span>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{ng.description}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {ng.tags.map((tag) => <span key={tag} className="rounded-full border bg-background/60 px-2 py-0.5 text-[10px]">{tag}</span>)}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <Users className="h-3 w-3" />{ng.memberCount} members
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => onOpen(ng)} data-testid={`button-open-network-${ng.id}`}>
                Open<ExternalLink className="ml-1 h-3 w-3" />
              </Button>
              {!ng.isMember && (
                <Button size="sm" className="h-8" onClick={() => onJoin(ng.id)} data-testid={`button-join-network-${ng.id}`}>Join</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// --- Match Suggestions ---

const MATCH_SUGGESTIONS = [
  { id: "m1", name: "Forwarder in Vietnam", reason: "Matched to your SEA corridor requirements", fit: "98%", tags: ["SEA", "Verified", "Fast onboarding"], role: "Logistics" as PartnerRole },
  { id: "m2", name: "LC Advising Bank – Singapore", reason: "Matches your funding structure (LC) and corridor", fit: "95%", tags: ["Finance", "SG-based", "Rapid issuance"], role: "Financier" as PartnerRole },
  { id: "m3", name: "Cargo Insurer – Lloyd's Syndicate", reason: "Evidence-first policy aligned with your compliance stance", fit: "91%", tags: ["Insurance", "Evidence-ready", "EU corridors"], role: "Insurance" as PartnerRole },
  { id: "m4", name: "East Africa Customs Broker", reason: "Specialist in Kenya import clearance", fit: "89%", tags: ["Africa", "Customs", "Trade docs"], role: "Customs" as PartnerRole },
  { id: "m5", name: "Commodity Aggregator – West Africa", reason: "Operates in your target sourcing corridor", fit: "84%", tags: ["Africa", "Agri", "Aggregation"], role: "Supplier" as PartnerRole },
  { id: "m6", name: "Invoice Factoring Desk – LATAM", reason: "Available for LATAM receivables on short-cycle trades", fit: "80%", tags: ["Finance", "LATAM", "Factoring"], role: "Financier" as PartnerRole },
];

function MatchCard({ match, onRequest, requested }: { match: (typeof MATCH_SUGGESTIONS)[0]; onRequest: (id: string) => void; requested: boolean; }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}
      className="rounded-2xl border bg-card/60 p-4 hover:bg-card transition-colors" data-testid={`card-match-${match.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">{match.name}</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/15 text-primary px-2 py-0.5 text-[10px] font-medium">
              <Zap className="h-2.5 w-2.5" />{match.fit} fit
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{match.reason}</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {match.tags.map((tag) => <span key={tag} className="rounded-full border bg-background/60 px-2 py-0.5 text-[10px]">{tag}</span>)}
          </div>
        </div>
        {requested ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5" />Requested
          </span>
        ) : (
          <Button size="sm" className="h-8 shrink-0" onClick={() => onRequest(match.id)} data-testid={`button-request-${match.id}`}>
            Request<ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// --- Capability Edit Modal ---

const SERVICE_CAPABILITIES = [
  "Forwarding", "Manufacturing", "QA", "Trade docs", "Aggregation",
  "Fulfillment", "Local compliance", "Customs", "LC issuance",
  "Invoice factoring", "Cargo insurance", "Risk assessment",
];

function CapabilityEditModal({ partner, capabilities, canActAs, onToggleCapability, onToggleRole, onSave, onClose }: {
  partner: Partner; capabilities: string[]; canActAs: PartnerRole[];
  onToggleCapability: (cap: string) => void; onToggleRole: (role: PartnerRole) => void;
  onSave: () => void; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" data-testid="modal-edit-capabilities">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
        className="relative w-full max-w-md rounded-3xl border bg-card shadow-2xl p-6 mx-4">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="font-semibold">Edit {partner.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Roles and service capabilities</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose} data-testid="button-close-modal"><X className="h-4 w-4" /></Button>
        </div>
        <div className="space-y-5">
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2.5">Can act as</div>
            <div className="flex flex-wrap gap-2">
              {ALL_PARTNER_ROLES.map((role) => (
                <button key={role} onClick={() => onToggleRole(role)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${canActAs.includes(role) ? "bg-primary border-primary/40 text-primary-foreground" : "bg-background/60 hover:bg-background"}`}
                  data-testid={`toggle-role-${role}`}>
                  {roleIcon(role)}{role}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2.5">Services</div>
            <div className="flex flex-wrap gap-2">
              {SERVICE_CAPABILITIES.map((cap) => (
                <button key={cap} onClick={() => onToggleCapability(cap)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${capabilities.includes(cap) ? "bg-primary border-primary/40 text-primary-foreground" : "bg-background/60 hover:bg-background"}`}
                  data-testid={`toggle-cap-${cap}`}>
                  {cap}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" className="h-9" onClick={onClose}>Cancel</Button>
          <Button className="h-9" onClick={onSave} data-testid="button-save-capabilities">
            <Check className="mr-2 h-4 w-4" />Save changes
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Add Party Modal ---

function AddPartyModal({ onAdd, onClose }: { onAdd: (name: string, region: string, type: Partner["type"]) => void; onClose: () => void; }) {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [type, setType] = useState<Partner["type"]>("counterparty");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" data-testid="modal-add-party">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
        className="relative w-full max-w-md rounded-3xl border bg-card shadow-2xl p-6 mx-4">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div><h3 className="font-semibold">Add party</h3><p className="text-xs text-muted-foreground mt-0.5">Manually add a counterparty, participant, or organization</p></div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Organization name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Meridian Trade Finance" data-testid="input-add-party-name" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Region / Country</label>
            <Input value={region} onChange={(e) => setRegion(e.target.value)} placeholder="e.g. Singapore, SEA" data-testid="input-add-party-region" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Party type</label>
            <div className="flex gap-2">
              {(["counterparty", "participant", "organization"] as Partner["type"][]).map((t) => (
                <button key={t} onClick={() => setType(t)}
                  className={`flex-1 rounded-xl border py-2 text-[11px] capitalize transition-colors ${type === t ? "bg-primary border-primary/40 text-primary-foreground" : "bg-background/60 hover:bg-background"}`}
                  data-testid={`button-type-${t}`}>{t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" className="h-9" onClick={onClose}>Cancel</Button>
          <Button className="h-9" disabled={!name.trim() || !region.trim()}
            onClick={() => { if (name.trim() && region.trim()) { onAdd(name.trim(), region.trim(), type); onClose(); } }}
            data-testid="button-confirm-add-party">
            <Plus className="mr-2 h-4 w-4" />Add party
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Create Network Modal ---

function CreateNetworkModal({ onCreate, onClose }: { onCreate: (name: string, theme: NetworkGroup["theme"], description: string, tags: string[]) => void; onClose: () => void; }) {
  const [name, setName] = useState("");
  const [theme, setTheme] = useState<NetworkGroup["theme"]>("geography");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const addTag = () => { const t = tagInput.trim(); if (t && !tags.includes(t)) { setTags([...tags, t]); setTagInput(""); } };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" data-testid="modal-create-network">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
        className="relative w-full max-w-md rounded-3xl border bg-card shadow-2xl p-6 mx-4">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div><h3 className="font-semibold">Create Network</h3><p className="text-xs text-muted-foreground mt-0.5">Build a curated, ownable mini-marketplace</p></div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Network name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. US Wine Market Network" data-testid="input-network-name" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Theme</label>
            <div className="grid grid-cols-2 gap-2">
              {(["geography", "industry", "corridor", "custom"] as NetworkGroup["theme"][]).map((t) => (
                <button key={t} onClick={() => setTheme(t)}
                  className={`flex items-center gap-2 rounded-xl border p-2.5 text-[11px] capitalize transition-colors ${theme === t ? "bg-primary border-primary/40 text-primary-foreground" : "bg-background/60 hover:bg-background"}`}
                  data-testid={`button-theme-${t}`}>
                  {themeIcon(t)}{t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this Network for?"
              className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm resize-none h-20 outline-none focus:ring-1 focus:ring-primary/30"
              data-testid="input-network-description" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Tags</label>
            <div className="flex gap-2">
              <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTag()} placeholder="Add a tag, press Enter" className="flex-1" data-testid="input-network-tag" />
              <Button variant="secondary" size="sm" className="h-9" onClick={addTag}>Add</Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full border bg-background/60 px-2 py-0.5 text-[10px]">
                    {tag}<button onClick={() => setTags(tags.filter((t) => t !== tag))}><X className="h-2.5 w-2.5" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" className="h-9" onClick={onClose}>Cancel</Button>
          <Button className="h-9" disabled={!name.trim()}
            onClick={() => { if (name.trim()) { onCreate(name.trim(), theme, description.trim(), tags); onClose(); } }}
            data-testid="button-confirm-create-network">
            <Network className="mr-2 h-4 w-4" />Create Network
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Invite Modal ---

function InviteModal({ onSend, onClose }: { onSend: (name: string, email: string, message: string) => void; onClose: () => void; }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" data-testid="modal-invite">
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
        className="relative w-full max-w-md rounded-3xl border bg-card shadow-2xl p-6 mx-4">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div><h3 className="font-semibold">Send invitation</h3><p className="text-xs text-muted-foreground mt-0.5">Invite a party into TRAIBOX</p></div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}><X className="h-4 w-4" /></Button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Organization / contact name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vortex Commodities AG" data-testid="input-invite-name" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Email address</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ops@example.com" data-testid="input-invite-email" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1.5">Optional message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Why are you inviting them?"
              className="w-full rounded-xl border bg-background/60 px-3 py-2 text-sm resize-none h-20 outline-none focus:ring-1 focus:ring-primary/30"
              data-testid="input-invite-message" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" className="h-9" onClick={onClose}>Cancel</Button>
          <Button className="h-9" disabled={!name.trim() || !email.trim()}
            onClick={() => { if (name.trim() && email.trim()) { onSend(name.trim(), email.trim(), message.trim()); onClose(); } }}
            data-testid="button-confirm-invite">
            <Send className="mr-2 h-4 w-4" />Send invitation
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// --- Main Component ---

export default function MyNetwork() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<PartnerRole | "all">("all");
  const [typeFilter, setTypeFilter] = useState<Partner["type"] | "all">("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateNetworkModal, setShowCreateNetworkModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [editCapabilities, setEditCapabilities] = useState<string[]>([]);
  const [editCanActAs, setEditCanActAs] = useState<PartnerRole[]>([]);
  const [requestedMatches, setRequestedMatches] = useState<Set<string>>(new Set());
  const [acceptedInvites, setAcceptedInvites] = useState<Set<string>>(new Set());
  const [declinedInvites, setDeclinedInvites] = useState<Set<string>>(new Set());

  const { partners, partnerInvites, networkGroups, updatePartner, addPartnerInvite, addNetworkGroup, joinNetworkGroup } = useAppStore();

  const handleConnect = (id: string) => {
    updatePartner(id, { connectionStatus: "pending" });
    setTimeout(() => updatePartner(id, { connectionStatus: "connected" }), 1500);
  };

  const handleOpenCapabilityEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setEditCapabilities([...partner.capabilities]);
    setEditCanActAs([...(partner.canActAs ?? [])]);
  };

  const handleToggleCapability = (cap: string) =>
    setEditCapabilities((prev) => prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]);

  const handleToggleCanActAs = (role: PartnerRole) =>
    setEditCanActAs((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);

  const handleSaveCapabilities = () => {
    if (editingPartner) {
      updatePartner(editingPartner.id, { capabilities: editCapabilities, canActAs: editCanActAs });
      setEditingPartner(null);
    }
  };

  const handleAddParty = (name: string, region: string, type: Partner["type"]) => {
    useAppStore.setState((state) => ({
      partners: [...state.partners, {
        id: `p-${Date.now()}`, name, region, country: region, capabilities: [], canActAs: [],
        trust: "new" as const, visibility: "private" as const, connectionStatus: "none" as const,
        type, tradePassportReady: false, activeTradeIds: [], networkIds: [],
      }],
    }));
  };

  const handleSendInvite = (name: string, email: string, message: string) => {
    addPartnerInvite({ partnerName: name, email, status: "sent", direction: "sent", scope: "network", message: message || undefined });
  };

  const handleCreateNetwork = (name: string, theme: NetworkGroup["theme"], description: string, tags: string[]) => {
    addNetworkGroup({ name, theme, description, tags, memberCount: 1, visibility: "invite-only", isOwner: true, isMember: true });
  };

  const filteredAll = useMemo(() => {
    let result = partners;
    const q = query.trim().toLowerCase();
    if (q) result = result.filter((p) => p.name.toLowerCase().includes(q));
    if (roleFilter !== "all") result = result.filter((p) => p.canActAs?.includes(roleFilter));
    if (typeFilter !== "all") result = result.filter((p) => (p.type ?? "counterparty") === typeFilter);
    return result;
  }, [query, partners, roleFilter, typeFilter]);

  const counterparties = useMemo(() => partners.filter((p) => p.type === "counterparty"), [partners]);
  const participants = useMemo(() => partners.filter((p) => p.type === "participant"), [partners]);
  const sentInvites = useMemo(() => partnerInvites.filter((i) => i.direction === "sent"), [partnerInvites]);
  const receivedInvites = useMemo(() => partnerInvites.filter((i) => i.direction === "received"), [partnerInvites]);
  const pendingReceived = useMemo(() => receivedInvites.filter((i) => !declinedInvites.has(i.id) && !acceptedInvites.has(i.id)), [receivedInvites, declinedInvites, acceptedInvites]);
  const myNetworks = useMemo(() => networkGroups.filter((ng) => ng.isMember || ng.isOwner), [networkGroups]);
  const discoverNetworks = useMemo(() => networkGroups.filter((ng) => !ng.isMember && !ng.isOwner), [networkGroups]);
  const connected = partners.filter((p) => p.connectionStatus === "connected").length;
  const pendingCount = partners.filter((p) => p.connectionStatus === "pending").length;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
              <Network className="h-4 w-4 text-primary" />
            </div>
            <h1 className="font-semibold text-2xl tracking-tight md:text-3xl" data-testid="text-title-network">Network</h1>
          </div>
          <p className="text-sm text-muted-foreground" data-testid="text-subtitle-network">
            Structured relationships, participants, and matchmaking — private by default.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <Button variant="secondary" size="sm" className="h-9 gap-1.5" data-testid="button-import">
            <Upload className="h-3.5 w-3.5" />Import
          </Button>
          <Button variant="secondary" size="sm" className="h-9 gap-1.5" onClick={() => setShowAddModal(true)} data-testid="button-add-party">
            <Plus className="h-3.5 w-3.5" />Add party
          </Button>
          <Button size="sm" className="h-9 gap-1.5" onClick={() => setShowInviteModal(true)} data-testid="button-invite">
            <UserPlus className="h-3.5 w-3.5" />Invite
          </Button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {[
          { label: "Total parties", value: partners.length, icon: <Users className="h-4 w-4" /> },
          { label: "Connected", value: connected, icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> },
          { label: "Pending", value: pendingCount, icon: <Clock className="h-4 w-4 text-amber-500" /> },
          { label: "My Networks", value: myNetworks.length, icon: <Network className="h-4 w-4 text-primary" /> },
          { label: "Invitations", value: pendingReceived.length, icon: <Inbox className="h-4 w-4" /> },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border bg-card/60 p-3 flex flex-col gap-1">
            <div className="text-muted-foreground">{stat.icon}</div>
            <div className="text-xl font-semibold tabular-nums">{stat.value}</div>
            <div className="text-[11px] text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-5">
        <Tabs defaultValue="directory" data-testid="tabs-network">
          <TabsList className="w-full justify-start overflow-x-auto" data-testid="tabslist-network">
            <TabsTrigger value="directory" data-testid="tab-directory">
              <Globe className="mr-1.5 h-3.5 w-3.5" />Directory
            </TabsTrigger>
            <TabsTrigger value="counterparties" data-testid="tab-counterparties">
              <Handshake className="mr-1.5 h-3.5 w-3.5" />Counterparties
            </TabsTrigger>
            <TabsTrigger value="participants" data-testid="tab-participants">
              <Briefcase className="mr-1.5 h-3.5 w-3.5" />Participants
            </TabsTrigger>
            <TabsTrigger value="invitations" data-testid="tab-invitations">
              <Mail className="mr-1.5 h-3.5 w-3.5" />
              Invitations
              {pendingReceived.length > 0 && (
                <span className="ml-1.5 rounded-full bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 leading-none">
                  {pendingReceived.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="networks" data-testid="tab-networks">
              <Network className="mr-1.5 h-3.5 w-3.5" />Networks
            </TabsTrigger>
            <TabsTrigger value="matchmaking" data-testid="tab-matchmaking">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />Matchmaking
            </TabsTrigger>
          </TabsList>

          {/* Directory */}
          <TabsContent value="directory" className="mt-4" data-testid="panel-directory">
            <TBCard title="Directory" subtitle="All parties in your Network — private by default"
              state="idle" icon={<Globe className="h-4 w-4" />} dataTestId="card-directory">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <div className="relative flex-1 min-w-[160px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search parties…" className="pl-9" data-testid="input-party-search" />
                </div>
                <select value={typeFilter ?? "all"} onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="h-9 rounded-lg border bg-background/60 px-3 text-sm" data-testid="select-type-filter">
                  <option value="all">All types</option>
                  <option value="counterparty">Counterparties</option>
                  <option value="participant">Participants</option>
                  <option value="organization">Organizations</option>
                </select>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="h-9 rounded-lg border bg-background/60 px-3 text-sm" data-testid="select-role-filter">
                  <option value="all">All roles</option>
                  {ALL_PARTNER_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {filteredAll.length === 0 ? (
                <div className="rounded-2xl border bg-background/60 p-6 text-center text-sm text-muted-foreground">No parties match your filters.</div>
              ) : (
                <div className="grid gap-3">
                  {filteredAll.map((p) => <PartyCard key={p.id} p={p} onConnect={handleConnect} onEditCapabilities={handleOpenCapabilityEdit} />)}
                </div>
              )}
              <div className="mt-5 rounded-2xl border bg-background/60 p-4" data-testid="callout-privacy">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm font-medium">Private by default</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  All parties are private until explicitly shared within a trade or Network. Your relationship graph is never exposed externally.
                </p>
              </div>
            </TBCard>
          </TabsContent>

          {/* Counterparties */}
          <TabsContent value="counterparties" className="mt-4" data-testid="panel-counterparties">
            <TBCard title="Counterparties" subtitle="Trading partners — buyers, sellers, and suppliers you transact with"
              state="idle" icon={<Handshake className="h-4 w-4" />} dataTestId="card-counterparties">
              {counterparties.length === 0 ? (
                <div className="rounded-2xl border bg-background/60 p-6 text-center">
                  <Handshake className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">No counterparties yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Add a buyer, seller, or supplier to get started.</p>
                  <Button size="sm" className="mt-4" onClick={() => setShowAddModal(true)} data-testid="button-add-counterparty">
                    <Plus className="mr-2 h-4 w-4" />Add counterparty
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {counterparties.map((p) => <PartyCard key={p.id} p={p} onConnect={handleConnect} onEditCapabilities={handleOpenCapabilityEdit} />)}
                </div>
              )}
              <div className="mt-5 rounded-2xl border border-primary/10 bg-primary/5 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Link2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Reuse across trades</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Counterparties saved here can be linked to any trade. Their roles, trust level, and Trade Passport readiness carry over automatically.
                </p>
              </div>
            </TBCard>
          </TabsContent>

          {/* Participants */}
          <TabsContent value="participants" className="mt-4" data-testid="panel-participants">
            <TBCard title="Participants" subtitle="Service providers — logistics, finance, compliance, insurance, and more"
              state="idle" icon={<Briefcase className="h-4 w-4" />} dataTestId="card-participants">
              {participants.length === 0 ? (
                <div className="rounded-2xl border bg-background/60 p-6 text-center">
                  <Briefcase className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium">No participants yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">Add logistics providers, financiers, or compliance specialists.</p>
                  <Button size="sm" className="mt-4" onClick={() => setShowAddModal(true)} data-testid="button-add-participant">
                    <Plus className="mr-2 h-4 w-4" />Add participant
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {participants.map((p) => <PartyCard key={p.id} p={p} onConnect={handleConnect} onEditCapabilities={handleOpenCapabilityEdit} />)}
                </div>
              )}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  { label: "Logistics & Freight", icon: <Truck className="h-4 w-4" />, count: participants.filter((p) => p.canActAs?.includes("Logistics")).length },
                  { label: "Trade Finance", icon: <CreditCard className="h-4 w-4" />, count: participants.filter((p) => p.canActAs?.includes("Financier")).length },
                  { label: "Insurance & Risk", icon: <Shield className="h-4 w-4" />, count: participants.filter((p) => p.canActAs?.includes("Insurance")).length },
                  { label: "Customs & Compliance", icon: <BadgeCheck className="h-4 w-4" />, count: participants.filter((p) => p.canActAs?.includes("Customs")).length },
                ].map((cat) => (
                  <div key={cat.label} className="rounded-2xl border bg-background/60 p-3 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-primary/8 border border-primary/10 flex items-center justify-center text-primary">{cat.icon}</div>
                    <div>
                      <div className="text-sm font-medium">{cat.label}</div>
                      <div className="text-xs text-muted-foreground">{cat.count} participant{cat.count !== 1 ? "s" : ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TBCard>
          </TabsContent>

          {/* Invitations */}
          <TabsContent value="invitations" className="mt-4" data-testid="panel-invitations">
            <div className="grid gap-4 md:grid-cols-2">
              <TBCard title="Received" subtitle="Parties who want to connect with you"
                state={pendingReceived.length > 0 ? "ready" : "idle"} icon={<Inbox className="h-4 w-4" />} dataTestId="card-invites-received">
                {receivedInvites.length === 0 ? (
                  <div className="rounded-2xl border bg-background/60 p-4 text-center text-sm text-muted-foreground">No pending invitations received.</div>
                ) : (
                  <div className="grid gap-3">
                    {receivedInvites.map((invite) => {
                      const accepted = acceptedInvites.has(invite.id);
                      const declined = declinedInvites.has(invite.id);
                      return (
                        <div key={invite.id} className="rounded-2xl border bg-background/60 p-3" data-testid={`card-received-invite-${invite.id}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="font-medium text-sm">{invite.partnerName}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{invite.email}</div>
                              {invite.message && <p className="mt-1.5 text-xs text-muted-foreground italic">"{invite.message}"</p>}
                              {invite.scope && <span className="mt-1.5 inline-block rounded-full border bg-background px-2 py-0.5 text-[10px] capitalize">{invite.scope}</span>}
                            </div>
                            {accepted ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 shrink-0">
                                <CheckCircle2 className="h-3.5 w-3.5" />Accepted
                              </span>
                            ) : declined ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground shrink-0">
                                <X className="h-3.5 w-3.5" />Declined
                              </span>
                            ) : (
                              <div className="flex gap-1.5 shrink-0">
                                <Button variant="ghost" size="sm" className="h-7 text-xs"
                                  onClick={() => setDeclinedInvites((prev) => new Set(prev).add(invite.id))}
                                  data-testid={`button-decline-invite-${invite.id}`}>Decline</Button>
                                <Button size="sm" className="h-7 text-xs"
                                  onClick={() => setAcceptedInvites((prev) => new Set(prev).add(invite.id))}
                                  data-testid={`button-accept-invite-${invite.id}`}>Accept</Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TBCard>

              <TBCard title="Sent" subtitle="Invitations you have dispatched"
                state="idle" icon={<Send className="h-4 w-4" />} dataTestId="card-invites-sent">
                {sentInvites.length === 0 ? (
                  <div className="rounded-2xl border bg-background/60 p-4 text-center">
                    <Mail className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                    <p className="text-sm text-muted-foreground">No invitations sent yet.</p>
                    <Button size="sm" className="mt-3" onClick={() => setShowInviteModal(true)} data-testid="button-send-invite-empty">
                      <UserPlus className="mr-2 h-4 w-4" />Send invitation
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {sentInvites.map((invite) => (
                      <div key={invite.id} className="rounded-2xl border bg-background/60 p-3" data-testid={`card-sent-invite-${invite.id}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-medium text-sm">{invite.partnerName}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{invite.email}</div>
                            {invite.scope && <span className="mt-1.5 inline-block rounded-full border bg-background px-2 py-0.5 text-[10px] capitalize">{invite.scope}</span>}
                          </div>
                          <TBChip tone={invite.status === "accepted" ? "success" : invite.status === "declined" ? "error" : "neutral"}
                            dataTestId={`chip-invite-status-${invite.id}`}>{invite.status}</TBChip>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" className="h-8" onClick={() => setShowInviteModal(true)} data-testid="button-send-another-invite">
                      <UserPlus className="mr-2 h-3.5 w-3.5" />Send another
                    </Button>
                  </div>
                )}
              </TBCard>
            </div>
            <div className="mt-4 rounded-2xl border bg-background/60 p-4" data-testid="callout-invitations">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Invitation model</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Invitations are always intentional and scoped — to a trade, a Network, or the platform. They can be revoked at any time. Acceptance does not grant access to your data.
              </p>
            </div>
          </TabsContent>

          {/* Networks */}
          <TabsContent value="networks" className="mt-4" data-testid="panel-networks">
            <div className="flex items-center justify-between gap-3 mb-4">
              <p className="text-sm text-muted-foreground">
                Curated, ownable mini-marketplaces organized by geography, industry, corridor, or theme.
              </p>
              <Button size="sm" className="h-9 gap-1.5 shrink-0" onClick={() => setShowCreateNetworkModal(true)} data-testid="button-create-network">
                <Plus className="h-3.5 w-3.5" />Create Network
              </Button>
            </div>
            {myNetworks.length > 0 && (
              <div className="mb-5">
                <div className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">My Networks</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {myNetworks.map((ng) => <NetworkGroupCard key={ng.id} ng={ng} onJoin={joinNetworkGroup} onOpen={() => {}} />)}
                </div>
              </div>
            )}
            {discoverNetworks.length > 0 && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Discover</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {discoverNetworks.map((ng) => <NetworkGroupCard key={ng.id} ng={ng} onJoin={joinNetworkGroup} onOpen={() => {}} />)}
                </div>
              </div>
            )}
            <div className="mt-5 rounded-2xl border border-primary/10 bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Network className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">What is a Network?</span>
              </div>
              <p className="text-xs text-muted-foreground">
                A Network is a curated, interactive space you own and manage — not a social feed. Use it to organize vetted parties by geography, industry, or trade corridor. Members can be invited, given roles, and reused across your trades. Networks are private or invite-only by default.
              </p>
            </div>
          </TabsContent>

          {/* Matchmaking */}
          <TabsContent value="matchmaking" className="mt-4" data-testid="panel-matchmaking">
            <TBCard title="Matchmaking" subtitle="Intelligence-driven party discovery — matched to your trade requirements"
              state="ready" icon={<Sparkles className="h-4 w-4" />} dataTestId="card-matchmaking">
              <div className="mb-4 rounded-2xl border bg-background/60 p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Matching criteria</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["SEA corridor", "LC-based funding", "Agri commodities", "Verified only", "Fast onboarding"].map((c) => (
                    <span key={c} className="rounded-full border bg-primary/8 border-primary/15 text-primary px-2.5 py-1 text-[11px] font-medium">{c}</span>
                  ))}
                  <span className="rounded-full border bg-background/70 px-2.5 py-1 text-[11px] text-muted-foreground cursor-pointer hover:bg-background transition-colors">+ Edit criteria</span>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {MATCH_SUGGESTIONS.map((match) => (
                  <MatchCard key={match.id} match={match}
                    onRequest={(id) => setRequestedMatches((prev) => new Set(prev).add(id))}
                    requested={requestedMatches.has(match.id)} />
                ))}
              </div>
              <div className="mt-5 rounded-2xl border bg-background/60 p-4" data-testid="callout-matchmaking-privacy">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm font-medium">Intent-based, not data-exhaust</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Matchmaking uses your trade intent signals — corridor, role needs, funding structure — not your raw data. You control what is shared, and matches are always opt-in.
                </p>
              </div>
            </TBCard>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {editingPartner && (
          <CapabilityEditModal partner={editingPartner} capabilities={editCapabilities} canActAs={editCanActAs}
            onToggleCapability={handleToggleCapability} onToggleRole={handleToggleCanActAs}
            onSave={handleSaveCapabilities} onClose={() => setEditingPartner(null)} />
        )}
        {showAddModal && <AddPartyModal onAdd={handleAddParty} onClose={() => setShowAddModal(false)} />}
        {showInviteModal && <InviteModal onSend={handleSendInvite} onClose={() => setShowInviteModal(false)} />}
        {showCreateNetworkModal && <CreateNetworkModal onCreate={handleCreateNetwork} onClose={() => setShowCreateNetworkModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
