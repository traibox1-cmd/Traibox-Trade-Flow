import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TBCard } from "@/components/tb/TBCard";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Sparkles,
  Target,
  Globe,
  BarChart3,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
} from "lucide-react";

type TrendInsight = {
  id: string;
  type: "trend" | "forecast" | "alert" | "opportunity";
  title: string;
  description: string;
  confidence: number;
  timeframe?: string;
  metrics?: {
    label: string;
    value: string;
    change?: string;
    direction?: "up" | "down" | "stable";
  }[];
};

type CommodityTrend = {
  commodity: string;
  trend: "rising" | "falling" | "stable";
  priceChange: string;
  forecast: string;
};

type CorridorAnalysis = {
  corridor: string;
  volume: string;
  growth: string;
  riskLevel: "low" | "medium" | "high";
};

type TrendAnalysis = {
  summary: string;
  insights: TrendInsight[];
  commodityTrends: CommodityTrend[];
  corridorAnalysis: CorridorAnalysis[];
  marketOutlook: string;
  generatedAt: string;
};

const insightTypeConfig = {
  trend: { icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  forecast: { icon: Target, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  alert: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  opportunity: { icon: Zap, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
};

const trendConfig = {
  rising: { icon: TrendingUp, color: "text-green-500" },
  falling: { icon: TrendingDown, color: "text-red-500" },
  stable: { icon: Minus, color: "text-muted-foreground" },
};

const riskColors = {
  low: "bg-green-500/10 text-green-600 border-green-500/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  high: "bg-red-500/10 text-red-600 border-red-500/20",
};

export default function TradeTrends() {
  const [analysis, setAnalysis] = useState<TrendAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/trends");
      if (!res.ok) throw new Error("Failed to fetch trends");
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      setError("Unable to load trend analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Trade Trends & Forecasts</h1>
            <p className="text-sm text-muted-foreground">AI-powered market intelligence</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-muted-foreground">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Analyzing market trends...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Trade Trends & Forecasts</h1>
            <p className="text-sm text-muted-foreground">AI-powered market intelligence</p>
          </div>
        </div>
        <TBCard title="Error" state="idle" dataTestId="card-error">
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchAnalysis} className="mt-4" data-testid="button-retry">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </TBCard>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-page-title">Trade Trends & Forecasts</h1>
            <p className="text-sm text-muted-foreground">AI-powered market intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Updated {new Date(analysis.generatedAt).toLocaleTimeString()}
          </div>
          <Button variant="outline" size="sm" onClick={fetchAnalysis} data-testid="button-refresh">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-gradient-to-br from-primary/5 to-background p-6 mb-6"
        data-testid="card-summary"
      >
        <p className="text-lg">{analysis.summary}</p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Key Insights
          </h2>
          <div className="space-y-3">
            {analysis.insights.map((insight, idx) => {
              const config = insightTypeConfig[insight.type];
              const Icon = config.icon;
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`rounded-xl border ${config.border} ${config.bg} p-4`}
                  data-testid={`insight-${insight.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${config.bg}`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h3 className="font-medium">{insight.title}</h3>
                        <div className="flex items-center gap-2">
                          {insight.timeframe && (
                            <span className="text-xs bg-muted/60 border border-border rounded-full px-2 py-0.5">{insight.timeframe}</span>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {insight.confidence}% confidence
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground" data-testid={`text-insight-desc-${insight.id}`}>{insight.description}</p>
                      {insight.metrics && insight.metrics.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-3" data-testid={`metrics-${insight.id}`}>
                          {insight.metrics.map((metric, midx) => (
                            <div key={midx} className="flex items-center gap-2 text-sm" data-testid={`metric-${insight.id}-${midx}`}>
                              <span className="font-medium">{metric.label}:</span>
                              <span data-testid={`metric-value-${insight.id}-${midx}`}>{metric.value}</span>
                              {metric.change && (
                                <span className={`flex items-center gap-0.5 ${
                                  metric.direction === "up" ? "text-green-500" :
                                  metric.direction === "down" ? "text-red-500" :
                                  "text-muted-foreground"
                                }`} data-testid={`metric-change-${insight.id}-${midx}`}>
                                  {metric.direction === "up" && <ArrowUpRight className="h-3 w-3" />}
                                  {metric.direction === "down" && <ArrowDownRight className="h-3 w-3" />}
                                  {metric.change}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Commodity Trends
          </h2>
          <div className="space-y-2">
            {analysis.commodityTrends.map((ct, idx) => {
              const tConfig = trendConfig[ct.trend];
              const TrendIcon = tConfig.icon;
              return (
                <motion.div
                  key={ct.commodity}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-xl border bg-card p-3"
                  data-testid={`commodity-${ct.commodity.toLowerCase()}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium" data-testid={`commodity-name-${ct.commodity.toLowerCase()}`}>{ct.commodity}</span>
                    <div className="flex items-center gap-2">
                      <TrendIcon className={`h-4 w-4 ${tConfig.color}`} />
                      <span className={`text-sm font-medium ${tConfig.color}`} data-testid={`commodity-change-${ct.commodity.toLowerCase()}`}>
                        {ct.priceChange}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground" data-testid={`commodity-forecast-${ct.commodity.toLowerCase()}`}>{ct.forecast}</p>
                </motion.div>
              );
            })}
          </div>

          <h2 className="text-lg font-semibold flex items-center gap-2 pt-4">
            <Globe className="h-5 w-5 text-primary" />
            Corridor Analysis
          </h2>
          <div className="space-y-2">
            {analysis.corridorAnalysis.map((ca, idx) => (
              <motion.div
                key={ca.corridor}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="rounded-xl border bg-card p-3"
                data-testid={`corridor-${idx}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium" data-testid={`corridor-name-${idx}`}>{ca.corridor}</span>
                  <span className={`text-xs rounded-full px-2 py-0.5 border ${riskColors[ca.riskLevel]}`} data-testid={`corridor-risk-${idx}`}>
                    {ca.riskLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span data-testid={`corridor-volume-${idx}`}>Volume: {ca.volume}</span>
                  <span className="text-green-500" data-testid={`corridor-growth-${idx}`}>{ca.growth} growth</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <TBCard
          title="Market Outlook"
          subtitle="AI-generated market perspective"
          icon={<Sparkles className="h-4 w-4" />}
          state="idle"
          dataTestId="card-market-outlook"
        >
          <p className="text-muted-foreground leading-relaxed" data-testid="text-market-outlook">{analysis.marketOutlook}</p>
        </TBCard>
      </motion.div>
    </div>
  );
}
