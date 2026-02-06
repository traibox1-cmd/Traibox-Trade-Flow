import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useRole } from "@/components/app/role";
import {
  Briefcase,
  Sparkles,
  Handshake,
  Banknote,
  ShieldCheck,
  LayoutDashboard,
  Building2,
  FileCheck,
} from "lucide-react";

const OPERATOR_MOBILE = [
  { href: "/space", label: "Space", icon: Briefcase },
  { href: "/trade", label: "Intel", icon: Sparkles },
  { href: "/network", label: "Network", icon: Handshake },
  { href: "/finance", label: "Finance", icon: Banknote },
  { href: "/compliance", label: "Comply", icon: ShieldCheck },
];

const FINANCIER_MOBILE = [
  { href: "/capital-console", label: "Console", icon: LayoutDashboard },
  { href: "/funding-desk", label: "Funding", icon: Banknote },
  { href: "/deal-assistant", label: "Deals", icon: Sparkles },
  { href: "/counterparties", label: "Parties", icon: Building2 },
  { href: "/evidence", label: "Evidence", icon: FileCheck },
];

export function MobileNav() {
  const [location, setLocation] = useLocation();
  const { role } = useRole();

  const items = role === "operator" ? OPERATOR_MOBILE : FINANCIER_MOBILE;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/50 bg-background/80 backdrop-blur-xl" data-testid="mobile-nav">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = location === item.href || location.startsWith(item.href + "?") || location.startsWith(item.href + "/");
          return (
            <button
              key={item.href}
              onClick={() => setLocation(item.href)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
              data-testid={`mobile-nav-${item.label.toLowerCase()}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
