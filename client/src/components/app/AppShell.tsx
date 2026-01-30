import React, { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRole } from "@/components/app/role";
import {
  LayoutDashboard,
  Brain,
  Users,
  DollarSign,
  ShieldCheck,
  Settings,
  Pin,
  PinOff,
  ChevronRight,
  Boxes,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  testId: string;
  submenu?: { label: string; href: string; testId: string }[];
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/console",
    label: "Console",
    icon: LayoutDashboard,
    testId: "nav-console",
  },
  {
    href: "/intelligence",
    label: "Trade Intelligence",
    icon: Brain,
    testId: "nav-intelligence",
  },
  {
    href: "/network",
    label: "My Network",
    icon: Users,
    testId: "nav-network",
  },
  {
    href: "/finance",
    label: "Finance",
    icon: DollarSign,
    testId: "nav-finance",
    submenu: [
      { label: "Payments", href: "/finance?tab=payments", testId: "nav-finance-payments" },
      { label: "Funding", href: "/finance?tab=funding", testId: "nav-finance-funding" },
    ],
  },
  {
    href: "/assurance",
    label: "Assurance",
    icon: ShieldCheck,
    testId: "nav-assurance",
    submenu: [
      { label: "Checks", href: "/assurance?tab=checks", testId: "nav-assurance-checks" },
      { label: "Reports", href: "/assurance?tab=reports", testId: "nav-assurance-reports" },
      { label: "Proofs", href: "/assurance?tab=proofs", testId: "nav-assurance-proofs" },
      { label: "Anchoring", href: "/assurance?tab=anchoring", testId: "nav-assurance-anchoring" },
    ],
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    testId: "nav-settings",
  },
];

function Sidebar() {
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

  const width = isExpanded || isPinned ? 240 : 64;

  return (
    <motion.div
      className="fixed left-0 top-0 h-full bg-[#0a0a0a] border-r border-white/10 flex flex-col z-40"
      initial={{ width: 64 }}
      animate={{ width }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid="sidebar"
    >
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          <Boxes className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <AnimatePresence>
            {(isExpanded || isPinned) && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="font-light text-white truncate"
              >
                TRAIBOX
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {(isExpanded || isPinned) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              onClick={togglePin}
              data-testid="button-pin-sidebar"
              className="p-1.5 hover:bg-white/10 rounded-md transition-colors flex-shrink-0"
            >
              {isPinned ? (
                <PinOff className="w-4 h-4 text-white/50" />
              ) : (
                <Pin className="w-4 h-4 text-white/50" />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            const hasSubmenu = !!item.submenu;
            const submenuExpanded = expandedMenu === item.href;

            return (
              <div key={item.href}>
                <button
                  onClick={() => handleItemClick(item)}
                  data-testid={item.testId}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                    active
                      ? "bg-blue-500/20 text-blue-400"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence>
                    {(isExpanded || isPinned) && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm font-light truncate flex-1"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {hasSubmenu && (isExpanded || isPinned) && (
                    <ChevronRight
                      className={cn(
                        "w-4 h-4 flex-shrink-0 transition-transform",
                        submenuExpanded && "rotate-90"
                      )}
                    />
                  )}
                </button>

                <AnimatePresence>
                  {hasSubmenu && submenuExpanded && (isExpanded || isPinned) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-8 mt-1 space-y-1"
                    >
                      {item.submenu?.map((subitem) => (
                        <button
                          key={subitem.href}
                          onClick={() => {
                            setLocation(subitem.href);
                            if (!isPinned) {
                              setIsExpanded(false);
                              setExpandedMenu(null);
                            }
                          }}
                          data-testid={subitem.testId}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                            isActive(subitem.href)
                              ? "text-blue-400 bg-blue-500/10"
                              : "text-white/50 hover:text-white/70 hover:bg-white/5"
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
        </div>
      </nav>

      <div className="p-4 border-t border-white/10">
        <AnimatePresence>
          {(isExpanded || isPinned) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-white/40 space-y-1"
            >
              <div>Private-by-default</div>
              <div>Evidence-linked operations</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function TopBar() {
  const { role, setRole } = useRole();

  return (
    <div className="fixed top-0 left-64 right-0 h-14 bg-[#0a0a0a] border-b border-white/10 flex items-center justify-end px-6 z-30">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setRole("operator")}
          data-testid="tab-role-operator"
          className={cn(
            "px-3 py-1.5 text-xs rounded-md transition-colors",
            role === "operator"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
          )}
        >
          Operator
        </button>
        <button
          onClick={() => setRole("financier")}
          data-testid="tab-role-financier"
          className={cn(
            "px-3 py-1.5 text-xs rounded-md transition-colors",
            role === "financier"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
              : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"
          )}
        >
          Financier
        </button>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Sidebar />
      <TopBar />
      <main className="ml-16 mt-14 min-h-[calc(100vh-3.5rem)]" data-testid="main">
        {children}
      </main>
    </div>
  );
}
