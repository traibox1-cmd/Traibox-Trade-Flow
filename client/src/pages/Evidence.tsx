import { FileCheck, Download, CheckCircle2, Shield, Clock } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { TBChip } from "@/components/tb/TBChip";

export default function Evidence() {
  const { proofPacks, updateProofPack, addNotification, addTimelineEvent } = useAppStore();

  const handleVerify = (packId: string) => {
    const pack = proofPacks.find(p => p.id === packId);
    if (!pack) return;

    updateProofPack(packId, { status: 'verified' });

    addTimelineEvent({
      tradeId: pack.tradeId,
      type: 'verified',
      actor: 'Financier - Evidence Team',
      message: `Proof pack "${pack.title}" verified`,
    });

    addNotification({
      type: 'proof-verified',
      targetRole: 'operator',
      tradeId: pack.tradeId,
      message: `Proof pack "${pack.title}" has been verified by Financier`,
    });
  };

  const handleExport = (packId: string) => {
    const pack = proofPacks.find(p => p.id === packId);
    if (!pack) return;

    const content = `PROOF PACK EXPORT\n\nTitle: ${pack.title}\nStatus: ${pack.status}\nDocuments:\n${pack.documents.map(d => `- ${d}`).join('\n')}\n\nExported: ${new Date().toLocaleString()}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pack.title.replace(/\s+/g, '-')}-${pack.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusTone = (status: string) => {
    switch (status) {
      case 'verified': return 'success';
      case 'ready': return 'neutral';
      default: return 'warn';
    }
  };

  const getAnchoringReceipt = (packId: string) => {
    return {
      hash: `0x${packId.substring(6, 18)}...${Math.random().toString(16).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
      blockchain: 'Ethereum Sepolia',
    };
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-6 border-b border-border">
        <div className="flex items-center gap-2">
          <FileCheck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-title-evidence">
            Evidence
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Review and verify proof packs</p>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto space-y-4">
          {proofPacks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileCheck className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No proof packs available</p>
              <p className="text-sm text-muted-foreground">Documentation from operators will appear here</p>
            </div>
          ) : (
            proofPacks.map((pack) => {
              const receipt = pack.status === 'verified' ? getAnchoringReceipt(pack.id) : null;
              
              return (
                <div key={pack.id} className="rounded-2xl border bg-card p-6" data-testid={`proof-pack-${pack.id}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{pack.title}</h3>
                        <TBChip tone={getStatusTone(pack.status)} dataTestId={`chip-status-${pack.id}`}>
                          {pack.status}
                        </TBChip>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {pack.documents.length} documents • Created {new Date(pack.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4 mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Documents:</p>
                    <div className="space-y-1">
                      {pack.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {receipt && (
                    <div className="rounded-xl border bg-primary/5 p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Anchoring Receipt</span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Hash:</span>
                          <code className="text-xs font-mono">{receipt.hash}</code>
                        </div>
                        <div className="flex justify-between">
                          <span>Blockchain:</span>
                          <span>{receipt.blockchain}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Timestamp:</span>
                          <span>{new Date(receipt.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    {pack.status !== 'verified' && (
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => handleVerify(pack.id)}
                        data-testid={`verify-${pack.id}`}
                      >
                        <FileCheck className="w-4 h-4 mr-2" />
                        Verify Documents
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleExport(pack.id)}
                      data-testid={`export-${pack.id}`}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Pack
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
