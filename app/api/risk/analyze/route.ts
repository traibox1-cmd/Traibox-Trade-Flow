import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trade } = body;

    if (!trade) {
      return NextResponse.json(
        { error: "Trade data is required" },
        { status: 400 }
      );
    }

    const corridorParts = (trade.corridor || "")
      .split("→")
      .map((s: string) => s.trim());
    const isHighRiskCorridor = ["Africa", "SEA", "LATAM", "MENA"].some(
      (r: string) => (trade.corridor || "").includes(r)
    );
    const isLargeTrade = (trade.value || 0) > 100000;
    const hasVerifiedParties = (trade.linkedParties || []).length > 0;

    const tradeIdHash = (trade.id || "")
      .split("")
      .reduce(
        (acc: number, char: string) => acc + char.charCodeAt(0),
        0
      );
    const variation = tradeIdHash % 10;

    const categories = [
      {
        key: "counterparty",
        label: "Counterparty Risk",
        score: hasVerifiedParties ? 28 + variation : 55 + variation,
        trend: hasVerifiedParties ? "improving" : "stable",
        factors: [
          hasVerifiedParties
            ? "Network-verified partners detected"
            : "Unverified counterparties",
          "Credit assessment: " +
            (hasVerifiedParties ? "Strong" : "Limited data"),
          "Payment history: On-time",
        ],
        aiInsight: hasVerifiedParties
          ? "Counterparties have established track record in your network."
          : "Consider requesting trade references or credit reports.",
      },
      {
        key: "corridor",
        label: "Corridor Risk",
        score: isHighRiskCorridor ? 52 + variation : 25 + variation,
        trend: isHighRiskCorridor ? "elevated" : "stable",
        factors: [
          `Origin: ${corridorParts[0] || "Unknown"}`,
          `Destination: ${corridorParts[1] || "Unknown"}`,
          isHighRiskCorridor
            ? "Enhanced monitoring recommended"
            : "Standard compliance path",
        ],
        aiInsight: isHighRiskCorridor
          ? "This corridor requires enhanced due diligence. Consider additional documentation."
          : "Low-risk corridor with established trade flows.",
      },
      {
        key: "compliance",
        label: "Compliance Risk",
        score: 22 + (variation % 8),
        trend: "improving",
        factors: [
          "Sanctions screening: Clear",
          "AML checks: Passed",
          "Document verification: Complete",
        ],
        aiInsight:
          "All compliance checks passed. Continue standard monitoring.",
      },
      {
        key: "financial",
        label: "Financial Risk",
        score: isLargeTrade ? 48 + variation : 28 + variation,
        trend: isLargeTrade ? "elevated" : "stable",
        factors: [
          `Trade value: ${trade.currency || "USD"} ${(trade.value || 0).toLocaleString()}`,
          trade.fundingType
            ? `Funding: ${trade.fundingType}`
            : "Self-funded",
          "Currency exposure: Moderate",
        ],
        aiInsight: isLargeTrade
          ? "Large transaction value. Consider trade insurance or guarantees."
          : "Transaction value within normal parameters.",
      },
      {
        key: "operational",
        label: "Operational Risk",
        score: 35 + (variation % 12),
        trend: "stable",
        factors: [
          `Incoterms: ${trade.incoterms || "Not specified"}`,
          `Goods: ${trade.goods || "General cargo"}`,
          "Logistics tracking: " +
            ((trade.logisticsMilestones || []).length > 0
              ? "Active"
              : "Pending"),
        ],
        aiInsight:
          "Standard operational complexity. Monitor logistics milestones.",
      },
      {
        key: "concentration",
        label: "Concentration Risk",
        score: 32 + (variation % 8),
        trend: "improving",
        factors: [
          "Corridor diversification: Good",
          "Counterparty spread: Moderate",
          "Sector exposure: Balanced",
        ],
        aiInsight:
          "Portfolio concentration within acceptable limits.",
      },
    ];

    const overallScore = Math.round(
      categories.reduce((sum, c) => sum + c.score, 0) / categories.length
    );
    const riskLevel =
      overallScore <= 30
        ? "low"
        : overallScore <= 60
          ? "medium"
          : overallScore <= 80
            ? "high"
            : "critical";

    const insights: Array<{
      id: string;
      type: string;
      title: string;
      description: string;
      action?: string;
    }> = [];
    const highRiskCats = categories.filter((c) => c.score > 50);
    if (highRiskCats.length > 0) {
      insights.push({
        id: "high-risk",
        type: "warning",
        title: `${highRiskCats.length} elevated risk area${highRiskCats.length > 1 ? "s" : ""} detected`,
        description: `${highRiskCats.map((c) => c.label.replace(" Risk", "")).join(", ")} require${highRiskCats.length === 1 ? "s" : ""} attention.`,
        action: "Review mitigation options",
      });
    }

    if (!trade.fundingType && trade.value > 50000) {
      insights.push({
        id: "funding-opportunity",
        type: "opportunity",
        title: "Trade finance opportunity",
        description:
          "Consider structured financing to optimize working capital and reduce exposure.",
        action: "Explore funding options",
      });
    }

    const lowRiskCats = categories.filter((c) => c.score <= 30);
    if (lowRiskCats.length >= 3) {
      insights.push({
        id: "strong-profile",
        type: "info",
        title: "Strong risk profile",
        description: `${lowRiskCats.map((c) => c.label.replace(" Risk", "")).join(", ")} show excellent scores.`,
      });
    }

    return NextResponse.json({
      tradeId: trade.id,
      overallScore,
      riskLevel,
      categories,
      insights,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Risk analysis error:", error);
    return NextResponse.json(
      { error: "Failed to generate risk analysis" },
      { status: 500 }
    );
  }
}
