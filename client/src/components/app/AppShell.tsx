import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRole } from "@/components/app/role";
import {
  Briefcase,
  Sparkles,
  Handshake,
  Banknote,
  ShieldCheck,
  Settings2,
  ChevronRight,
  Boxes,
  Pin,
  PinOff,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  testId: string;
  subtitle?: string;
  submenu?: { label: string; href: string; testId: string }[];
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/space",
    label: "My Space",
    icon: Briefcase,
    testId: "nav-space",
    subtitle: "Active trades",
  },
  {
    href: "/intelligence",
    label: "Trade Intelligence",
    icon: Sparkles,
    testId: "nav-intelligence",
    subtitle: "Chat + controllers",
  },
  {
    href: "/network",
    label: "My Network",
    icon: Handshake,
    testId: "nav-network",
    subtitle: "Private graph",
  },
  {
    href: "/finance",
    label: "Finance",
    icon: Banknote,
    testId: "nav-finance",
    subtitle: "Payments + funding",
    submenu: [
      { label: "Payments", href: "/finance?tab=payments", testId: "nav-finance-payments" },
      { label: "Funding", href: "/finance?tab=funding", testId: "nav-finance-funding" },
    ],
  },
  {
    href: "/compliance-proofs",
    label: "Compliance & Proofs",
    icon: ShieldCheck,
    testId: "nav-compliance-proofs",
    subtitle: "Checks + reports",
    submenu: [
      { label: "Checks & Findings", href: "/compliance-proofs?tab=checks", testId: "nav-cp-checks" },
      { label: "Reports", href: "/compliance-proofs?tab=reports", testId: "nav-cp-reports" },
      { label: "Proof Packs", href: "/compliance-proofs?tab=proofs", testId: "nav-cp-proofs" },
      { label: "Anchoring", href: "/compliance-proofs?tab=anchoring", testId: "nav-cp-anchoring" },
    ],
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings2,
    testId: "nav-settings",
    subtitle: "Preferences",
  },
];

function TopBar() {
  const { role, setRole, theme, setTheme } = useRole();

  return (
    <div className="sticky top-0 z-30 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="relative" data-testid="brand-mark">
            <div className="noise relative flex h-9 w-9 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <Boxes className="h-5 w-5" />
            </div>
            <div className="pointer-events-none absolute -inset-1 rounded-3xl bg-primary/10 blur-xl" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-2">
              <div className="font-serif text-[15px] tracking-tight" data-testid="text-brand">
                TRAIBOX
              </div>
              <div
                className="rounded-full border bg-card/60 px-2 py-0.5 text-[11px] text-muted-foreground"
                data-testid="badge-tagline"
              >
                AI-first trade workspace
              </div>
            </div>
            <div className="text-[12px] text-muted-foreground" data-testid="text-tagline">
              Trust-first chat + cards for real execution.
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Tabs value={role} onValueChange={(v) => setRole(v as any)} data-testid="tabs-role">
            <TabsList data-testid="tabslist-role">
              <TabsTrigger value="operator" data-testid="tab-role-operator">
                Operator
              </TabsTrigger>
              <TabsTrigger value="financier" data-testid="tab-role-financier">
                Financier
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            variant="secondary"
            className="h-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            data-testid="button-toggle-theme"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function NavRail() {
  const [location, setLocation] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const handleMouseEnter = () => {
    if (!isPinned) {
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      setIsExpanded(false);
      setExpandedMenu(null);
    }
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
    if (!isPinned) {
      setIsExpanded(true);
    }
  };

  const handleItemClick = (item: NavItem) => {
    if (item.submenu) {
      if (expandedMenu === item.href) {
        setExpandedMenu(null);
      } else {
        setExpandedMenu(item.href);
      }
    } else {
      setLocation(item.href);
      if (!isPinned) {
        setIsExpanded(false);
        setExpandedMenu(null);
      }
    }
  };

  const isActive = (href: string) => {
    return location === href || location.startsWith(href + "?");
  };

  const shouldExpand = isExpanded || isPinned;

  return (
    <motion.div
      className="hidden md:flex md:flex-col md:border-r md:bg-sidebar/60 md:backdrop-blur supports-[backdrop-filter]:md:bg-sidebar/50 overflow-hidden"
      initial={{ width: 72 }}
      animate={{ width: shouldExpand ? 280 : 72 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid="nav-rail"
    >
      <div className="p-4 flex items-center justify-between">
        <div className="min-w-0 flex items-center gap-2">
          <div className="flex-shrink-0 w-9 h-9 rounded-2xl bg-primary/10 border border-primary/15 flex items-center justify-center">
            <Boxes className="h-5 w-5 text-primary" />
          </div>
          <AnimatePresence>
            {shouldExpand && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-serif text-sm whitespace-nowrap"
              >
                TRAIBOX
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {shouldExpand && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              onClick={togglePin}
              data-testid="button-pin-sidebar"
              className="p-1.5 hover:bg-accent rounded-md transition-colors flex-shrink-0"
            >
              {isPinned ? (
                <PinOff className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Pin className="w-4 h-4 text-muted-foreground" />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="px-2 flex-1 overflow-y-auto">
        <nav className="grid gap-1" aria-label="Primary" data-testid="nav-primary">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const hasSubmenu = !!item.submenu;
            const submenuExpanded = expandedMenu === item.href;

            return (
              <div key={item.href}>
                <button
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition-colors focus-ring w-full",
                    active
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                  )}
                  data-testid={item.testId}
                >
                  <span
                    className={cn(
                      "inline-flex h-9 w-9 items-center justify-center rounded-2xl border bg-background/50 transition-colors flex-shrink-0",
                      active
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-border text-muted-foreground group-hover:text-foreground",
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <AnimatePresence>
                    {shouldExpand && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="min-w-0 flex-1"
                      >
                        <div className="font-medium truncate">{item.label}</div>
                        {item.subtitle && (
                          <div className="text-[11px] text-muted-foreground truncate">
                            {item.subtitle}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {hasSubmenu && shouldExpand && (
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 flex-shrink-0 transition-transform",
                        submenuExpanded && "rotate-90"
                      )}
                    />
                  )}
                </button>

                <AnimatePresence>
                  {hasSubmenu && submenuExpanded && shouldExpand && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-14 mt-1 space-y-1"
                    >
                      {item.submenu?.map((subitem) => (
                        <button
                          key={subitem.href}
                          type="button"
                          onClick={() => {
                            setLocation(subitem.href);
                            if (!isPinned) {
                              setIsExpanded(false);
                              setExpandedMenu(null);
                            }
                          }}
                          data-testid={subitem.testId}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-2xl text-sm transition-colors",
                            isActive(subitem.href)
                              ? "text-foreground bg-primary/5"
                              : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                          )}
                        >
                          {subitem.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <div className="rounded-3xl border bg-card/60 p-3" data-testid="nav-safety">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 border border-primary/15 flex-shrink-0">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <AnimatePresence>
              {shouldExpand && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="min-w-0"
                >
                  <div className="text-sm font-medium whitespace-nowrap" data-testid="text-safety-title">
                    Trust posture
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground whitespace-nowrap" data-testid="text-safety-subtitle">
                    Private-by-default · Evidence-linked
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MobileNav() {
  const [location, setLocation] = useLocation();

  return (
    <div className="md:hidden" data-testid="mobile-nav">
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/75 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-2 py-2">
          {NAV_ITEMS.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = location === item.href || location.startsWith(item.href + "?");
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => setLocation(item.href)}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] focus-ring",
                  active ? "text-primary" : "text-muted-foreground",
                )}
                data-testid={`${item.testId}-mobile`}
              >
                <Icon className="h-4 w-4" />
                <span className="truncate">{item.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <TopBar />
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 md:grid-cols-[auto_1fr]">
        <NavRail />
        <main className="min-w-0 pb-20 md:pb-0" data-testid="main">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="relative"
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 subtle-grid" aria-hidden="true" />
            </div>
            <div className="relative">{children}</div>
          </motion.div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
