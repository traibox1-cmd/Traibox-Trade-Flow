import { Check, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TradeTimelineStep, Trade } from "@/lib/store";

const STEPS: { key: TradeTimelineStep; label: string; cta: string }[] = [
  { key: "plan", label: "Plan", cta: "Generate Plan" },
  { key: "compliance", label: "Verify", cta: "Run Checks" },
  { key: "funding", label: "Finance", cta: "Request Offers" },
  { key: "payments", label: "Pay", cta: "Create Payment" },
  { key: "proof-pack", label: "Prove", cta: "Generate Proof Pack" },
];

interface StepsTimelineProps {
  trade: Trade | null;
  onStepAction?: (step: TradeTimelineStep) => void;
}

export function StepsTimeline({ trade, onStepAction }: StepsTimelineProps) {
  const currentStep = trade?.timelineStep || "plan";
  const currentIndex = STEPS.findIndex(s => s.key === currentStep);

  return (
    <div className="space-y-3">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isPending = index > currentIndex;

        return (
          <div
            key={step.key}
            className={`relative flex items-start gap-3 p-3 rounded-xl transition-colors ${
              isCurrent ? "bg-primary/5 border border-primary/20" : "hover:bg-accent/50"
            }`}
          >
            {/* Timeline line */}
            {index < STEPS.length - 1 && (
              <div
                className={`absolute left-[22px] top-[40px] w-0.5 h-[calc(100%-16px)] ${
                  isCompleted ? "bg-primary" : "bg-border"
                }`}
              />
            )}

            {/* Step indicator */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                isCompleted
                  ? "bg-primary text-primary-foreground"
                  : isCurrent
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {isCompleted ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Circle className="w-3 h-3" />
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm font-medium ${
                    isPending ? "text-muted-foreground" : ""
                  }`}
                >
                  {step.label}
                </span>
              </div>
              
              {isCurrent && trade && (
                <Button
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => onStepAction?.(step.key)}
                  data-testid={`step-cta-${step.key}`}
                >
                  {step.cta}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
