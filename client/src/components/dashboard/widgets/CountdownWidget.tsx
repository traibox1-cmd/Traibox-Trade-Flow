import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Clock, Ship, FileCheck, CreditCard } from "lucide-react";

interface DeadlineItem {
  id: string;
  label: string;
  trade: string;
  deadline: Date;
  type: "shipment" | "compliance" | "payment" | "document";
}

interface CountdownWidgetProps {
  deadlines?: DeadlineItem[];
}

const TYPE_ICONS = {
  shipment: Ship,
  compliance: FileCheck,
  payment: CreditCard,
  document: FileCheck,
};

const TYPE_COLORS = {
  shipment: "text-blue-500 bg-blue-500/10",
  compliance: "text-amber-500 bg-amber-500/10",
  payment: "text-emerald-500 bg-emerald-500/10",
  document: "text-purple-500 bg-purple-500/10",
};

function useCountdown(deadline: Date) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = deadline.getTime() - Date.now();
    return Math.max(0, diff);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, deadline.getTime() - Date.now()));
    }, 60000);
    return () => clearInterval(interval);
  }, [deadline]);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return { days, hours, isUrgent: days <= 2 };
}

function DeadlineRow({ item }: { item: DeadlineItem }) {
  const { days, hours, isUrgent } = useCountdown(item.deadline);
  const Icon = TYPE_ICONS[item.type];

  return (
    <div className="flex items-center gap-3 py-2">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", TYPE_COLORS[item.type])}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium truncate">{item.label}</div>
        <div className="text-[10px] text-muted-foreground/50 truncate">{item.trade}</div>
      </div>
      <div className={cn(
        "text-right flex-shrink-0",
        isUrgent ? "text-red-500" : "text-muted-foreground"
      )}>
        <div className="text-[12px] font-semibold tabular-nums">
          {days > 0 ? `${days}d ${hours}h` : `${hours}h`}
        </div>
        <div className="text-[9px] text-muted-foreground/40">remaining</div>
      </div>
    </div>
  );
}

export function CountdownWidget({ deadlines }: CountdownWidgetProps) {
  const now = Date.now();
  const defaultDeadlines: DeadlineItem[] = deadlines || [
    { id: "1", label: "ETA Hamburg Port", trade: "Kenya Coffee Import", deadline: new Date(now + 8 * 24 * 60 * 60 * 1000), type: "shipment" },
    { id: "2", label: "FDA Certificate Expiry", trade: "Medical Supplies Export", deadline: new Date(now + 3 * 24 * 60 * 60 * 1000), type: "compliance" },
    { id: "3", label: "LC Payment Due", trade: "Kenya Coffee Import", deadline: new Date(now + 12 * 24 * 60 * 60 * 1000), type: "payment" },
    { id: "4", label: "Insurance Renewal", trade: "Medical Supplies Export", deadline: new Date(now + 1.5 * 24 * 60 * 60 * 1000), type: "document" },
  ];

  const sorted = [...defaultDeadlines].sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

  return (
    <div className="space-y-1" data-testid="widget-countdown">
      {sorted.map((item) => (
        <DeadlineRow key={item.id} item={item} />
      ))}
    </div>
  );
}
