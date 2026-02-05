import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Briefcase,
  Sparkles,
  Users,
  ShieldCheck,
  Banknote,
  CreditCard,
  FileCheck,
  Settings,
  Plus,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

type NavItem = {
  id: string;
  href: string;
  label: string;
  icon: React.ElementType;
  enabled: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { id: "space", href: "/space", label: "My Space", icon: Briefcase, enabled: true },
  { id: "trade", href: "/trade", label: "Trade Intelligence", icon: Sparkles, enabled: true },
  { id: "network", href: "/network", label: "My Network", icon: Users, enabled: false },
  { id: "compliance", href: "/compliance", label: "Compliance", icon: ShieldCheck, enabled: false },
  { id: "finance", href: "/finance", label: "Finance", icon: Banknote, enabled: false },
  { id: "payments", href: "/payments", label: "Payments", icon: CreditCard, enabled: false },
  { id: "proofs", href: "/proofs", label: "Proofs", icon: FileCheck, enabled: false },
  { id: "settings", href: "/settings", label: "Settings", icon: Settings, enabled: false },
];

const STORAGE_KEY = "traibox-rail-expanded";

interface LeftRailProps {
  onNewTrade: () => void;
}

export function LeftRail({ onNewTrade }: LeftRailProps) {
  const [location, setLocation] = useLocation();
  const [expanded, setExpanded] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(expanded));
  }, [expanded]);

  const isActive = (href: string) => {
    if (href === "/trade") {
      return location === "/trade" || location.startsWith("/trade/");
    }
    return location === href || location.startsWith(href + "/");
  };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        className="flex flex-col h-full bg-sidebar border-r border-border"
        initial={false}
        animate={{ width: expanded ? 220 : 64 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* Header with toggle */}
        <div className={cn(
          "flex items-center h-14 px-3 border-b border-border",
          expanded ? "justify-between" : "justify-center"
        )}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <img src="/traibox-logo.png" alt="TRAIBOX" className="h-6 w-auto" />
              <span className="font-semibold text-sm">TRAIBOX</span>
            </motion.div>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            data-testid="toggle-rail"
          >
            {expanded ? (
              <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
            ) : (
              <PanelLeft className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* New Trade Button */}
        <div className="px-2 py-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onNewTrade}
                className={cn(
                  "w-full gap-2 bg-primary hover:bg-primary/90",
                  !expanded && "px-0"
                )}
                data-testid="btn-new-trade"
              >
                <Plus className="w-4 h-4" />
                {expanded && <span>New Trade</span>}
              </Button>
            </TooltipTrigger>
            {!expanded && (
              <TooltipContent side="right">New Trade</TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            const button = (
              <button
                key={item.id}
                onClick={() => item.enabled && setLocation(item.href)}
                disabled={!item.enabled}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                  expanded ? "justify-start" : "justify-center",
                  active && item.enabled
                    ? "bg-primary/10 text-primary"
                    : item.enabled
                      ? "text-muted-foreground hover:bg-accent hover:text-foreground"
                      : "text-muted-foreground/40 cursor-not-allowed"
                )}
                data-testid={`nav-${item.id}`}
              >
                <Icon className={cn("w-5 h-5 flex-shrink-0", active && "text-primary")} />
                <AnimatePresence>
                  {expanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );

            if (!expanded) {
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>{button}</TooltipTrigger>
                  <TooltipContent side="right" className={!item.enabled ? "opacity-60" : ""}>
                    {item.label}
                    {!item.enabled && " (Coming soon)"}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return button;
          })}
        </nav>

        {/* Footer */}
        <div className="px-2 py-3 border-t border-border">
          <div className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50",
            !expanded && "justify-center"
          )}>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">TB</span>
            </div>
            {expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs"
              >
                <div className="font-medium">Trade Operator</div>
                <div className="text-muted-foreground">Demo Mode</div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
