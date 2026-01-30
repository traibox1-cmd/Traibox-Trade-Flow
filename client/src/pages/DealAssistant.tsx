import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Loader2, AlertTriangle, CheckCircle2, DollarSign } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TBChip } from "@/components/tb/TBChip";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type AIResponse = {
  summary: string;
  risk_assessment?: {
    level: "low" | "medium" | "high";
    factors: string[];
  };
  missing_evidence?: string[];
  recommended_terms?: {
    tenor: number;
    rate: number;
    fees: number;
    conditions: string[];
  };
  next_actions?: Array<string | { type: string; label: string; description: string }>;
};

export default function DealAssistant() {
  const { fundingRequests, trades } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          mode: "deal-assistant",
          context: {
            fundingRequests: fundingRequests.length,
            trades: trades.length,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedChunks = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulatedChunks += decoder.decode(value, { stream: true });
        }
      }

      let parsedResponse: AIResponse | null = null;
      try {
        parsedResponse = JSON.parse(accumulatedChunks);
      } catch (e) {
        console.error("Failed to parse accumulated response:", e);
      }

      const accumulatedText = parsedResponse?.summary || "";

      if (accumulatedText) {
        const assistantMessage: Message = {
          role: "assistant",
          content: accumulatedText,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setAiResponse(parsedResponse);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "I'm having trouble connecting right now. Please try again in a moment.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return "success";
      case "medium":
        return "warn";
      case "high":
        return "error";
      default:
        return "neutral";
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-title-deal-assistant">
            Deal Assistant
          </h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          AI-powered deal analysis and risk assessment
        </p>
      </div>

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="rounded-2xl border bg-card p-8 text-center">
              <Sparkles className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Deal Assistant Ready</h3>
              <p className="text-muted-foreground mb-4">
                Ask me to analyze funding requests, assess risks, or recommend financing terms.
              </p>
              <div className="grid gap-2 text-sm text-left">
                <div className="p-3 rounded-lg bg-muted/50">
                  <strong>Example:</strong> "Analyze the risk for the latest funding request"
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <strong>Example:</strong> "What terms would you recommend for a $200K LC request?"
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <strong>Example:</strong> "What evidence is missing for proper due diligence?"
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border"
                  }`}
                  data-testid={`message-${message.role}-${idx}`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl p-4 bg-card border">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Analyzing...</span>
                  </div>
                </div>
              </div>
            )}

            {aiResponse && (
              <div className="space-y-3">
                {aiResponse.risk_assessment && (
                  <div className="rounded-2xl border bg-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">Risk Assessment</h4>
                      <TBChip tone={getRiskColor(aiResponse.risk_assessment.level)} dataTestId="chip-risk-level">
                        {aiResponse.risk_assessment.level.toUpperCase()}
                      </TBChip>
                    </div>
                    <div className="space-y-2">
                      {aiResponse.risk_assessment.factors.map((factor, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span>{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aiResponse.missing_evidence && aiResponse.missing_evidence.length > 0 && (
                  <div className="rounded-2xl border bg-card p-6">
                    <h4 className="font-semibold mb-3">Missing Evidence</h4>
                    <div className="space-y-2">
                      {aiResponse.missing_evidence.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {aiResponse.recommended_terms && (
                  <div className="rounded-2xl border bg-primary/10 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <h4 className="font-semibold">Recommended Terms</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Tenor</div>
                        <div className="font-medium">{aiResponse.recommended_terms.tenor} days</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Rate</div>
                        <div className="font-medium">{aiResponse.recommended_terms.rate}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Fees</div>
                        <div className="font-medium">${aiResponse.recommended_terms.fees.toLocaleString()}</div>
                      </div>
                    </div>
                    {aiResponse.recommended_terms.conditions.length > 0 && (
                      <div className="mt-4">
                        <div className="text-muted-foreground text-xs mb-2">Conditions</div>
                        <div className="space-y-1">
                          {aiResponse.recommended_terms.conditions.map((condition, idx) => (
                            <div key={idx} className="text-sm">• {condition}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {aiResponse.next_actions && aiResponse.next_actions.length > 0 && (
                  <div className="rounded-2xl border bg-card p-6">
                    <h4 className="font-semibold mb-3">Next Actions</h4>
                    <div className="space-y-2">
                      {aiResponse.next_actions.map((action, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <span className="font-medium text-primary">{idx + 1}.</span>
                          <span>{typeof action === 'string' ? action : action.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-border bg-muted/30">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about deal analysis, risk assessment, or financing terms..."
              className="min-h-[60px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isLoading}
              data-testid="textarea-deal-assistant"
            />
            <Button
              type="submit"
              size="lg"
              disabled={isLoading || !input.trim()}
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
