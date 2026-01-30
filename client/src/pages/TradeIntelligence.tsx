import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, AlertCircle, Loader2 } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ActionCard = {
  id: string;
  title: string;
  type: string;
  description: string;
};

const MODES = [
  { id: "auto", label: "Auto" },
  { id: "trade-plan", label: "Trade Plan" },
  { id: "compliance", label: "Compliance" },
  { id: "funding", label: "Funding" },
  { id: "payments", label: "Payments" },
  { id: "docs", label: "Docs" },
  { id: "contracts", label: "Contracts" },
  { id: "track", label: "Track & Trace" },
];

const ACTION_CHIPS = [
  "Run compliance check",
  "Request funding",
  "Create payment",
  "Generate proof pack",
  "Invite partner",
];

export default function TradeIntelligence() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState("auto");
  const [actionCards, setActionCards] = useState<ActionCard[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
          messages: [...messages, userMessage],
          mode,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from TRAIBOX");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let assistantMessage = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));

            if (data.type === "token") {
              assistantMessage += data.content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantMessage,
                };
                return newMessages;
              });
            } else if (data.type === "done") {
              if (data.intents && data.intents.length > 0) {
                const actionDescriptions: Record<string, { title: string; desc: string; route: string }> = {
                  "compliance": { 
                    title: "Run Compliance Check", 
                    desc: "Verify sanctions, KYC, and regulatory compliance for this trade",
                    route: "/compliance-proofs?tab=checks"
                  },
                  "funding": { 
                    title: "Request Trade Funding", 
                    desc: "Explore LC, invoice factoring, or supply chain finance options",
                    route: "/finance?tab=funding"
                  },
                  "payment": { 
                    title: "Create Payment Instruction", 
                    desc: "Set up cross-border payment routing and settlement",
                    route: "/finance?tab=payments"
                  },
                  "proof-pack": { 
                    title: "Generate Proof Pack", 
                    desc: "Create verified document package with invoices, certificates, and compliance records",
                    route: "/compliance-proofs?tab=proofs"
                  },
                  "invite-partner": { 
                    title: "Invite Trade Partner", 
                    desc: "Send private invitation to join this trade network",
                    route: "/network"
                  },
                  "trade-plan": { 
                    title: "Create Trade Plan", 
                    desc: "Structure your trade with milestones, documentation, and risk assessment",
                    route: "/space"
                  },
                };

                const newCards: ActionCard[] = data.intents.map((intent: string, idx: number) => {
                  const info = actionDescriptions[intent] || { 
                    title: intent, 
                    desc: `Action available: ${intent}`,
                    route: "/space"
                  };
                  return {
                    id: `card-${Date.now()}-${idx}`,
                    title: info.title,
                    type: intent,
                    description: info.desc,
                  };
                });
                setActionCards((prev) => [...prev, ...newCards]);
              }
            } else if (data.type === "error") {
              throw new Error(data.message);
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

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-8 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Trade Intelligence</h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered chat + controllers</p>
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

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <div className="flex gap-2 flex-wrap">
              {ACTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  data-testid={`chip-${chip.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => handleSend(chip)}
                  className="px-3 py-1.5 text-xs bg-card text-muted-foreground border border-border rounded-md hover:bg-accent transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto px-8 py-6">
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Bot className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground">Start a conversation with TRAIBOX</h3>
                  <p className="text-sm text-muted-foreground mt-2">Ask about trade operations, compliance, funding, or payments</p>
                </div>
              </div>
            )}

            <div className="space-y-6 max-w-4xl">
              {messages.map((msg, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user" ? "bg-accent" : "bg-primary/20"
                  }`}>
                    {msg.role === "user" ? (
                      <User className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Bot className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className={`text-sm whitespace-pre-wrap ${msg.role === "user" ? "text-foreground" : "text-foreground/90"}`}>
                      {msg.content || (loading && idx === messages.length - 1 ? (
                        <span className="text-muted-foreground flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Thinking...
                        </span>
                      ) : "")}
                    </div>
                  </div>
                </div>
              ))}

              {error && (
                <div className="flex gap-4 text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div className="text-sm">{error}</div>
                </div>
              )}

              {actionCards.map((card) => (
                <div key={card.id} className="bg-card border border-border rounded-2xl p-5 hover:bg-accent/50 transition-colors">
                  <h4 className="text-foreground font-semibold mb-1.5">{card.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
                  <button
                    data-testid={`action-${card.type}`}
                    className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Execute Action
                  </button>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="px-8 py-4 border-t border-border">
            <div className="flex gap-3">
              <input
                data-testid="input-message"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask TRAIBOX anything..."
                disabled={loading}
                className="flex-1 bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder-white/30 focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
              />
              <button
                data-testid="button-send"
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="px-6 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
