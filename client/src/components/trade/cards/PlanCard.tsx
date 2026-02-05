import { CardFrame } from "./CardFrame";

interface PlanCardProps {
  summary: string;
  bullets: string[];
  onConfirm: () => void;
  traceId?: string;
}

export function PlanCard({ summary, bullets, onConfirm, traceId }: PlanCardProps) {
  return (
    <CardFrame
      title="Trade Plan"
      status={{ label: "Ready", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" }}
      primaryCta={{ label: "Confirm Plan", onClick: onConfirm }}
      why="This plan was generated based on your trade details and common patterns for similar trade corridors."
      traceId={traceId}
    >
      <div className="space-y-3">
        <p className="text-sm">{summary}</p>
        <ul className="space-y-1.5">
          {bullets.map((bullet, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="text-primary mt-1">•</span>
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </CardFrame>
  );
}
