import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useRole } from "@/components/app/role";
import { useAppStore } from "@/lib/store";
import {
  Briefcase,
  Sparkles,
  Handshake,
  Banknote,
  ShieldCheck,
  Settings2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Menu,
  LayoutDashboard,
  Building2,
  AlertTriangle,
  FileCheck,
  Coins,
  TrendingUp,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  testId: string;
  subtitle?: string;
  submenu?: { label: string; href: string; testId: string }[];
};

const OPERATOR_NAV: NavItem[] = [
  { href: "/space", label: "My Space", icon: Briefcase, testId: "nav-space", subtitle: "Home workspace" },
  {
    href: "/trade",
    label: "Intelligence",
    icon: Sparkles,
    testId: "nav-intelligence",
    subtitle: "AI trade assistant",
    submenu: [
      { label: "Chat", href: "/trade", testId: "nav-ti-chat" },
      { label: "Trade Trends", href: "/trade-trends", testId: "nav-ti-trends" },
      { label: "Risk Analysis", href: "/risk-assessment", testId: "nav-ti-risk" },
    ],
  },
  { href: "/network", label: "Network", icon: Handshake, testId: "nav-network", subtitle: "Partners & trust" },
  {
    href: "/finance",
    label: "Finance",
    icon: Banknote,
    testId: "nav-finance",
    subtitle: "Payments & funding",
    submenu: [
      { label: "Payments", href: "/finance?tab=payments", testId: "nav-finance-payments" },
      { label: "Funding", href: "/finance?tab=funding", testId: "nav-finance-funding" },
    ],
  },
  {
    href: "/compliance",
    label: "Compliance",
    icon: ShieldCheck,
    testId: "nav-compliance",
    subtitle: "Checks & proofs",
    submenu: [
      { label: "Checks", href: "/compliance?tab=checks", testId: "nav-cp-checks" },
      { label: "Reports", href: "/compliance?tab=reports", testId: "nav-cp-reports" },
      { label: "Proof Packs", href: "/compliance?tab=proof-packs", testId: "nav-cp-proofs" },
      { label: "Trade Passport", href: "/compliance?tab=passport", testId: "nav-cp-passport" },
      { label: "Track & Trace", href: "/compliance?tab=track", testId: "nav-cp-track" },
    ],
  },
  { href: "/settings", label: "Settings", icon: Settings2, testId: "nav-settings", subtitle: "Preferences" },
];

const FINANCIER_NAV: NavItem[] = [
  { href: "/capital-console", label: "Capital Console", icon: LayoutDashboard, testId: "nav-capital-console", subtitle: "Portfolio view" },
  { href: "/funding-desk", label: "Funding Desk", icon: Banknote, testId: "nav-funding-desk", subtitle: "Deal pipeline" },
  { href: "/deal-assistant", label: "Deal Assistant", icon: Sparkles, testId: "nav-deal-assistant", subtitle: "AI analysis" },
  { href: "/counterparties", label: "Counterparties", icon: Building2, testId: "nav-counterparties", subtitle: "Credit profiles" },
  { href: "/risk-policy", label: "Risk & Policy", icon: AlertTriangle, testId: "nav-risk-policy", subtitle: "Limits & checks" },
  { href: "/settlement", label: "Settlement", icon: Coins, testId: "nav-settlement", subtitle: "Payment tracking" },
  { href: "/evidence", label: "Evidence", icon: FileCheck, testId: "nav-evidence", subtitle: "Due diligence" },
  { href: "/settings", label: "Settings", icon: Settings2, testId: "nav-settings", subtitle: "Preferences" },
];

const STORAGE_KEY = "traibox-rail-expanded";

interface LeftRailProps {
  onNewTrade: () => void;
}

export function LeftRail({ onNewTrade }: LeftRailProps) {
  const [location, setLocation] = useLocation();
  const { role } = useRole();
  const { getUnreadNotifications } = useAppStore();
  const [expanded, setExpanded] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) === "true";
    }
    return false;
  });
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const NAV_ITEMS = role === "operator" ? OPERATOR_NAV : FINANCIER_NAV;
  const unreadNotifications = getUnreadNotifications(role);

  const getNotificationCount = (href: string): number => {
    if (role === "operator" && href === "/finance") {
      return unreadNotifications.filter(n =>
        n.type === 'offer' || n.type === 'info-request' || n.type === 'approval' || n.type === 'rejection'
      ).length;
    }
    if (role === "financier" && href === "/funding-desk") {
      return unreadNotifications.filter(n =>
        n.type === 'info-provided' || n.type === 'approval' || n.type === 'rejection'
      ).length;
    }
    if (role === "financier" && href === "/evidence") {
      return unreadNotifications.filter(n => n.type === 'proof-verified').length;
    }
    return 0;
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(expanded));
  }, [expanded]);

  useEffect(() => {
    const defaultPath = role === "operator" ? "/space" : "/capital-console";
    if (location === "/" || location === "") {
      setLocation(defaultPath);
    }
  }, [role, location, setLocation]);

  const toggleExpanded = () => {
    const next = !expanded;
    setExpanded(next);
    if (!next) setExpandedMenu(null);
  };

  const isActive = (href: string) => {
    if (href === "/trade") {
      return location === "/trade" || location.startsWith("/trade/") || location === "/trade-intelligence";
    }
    return location === href || location.startsWith(href + "?") || location.startsWith(href + "/");
  };

  const handleItemClick = (item: NavItem) => {
    if (item.submenu) {
      if (expanded) {
        setExpandedMenu(expandedMenu === item.href ? null : item.href);
      } else {
        setLocation(item.submenu[0].href);
      }
    } else {
      setLocation(item.href);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        className="hidden md:flex md:flex-col h-full border-r border-border/60 bg-sidebar/80 backdrop-blur-xl supports-[backdrop-filter]:bg-sidebar/60 overflow-hidden"
        initial={false}
        animate={{ width: expanded ? 240 : 72 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        data-testid="nav-rail"
      >
        {/* Header */}
        <div className="flex items-center h-14 px-3 border-b border-border/40">
          <div className="min-w-0 flex items-center gap-2">
            <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center">
              <img
                src="/traibox-logo.png"
                alt="TRAIBOX"
                className="h-6 w-auto object-contain"
                style={{ maxHeight: '24px' }}
              />
            </div>
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-2 overflow-hidden"
                >
                  <span className="font-semibold text-sm tracking-tight whitespace-nowrap">TRAIBOX</span>
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary border border-primary/20 whitespace-nowrap">
                    AI
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex-1" />
          <button
            onClick={toggleExpanded}
            className="p-1.5 hover:bg-accent/60 rounded-lg transition-colors flex-shrink-0"
            data-testid="toggle-rail"
          >
            {expanded ? (
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            ) : (
              <Menu className="w-4 h-4 text-muted-foreground" />
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
                  "w-full gap-2 rounded-xl h-10 font-medium shadow-sm",
                  !expanded && "px-0"
                )}
                data-testid="btn-new-trade"
              >
                <Plus className="w-4 h-4" />
                {expanded && <span className="text-[13px]">New Trade</span>}
              </Button>
            </TooltipTrigger>
            {!expanded && (
              <TooltipContent side="right">New Trade</TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 space-y-0.5" data-testid="nav-primary">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const hasSubmenu = !!item.submenu;
            const submenuOpen = expandedMenu === item.href;
            const notifCount = getNotificationCount(item.href);

            const navButton = (
              <button
                type="button"
                onClick={() => handleItemClick(item)}
                className={cn(
                  "group flex items-center rounded-xl text-left text-sm transition-all duration-150 w-full relative",
                  expanded ? "gap-3 px-2 py-1.5" : "justify-center px-2 py-1.5",
                  active
                    ? "bg-primary/[0.06] text-foreground"
                    : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                )}
                data-testid={item.testId}
              >
                <span
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-all flex-shrink-0 relative",
                    active
                      ? "border-primary/25 bg-primary/10 text-primary shadow-xs"
                      : "border-border/40 bg-background/60 text-muted-foreground group-hover:text-foreground group-hover:border-primary/15"
                  )}
                >
                  <Icon className="h-[18px] w-[18px] stroke-[1.8]" />
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-sm">
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                </span>
                <AnimatePresence mode="wait">
                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.15 }}
                      className="min-w-0 flex-1 overflow-hidden"
                    >
                      <div className="font-medium text-[13px] truncate">{item.label}</div>
                      {item.subtitle && (
                        <div className="text-[11px] text-muted-foreground/50 truncate">{item.subtitle}</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                {hasSubmenu && expanded && (
                  <ChevronRight
                    className={cn(
                      "w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 text-muted-foreground/60",
                      submenuOpen && "rotate-90"
                    )}
                  />
                )}
              </button>
            );

            return (
              <div key={item.href}>
                {!expanded ? (
                  <Tooltip>
                    <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium">{item.label}</TooltipContent>
                  </Tooltip>
                ) : (
                  navButton
                )}

                <AnimatePresence>
                  {hasSubmenu && submenuOpen && expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className="ml-[52px] mt-0.5 space-y-0.5 mb-1"
                    >
                      {item.submenu?.map((sub) => (
                        <button
                          key={sub.href}
                          onClick={() => setLocation(sub.href)}
                          data-testid={sub.testId}
                          className={cn(
                            "w-full text-left px-3 py-1.5 rounded-lg text-[12px] transition-all font-medium",
                            isActive(sub.href)
                              ? "text-foreground bg-primary/[0.06]"
                              : "text-muted-foreground/70 hover:text-foreground hover:bg-accent/30"
                          )}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Footer - Trust posture */}
        <div className="p-2 border-t border-border/30">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "rounded-xl border border-border/30 bg-card/30 transition-all",
                expanded ? "p-3" : "p-2 flex justify-center"
              )} data-testid="nav-safety">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "inline-flex items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary flex-shrink-0",
                    expanded ? "h-9 w-9" : "h-8 w-8"
                  )}>
                    <ShieldCheck className="h-[16px] w-[16px] stroke-[1.8]" />
                  </div>
                  <AnimatePresence mode="wait">
                    {expanded && (
                      <motion.div
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.15 }}
                        className="min-w-0 overflow-hidden"
                      >
                        <div className="text-[12px] font-medium whitespace-nowrap">Trust posture</div>
                        <div className="text-[10px] text-muted-foreground/50 whitespace-nowrap">Private &middot; Evidence-linked</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </TooltipTrigger>
            {!expanded && (
              <TooltipContent side="right" className="font-medium">Trust posture</TooltipContent>
            )}
          </Tooltip>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
