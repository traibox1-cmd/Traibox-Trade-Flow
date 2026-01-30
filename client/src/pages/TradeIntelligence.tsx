import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Send, Bot, User, AlertCircle, Loader2, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

type Message = {
  role: "user" | "assistant";
  content: string;
  structured?: AIResponse;
};

type AIResponse = {
  summary: string;
  missing_inputs: string[];
  next_actions: { type: string; label: string; description: string }[];
  trade_updates?: {
    title?: string;
    corridor?: string;
    goods?: string;
    value?: number;
    currency?: string;
    incoterms?: string;
    parties?: { name: string; role: string; region: string }[];
  };
};

const MODES = [
  { id: "auto", label: "Auto" },
  { id: "trade-plan", label: "Trade Plan" },
  { id: "compliance", label: "Compliance" },
  { id: "funding", label: "Funding" },
  { id: "payments", label: "Payments" },
  { id: "docs", label: "Docs" },
];

const ACTION_CHIPS = [
  "Plan a new trade",
  "Run compliance check",
  "Request funding",
  "Create payment",
  "Generate proof pack",
];

export default function TradeIntelligence() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState("auto");
  const [pendingTradeUpdates, setPendingTradeUpdates] = useState<AIResponse["trade_updates"] | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { addTrade, addFundingRequest, addComplianceRun, addProofPack, addPayment } = useAppStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (message?: string) => {
    const textToSend = message || input.trim();
    if (!textToSend || loading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({ role: m.role, content: m.content })),
          mode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from TRAIBOX");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let fullContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "..." }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "token") {
                fullContent += data.content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    role: "assistant",
                    content: fullContent,
                  };
                  return newMessages;
                });
              } else if (data.type === "done") {
                try {
                  const structured = JSON.parse(fullContent) as AIResponse;
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                      role: "assistant",
                      content: structured.summary,
                      structured,
                    };
                    return newMessages;
                  });
                  if (structured.trade_updates) {
                    setPendingTradeUpdates(structured.trade_updates);
                  }
                } catch {
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                      role: "assistant",
                      content: fullContent,
                    };
                    return newMessages;
                  });
                }
              } else if (data.type === "error") {
                throw new Error(data.message);
              }
            } catch (parseErr) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const createTradeFromUpdates = (step: "plan" | "compliance" | "funding" | "payments" | "proof-pack") => {
    const updates = pendingTradeUpdates || {};
    const tradeId = addTrade({
      title: updates.title || "New Trade",
      corridor: updates.corridor || "TBD",
      goods: updates.goods || "TBD",
      value: updates.value || 0,
      currency: updates.currency || "USD",
      incoterms: updates.incoterms || "FOB",
      status: "planning",
      timelineStep: step,
      parties: (updates.parties as any) || [
        { name: "Buyer Co", role: "buyer", region: "US" },
        { name: "Seller Co", role: "seller", region: "EU" },
      ],
      documents: [],
    });
    setPendingTradeUpdates(null);
    return tradeId;
  };

  const handleActionClick = (action: { type: string; label: string; description: string }) => {
    if (action.type === "create-trade") {
      const tradeId = createTradeFromUpdates("plan");
      setLocation(`/trade/${tradeId}`);
    } else if (action.type === "compliance") {
      const tradeId = createTradeFromUpdates("compliance");
      addComplianceRun({
        tradeId,
        targetEntity: "Trade Counterparty",
        checks: ["sanctions", "kyc", "documents"],
        status: "passed",
        findings: [{ type: "pass", message: "No sanctions matches found" }],
      });
      setLocation(`/trade/${tradeId}`);
    } else if (action.type === "funding") {
      const updates = pendingTradeUpdates || {};
      const tradeId = createTradeFromUpdates("funding");
      addFundingRequest({
        tradeId,
        amount: updates.value || 100000,
        type: "lc",
        status: "pending",
        requesterName: "Current User",
        notes: `Funding for ${updates.title || "Trade"}`,
      });
      setLocation(`/trade/${tradeId}`);
    } else if (action.type === "payment") {
      const updates = pendingTradeUpdates || {};
      const tradeId = createTradeFromUpdates("payments");
      addPayment({
        tradeId,
        amount: updates.value || 50000,
        currency: updates.currency || "USD",
        beneficiary: "Trade Partner",
        rail: "swift",
        status: "draft",
      });
      setLocation(`/trade/${tradeId}`);
    } else if (action.type === "proof-pack") {
      const updates = pendingTradeUpdates || {};
      const tradeId = createTradeFromUpdates("proof-pack");
      addProofPack({
        tradeId,
        title: `${updates.title || "Trade"} - Proof Pack`,
        documents: ["Commercial Invoice", "Bill of Lading", "Certificate of Origin"],
        status: "ready",
      });
      setLocation(`/trade/${tradeId}`);
    } else if (action.type === "invite-partner") {
      setLocation("/network?tab=invites");
    }
  };

  const renderStructuredResponse = (msg: Message) => {
    if (!msg.structured) {
      return <p className="text-sm leading-relaxed">{msg.content}</p>;
    }

    const { summary, missing_inputs, next_actions } = msg.structured;

    return (
      <div className="space-y-4">
        <p className="text-sm leading-relaxed">{summary}</p>

        {missing_inputs && missing_inputs.length > 0 && (
          <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-3">
            <div className="text-xs font-medium text-yellow-500 mb-2">Missing Information</div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {missing_inputs.map((input, idx) => (
                <li key={idx}>• {input}</li>
              ))}
            </ul>
          </div>
        )}

        {next_actions && next_actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {next_actions.map((action, idx) => (
              <Button
                key={idx}
                variant="secondary"
                size="sm"
                onClick={() => handleActionClick(action)}
                className="rounded-xl shadow-sm"
                data-testid={`action-${action.type}`}
              >
                <Sparkles className="w-3 h-3 mr-2" />
                {action.label}
                <ArrowRight className="w-3 h-3 ml-2" />
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-8 py-4 border-b border-border flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Trade Intelligence</h1>
            <span className="px-2 py-0.5 text-xs font-medium bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 rounded">
              Demo Mode
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">AI-powered trade planning + execution</p>
        </div>
        
        <div className="flex items-center gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              data-testid={`mode-${m.id}`}
              onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors font-medium ${
                mode === m.id
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-card text-muted-foreground border border-border hover:bg-accent"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <div className="flex gap-2 flex-wrap">
            {ACTION_CHIPS.map((chip) => (
              <button
                key={chip}
                data-testid={`chip-${chip.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => handleSend(chip)}
                className="px-3 py-1.5 text-xs bg-card text-muted-foreground border border-border rounded-lg hover:bg-accent transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold mb-2">TRAIBOX AI</h2>
              <p className="text-muted-foreground text-sm max-w-md">
                Describe your trade and I'll help you plan it, run compliance, arrange funding, set up payments, and generate proof packs.
              </p>
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-4 ${msg.role === "user" ? "justify-end" : ""}`}
                  data-testid={`message-${idx}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border"
                    }`}
                  >
                    {msg.role === "assistant" && msg.content === "..." ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Thinking...
                      </div>
                    ) : msg.role === "assistant" ? (
                      renderStructuredResponse(msg)
                    ) : (
                      <p className="text-sm">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {error && (
          <div className="px-8 py-3 bg-destructive/10 border-t border-destructive/20">
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          </div>
        )}

        <div className="px-8 py-4 border-t border-border">
          <div className="max-w-3xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe your trade or ask about compliance, funding, payments..."
              className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              data-testid="input-chat"
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="px-6 rounded-xl"
              data-testid="button-send"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
