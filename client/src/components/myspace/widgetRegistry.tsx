import {
  LayoutDashboard,
  TrendingUp,
  Clock,
  Shield,
  Globe,
  CreditCard,
} from "lucide-react";

export type WidgetId =
  | "kpi-strip"
  | "next-actions"
  | "recent-trades"
  | "trade-table"
  | "trade-passport"
  | "network"
  | "payments";

export type WidgetSize = "full" | "half";

export type WidgetDefinition = {
  id: WidgetId;
  label: string;
  description: string;
  icon: React.ElementType;
  defaultSize: WidgetSize;
  removable: boolean;
};

export const WIDGET_REGISTRY: WidgetDefinition[] = [
  {
    id: "kpi-strip",
    label: "Overview",
    description: "Key performance indicators at a glance",
    icon: LayoutDashboard,
    defaultSize: "full",
    removable: true,
  },
  {
    id: "next-actions",
    label: "Next Actions",
    description: "Pending tasks across your active trades",
    icon: Clock,
    defaultSize: "half",
    removable: true,
  },
  {
    id: "recent-trades",
    label: "Recent Trades",
    description: "Your most recently updated trades",
    icon: TrendingUp,
    defaultSize: "half",
    removable: true,
  },
  {
    id: "trade-table",
    label: "Trade Table",
    description: "Tabular view of active and pending trades",
    icon: TrendingUp,
    defaultSize: "full",
    removable: true,
  },
  {
    id: "trade-passport",
    label: "Trade Passport",
    description: "Your compliance readiness and certification status",
    icon: Shield,
    defaultSize: "half",
    removable: true,
  },
  {
    id: "network",
    label: "Network",
    description: "Your connected trade partners and counterparties",
    icon: Globe,
    defaultSize: "half",
    removable: true,
  },
  {
    id: "payments",
    label: "Payments",
    description: "Recent and pending payment instructions",
    icon: CreditCard,
    defaultSize: "half",
    removable: true,
  },
];

export const DEFAULT_WIDGET_ORDER: WidgetId[] = [
  "kpi-strip",
  "next-actions",
  "recent-trades",
  "trade-table",
];

const STORAGE_KEY = "traibox-my-space-widgets";

export function loadWidgetPreferences(): WidgetId[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WIDGET_ORDER;
    const parsed = JSON.parse(raw) as WidgetId[];
    // Validate: keep only known widget IDs
    const known = new Set(WIDGET_REGISTRY.map((w) => w.id));
    const filtered = parsed.filter((id) => known.has(id));
    return filtered.length > 0 ? filtered : DEFAULT_WIDGET_ORDER;
  } catch {
    return DEFAULT_WIDGET_ORDER;
  }
}

export function saveWidgetPreferences(ids: WidgetId[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Silently fail if storage is unavailable
  }
}
