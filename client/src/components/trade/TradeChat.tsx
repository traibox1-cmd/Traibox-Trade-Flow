import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import { PlanCard } from "./cards/PlanCard";
import { ErrorRetryCard } from "./cards/ErrorRetryCard";
import { PlaceholderCard } from "./cards/PlaceholderCard";

export type ActionCard = {
  type: string;
  data?: any;
  traceId?: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: ActionCard[];
};

interface TradeChatProps {
  messages: ChatMessage[];
  loading?: boolean;
  onActionClick?: (action: ActionCard) => void;
}

function renderActionCard(action: ActionCard, onAction?: (a: ActionCard) => void) {
  switch (action.type) {
    case "plan":
      return (
        <PlanCard
          key={action.traceId}
          summary={action.data?.summary || "Trade plan generated."}
          bullets={action.data?.bullets || []}
          onConfirm={() => onAction?.(action)}
          traceId={action.traceId}
        />
      );
    case "error":
      return (
        <ErrorRetryCard
          key={action.traceId}
          error={action.data?.message || "An error occurred."}
          onRetry={() => onAction?.(action)}
          traceId={action.traceId}
        />
      );
    default:
      return (
        <PlaceholderCard
          key={action.traceId}
          actionType={action.type}
          traceId={action.traceId}
        />
      );
  }
}

export function TradeChat({ messages, loading, onActionClick }: TradeChatProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Bot className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Trade Intelligence</h3>
        <p className="text-muted-foreground max-w-md">
          Ask questions about your trade, run compliance checks, request funding, or generate proof packs.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {message.role === "assistant" && (
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
          )}
          
          <div className={`max-w-[80%] space-y-3 ${message.role === "user" ? "items-end" : "items-start"}`}>
            <div
              className={`rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
            
            {/* Action cards */}
            {message.actions && message.actions.length > 0 && (
              <div className="space-y-3 w-full max-w-md">
                {message.actions.map(action => renderActionCard(action, onActionClick))}
              </div>
            )}
          </div>
          
          {message.role === "user" && (
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </motion.div>
      ))}
      
      {loading && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div className="bg-card border border-border rounded-2xl px-4 py-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}
      
      <div ref={endRef} />
    </div>
  );
}
