import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Send, Bot, User, AlertCircle, Loader2, Sparkles, ArrowRight, Paperclip, X, Mic, Camera, Upload, Plus, Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAppStore, type TradeDocument } from "@/lib/store";

type FileAttachment = {
  name: string;
  type: string;
  size: number;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  structured?: AIResponse;
  attachments?: FileAttachment[];
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
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState("auto");
  const [chatMode, setChatMode] = useState<"trade" | "explore">("explore");
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [pendingTradeUpdates, setPendingTradeUpdates] = useState<AIResponse["trade_updates"] | null>(null);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>("auto");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { trades, addTrade, updateTrade, addFundingRequest, addComplianceRun, addProofPack, addPayment, aiStatus, setAIStatus } = useAppStore();
  const selectedTrade = trades.find(t => t.id === selectedTradeId);

  // Show prompt immediately when Trade Mode selected without trade
  useEffect(() => {
    if (chatMode === "trade" && !selectedTradeId) {
      // Show prompt immediately on mode switch
      const lastMessage = messages[messages.length - 1];
      const isAlreadyPrompt = lastMessage?.structured?.next_actions?.some(a => a.type === "create-trade" || a.type === "select-trade");
      
      if (!isAlreadyPrompt) {
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: "To use Trade Mode, please select or create a trade first.",
            structured: {
              summary: "Trade Mode requires a trade context to execute workflows.",
              missing_inputs: [],
              next_actions: [
                { type: "create-trade", label: "Create Trade", description: "Create a new trade to get started" },
                { type: "select-trade", label: "Select Trade", description: "Choose an existing trade" },
              ],
            },
          },
        ]);
      }
    }
  }, [chatMode, selectedTradeId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newAttachments: FileAttachment[] = Array.from(files).map(file => ({
      name: file.name,
      type: file.type || 'other',
      size: file.size,
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async (message?: string) => {
    const textToSend = message || input.trim();
    if (!textToSend || loading) return;

    // Check if Trade Mode without trade selected
    if (chatMode === "trade" && !selectedTradeId) {
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: textToSend,
        },
        {
          role: "assistant",
          content: "To use Trade Mode, please select or create a trade first.",
          structured: {
            summary: "Trade Mode requires a trade context to execute workflows.",
            missing_inputs: [],
            next_actions: [
              { type: "create-trade", label: "Create Trade", description: "Create a new trade to get started" },
              { type: "select-trade", label: "Select Trade", description: "Choose an existing trade" },
            ],
          },
        },
      ]);
      setInput("");
      return;
    }

    const userMessage: Message = { 
      role: "user", 
      content: textToSend,
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    // In Trade mode, save attachments to trade documents
    if (chatMode === "trade" && selectedTradeId && attachments.length > 0) {
      const tradeDocuments: TradeDocument[] = attachments.map((att, idx) => ({
        id: `doc-${Date.now()}-${idx}`,
        name: att.name,
        type: att.type.includes('pdf') ? 'pdf' : att.type.includes('image') ? 'image' : 'other',
        uploadedAt: new Date(),
        extractedFields: { preview: "Content preview unavailable until backend extraction" }
      }));

      const currentTrade = trades.find(t => t.id === selectedTradeId);
      if (currentTrade) {
        updateTrade(selectedTradeId, {
          uploadedDocuments: [...(currentTrade.uploadedDocuments || []), ...tradeDocuments]
        });
      }
    }

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachments([]);
    setLoading(true);
    setStreaming(true);
    setError(null);

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({ 
            role: m.role, 
            content: m.content,
            attachments: m.attachments 
          })),
          mode,
          chatMode,
          tradeContext: chatMode === "trade" && selectedTrade ? {
            id: selectedTrade.id,
            title: selectedTrade.title,
            corridor: selectedTrade.corridor,
            goods: selectedTrade.goods,
            value: selectedTrade.value,
            currency: selectedTrade.currency,
            incoterms: selectedTrade.incoterms,
            parties: selectedTrade.parties,
            timelineStep: selectedTrade.timelineStep,
          } : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from TRAIBOX");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let fullContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

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
                  setAIStatus('connected');
                } catch {
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                      role: "assistant",
                      content: fullContent,
                    };
                    return newMessages;
                  });
                  // Fallback recovery - no status update needed
                  if (process.env.NODE_ENV === 'development') {
                    console.log('JSON parse recovered with plain text fallback');
                  }
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
      setStreaming(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
      }));
      
      setAttachments(prev => [...prev, ...newFiles]);
      
      // If no messages yet, create a "Create Trade from Documents" action
      if (messages.length === 0) {
        const fileNames = newFiles.map(f => f.name).join(", ");
        setMessages([
          {
            role: "user",
            content: `I've uploaded ${newFiles.length} document(s): ${fileNames}`,
            attachments: newFiles,
          },
          {
            role: "assistant",
            content: "I can help you create a trade from these documents.",
            structured: {
              summary: "I can analyze these documents and create a trade plan with extracted details.",
              missing_inputs: [],
              next_actions: [
                {
                  type: "create-trade",
                  label: "Create Trade from Documents",
                  description: "Extract trade details from uploaded documents and create a new trade",
                }
              ],
            },
          },
        ]);
        setAttachments([]);
      }
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
      linkedParties: [],
      uploadedDocuments: [],
      logisticsMilestones: [],
      logisticsEvents: [],
      logisticsVisibility: "internal",
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
          <div className="space-y-2 mt-3">
            {next_actions.map((action, idx) => {
              const getDeepLink = () => {
                if (selectedTradeId) {
                  if (action.type === "compliance") return `/trade/${selectedTradeId}#compliance`;
                  if (action.type === "funding") return `/finance?tab=funding`;
                  if (action.type === "payment") return `/finance?tab=payments`;
                  if (action.type === "proof-pack") return `/compliance?tab=proofs`;
                  if (action.type === "invite-partner") return `/network?tab=invites`;
                }
                return null;
              };

              const deepLink = getDeepLink();

              return (
                <div key={idx} className="rounded-xl border bg-card p-3 flex items-start gap-3">
                  <div className="flex-1">
                    <div className="text-sm font-semibold mb-1">{action.label}</div>
                    <div className="text-xs text-muted-foreground">{action.description}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleActionClick(action)}
                      className="rounded-xl shadow-sm"
                      data-testid={`action-${action.type}`}
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      {action.label}
                    </Button>
                    {deepLink && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setLocation(deepLink)}
                        className="text-xs px-2"
                        data-testid={`action-open-${action.type}`}
                      >
                        Open
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-8 py-4 border-b border-border flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">Trade Intelligence</h1>
            {aiStatus === 'demo' && (
              <span className="px-2 py-0.5 text-xs font-medium bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 rounded">
                Demo Mode
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-sm text-muted-foreground">AI-powered trade planning + execution</p>
            {selectedTrade && (
              <span className="text-xs text-muted-foreground">
                • Context: <span className="font-medium text-primary">Trade {selectedTrade.id}</span>
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={selectedTradeId || ''}
            onChange={(e) => setSelectedTradeId(e.target.value || null)}
            className="text-sm bg-card border border-border rounded-lg px-3 py-1.5 text-foreground"
            data-testid="select-trade-context"
          >
            <option value="">No trade selected</option>
            {trades.map((trade) => (
              <option key={trade.id} value={trade.id}>
                {trade.title} ({trade.id})
              </option>
            ))}
          </select>
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

        <div 
          className="flex-1 overflow-y-auto px-8 py-6"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {messages.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-full text-center transition-all ${dragActive ? 'scale-105' : ''}`}>
              <div className={`w-32 h-32 rounded-3xl border-2 border-dashed flex items-center justify-center mb-6 transition-all ${dragActive ? 'border-primary bg-primary/10' : 'border-border bg-muted/30'}`}>
                <Upload className={`w-12 h-12 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <h2 className="text-lg font-semibold mb-2">
                {dragActive ? "Drop files to start a trade" : "TRAIBOX AI"}
              </h2>
              <p className="text-muted-foreground text-sm max-w-md mb-4">
                {dragActive 
                  ? "I'll analyze your documents and help you create a trade plan with extracted details" 
                  : "Describe your trade, or drop documents to start. I'll help you plan, run compliance, arrange funding, and generate proof packs."
                }
              </p>
              {!dragActive && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="button-upload-docs"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Documents
                </Button>
              )}
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
                    {msg.role === "assistant" && (msg.content === "" || msg.content === "...") ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Thinking...
                      </div>
                    ) : msg.role === "assistant" ? (
                      renderStructuredResponse(msg)
                    ) : (
                      <div>
                        <p className="text-sm">{msg.content}</p>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {msg.attachments.map((att, attIdx) => (
                              <div key={attIdx} className="text-xs px-2 py-1 rounded bg-primary-foreground/10 border border-primary-foreground/20">
                                📎 {att.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
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
          <div className="max-w-3xl mx-auto space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center rounded-lg border border-border bg-background p-1" data-testid="toggle-chat-mode">
                  <button
                    onClick={() => setChatMode("explore")}
                    className={`px-3 py-1.5 text-xs rounded transition-colors ${
                      chatMode === "explore" 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-accent"
                    }`}
                    data-testid="button-mode-explore"
                  >
                    Explore Mode
                  </button>
                  <button
                    onClick={() => setChatMode("trade")}
                    className={`px-3 py-1.5 text-xs rounded transition-colors ${
                      chatMode === "trade" 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-accent"
                    }`}
                    data-testid="button-mode-trade"
                  >
                    Trade Mode
                  </button>
                </div>
                <div className="px-2.5 py-1 text-[11px] rounded-full bg-muted text-muted-foreground border border-border" data-testid="pill-agent">
                  Agent: {selectedAgent === "auto" ? "Auto" : selectedAgent === "compliance" ? "Compliance Officer" : selectedAgent === "logistics" ? "Logistics Coordinator" : selectedAgent === "finance" ? "Trade Finance Desk" : selectedAgent === "legal" ? "Legal" : "Sustainability"}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {chatMode === "explore" 
                  ? "Explore Mode: Insights, best practices, partners, routes" 
                  : "Trade Mode: Create & execute a trade workflow"}
              </p>
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-muted/50 border border-border">
                {attachments.map((att, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-2 py-1 rounded bg-background border border-border text-xs">
                    <span>📎 {att.name}</span>
                    <button
                      onClick={() => removeAttachment(idx)}
                      className="text-muted-foreground hover:text-foreground"
                      data-testid={`button-remove-attachment-${idx}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,image/*"
                multiple
                className="hidden"
              />
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAttachMenu(!showAttachMenu)}
                  className="px-3"
                  data-testid="button-attach-menu"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                {showAttachMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowAttachMenu(false)}
                    />
                    <div className="absolute bottom-full left-0 mb-2 w-56 rounded-lg border border-border bg-card shadow-lg p-1 z-50">
                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowAttachMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent flex items-center gap-2"
                      data-testid="menu-upload"
                    >
                      <Upload className="w-4 h-4" />
                      Upload documents
                    </button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          disabled
                          className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent flex items-center gap-2 opacity-50"
                          data-testid="menu-voice"
                        >
                          <Mic className="w-4 h-4" />
                          Voice
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Coming soon</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          disabled
                          className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent flex items-center gap-2 opacity-50"
                          data-testid="menu-camera"
                        >
                          <Camera className="w-4 h-4" />
                          Camera
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Coming soon</TooltipContent>
                    </Tooltip>
                    <div className="h-px bg-border my-1" />
                    <button
                      onClick={() => {
                        setShowAgentPicker(true);
                        setShowAttachMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-accent flex items-center gap-2"
                      data-testid="menu-agents"
                    >
                      <Sparkles className="w-4 h-4" />
                      Agents
                    </button>
                  </div>
                  </>
                )}
              </div>
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

      {/* Agent Picker Modal */}
      {showAgentPicker && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowAgentPicker(false)}
        >
          <div 
            className="bg-card rounded-2xl border border-border p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users2 className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Select Agent</h3>
              </div>
              <button
                onClick={() => setShowAgentPicker(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Choose a specialized agent to scope the assistant's responses and suggested actions.
            </p>
            <div className="space-y-2">
              {[
                { id: "auto", label: "Auto", desc: "General trade assistance" },
                { id: "compliance", label: "Compliance Officer", desc: "Sanctions, KYC, and regulatory checks" },
                { id: "logistics", label: "Logistics Coordinator", desc: "Shipping, tracking, and documentation" },
                { id: "finance", label: "Trade Finance Desk", desc: "Funding, payments, and financing" },
                { id: "legal", label: "Legal", desc: "Terms, contracts, and legal compliance" },
                { id: "sustainability", label: "Sustainability", desc: "ESG and sustainability reporting" },
              ].map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => {
                    setSelectedAgent(agent.id);
                    setShowAgentPicker(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedAgent === agent.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 hover:bg-accent"
                  }`}
                  data-testid={`agent-${agent.id}`}
                >
                  <div className="font-medium text-sm">{agent.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{agent.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
