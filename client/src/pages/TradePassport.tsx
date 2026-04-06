import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TBCard } from "@/components/tb/TBCard";
import { TBChip } from "@/components/tb/TBChip";
import {
  Building2,
  Users,
  ShieldCheck,
  FileText,
  Share2,
  Download,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAppStore } from "@/lib/store";

export default function TradePassport() {
  const { proofPacks } = useAppStore();
  const [shareLevel, setShareLevel] = useState<"internal" | "parties" | "financier">("internal");

  const kybStatus = "complete" as "complete" | "pending";
  const uboStatus = "pending" as "complete" | "pending";
  const kycStatus = "complete" as "complete" | "pending";
  const amlStatus = "complete" as "complete" | "pending";
  const esgStatus = "pending" as "complete" | "pending";

  const missingItems = [
    uboStatus === "pending" && "Beneficial ownership declaration",
    esgStatus === "pending" && "ESG compliance report",
  ].filter(Boolean);

  const passportStatus = missingItems.length > 0 ? "missing-items" : "ready";

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-title-trade-passport">
                Trade Passport
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Identity, compliance status, and shareable verification credentials
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" data-testid="button-generate-share-link">
              <Share2 className="mr-2 h-4 w-4" />
              Generate share link
            </Button>
            <Button data-testid="button-export-passport-pdf">
              <Download className="mr-2 h-4 w-4" />
              Export passport PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {passportStatus === "missing-items" && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Missing information</h3>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {missingItems.map((item, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1 h-1 bg-yellow-600 rounded-full" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button size="sm" variant="outline" className="mt-3" data-testid="button-complete-passport">
                    Complete passport
                  </Button>
                </div>
              </div>
            </div>
          )}

          <TBCard title="Identity & Business (KYB)" state="ready" icon={<Building2 className="h-4 w-4" />} dataTestId="card-kyb">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Company Name</div>
                  <div className="text-sm font-medium">Global Trade Solutions Ltd</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Registration Country</div>
                  <div className="text-sm font-medium">United Kingdom</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Company Registration No.</div>
                  <div className="text-sm font-medium">GB123456789</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">LEI Code</div>
                  <div className="text-sm font-medium">213800ABCDEFGH1234</div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-xs text-muted-foreground">
                  KYB verification complete
                </span>
              </div>
            </div>
          </TBCard>

          <TBCard title="Beneficial Ownership (UBO)" state={uboStatus === "pending" ? "warn" : "ready"} icon={<Users className="h-4 w-4" />} dataTestId="card-ubo">
            <div className="space-y-3">
              {uboStatus === "pending" ? (
                <div className="text-sm text-muted-foreground">
                  Beneficial ownership declaration pending. Upload UBO statement to complete.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <div>
                      <div className="text-sm font-medium">John Smith</div>
                      <div className="text-xs text-muted-foreground">45% ownership</div>
                    </div>
                    <TBChip tone="success" dataTestId="chip-ubo-verified">Verified</TBChip>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <div>
                      <div className="text-sm font-medium">Jane Doe</div>
                      <div className="text-xs text-muted-foreground">30% ownership</div>
                    </div>
                    <TBChip tone="success" dataTestId="chip-ubo-verified">Verified</TBChip>
                  </div>
                </div>
              )}
              <Button size="sm" variant="outline" data-testid="button-upload-ubo">
                <FileText className="mr-2 h-3 w-3" />
                Upload UBO declaration
              </Button>
            </div>
          </TBCard>

          <TBCard title="Compliance Status" state="idle" icon={<ShieldCheck className="h-4 w-4" />} dataTestId="card-compliance">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">KYC / KYB</span>
                <TBChip
                  tone={kycStatus === "complete" ? "success" : "neutral"}
                  dataTestId="chip-kyc-status"
                >
                  {kycStatus === "complete" ? "Complete" : "Pending"}
                </TBChip>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">AML Screening</span>
                <TBChip
                  tone={amlStatus === "complete" ? "success" : "neutral"}
                  dataTestId="chip-aml-status"
                >
                  {amlStatus === "complete" ? "Clear" : "Pending"}
                </TBChip>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">ESG</span>
                <TBChip
                  tone={esgStatus === "complete" ? "success" : "neutral"}
                  dataTestId="chip-esg-status"
                >
                  {esgStatus === "complete" ? "Verified" : "Pending"}
                </TBChip>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">CBAM / CSRD / SFDR</span>
                <TBChip tone="warn" dataTestId="chip-cbam-status">Scope check required</TBChip>
              </div>
            </div>
          </TBCard>

          <TBCard title="Evidence & Proof Packs" state="idle" icon={<FileText className="h-4 w-4" />} dataTestId="card-evidence">
            <div className="space-y-2">
              {proofPacks.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4 text-center">
                  No proof packs generated yet
                </div>
              ) : (
                proofPacks.slice(0, 5).map((pack) => (
                  <div
                    key={pack.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium">{pack.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {pack.documents.length} documents
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TBChip
                        tone={pack.status === "verified" ? "success" : "neutral"}
                        dataTestId={`chip-pack-status-${pack.id}`}
                      >
                        {pack.status}
                      </TBChip>
                      <Button size="sm" variant="ghost" data-testid={`button-view-pack-${pack.id}`}>
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TBCard>

          <TBCard title="Share & Export Controls" state="idle" icon={<Share2 className="h-4 w-4" />} dataTestId="card-share-controls">
            <div className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-2">Visibility Level</div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={shareLevel === "internal" ? "default" : "outline"}
                    onClick={() => setShareLevel("internal")}
                    data-testid="button-share-internal"
                  >
                    Internal
                  </Button>
                  <Button
                    size="sm"
                    variant={shareLevel === "parties" ? "default" : "outline"}
                    onClick={() => setShareLevel("parties")}
                    data-testid="button-share-parties"
                  >
                    Parties
                  </Button>
                  <Button
                    size="sm"
                    variant={shareLevel === "financier" ? "default" : "outline"}
                    onClick={() => setShareLevel("financier")}
                    data-testid="button-share-financier"
                  >
                    Financier
                  </Button>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {shareLevel === "internal" && "Passport visible only to your organization"}
                {shareLevel === "parties" && "Passport shared with trade counterparties"}
                {shareLevel === "financier" && "Passport shared with financiers for due diligence"}
              </div>
            </div>
          </TBCard>
        </div>
      </div>
    </div>
  );
}
