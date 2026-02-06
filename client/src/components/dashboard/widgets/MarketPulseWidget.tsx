import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketItem {
  pair: string;
  label: string;
  price: number;
  change: number;
  sparkline: number[];
}

interface MarketPulseWidgetProps {
  items?: MarketItem[];
}

function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 24;
  const w = 60;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#22c55e" : "#ef4444"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MarketPulseWidget({ items }: MarketPulseWidgetProps) {
  const [data, setData] = useState<MarketItem[]>(items || [
    { pair: "EUR/USD", label: "Euro", price: 1.0842, change: 0.12, sparkline: [1.08, 1.082, 1.079, 1.085, 1.083, 1.084, 1.0842] },
    { pair: "GBP/USD", label: "Pound", price: 1.2615, change: -0.08, sparkline: [1.265, 1.263, 1.264, 1.260, 1.262, 1.261, 1.2615] },
    { pair: "USD/KES", label: "Kenya Shilling", price: 153.45, change: 0.32, sparkline: [152.8, 153.0, 153.1, 153.3, 153.2, 153.4, 153.45] },
    { pair: "USD/SGD", label: "Singapore Dollar", price: 1.3412, change: -0.05, sparkline: [1.342, 1.343, 1.341, 1.340, 1.342, 1.341, 1.3412] },
    { pair: "COFFEE-C", label: "Coffee Futures", price: 234.85, change: 2.15, sparkline: [228, 230, 229, 232, 231, 233, 234.85] },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(item => {
        const delta = (Math.random() - 0.48) * 0.003 * item.price;
        const newPrice = +(item.price + delta).toFixed(item.price > 100 ? 2 : 4);
        const newChange = +((newPrice - item.sparkline[0]) / item.sparkline[0] * 100).toFixed(2);
        return {
          ...item,
          price: newPrice,
          change: newChange,
          sparkline: [...item.sparkline.slice(1), newPrice],
        };
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2" data-testid="widget-market-pulse">
      {data.map((item) => (
        <div key={item.pair} className="flex items-center gap-3 py-1.5 hover:bg-accent/20 rounded-lg px-2 -mx-2 transition-colors">
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-semibold">{item.pair}</div>
            <div className="text-[10px] text-muted-foreground/50">{item.label}</div>
          </div>
          <MiniSparkline data={item.sparkline} positive={item.change >= 0} />
          <div className="text-right flex-shrink-0 w-16">
            <div className="text-[12px] font-medium tabular-nums">{item.price.toFixed(item.price > 100 ? 2 : 4)}</div>
            <div className={cn(
              "flex items-center justify-end gap-0.5 text-[10px] font-medium",
              item.change >= 0 ? "text-emerald-500" : "text-red-500"
            )}>
              {item.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {item.change >= 0 ? "+" : ""}{item.change}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
