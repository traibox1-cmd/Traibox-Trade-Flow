import { useState, useRef, useEffect, useCallback } from "react";
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
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>("auto");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const watchdogIdRef = useRef<NodeJS.Timeout | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const [thinkingTime, setThinkingTime] = useState(0);
  const [aiMode, setAiMode] = useState<"live" | "demo">("demo");
  const [aiModel, setAiModel] = useState<string>("");
  const [aiLastError, setAiLastError] = useState<string | null>(null);
  
  const { trades, addTrade, updateTrade, addFundingRequest, addComplianceRun, addProofPack, addPayment, aiStatus, setAIStatus, fetchTradesFromAPI } = useAppStore();

  // Fetch AI status on mount
  useEffect(() => {
    fetch("/api/ai/status")
      .then(res => res.json())
      .then(data => {
        setAiMode(data.mode || "demo");
        setAiModel(data.model || "");
        setAiLastError(data.lastError || null);
        setAIStatus(data.mode === "live" ? "connected" : "demo");
      })
      .catch(() => setAiMode("demo"));
  }, [setAIStatus]);

  // Fetch trades from API on mount
  useEffect(() => {
    fetchTradesFromAPI();
  }, [fetchTradesFromAPI]);

  // Handle ?trade= query parameter for deep linking from My Space
  const [pendingTradeIdFromUrl, setPendingTradeIdFromUrl] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('trade');
    }
    return null;
  });

  useEffect(() => {
    if (pendingTradeIdFromUrl && trades.length > 0) {
      const trade = trades.find(t => t.id === pendingTradeIdFromUrl);
      if (trade) {
        setSelectedTradeId(pendingTradeIdFromUrl);
        setChatMode("trade");
        setPendingTradeIdFromUrl(null);
        // Clean URL
        window.history.replaceState(null, "", "/intelligence");
      }
    }
  }, [trades, pendingTradeIdFromUrl]);

  const selectedTrade = trades.find(t => t.id === selectedTradeId);

  const AI_TIMEOUT_MS = 12000; // 12 second total timeout (server sends heartbeats every 2s)
  const WATCHDOG_MS = 5000; // 5 second watchdog - server sends heartbeats every 2s to keep alive

  // Show prompt immediately when Trade Mode selected without trade
  useEffect(() => {
    if (chatMode === "trade" && !selectedTradeId) {
      // Show prompt immediately on mode switch
      const lastMessage = messages[messages.length - 1];
      const isAlreadyPrompt = lastMessage?.structured?.actions?.some(a => a.type === "create-trade" || a.type === "select-trade");
      
      if (!isAlreadyPrompt) {
        setMessages(prev => [
          ...prev,
          {
            role: "assistant",
            content: "",
            structured: {
              assistant_text: "To use **Trade Mode**, please select or create a trade first.\n\nTrade Mode lets you execute workflows like compliance checks, funding requests, and document generation scoped to a specific trade.",
              actions: [
                { type: "create-trade", label: "Create Trade", description: "Create a new trade to get started" },
                { type: "select-trade", label: "Select Trade", description: "Choose an existing trade from your trades" },
              ],
              meta: { mode: "trade" }
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

  // Track thinking time for visual feedback
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (loading || streaming) {
      setThinkingTime(0);
      interval = setInterval(() => {
        setThinkingTime(t => t + 1);
      }, 1000);
    } else {
      setThinkingTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading, streaming]);

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

    // In Trade Mode without a trade, we still send the message but will include 
    // create/select actions in the response for workflow-related queries
    const needsTradeContext = chatMode === "trade" && !selectedTradeId;

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
    setLastUserMessage(textToSend);

    // Create abort controller for timeout
    abortControllerRef.current = new AbortController();
    
    // Set up timeout
    timeoutIdRef.current = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }, AI_TIMEOUT_MS);

    try {
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({ 
            role: m.role, 
            content: m.content,
            attachments: m.attachments 
          })),
          mode,
          chatMode,
          agent: selectedAgent,
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

      // Clear timeout on successful response start
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }

      if (!response.ok) {
        throw new Error("Failed to get response from TRAIBOX");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let fullContent = "";

      // Reset watchdog function - call this each time we receive data
      // Aborts if no activity for WATCHDOG_MS (handles both initial and mid-stream stalls)
      const resetWatchdog = () => {
        if (watchdogIdRef.current) {
          clearTimeout(watchdogIdRef.current);
        }
        watchdogIdRef.current = setTimeout(() => {
          if (abortControllerRef.current) {
            console.warn("Watchdog: Stream stalled, aborting after no activity");
            abortControllerRef.current.abort();
          }
        }, WATCHDOG_MS);
      };

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      
      // Start watchdog for initial connection
      resetWatchdog();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "thinking" || data.type === "heartbeat") {
                // Server is processing - reset watchdog to prevent timeout during AI processing
                // Heartbeats sent every 2s keep connection alive during OpenAI processing
                resetWatchdog();
                continue;
              }

              if (data.type === "token") {
                if (typeof data.content !== "string") {
                  console.warn("Invalid token data received:", data);
                  continue;
                }
                resetWatchdog(); // Reset watchdog on each token to detect mid-stream stalls
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
                  const parsed = JSON.parse(fullContent);
                  // Handle legacy format with summary/next_actions
                  const structured: AIResponse = parsed.assistant_text ? parsed : {
                    assistant_text: parsed.summary || fullContent,
                    actions: parsed.next_actions || [],
                    trade_updates: parsed.trade_updates,
                    meta: { mode: chatMode }
                  };
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                      role: "assistant",
                      content: "",
                      structured,
                    };
                    return newMessages;
                  });
                  if (structured.trade_updates) {
                    setPendingTradeUpdates(structured.trade_updates);
                  }
                  setAIStatus('connected');
                } catch {
                  // Fallback: if JSON parse fails, show as plain text or create structured response
                  if (fullContent.trim()) {
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      newMessages[newMessages.length - 1] = {
                        role: "assistant",
                        content: "",
                        structured: {
                          assistant_text: fullContent,
                          meta: { mode: chatMode }
                        }
                      };
                      return newMessages;
                    });
                  } else {
                    setMessages((prev) => {
                      const newMessages = [...prev];
                      newMessages[newMessages.length - 1] = {
                        role: "assistant",
                        content: fullContent || "I received your message but couldn't generate a complete response. Please try again.",
                      };
                      return newMessages;
                    });
                  }
                }
              } else if (data.type === "error") {
                throw new Error(data.message);
              }
            } catch (parseErr) {
              if (parseErr instanceof Error && !line.includes('{"type":"token"')) {
                console.warn("SSE parse error:", parseErr.message, "Line:", line.substring(0, 100));
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Chat error:", err, err instanceof Error ? err.message : "", err instanceof Error ? err.stack : "");
      const isAbort = err instanceof Error && err.name === 'AbortError';
      const errorMessage = isAbort 
        ? "Connection stalled. The AI didn't respond in time."
        : err instanceof Error ? err.message : "An error occurred";
      
      // Replace the empty assistant message with error message
      setMessages((prev) => {
        const lastIndex = prev.length - 1;
        if (lastIndex >= 0 && prev[lastIndex].role === "assistant" && !prev[lastIndex].content && !prev[lastIndex].structured) {
          const newMessages = [...prev];
          newMessages[lastIndex] = {
            role: "assistant",
            content: "",
            structured: {
              assistant_text: `**Error:** ${errorMessage}\n\nPlease try again or rephrase your question.`,
              actions: [{ type: "retry", label: "Retry", description: "Try sending the message again" }],
              meta: { mode: chatMode }
            }
          };
          return newMessages;
        }
        return prev;
      });
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setStreaming(false);
      setThinkingTime(0);
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      if (watchdogIdRef.current) {
        clearTimeout(watchdogIdRef.current);
        watchdogIdRef.current = null;
      }
      abortControllerRef.current = null;
    }
  };

  const handleRetry = useCallback(() => {
    if (lastUserMessage) {
      setError(null);
      // Remove the last error message
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg?.structured?.actions?.some(a => a.type === "retry")) {
          return prev.slice(0, -1);
        }
        return prev;
      });
      handleSend(lastUserMessage);
    }
  }, [lastUserMessage]);

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
            content: "",
            structured: {
              assistant_text: "I can analyze these documents and **create a trade plan** with extracted details.\n\nI'll look for:\n• Trade corridors and parties\n• Product/commodity information\n• Values and payment terms\n• Shipping and logistics details",
              actions: [
                {
                  type: "create-trade",
                  label: "Create Trade from Documents",
                  description: "Extract trade details and create a new trade workspace",
                }
              ],
              meta: { mode: "explore" }
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
    } else if (action.type === "retry") {
      handleRetry();
    }
  };

  // Render markdown-like text with basic formatting
  const renderMarkdownText = (text: string) => {
    // Split by double newlines for paragraphs
    const paragraphs = text.split(/\n\n+/);
    
    return paragraphs.map((para, pIdx) => {
      // Handle bullet points
      if (para.includes('\n•') || para.startsWith('•')) {
        const lines = para.split('\n');
        return (
          <div key={pIdx} className="space-y-1">
            {lines.map((line, lIdx) => {
              if (line.startsWith('•')) {
                return <div key={lIdx} className="text-sm leading-relaxed pl-2">{renderInlineFormatting(line)}</div>;
              }
              return <div key={lIdx} className="text-sm leading-relaxed font-medium">{renderInlineFormatting(line)}</div>;
            })}
          </div>
        );
      }
      return <p key={pIdx} className="text-sm leading-relaxed">{renderInlineFormatting(para)}</p>;
    });
  };

  // Render inline **bold** formatting
  const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderStructuredResponse = (msg: Message) => {
    if (!msg.structured) {
      return <p className="text-sm leading-relaxed">{msg.content}</p>;
    }

    const { assistant_text, actions } = msg.structured;

    return (
      <div className="space-y-4">
        <div className="space-y-3">
          {renderMarkdownText(assistant_text)}
        </div>

        {actions && actions.length > 0 && (
          <div className="pt-3 border-t border-border/50">
            <div className="text-xs text-muted-foreground font-medium mb-2">Suggested Actions</div>
            <div className={actions.length > 3 ? "flex gap-3 overflow-x-auto pb-2 -mx-1 px-1" : "space-y-2"}>
            {actions.slice(0, 5).map((action, idx) => {
              const getDeepLink = () => {
                if (selectedTradeId) {
                  if (action.type === "compliance") return `/trade/${selectedTradeId}#compliance`;
                  if (action.type === "funding") return `/finance?tab=funding`;
                  if (action.type === "payment") return `/finance?tab=payments`;
                  if (action.type === "proof-pack") return `/compliance?tab=proof-packs`;
                  if (action.type === "invite-partner") return `/network?tab=invites`;
                }
                return null;
              };

              const deepLink = getDeepLink();

              return (
                <div 
                  key={idx} 
                  className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm hover:shadow-md transition-shadow flex items-start gap-3 min-w-[260px] flex-shrink-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{action.label}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{action.description}</div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleActionClick(action)}
                      className="rounded-xl"
                      data-testid={`action-${action.type}`}
                    >
                      {action.label}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              );
            })}
            </div>
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
          <div className="flex items-center gap-2">
            <select
              value={selectedTradeId || ''}
              onChange={(e) => setSelectedTradeId(e.target.value || null)}
              className="text-sm bg-card border border-border rounded-lg px-3 py-1.5 text-foreground min-w-[180px]"
              data-testid="select-trade-context"
            >
              <option value="">Select trade...</option>
              {trades.map((trade) => (
                <option key={trade.id} value={trade.id}>
                  {trade.title}
                </option>
              ))}
            </select>
            {selectedTrade && (
              <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${
                selectedTrade.status === 'active' 
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' 
                  : selectedTrade.status === 'planning' 
                    ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                    : selectedTrade.status === 'completed'
                      ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                      : 'bg-muted text-muted-foreground border-border'
              }`} data-testid="pill-trade-status">
                {selectedTrade.status?.charAt(0).toUpperCase() + selectedTrade.status?.slice(1) || 'Planning'}
              </span>
            )}
          </div>
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
                    {(() => {
                      // Proper structured response detection
                      const hasStructured = msg.role === "assistant" && 
                        msg.structured != null && 
                        (typeof msg.structured !== "object" || Object.keys(msg.structured).length > 0);
                      const isThinking = msg.role === "assistant" && 
                        !hasStructured && 
                        (msg.content === "" || msg.content === "...");
                      
                      if (isThinking) {
                        return (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Thinking{thinkingTime > 2 ? ` (${thinkingTime}s)` : "..."}</span>
                          </div>
                        );
                      }
                      if (msg.role === "assistant") {
                        return renderStructuredResponse(msg);
                      }
                      // User messages
                      return (
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
                      );
                    })()}
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
                  Agent: {selectedAgent === "auto" ? "Auto" : selectedAgent === "trade-planner" ? "Trade Planner" : selectedAgent === "compliance" ? "Compliance Officer" : selectedAgent === "finance" ? "Finance Advisor" : "Auto"}
                </div>
                <div 
                  className={`px-2.5 py-1 text-[11px] rounded-full border flex items-center gap-1.5 ${
                    aiLastError
                      ? "bg-destructive/10 text-destructive border-destructive/30"
                      : aiMode === "live" 
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" 
                        : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                  }`}
                  data-testid="pill-ai-status"
                  title={aiLastError ? `Last error: ${aiLastError}` : `Model: ${aiModel}`}
                >
                  AI: {aiMode === "live" ? "Live" : "Demo"}
                  {aiModel && <span className="opacity-60">({aiModel})</span>}
                  {aiLastError && <AlertCircle className="w-3 h-3" />}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {chatMode === "explore" 
                  ? "Ask anything. Get insights + recommendations." 
                  : "Execute workflows for a selected trade."}
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

            {/* Trade Mode banner when no trade selected */}
            {chatMode === "trade" && !selectedTradeId && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-2" data-testid="banner-no-trade">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">Trade Mode needs a trade context.</span>
                <div className="flex gap-2 ml-auto">
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => {
                    handleActionClick({ type: "create-trade", label: "Create Trade", description: "Create a new trade" });
                  }} data-testid="button-create-trade-banner">
                    <Plus className="w-3 h-3 mr-1" />
                    Create Trade
                  </Button>
                  <select
                    value=""
                    onChange={(e) => e.target.value && setSelectedTradeId(e.target.value)}
                    className="h-7 text-xs bg-background border border-border rounded px-2"
                    data-testid="select-trade-banner"
                  >
                    <option value="">Select Trade</option>
                    {trades.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Agent selector chip - visible and discoverable */}
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setShowAgentPicker(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-border bg-background hover:border-primary/50 hover:bg-accent transition-colors"
                data-testid="button-agent-selector"
              >
                <Sparkles className="w-3 h-3 text-primary" />
                <span className="font-medium">
                  {selectedAgent === "auto" ? "Auto" : 
                   selectedAgent === "trade-planner" ? "Trade Planner" : 
                   selectedAgent === "compliance" ? "Compliance Officer" : 
                   selectedAgent === "finance" ? "Finance Advisor" : "Auto"}
                </span>
              </button>
              <span className="text-[10px] text-muted-foreground">← Switch agent</span>
            </div>

            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,image/*,.doc,.docx,.xls,.xlsx"
                multiple
                className="hidden"
              />
              
              {/* Paperclip - Upload button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3"
                    data-testid="button-attach"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach files</TooltipContent>
              </Tooltip>

              {/* Microphone - Coming soon */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled
                    className="px-3 opacity-50"
                    data-testid="button-mic"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Voice input - Coming soon</TooltipContent>
              </Tooltip>

              {/* Camera - Coming soon */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled
                    className="px-3 opacity-50"
                    data-testid="button-camera"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Camera capture - Coming soon</TooltipContent>
              </Tooltip>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Describe your trade or ask about compliance, funding, payments..."
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[44px] max-h-32"
                rows={1}
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
                { id: "auto", label: "Auto", desc: "General trade assistance - automatically adapts to context" },
                { id: "trade-planner", label: "Trade Planner", desc: "Trade structuring, corridors, and workflow planning" },
                { id: "compliance", label: "Compliance Officer", desc: "Sanctions, KYC, and regulatory checks" },
                { id: "finance", label: "Finance Advisor", desc: "Funding, payments, LC, and financing terms" },
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
