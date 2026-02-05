import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Globe,
  Calendar,
  AlertTriangle,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  BarChart3,
  ArrowRight,
  RefreshCw,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

type Scenario = {
  id: string;
  name: string;
  commodity: string;
  volume: number;
  unitPrice: number;
  currency: string;
  corridor: string;
  timeline: number;
  priceVolatility: number;
  exchangeRisk: number;
  complianceCost: number;
  shippingCost: number;
  insuranceCost: number;
  financingRate: number;
};

type ScenarioResult = {
  totalRevenue: number;
  totalCosts: number;
  grossMargin: number;
  marginPercent: number;
  riskScore: number;
  breakEvenVolume: number;
  projectedProfit: number;
  monthlyProjections: { month: string; revenue: number; costs: number; profit: number }[];
  riskFactors: { factor: string; impact: "low" | "medium" | "high"; value: number }[];
};

const COMMODITIES = [
  "Coffee (Arabica)",
  "Cocoa Beans",
  "Cotton",
  "Wheat",
  "Soybeans",
  "Palm Oil",
  "Sugar (Raw)",
  "Rice",
  "Copper",
  "Aluminum",
];

const CORRIDORS = [
  "East Africa → Europe",
  "West Africa → North America",
  "South America → Asia",
  "Southeast Asia → Europe",
  "Middle East → Asia",
  "Central America → North America",
];

const CURRENCIES = ["USD", "EUR", "GBP", "CHF", "JPY"];

const defaultScenario: Omit<Scenario, "id" | "name"> = {
  commodity: "Coffee (Arabica)",
  volume: 500,
  unitPrice: 180,
  currency: "USD",
  corridor: "East Africa → Europe",
  timeline: 6,
  priceVolatility: 15,
  exchangeRisk: 10,
  complianceCost: 2.5,
  shippingCost: 8,
  insuranceCost: 1.5,
  financingRate: 5,
};

function calculateScenario(scenario: Scenario): ScenarioResult {
  const baseRevenue = scenario.volume * scenario.unitPrice;
  
  const shippingTotal = baseRevenue * (scenario.shippingCost / 100);
  const insuranceTotal = baseRevenue * (scenario.insuranceCost / 100);
  const complianceTotal = baseRevenue * (scenario.complianceCost / 100);
  const financingTotal = baseRevenue * (scenario.financingRate / 100) * (scenario.timeline / 12);
  
  const volatilityImpact = baseRevenue * (scenario.priceVolatility / 100) * 0.3;
  const exchangeImpact = baseRevenue * (scenario.exchangeRisk / 100) * 0.2;
  
  const totalCosts = shippingTotal + insuranceTotal + complianceTotal + financingTotal;
  const riskAdjustedCosts = totalCosts + volatilityImpact + exchangeImpact;
  
  const grossMargin = baseRevenue - riskAdjustedCosts;
  const marginPercent = (grossMargin / baseRevenue) * 100;
  
  const riskScore = Math.min(100, Math.round(
    (scenario.priceVolatility * 0.4) +
    (scenario.exchangeRisk * 0.3) +
    (scenario.timeline * 2) +
    (scenario.financingRate * 1.5)
  ));
  
  const breakEvenVolume = Math.ceil(riskAdjustedCosts / scenario.unitPrice);
  
  const monthlyProjections = Array.from({ length: scenario.timeline }, (_, i) => {
    const month = new Date();
    month.setMonth(month.getMonth() + i + 1);
    const monthName = month.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    
    // Deterministic volatility simulation using sinusoidal pattern based on month index and volatility
    const volatilityAmplitude = scenario.priceVolatility / 100;
    const phaseShift = (scenario.volume * scenario.unitPrice) % 10; // Seed based on scenario params
    const volatilityFactor = 1 + (Math.sin((i + phaseShift) * 0.8) * volatilityAmplitude * 0.5);
    const monthRevenue = (baseRevenue / scenario.timeline) * volatilityFactor;
    const monthCosts = riskAdjustedCosts / scenario.timeline;
    
    return {
      month: monthName,
      revenue: Math.round(monthRevenue),
      costs: Math.round(monthCosts),
      profit: Math.round(monthRevenue - monthCosts),
    };
  });
  
  const riskFactors: { factor: string; impact: "low" | "medium" | "high"; value: number }[] = [
    { factor: "Price Volatility", impact: scenario.priceVolatility > 20 ? "high" : scenario.priceVolatility > 10 ? "medium" : "low", value: scenario.priceVolatility },
    { factor: "Exchange Rate", impact: scenario.exchangeRisk > 15 ? "high" : scenario.exchangeRisk > 8 ? "medium" : "low", value: scenario.exchangeRisk },
    { factor: "Timeline Risk", impact: scenario.timeline > 9 ? "high" : scenario.timeline > 6 ? "medium" : "low", value: scenario.timeline * 5 },
    { factor: "Financing Cost", impact: scenario.financingRate > 8 ? "high" : scenario.financingRate > 5 ? "medium" : "low", value: scenario.financingRate * 3 },
  ];
  
  return {
    totalRevenue: baseRevenue,
    totalCosts: riskAdjustedCosts,
    grossMargin,
    marginPercent,
    riskScore,
    breakEvenVolume,
    projectedProfit: grossMargin,
    monthlyProjections,
    riskFactors,
  };
}

export function ScenarioBuilderContent() {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { ...defaultScenario, id: "base", name: "Base Case" },
  ]);
  const [activeScenarioId, setActiveScenarioId] = useState("base");
  const [compareMode, setCompareMode] = useState(false);
  
  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];
  const result = useMemo(() => calculateScenario(activeScenario), [activeScenario]);
  
  const allResults = useMemo(() => 
    scenarios.map(s => ({ scenario: s, result: calculateScenario(s) })),
    [scenarios]
  );
  
  const updateScenario = (field: keyof Scenario, value: string | number) => {
    setScenarios(prev => prev.map(s => 
      s.id === activeScenarioId ? { ...s, [field]: value } : s
    ));
  };
  
  const addScenario = () => {
    const newId = `scenario-${Date.now()}`;
    const basedOn = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];
    setScenarios(prev => [...prev, { ...basedOn, id: newId, name: `Scenario ${prev.length + 1}` }]);
    setActiveScenarioId(newId);
  };
  
  const duplicateScenario = () => {
    const newId = `scenario-${Date.now()}`;
    setScenarios(prev => [...prev, { ...activeScenario, id: newId, name: `${activeScenario.name} (Copy)` }]);
    setActiveScenarioId(newId);
  };
  
  const deleteScenario = (id: string) => {
    if (scenarios.length <= 1) return;
    setScenarios(prev => prev.filter(s => s.id !== id));
    if (activeScenarioId === id) {
      setActiveScenarioId(scenarios[0].id === id ? scenarios[1].id : scenarios[0].id);
    }
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: activeScenario.currency, maximumFractionDigits: 0 }).format(value);
  };
  
  const riskImpactColors = {
    low: "bg-green-500/10 text-green-600 border-green-500/20",
    medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    high: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Scenario Builder
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Model trade scenarios and forecast outcomes with adjustable parameters
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={compareMode ? "default" : "outline"}
            size="sm"
            onClick={() => setCompareMode(!compareMode)}
            className="gap-2"
            data-testid="button-compare-mode"
          >
            <BarChart3 className="w-4 h-4" />
            Compare
          </Button>
          <Button variant="outline" size="sm" onClick={addScenario} className="gap-2" data-testid="button-add-scenario">
            <Plus className="w-4 h-4" />
            New Scenario
          </Button>
        </div>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        {scenarios.map((scenario) => (
          <button
            key={scenario.id}
            onClick={() => setActiveScenarioId(scenario.id)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              activeScenarioId === scenario.id
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border hover:bg-accent"
            )}
            data-testid={`tab-scenario-${scenario.id}`}
          >
            {scenario.name}
            {scenarios.length > 1 && activeScenarioId === scenario.id && (
              <button
                onClick={(e) => { e.stopPropagation(); deleteScenario(scenario.id); }}
                className="p-0.5 hover:bg-white/20 rounded"
                data-testid={`button-delete-scenario-${scenario.id}`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </button>
        ))}
      </div>
      
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground">Parameters</h3>
              <Button variant="ghost" size="sm" onClick={duplicateScenario} className="gap-1 h-7" data-testid="button-duplicate-scenario">
                <Copy className="w-3.5 h-3.5" />
                Clone
              </Button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Scenario Name</label>
                <input
                  type="text"
                  value={activeScenario.name}
                  onChange={(e) => updateScenario("name", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                  data-testid="input-scenario-name"
                />
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Commodity</label>
                <select
                  value={activeScenario.commodity}
                  onChange={(e) => updateScenario("commodity", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                  data-testid="select-commodity"
                >
                  {COMMODITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Trade Corridor</label>
                <select
                  value={activeScenario.corridor}
                  onChange={(e) => updateScenario("corridor", e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                  data-testid="select-corridor"
                >
                  {CORRIDORS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Volume (MT)
                  </label>
                  <input
                    type="number"
                    value={activeScenario.volume}
                    onChange={(e) => updateScenario("volume", parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                    data-testid="input-volume"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Unit Price ({activeScenario.currency}/MT)
                  </label>
                  <input
                    type="number"
                    value={activeScenario.unitPrice}
                    onChange={(e) => updateScenario("unitPrice", parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                    data-testid="input-unit-price"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Currency</label>
                  <select
                    value={activeScenario.currency}
                    onChange={(e) => updateScenario("currency", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                    data-testid="select-currency"
                  >
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Timeline (months)
                  </label>
                  <input
                    type="number"
                    value={activeScenario.timeline}
                    onChange={(e) => updateScenario("timeline", Math.max(1, Math.min(24, parseInt(e.target.value) || 1)))}
                    className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg"
                    min={1}
                    max={24}
                    data-testid="input-timeline"
                  />
                </div>
              </div>
              
              <div className="pt-3 border-t border-border">
                <h4 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Risk Parameters
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Price Volatility</span>
                      <span className="font-medium">{activeScenario.priceVolatility}%</span>
                    </div>
                    <Slider
                      value={[activeScenario.priceVolatility]}
                      onValueChange={([v]) => updateScenario("priceVolatility", v)}
                      max={50}
                      step={1}
                      data-testid="slider-price-volatility"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Exchange Rate Risk</span>
                      <span className="font-medium">{activeScenario.exchangeRisk}%</span>
                    </div>
                    <Slider
                      value={[activeScenario.exchangeRisk]}
                      onValueChange={([v]) => updateScenario("exchangeRisk", v)}
                      max={30}
                      step={1}
                      data-testid="slider-exchange-risk"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-3 border-t border-border">
                <h4 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  Cost Parameters (% of value)
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Shipping Cost</span>
                      <span className="font-medium">{activeScenario.shippingCost}%</span>
                    </div>
                    <Slider
                      value={[activeScenario.shippingCost]}
                      onValueChange={([v]) => updateScenario("shippingCost", v)}
                      max={20}
                      step={0.5}
                      data-testid="slider-shipping-cost"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Insurance Cost</span>
                      <span className="font-medium">{activeScenario.insuranceCost}%</span>
                    </div>
                    <Slider
                      value={[activeScenario.insuranceCost]}
                      onValueChange={([v]) => updateScenario("insuranceCost", v)}
                      max={5}
                      step={0.1}
                      data-testid="slider-insurance-cost"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Compliance Cost</span>
                      <span className="font-medium">{activeScenario.complianceCost}%</span>
                    </div>
                    <Slider
                      value={[activeScenario.complianceCost]}
                      onValueChange={([v]) => updateScenario("complianceCost", v)}
                      max={10}
                      step={0.5}
                      data-testid="slider-compliance-cost"
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Financing Rate (annual)</span>
                      <span className="font-medium">{activeScenario.financingRate}%</span>
                    </div>
                    <Slider
                      value={[activeScenario.financingRate]}
                      onValueChange={([v]) => updateScenario("financingRate", v)}
                      max={15}
                      step={0.5}
                      data-testid="slider-financing-rate"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2 space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                Total Revenue
              </div>
              <div className="text-xl font-semibold" data-testid="value-total-revenue">{formatCurrency(result.totalRevenue)}</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                Total Costs
              </div>
              <div className="text-xl font-semibold text-red-500" data-testid="value-total-costs">{formatCurrency(result.totalCosts)}</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                {result.marginPercent >= 0 ? <TrendingUp className="w-3.5 h-3.5 text-green-500" /> : <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
                Gross Margin
              </div>
              <div className={cn("text-xl font-semibold", result.marginPercent >= 0 ? "text-green-500" : "text-red-500")} data-testid="value-gross-margin">
                {formatCurrency(result.grossMargin)}
                <span className="text-sm ml-1">({result.marginPercent.toFixed(1)}%)</span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Risk Score
              </div>
              <div className={cn(
                "text-xl font-semibold",
                result.riskScore > 60 ? "text-red-500" : result.riskScore > 35 ? "text-amber-500" : "text-green-500"
              )} data-testid="value-risk-score">
                {result.riskScore}/100
              </div>
            </motion.div>
          </div>
          
          {compareMode && scenarios.length > 1 ? (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Scenario Comparison
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={allResults.map(r => ({
                    name: r.scenario.name,
                    revenue: r.result.totalRevenue,
                    costs: r.result.totalCosts,
                    margin: r.result.grossMargin,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="costs" name="Costs" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="margin" name="Margin" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Scenario</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Margin %</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Risk Score</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Break-Even</th>
                      <th className="text-center py-2 px-3 text-muted-foreground font-medium">Viable</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allResults.map(({ scenario, result: r }) => (
                      <tr key={scenario.id} className="border-b border-border/50">
                        <td className="py-2 px-3 font-medium">{scenario.name}</td>
                        <td className={cn("py-2 px-3 text-right", r.marginPercent >= 0 ? "text-green-500" : "text-red-500")}>
                          {r.marginPercent.toFixed(1)}%
                        </td>
                        <td className={cn("py-2 px-3 text-right", r.riskScore > 60 ? "text-red-500" : r.riskScore > 35 ? "text-amber-500" : "text-green-500")}>
                          {r.riskScore}
                        </td>
                        <td className="py-2 px-3 text-right">{r.breakEvenVolume} MT</td>
                        <td className="py-2 px-3 text-center">
                          {r.marginPercent > 5 && r.riskScore < 50 ? (
                            <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Monthly Projections
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={result.monthlyProjections}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis className="text-xs" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="costs" name="Costs" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="profit" name="Profit" stroke="hsl(142, 76%, 36%)" fill="hsl(142, 76%, 36%)" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-medium text-sm uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Risk Factor Analysis
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {result.riskFactors.map((rf) => (
                    <div key={rf.factor} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
                      <span className="text-sm">{rf.factor}</span>
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", riskImpactColors[rf.impact])}>
                        {rf.impact.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm mb-1">AI Recommendation</h4>
                      <p className="text-sm text-muted-foreground">
                        {result.riskScore > 60 
                          ? "This scenario has elevated risk. Consider reducing timeline or negotiating better financing terms to improve viability."
                          : result.marginPercent < 10
                            ? "Margins are tight. Look for opportunities to reduce shipping costs or increase volume for better economies of scale."
                            : result.marginPercent > 25
                              ? "Strong margin profile with manageable risk. This scenario looks favorable for execution."
                              : "Balanced risk-reward profile. Monitor price volatility closely and consider hedging strategies."
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm font-medium">{activeScenario.corridor}</div>
                <div className="text-xs text-muted-foreground">{activeScenario.commodity} • {activeScenario.volume} MT • {activeScenario.timeline} months</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border",
                result.marginPercent > 15 ? "bg-green-500/10 text-green-600 border-green-500/20" :
                result.marginPercent > 5 ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                "bg-red-500/10 text-red-600 border-red-500/20"
              )}>
                {result.marginPercent > 15 ? "High Potential" : result.marginPercent > 5 ? "Moderate" : "Low Margin"}
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{formatCurrency(result.projectedProfit)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScenarioBuilderContent;
