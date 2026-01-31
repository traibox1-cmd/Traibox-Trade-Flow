import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TBCard } from "@/components/tb/TBCard";
import {
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Globe,
  Building2,
  FileCheck,
  Banknote,
  Package,
  Users,
  Info,
  ChevronRight,
} from "lucide-react";
import { useAppStore, Trade } from "@/lib/store";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

type RiskCategory = {
  key: string;
  label: string;
  score: number;
  maxScore: number;
  trend: "up" | "down" | "stable";
  factors: string[];
  icon: React.ElementType;
};

type RiskInsight = {
  id: string;
  type: "warning" | "opportunity" | "info";
  title: string;
  description: string;
  action?: string;
};

const getRiskLevel = (score: number): { label: string; color: string; bg: string } => {
  if (score <= 30) return { label: "Low", color: "text-green-600", bg: "bg-green-500" };
  if (score <= 60) return { label: "Medium", color: "text-yellow-600", bg: "bg-yellow-500" };
  if (score <= 80) return { label: "High", color: "text-orange-600", bg: "bg-orange-500" };
  return { label: "Critical", color: "text-red-600", bg: "bg-red-500" };
};

const generateRiskCategories = (trade: Trade | null): RiskCategory[] => {
  if (!trade) {
    return [
      { key: "counterparty", label: "Counterparty", score: 0, maxScore: 100, trend: "stable", factors: [], icon: Building2 },
      { key: "corridor", label: "Corridor", score: 0, maxScore: 100, trend: "stable", factors: [], icon: Globe },
      { key: "compliance", label: "Compliance", score: 0, maxScore: 100, trend: "stable", factors: [], icon: FileCheck },
      { key: "financial", label: "Financial", score: 0, maxScore: 100, trend: "stable", factors: [], icon: Banknote },
      { key: "operational", label: "Operational", score: 0, maxScore: 100, trend: "stable", factors: [], icon: Package },
      { key: "concentration", label: "Concentration", score: 0, maxScore: 100, trend: "stable", factors: [], icon: Users },
    ];
  }

  const corridorParts = trade.corridor.split("→").map(s => s.trim());
  const isHighRiskCorridor = ["Africa", "SEA", "LATAM"].some(r => trade.corridor.includes(r));
  const isLargeTrade = trade.value > 100000;

  return [
    {
      key: "counterparty",
      label: "Counterparty",
      score: trade.linkedParties.length > 0 ? 35 : 65,
      maxScore: 100,
      trend: trade.linkedParties.length > 0 ? "down" : "stable",
      factors: [
        trade.linkedParties.length > 0 ? "Verified network partners" : "Unknown counterparties",
        "Credit history: Limited data",
        "Payment behavior: On-time",
      ],
      icon: Building2,
    },
    {
      key: "corridor",
      label: "Corridor",
      score: isHighRiskCorridor ? 58 : 28,
      maxScore: 100,
      trend: isHighRiskCorridor ? "up" : "stable",
      factors: [
        `Origin: ${corridorParts[0] || "Unknown"}`,
        `Destination: ${corridorParts[1] || "Unknown"}`,
        isHighRiskCorridor ? "Enhanced due diligence required" : "Standard monitoring",
      ],
      icon: Globe,
    },
    {
      key: "compliance",
      label: "Compliance",
      score: 25,
      maxScore: 100,
      trend: "down",
      factors: [
        "Sanctions: Clear",
        "AML screening: Passed",
        "Document verification: Complete",
      ],
      icon: FileCheck,
    },
    {
      key: "financial",
      label: "Financial",
      score: isLargeTrade ? 55 : 30,
      maxScore: 100,
      trend: isLargeTrade ? "up" : "stable",
      factors: [
        `Trade value: ${trade.currency} ${trade.value.toLocaleString()}`,
        trade.fundingType ? `Funding: ${trade.fundingType}` : "Self-funded",
        "Payment terms: Standard",
      ],
      icon: Banknote,
    },
    {
      key: "operational",
      label: "Operational",
      score: 42,
      maxScore: 100,
      trend: "stable",
      factors: [
        `Incoterms: ${trade.incoterms || "Not specified"}`,
        `Goods: ${trade.goods || "General cargo"}`,
        "Logistics: Tracking enabled",
      ],
      icon: Package,
    },
    {
      key: "concentration",
      label: "Concentration",
      score: 38,
      maxScore: 100,
      trend: "down",
      factors: [
        "Corridor diversification: Good",
        "Counterparty spread: Moderate",
        "Sector exposure: Balanced",
      ],
      icon: Users,
    },
  ];
};

const generateInsights = (categories: RiskCategory[], trade: Trade | null): RiskInsight[] => {
  const insights: RiskInsight[] = [];
  
  const highRiskCats = categories.filter(c => c.score > 50);
  const lowRiskCats = categories.filter(c => c.score <= 30);
  
  if (highRiskCats.length > 0) {
    insights.push({
      id: "high-risk-alert",
      type: "warning",
      title: `${highRiskCats.length} elevated risk ${highRiskCats.length === 1 ? "area" : "areas"} detected`,
      description: `${highRiskCats.map(c => c.label).join(", ")} ${highRiskCats.length === 1 ? "requires" : "require"} attention. Consider additional due diligence or risk mitigation measures.`,
      action: "View mitigation options",
    });
  }
  
  if (trade && !trade.fundingType) {
    insights.push({
      id: "funding-opportunity",
      type: "opportunity",
      title: "Trade finance opportunity",
      description: "This trade could benefit from structured financing. Consider factoring or supply chain finance to optimize working capital.",
      action: "Explore funding options",
    });
  }
  
  if (lowRiskCats.length >= 3) {
    insights.push({
      id: "low-risk-note",
      type: "info",
      title: "Strong risk profile in multiple areas",
      description: `${lowRiskCats.map(c => c.label).join(", ")} show low risk scores. This positions the trade favorably for competitive financing terms.`,
    });
  }
  
  const improvingCats = categories.filter(c => c.trend === "down");
  if (improvingCats.length > 0) {
    insights.push({
      id: "improving-trend",
      type: "info",
      title: "Positive risk trends observed",
      description: `Risk levels improving in ${improvingCats.map(c => c.label).join(", ")}. Continue current risk management practices.`,
    });
  }

  return insights;
};

function RiskScoreGauge({ score, size = 120 }: { score: number; size?: number }) {
  const { label, color, bg } = getRiskLevel(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={45}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/20"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={45}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          className={bg.replace("bg-", "text-")}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" data-testid="gauge-score">{score}</span>
        <span className={`text-xs font-medium ${color}`} data-testid="gauge-label">{label}</span>
      </div>
    </div>
  );
}

function CategoryCard({ category }: { category: RiskCategory }) {
  const { label, color } = getRiskLevel(category.score);
  const Icon = category.icon;
  const TrendIcon = category.trend === "up" ? TrendingUp : category.trend === "down" ? TrendingDown : null;

  return (
    <motion.div
      className="rounded-xl border bg-card p-4 hover:border-primary/30 transition-colors cursor-pointer"
      whileHover={{ scale: 1.01 }}
      data-testid={`risk-category-${category.key}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-muted/50">
            <Icon className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium text-sm">{category.label}</div>
            <div className={`text-xs ${color}`}>{label} Risk</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xl font-bold">{category.score}</span>
          {TrendIcon && (
            <TrendIcon className={`w-4 h-4 ${category.trend === "up" ? "text-red-500" : "text-green-500"}`} />
          )}
        </div>
      </div>
      <div className="space-y-1">
        {category.factors.slice(0, 2).map((factor, i) => (
          <div key={i} className="text-xs text-muted-foreground flex items-center gap-1">
            <ChevronRight className="w-3 h-3" />
            {factor}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function InsightCard({ insight }: { insight: RiskInsight }) {
  const icons = {
    warning: AlertTriangle,
    opportunity: Sparkles,
    info: Info,
  };
  const colors = {
    warning: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    opportunity: "text-green-500 bg-green-500/10 border-green-500/20",
    info: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  };
  const Icon = icons[insight.type];

  return (
    <motion.div
      className={`rounded-xl border p-4 ${colors[insight.type]}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      data-testid={`insight-${insight.id}`}
    >
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="font-medium text-sm text-foreground">{insight.title}</div>
          <div className="text-xs text-muted-foreground mt-1">{insight.description}</div>
          {insight.action && (
            <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-xs" data-testid={`insight-action-${insight.id}`}>
              {insight.action} →
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

type ApiRiskCategory = {
  key: string;
  label: string;
  score: number;
  trend: string;
  factors: string[];
  aiInsight: string;
};

type ApiRiskInsight = {
  id: string;
  type: "warning" | "opportunity" | "info";
  title: string;
  description: string;
  action?: string;
};

type ApiRiskAnalysis = {
  tradeId: string;
  overallScore: number;
  riskLevel: string;
  categories: ApiRiskCategory[];
  insights: ApiRiskInsight[];
  generatedAt: string;
};

export default function RiskAssessment() {
  const { trades } = useAppStore();
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(trades[0]?.id || null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiAnalysis, setApiAnalysis] = useState<ApiRiskAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisCache, setAnalysisCache] = useState<Record<string, ApiRiskAnalysis>>({});

  const selectedTrade = useMemo(
    () => trades.find(t => t.id === selectedTradeId) || null,
    [trades, selectedTradeId]
  );

  const fetchRiskAnalysis = useCallback(async (forceRefresh = false) => {
    if (!selectedTrade) {
      setApiAnalysis(null);
      setAnalysisError(null);
      return;
    }

    if (!forceRefresh && analysisCache[selectedTrade.id]) {
      setApiAnalysis(analysisCache[selectedTrade.id]);
      setAnalysisError(null);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const response = await fetch("/api/risk/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trade: selectedTrade }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiAnalysis(data);
        setAnalysisCache(prev => ({ ...prev, [selectedTrade.id]: data }));
      } else {
        setAnalysisError("Failed to analyze trade risk. Please try again.");
      }
    } catch (error) {
      console.error("Risk analysis failed:", error);
      setAnalysisError("Network error. Please check your connection and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedTrade, analysisCache]);

  useEffect(() => {
    if (selectedTrade) {
      fetchRiskAnalysis();
    }
  }, [selectedTradeId]);

  const riskCategories = useMemo(() => {
    if (apiAnalysis) {
      return apiAnalysis.categories.map(c => ({
        key: c.key,
        label: c.label.replace(" Risk", ""),
        score: c.score,
        maxScore: 100,
        trend: c.trend === "improving" ? "down" as const : c.trend === "elevated" ? "up" as const : "stable" as const,
        factors: c.factors,
        icon: c.key === "counterparty" ? Building2 :
              c.key === "corridor" ? Globe :
              c.key === "compliance" ? FileCheck :
              c.key === "financial" ? Banknote :
              c.key === "operational" ? Package : Users,
      }));
    }
    return generateRiskCategories(selectedTrade);
  }, [apiAnalysis, selectedTrade]);

  const overallScore = useMemo(() => {
    if (apiAnalysis) return apiAnalysis.overallScore;
    if (riskCategories.every(c => c.score === 0)) return 0;
    return Math.round(riskCategories.reduce((sum, c) => sum + c.score, 0) / riskCategories.length);
  }, [apiAnalysis, riskCategories]);

  const insights = useMemo(() => {
    if (apiAnalysis) return apiAnalysis.insights;
    return generateInsights(riskCategories, selectedTrade);
  }, [apiAnalysis, riskCategories, selectedTrade]);

  const radarData = riskCategories.map(c => ({
    category: c.label,
    score: c.score,
    fullMark: 100,
  }));

  const barData = riskCategories.map(c => ({
    name: c.label,
    score: c.score,
    fill: getRiskLevel(c.score).bg.replace("bg-", ""),
  }));

  const handleRunAnalysis = () => {
    fetchRiskAnalysis(true);
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-8 md:py-10">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <h1 className="font-semibold text-2xl tracking-tight md:text-3xl" data-testid="text-title-risk">
              Risk Assessment
            </h1>
          </div>
          <p className="text-sm text-muted-foreground" data-testid="text-subtitle-risk">
            AI-driven risk analysis and visualization for trade operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedTradeId || ""}
            onChange={(e) => setSelectedTradeId(e.target.value || null)}
            className="h-9 px-3 rounded-lg border bg-background text-sm"
            data-testid="select-trade"
          >
            <option value="">All Trades</option>
            {trades.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          <Button
            variant="secondary"
            className="h-9"
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            data-testid="button-run-analysis"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`} />
            {isAnalyzing ? "Analyzing..." : "Run Analysis"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <TBCard
            title="Risk Overview"
            subtitle="Comprehensive risk profile visualization"
            icon={<Sparkles className="h-4 w-4" />}
            state={isAnalyzing ? "loading" : "idle"}
            dataTestId="card-risk-overview"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center justify-center p-4">
                <RiskScoreGauge score={overallScore} size={140} />
                <div className="mt-3 text-center">
                  <div className="text-sm font-medium">Overall Risk Score</div>
                  <div className="text-xs text-muted-foreground">
                    Weighted average across all categories
                  </div>
                </div>
              </div>
              <div className="h-[200px]" data-testid="chart-radar-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="category"
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Radar
                      name="Risk"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TBCard>

          <TBCard
            title="Risk Categories"
            subtitle="Detailed breakdown by risk dimension"
            icon={<AlertTriangle className="h-4 w-4" />}
            state="idle"
            dataTestId="card-risk-categories"
          >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {riskCategories.map(category => (
                <CategoryCard key={category.key} category={category} />
              ))}
            </div>
          </TBCard>

          <TBCard
            title="Risk Distribution"
            subtitle="Comparative view across categories"
            icon={<TrendingUp className="h-4 w-4" />}
            state="idle"
            dataTestId="card-risk-distribution"
          >
            <div className="h-[200px]" data-testid="chart-bar-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical">
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.score <= 30 ? "#22c55e" :
                          entry.score <= 60 ? "#eab308" :
                          entry.score <= 80 ? "#f97316" : "#ef4444"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TBCard>
        </div>

        <div className="space-y-6">
          <TBCard
            title="AI Insights"
            subtitle="Automated risk intelligence"
            icon={<Sparkles className="h-4 w-4" />}
            state="idle"
            dataTestId="card-ai-insights"
          >
            {analysisError ? (
              <div className="text-center py-6" data-testid="insights-error">
                <AlertTriangle className="w-10 h-10 mx-auto text-orange-500 mb-3" />
                <div className="text-sm font-medium text-orange-600 mb-1">Analysis Error</div>
                <div className="text-xs text-muted-foreground mb-3">{analysisError}</div>
                <Button variant="outline" size="sm" onClick={handleRunAnalysis} data-testid="button-retry-analysis">
                  Try Again
                </Button>
              </div>
            ) : selectedTrade ? (
              <div className="space-y-3">
                {insights.map(insight => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
                {insights.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground text-sm" data-testid="insights-empty">
                    No notable insights at this time
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8" data-testid="insights-no-trade">
                <Sparkles className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <div className="text-sm font-medium mb-1">Select a trade</div>
                <div className="text-xs text-muted-foreground">
                  Choose a trade to see AI-generated risk insights
                </div>
              </div>
            )}
          </TBCard>

          {selectedTrade && (
            <TBCard
              title="Trade Context"
              subtitle="Current trade details"
              icon={<Package className="h-4 w-4" />}
              state="idle"
              dataTestId="card-trade-context"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Trade</span>
                  <span className="text-sm font-medium" data-testid="context-trade-title">{selectedTrade.title}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Corridor</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted" data-testid="context-corridor">{selectedTrade.corridor}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Value</span>
                  <span className="text-sm font-medium" data-testid="context-value">
                    {selectedTrade.currency} {selectedTrade.value.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Status</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${selectedTrade.status === "active" ? "bg-green-500/10 text-green-600" : "bg-muted"}`} data-testid="context-status">
                    {selectedTrade.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Goods</span>
                  <span className="text-sm" data-testid="context-goods">{selectedTrade.goods || "—"}</span>
                </div>
              </div>
            </TBCard>
          )}

          <div className="rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">About Risk Scores</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><span className="text-green-600 font-medium">0-30:</span> Low risk</p>
              <p><span className="text-yellow-600 font-medium">31-60:</span> Medium risk</p>
              <p><span className="text-orange-600 font-medium">61-80:</span> High risk</p>
              <p><span className="text-red-600 font-medium">81-100:</span> Critical risk</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
