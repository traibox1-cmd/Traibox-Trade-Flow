import { HelpCircle } from "lucide-react";
import { CardFrame } from "./CardFrame";

interface PlaceholderCardProps {
  actionType: string;
  traceId?: string;
}

export function PlaceholderCard({ actionType, traceId }: PlaceholderCardProps) {
  return (
    <CardFrame
      title={actionType}
      status={{ label: "Unknown", color: "bg-gray-500/10 text-gray-600 border-gray-500/30" }}
      traceId={traceId}
    >
      <div className="flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground">
          This action type ({actionType}) is not yet supported.
        </p>
      </div>
    </CardFrame>
  );
}
