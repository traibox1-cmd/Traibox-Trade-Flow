import React from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRole } from "@/components/app/role";
import {
  BadgeCheck,
  Banknote,
  Boxes,
  Briefcase,
  Building2,
  CreditCard,
  FileLock2,
  Handshake,
  Settings2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  testId: string;
};

function useNavItems(role: "operator" | "financier"): NavItem[] {
  if (role === "financier") {
    return [
      {
        href: "/finance",
        label: "Funding Desk",
        icon: <Banknote className="h-4 w-4" />,
        testId: "nav-finance",
      },
      {
        href: "/space",
        label: "Capital Console",
        icon: <Briefcase className="h-4 w-4" />,
        testId: "nav-space",
      },
      {
        href: "/assistant",
        label: "Deal Assistant",
        icon: <Sparkles className="h-4 w-4" />,
        testId: "nav-assistant",
      },
      {
        href: "/network",
        label: "Counterparties",
        icon: <Handshake className="h-4 w-4" />,
        testId: "nav-network",
      },
      {
        href: "/compliance",
        label: "Risk & Policy",
        icon: <ShieldCheck className="h-4 w-4" />,
        testId: "nav-compliance",
      },
      {
        href: "/payments",
        label: "Settlement",
        icon: <CreditCard className="h-4 w-4" />,
        testId: "nav-payments",
      },
      {
        href: "/proofs",
        label: "Evidence",
        icon: <FileLock2 className="h-4 w-4" />,
        testId: "nav-proofs",
      },
      {
        href: "/settings",
        label: "Settings",
        icon: <Settings2 className="h-4 w-4" />,
        testId: "nav-settings",
      },
    ];
  }

  return [
    {
      href: "/space",
      label: "My Space",
      icon: <Briefcase className="h-4 w-4" />,
      testId: "nav-space",
    },
    {
      href: "/assistant",
      label: "Trade Assistant",
      icon: <Sparkles className="h-4 w-4" />,
      testId: "nav-assistant",
    },
    {
      href: "/network",
      label: "My Network",
      icon: <Handshake className="h-4 w-4" />,
      testId: "nav-network",
    },
    {
      href: "/compliance",
      label: "Compliance",
      icon: <ShieldCheck className="h-4 w-4" />,
      testId: "nav-compliance",
    },
    {
      href: "/finance",
      label: "Finance",
      icon: <Banknote className="h-4 w-4" />,
      testId: "nav-finance",
    },
    {
      href: "/payments",
      label: "Payments",
      icon: <CreditCard className="h-4 w-4" />,
      testId: "nav-payments",
    },
    {
      href: "/proofs",
      label: "Proofs",
      icon: <FileLock2 className="h-4 w-4" />,
      testId: "nav-proofs",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: <Settings2 className="h-4 w-4" />,
      testId: "nav-settings",
    },
  ];
}

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
  const { role } = useRole();
  const [location, setLocation] = useLocation();
  const items = useNavItems(role);

  const quick = [
    {
      label: "Golden trade",
      href: "/trade/T-1042",
      icon: <Briefcase className="h-4 w-4" />,
      testId: "link-golden-trade",
    },
    {
      label: "Compliance",
      href: "/compliance",
      icon: <ShieldCheck className="h-4 w-4" />,
      testId: "link-quick-compliance",
    },
    {
      label: "Funding",
      href: "/finance",
      icon: <Banknote className="h-4 w-4" />,
      testId: "link-quick-finance",
    },
    {
      label: "Settlement",
      href: "/payments",
      icon: <CreditCard className="h-4 w-4" />,
      testId: "link-quick-payments",
    },
    {
      label: "Evidence",
      href: "/proofs",
      icon: <BadgeCheck className="h-4 w-4" />,
      testId: "link-quick-proofs",
    },
  ];

  return (
    <div className="hidden md:flex md:w-[280px] md:flex-col md:gap-3 md:border-r md:bg-sidebar/60 md:backdrop-blur supports-[backdrop-filter]:md:bg-sidebar/50">
      <div className="px-4 pt-4">
        <div className="rounded-3xl border bg-card/60 p-3" data-testid="nav-quick">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium" data-testid="text-quick-title">
                Quick jump
              </div>
              <div className="text-xs text-muted-foreground" data-testid="text-quick-subtitle">
                Golden path modules
              </div>
            </div>
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-2xl bg-primary/10 border border-primary/15">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
          </div>

          <div className="mt-3 grid gap-2">
            {quick.map((q) => (
              <button
                key={q.href}
                type="button"
                onClick={() => setLocation(q.href)}
                className="flex items-center gap-2 rounded-2xl border bg-background/50 px-3 py-2 text-left text-sm hover:bg-background transition-colors focus-ring"
                data-testid={q.testId}
              >
                <span className="text-primary" aria-hidden="true">
                  {q.icon}
                </span>
                <span className="font-medium">{q.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-2">
        <nav className="grid gap-1" aria-label="Primary" data-testid="nav-primary">
          {items.map((i) => {
            const active =
              location === i.href || (i.href.startsWith("/trade") && location.startsWith("/trade"));

            return (
              <button
                key={i.href}
                type="button"
                onClick={() => setLocation(i.href)}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition-colors focus-ring",
                  active
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
                )}
                data-testid={i.testId}
              >
                <span
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-2xl border bg-background/50 transition-colors",
                    active
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground group-hover:text-foreground",
                  )}
                  aria-hidden="true"
                >
                  {i.icon}
                </span>
                <div className="min-w-0">
                  <div className="font-medium truncate">{i.label}</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {i.href === "/assistant"
                      ? "Chat + controllers"
                      : i.href === "/space"
                        ? "Active trades"
                        : i.href === "/network"
                          ? "Private graph"
                          : i.href === "/compliance"
                            ? "Checks + reports"
                            : i.href === "/finance"
                              ? "Offers + compare"
                              : i.href === "/payments"
                                ? "Pay / collect"
                                : i.href === "/proofs"
                                  ? "Proof packs"
                                  : "Preferences"}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <div className="rounded-3xl border bg-card/60 p-3" data-testid="nav-safety">
          <div className="flex items-start gap-3">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 border border-primary/15">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="text-sm font-medium" data-testid="text-safety-title">
                Trust posture
              </div>
              <div className="mt-1 text-xs text-muted-foreground" data-testid="text-safety-subtitle">
                Private-by-default · Evidence-linked
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">
                Prototype only — no funds move, no data leaves your browser.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileNav() {
  const { role } = useRole();
  const [location, setLocation] = useLocation();
  const items = useNavItems(role);

  return (
    <div className="md:hidden" data-testid="mobile-nav">
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/75 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-2 py-2">
          {items.slice(0, 5).map((i) => {
            const active = location === i.href;
            return (
              <button
                key={i.href}
                type="button"
                onClick={() => setLocation(i.href)}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] focus-ring",
                  active ? "text-primary" : "text-muted-foreground",
                )}
                data-testid={`${i.testId}-mobile`}
              >
                {i.icon}
                <span className="truncate">{i.label.split(" ")[0]}</span>
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
      <div className="mx-auto grid max-w-[1600px] grid-cols-1 md:grid-cols-[280px_1fr]">
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
