import { FileCheck, Download, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export default function Evidence() {
  const { proofPacks } = useAppStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-500/20 text-green-400';
      case 'ready': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2">
          <div
            className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 border border-primary/15"
            aria-hidden="true"
          >
            <FileCheck className="h-4 w-4 text-primary" />
          </div>
          <h1
            className="font-semibold text-2xl tracking-tight md:text-3xl"
            data-testid="text-title-evidence"
          >
            Evidence
          </h1>
        </div>
        <p className="text-sm text-muted-foreground" data-testid="text-subtitle-evidence">
          Review proof packs and trade documentation
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {proofPacks.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center">
            <FileCheck className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No proof packs available. Documentation from operators will appear here.</p>
          </div>
        ) : (
          proofPacks.map((pack) => (
            <div key={pack.id} className="rounded-2xl border bg-card p-6" data-testid={`proof-pack-${pack.id}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{pack.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {pack.documents.length} documents • Created {new Date(pack.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(pack.status)}`}>
                  {pack.status}
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium text-muted-foreground mb-2">Documents:</p>
                <div className="space-y-1">
                  {pack.documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t mt-4">
                <Button size="sm" variant="default">
                  <FileCheck className="w-4 h-4 mr-2" />
                  Verify Documents
                </Button>
                <Button size="sm" variant="secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Export Pack
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
