import { Sparkles } from "lucide-react";

export default function DealAssistant() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2">
          <div
            className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 border border-primary/15"
            aria-hidden="true"
          >
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h1
            className="font-semibold text-2xl tracking-tight md:text-3xl"
            data-testid="text-title-deal-assistant"
          >
            Deal Assistant
          </h1>
        </div>
        <p className="text-sm text-muted-foreground" data-testid="text-subtitle-deal-assistant">
          AI-powered deal analysis and risk assessment
        </p>
      </div>

      <div className="mt-8 rounded-2xl border bg-card p-6">
        <h3 className="font-semibold text-lg">AI Deal Analysis</h3>
        <p className="mt-2 text-muted-foreground">
          Chat with the AI to analyze deals, assess risks, and get recommendations.
        </p>
        <div className="mt-4 rounded-xl bg-background p-4 text-sm text-muted-foreground">
          Deal Assistant is ready to help analyze funding requests and provide insights.
        </div>
      </div>
    </div>
  );
}
