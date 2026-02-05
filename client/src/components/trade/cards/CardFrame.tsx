import { ReactNode, useState } from "react";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface CardFrameProps {
  title: string;
  status?: { label: string; color: string };
  children: ReactNode;
  why?: string;
  primaryCta?: { label: string; onClick: () => void };
  traceId?: string;
}

export function CardFrame({ title, status, children, why, primaryCta, traceId }: CardFrameProps) {
  const [showWhy, setShowWhy] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <h4 className="font-medium text-sm">{title}</h4>
          {status && (
            <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${status.color}`}>
              {status.label}
            </span>
          )}
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-accent rounded transition-colors"
            data-testid="card-menu"
          >
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </button>
          
          {showMenu && traceId && (
            <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[150px] z-10">
              <div className="text-[10px] text-muted-foreground">
                Trace ID: <span className="font-mono">{traceId}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        {children}
      </div>

      {/* Why section (collapsible) */}
      {why && (
        <div className="border-t border-border">
          <button
            onClick={() => setShowWhy(!showWhy)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs text-muted-foreground hover:bg-accent/50 transition-colors"
          >
            <span>Why this recommendation?</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showWhy ? "rotate-180" : ""}`} />
          </button>
          
          <AnimatePresence>
            {showWhy && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 py-3 bg-muted/30 text-xs text-muted-foreground">
                  {why}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Footer CTA */}
      {primaryCta && (
        <div className="px-4 py-3 border-t border-border">
          <Button onClick={primaryCta.onClick} className="w-full" data-testid="card-cta">
            {primaryCta.label}
          </Button>
        </div>
      )}
    </div>
  );
}
