import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Loader2, Sparkles, Paperclip, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

type FileAttachment = {
  name: string;
  type: string;
  size: number;
};

type ActionCard = {
  type: string;
  label: string;
  description: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  structured?: AIResponse;
  attachments?: FileAttachment[];
};

type AIResponse = {
  assistant_text: string;
  actions?: ActionCard[];
  meta?: { mode?: string; agent?: string; tradeId?: string };
};

const QUICK_ACTIONS = [
  { label: "Plan a trade", prompt: "Help me plan a new international trade" },
  { label: "Check compliance", prompt: "Run a compliance check on my current trade" },
  { label: "Analyze risks", prompt: "What are the key risks for my trade?" },
  { label: "Market trends", prompt: "Show me current market trends and forecasts" },
];

export default function TradeIntelligence() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { trades } = useAppStore();
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const selectedTrade = trades.find(t => t.id === selectedTradeId);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text && attachments.length === 0) return;

    const userMessage: Message = {
      role: "user",
      content: text,
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachments([]);
    setLoading(true);
    setStreaming(false);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          mode: "auto",
          conversationHistory: messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          tradeId: selectedTradeId,
          tradeContext: selectedTrade ? {
            title: selectedTrade.title,
            goods: selectedTrade.goods,
            corridor: selectedTrade.corridor,
            value: selectedTrade.value,
            currency: selectedTrade.currency,
          } : undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      setLoading(false);
      setStreaming(true);

      let fullText = "";
      let structured: AIResponse | undefined;
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "text") {
                fullText += data.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  if (updated[lastIndex]?.role === "assistant") {
                    updated[lastIndex] = { ...updated[lastIndex], content: fullText };
                  } else {
                    updated.push({ role: "assistant", content: fullText });
                  }
                  return updated;
                });
              } else if (data.type === "structured") {
                structured = data.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  const lastIndex = updated.length - 1;
                  if (updated[lastIndex]?.role === "assistant") {
                    updated[lastIndex] = {
                      ...updated[lastIndex],
                      content: structured?.assistant_text || fullText,
                      structured,
                    };
                  }
                  return updated;
                });
              }
            } catch {}
          }
        }
      }

      setStreaming(false);
    } catch {
      setLoading(false);
      setStreaming(false);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I encountered an issue. Please try again.",
        },
      ]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newAttachments = Array.from(files).map((f) => ({
      name: f.name,
      type: f.type,
      size: f.size,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Clean Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Trade Intelligence</h1>
              <p className="text-sm text-muted-foreground">AI-powered trade assistant</p>
            </div>
          </div>
          
          {/* Trade Context Selector */}
          <select
            value={selectedTradeId || ''}
            onChange={(e) => setSelectedTradeId(e.target.value || null)}
            className="text-sm bg-card border border-border rounded-lg px-3 py-2 text-foreground min-w-[200px]"
            data-testid="select-trade-context"
          >
            <option value="">No trade selected</option>
            {trades.map((trade) => (
              <option key={trade.id} value={trade.id}>
                {trade.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">How can I help you today?</h2>
            <p className="text-muted-foreground text-center max-w-md mb-8">
              I can help you plan trades, run compliance checks, analyze risks, and explore market opportunities.
            </p>
            
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 max-w-lg w-full">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleSend(action.prompt)}
                  className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-accent transition-colors text-left group"
                  data-testid={`quick-action-${action.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {action.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-6 py-6 space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  }`}
                >
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {message.attachments.map((att, i) => (
                        <span key={i} className="text-xs bg-black/10 rounded px-2 py-1">
                          {att.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Action Cards */}
                  {message.structured?.actions && message.structured.actions.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {message.structured.actions.map((action, i) => (
                        <button
                          key={i}
                          className="w-full text-left p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors"
                          data-testid={`action-card-${action.type}`}
                        >
                          <span className="text-sm font-medium text-foreground">{action.label}</span>
                          <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {(loading || streaming) && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-card border border-border rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {loading ? "Thinking..." : "Responding..."}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-border bg-background">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((att, index) => (
              <div key={index} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1.5">
                <Paperclip className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-foreground">{att.name}</span>
                <button
                  onClick={() => removeAttachment(index)}
                  className="text-muted-foreground hover:text-foreground"
                  data-testid={`remove-attachment-${index}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your trade, compliance, risks, or market trends..."
              className="w-full resize-none bg-card border border-border rounded-xl px-4 py-3 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[48px] max-h-[120px]"
              rows={1}
              data-testid="input-message"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-3 bottom-3 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="btn-attach-file"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
          
          <Button
            onClick={() => handleSend()}
            disabled={loading || streaming || (!input.trim() && attachments.length === 0)}
            className="h-12 w-12 rounded-xl"
            data-testid="btn-send"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
