import { useState, useRef, KeyboardEvent } from "react";
import { Send, Paperclip, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComposerProps {
  onSend: (message: string, mode: "explore" | "execute") => void;
  disabled?: boolean;
}

const AGENTS = [
  { id: "auto", label: "Auto" },
  { id: "finance", label: "Finance" },
  { id: "compliance", label: "Compliance" },
  { id: "logistics", label: "Logistics" },
];

export function Composer({ onSend, disabled }: ComposerProps) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"explore" | "execute">("explore");
  const [agent, setAgent] = useState("auto");
  const [showAgents, setShowAgents] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim(), mode);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border p-4 bg-background">
      {/* Mode and Agent toggles */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setMode("explore")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === "explore" ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
            data-testid="mode-explore"
          >
            Explore
          </button>
          <button
            onClick={() => setMode("execute")}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === "execute" ? "bg-background shadow-sm" : "text-muted-foreground"
            }`}
            data-testid="mode-execute"
          >
            Execute
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowAgents(!showAgents)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-accent transition-colors"
            data-testid="agent-selector"
          >
            Agent: {AGENTS.find(a => a.id === agent)?.label}
            <ChevronDown className="w-3 h-3" />
          </button>
          
          {showAgents && (
            <div className="absolute bottom-full left-0 mb-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[120px] z-10">
              {AGENTS.map(a => (
                <button
                  key={a.id}
                  onClick={() => { setAgent(a.id); setShowAgents(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors ${
                    agent === a.id ? "text-primary" : ""
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input area */}
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === "explore" ? "Ask about this trade..." : "Execute an action..."}
            className="w-full resize-none bg-muted/50 border border-border rounded-xl px-4 py-3 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[48px] max-h-[120px]"
            rows={1}
            disabled={disabled}
            data-testid="chat-input"
          />
          <button
            className="absolute right-3 bottom-3 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            disabled
            data-testid="btn-attach"
          >
            <Paperclip className="w-5 h-5" />
          </button>
        </div>
        
        <Button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          className="h-12 w-12 rounded-xl"
          data-testid="btn-send"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
