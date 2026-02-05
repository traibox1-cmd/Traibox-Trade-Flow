import { AlertCircle } from "lucide-react";
import { CardFrame } from "./CardFrame";

interface ErrorRetryCardProps {
  error: string;
  onRetry: () => void;
  traceId?: string;
}

export function ErrorRetryCard({ error, onRetry, traceId }: ErrorRetryCardProps) {
  return (
    <CardFrame
      title="Error"
      status={{ label: "Failed", color: "bg-red-500/10 text-red-600 border-red-500/30" }}
      primaryCta={{ label: "Retry", onClick: onRetry }}
      traceId={traceId}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    </CardFrame>
  );
}
