import { cn } from "@/lib/utils";
import { Check, AlertCircle, Clock } from "lucide-react";

interface PassportItem {
  label: string;
  status: "complete" | "missing" | "pending";
}

interface PassportWidgetProps {
  readiness: number;
  items?: PassportItem[];
}

export function PassportWidget({ readiness, items }: PassportWidgetProps) {
  const defaultItems: PassportItem[] = items || [
    { label: "KYC Documents", status: "complete" },
    { label: "Sanctions Screening", status: "complete" },
    { label: "UBO Declaration", status: "pending" },
    { label: "Proof of Address", status: "missing" },
    { label: "Trade License", status: "complete" },
    { label: "AML Check", status: "complete" },
    { label: "PEP Screening", status: "missing" },
    { label: "Bank Reference", status: "missing" },
  ];

  const complete = defaultItems.filter(i => i.status === "complete").length;
  const missing = defaultItems.filter(i => i.status === "missing").length;

  return (
    <div className="space-y-4" data-testid="widget-passport">
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
            <circle
              cx="18" cy="18" r="14"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 14}`}
              strokeDashoffset={`${2 * Math.PI * 14 * (1 - readiness / 100)}`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold tabular-nums">{readiness}%</span>
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold">Trade Passport</div>
          <div className="text-[11px] text-muted-foreground/60 mt-0.5">
            {complete}/{defaultItems.length} complete &middot; {missing} missing
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        {defaultItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2.5 py-1">
            {item.status === "complete" && (
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-emerald-500" />
              </div>
            )}
            {item.status === "missing" && (
              <div className="w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-3 h-3 text-red-500" />
              </div>
            )}
            {item.status === "pending" && (
              <div className="w-5 h-5 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-3 h-3 text-amber-500" />
              </div>
            )}
            <span className={cn(
              "text-[12px]",
              item.status === "complete" && "text-foreground",
              item.status === "missing" && "text-red-600 dark:text-red-400 font-medium",
              item.status === "pending" && "text-amber-600 dark:text-amber-400"
            )}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
