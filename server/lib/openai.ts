import OpenAI from "openai";

const hasValidApiKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "demo-key";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-demo-key-placeholder",
});

export type AIResponse = {
  summary: string;
  missing_inputs: string[];
  next_actions: { type: string; label: string; description: string }[];
  trade_updates?: {
    title?: string;
    corridor?: string;
    goods?: string;
    value?: number;
    currency?: string;
    incoterms?: string;
    parties?: { name: string; role: string; region: string }[];
  };
  risk_assessment?: {
    level: "low" | "medium" | "high";
    factors: string[];
  };
  missing_evidence?: string[];
  recommended_terms?: {
    tenor: number;
    rate: number;
    fees: number;
    conditions: string[];
  };
};

function generateDemoResponse(messages: Array<{ role: string; content: string }>, mode: string): AIResponse {
  const lastUserMessage = messages[messages.length - 1]?.content || "";
  const lower = lastUserMessage.toLowerCase();

  if (mode === "deal-assistant") {
    if (lower.includes("risk") || lower.includes("assess") || lower.includes("analyze")) {
      return {
        summary: "Based on the funding request parameters, this deal presents medium risk due to corridor volatility but has strong fundamentals.",
        missing_inputs: [],
        next_actions: [
          { type: "review", label: "Review in Funding Desk", description: "Take action on this request" }
        ],
        risk_assessment: {
          level: "medium",
          factors: [
            "Emerging market corridor adds currency volatility",
            "Requester has limited trade history",
            "Commodity price fluctuations may impact margins"
          ]
        },
        missing_evidence: [
          "Audited financial statements (last 2 years)",
          "Trade contract or purchase order",
          "Counterparty credit report"
        ],
        recommended_terms: {
          tenor: 60,
          rate: 2.8,
          fees: 5500,
          conditions: [
            "Require 20% cash collateral",
            "Weekly position monitoring",
            "ESG compliance certification"
          ]
        }
      };
    }

    if (lower.includes("term") || lower.includes("recommend") || lower.includes("pricing")) {
      return {
        summary: "For this request size and corridor, I recommend 60-day tenor at 2.5% with standard trade finance covenants.",
        missing_inputs: [],
        next_actions: [],
        recommended_terms: {
          tenor: 60,
          rate: 2.5,
          fees: 5000,
          conditions: [
            "Proof of shipment within 30 days",
            "Insurance coverage minimum 110%",
            "Right to audit trade documents"
          ]
        }
      };
    }

    if (lower.includes("evidence") || lower.includes("document") || lower.includes("missing")) {
      return {
        summary: "Several key documents are missing for proper due diligence. Request these from the operator before proceeding.",
        missing_inputs: [],
        next_actions: [
          { type: "request-info", label: "Request Missing Docs", description: "Send info request to operator" }
        ],
        missing_evidence: [
          "Trade contract or sales agreement",
          "KYB documentation for counterparty",
          "Certificate of origin",
          "Insurance certificate"
        ]
      };
    }

    return {
      summary: "I can help you analyze deals, assess risks, and recommend financing terms. Ask me about specific funding requests or risk factors.",
      missing_inputs: [],
      next_actions: []
    };
  }

  if (lower.includes("compliance") || lower.includes("check") || lower.includes("kyc") || lower.includes("sanction")) {
    return {
      summary: "I can run compliance checks including sanctions screening (OFAC, EU, UN), KYC verification, and document review. This ensures your trade meets regulatory requirements.",
      missing_inputs: [],
      next_actions: [
        { type: "compliance", label: "Run Compliance Check", description: "Screen parties against sanctions lists and verify KYC" }
      ],
    };
  }

  if (lower.includes("fund") || lower.includes("financ") || lower.includes("capital") || lower.includes("offer") || lower.includes("lc") || lower.includes("credit")) {
    return {
      summary: "I'll help you explore trade finance options: Letter of Credit (1.5-2.5%, 5-7 days), Invoice Factoring (2-4%, 1-2 days), or Supply Chain Finance (1-3% APR).",
      missing_inputs: [],
      next_actions: [
        { type: "funding", label: "Request Trade Funding", description: "Submit funding request for LC, factoring, or supply chain finance" }
      ],
    };
  }

  if (lower.includes("pay") || lower.includes("payment") || lower.includes("settlement") || lower.includes("transfer") || lower.includes("swift")) {
    return {
      summary: "I can set up cross-border payment routing via SWIFT (2-3 days), ACH/SEPA (1-2 days), or stablecoin rails (same-day settlement).",
      missing_inputs: [],
      next_actions: [
        { type: "payment", label: "Create Payment Instruction", description: "Set up payment routing with optimal cost-speed tradeoff" }
      ],
    };
  }

  if (lower.includes("proof") || lower.includes("doc") || lower.includes("evidence") || lower.includes("certificate") || lower.includes("pack")) {
    return {
      summary: "I'll generate a comprehensive proof pack with commercial invoice, bill of lading, certificates, and compliance records ready for verification.",
      missing_inputs: [],
      next_actions: [
        { type: "proof-pack", label: "Generate Proof Pack", description: "Create document package with timestamped evidence" }
      ],
    };
  }

  if (lower.includes("partner") || lower.includes("invite") || lower.includes("network") || lower.includes("connect")) {
    return {
      summary: "I can help manage your trade network with private-by-default security, partner invitations, and matchmaking.",
      missing_inputs: [],
      next_actions: [
        { type: "invite-partner", label: "Invite Trade Partner", description: "Send secure invitation to join your network" }
      ],
    };
  }

  if (lower.includes("trade") || lower.includes("plan") || lower.includes("shipment") || lower.includes("export") || lower.includes("import") || lower.includes("buy") || lower.includes("sell")) {
    const extractedTrade = extractTradeFromMessage(lower);
    return {
      summary: "I'll help you set up this trade. I've extracted the key details - let's create a trade workspace to manage the full lifecycle.",
      missing_inputs: extractedTrade.missingInputs,
      next_actions: [
        { type: "create-trade", label: "Create Trade Workspace", description: "Set up full trade management with compliance, funding, and documentation" }
      ],
      trade_updates: extractedTrade.updates,
    };
  }

  return {
    summary: "I'm TRAIBOX, your AI trade assistant. I can help with trade planning, compliance checks, funding requests, payment routing, and documentation.",
    missing_inputs: [],
    next_actions: [
      { type: "create-trade", label: "Plan New Trade", description: "Start planning a new international trade" },
      { type: "compliance", label: "Run Compliance Check", description: "Screen counterparties and verify documents" },
      { type: "funding", label: "Request Funding", description: "Explore trade finance options" },
    ],
  };
}

function extractTradeFromMessage(message: string): { updates: AIResponse["trade_updates"]; missingInputs: string[] } {
  const updates: AIResponse["trade_updates"] = {};
  const missingInputs: string[] = [];

  const corridorMatch = message.match(/(from|ex)\s+(\w+)\s+(to|into)\s+(\w+)/i);
  if (corridorMatch) {
    updates.corridor = `${corridorMatch[2].toUpperCase()} → ${corridorMatch[4].toUpperCase()}`;
  } else {
    missingInputs.push("Origin and destination countries");
  }

  const valueMatch = message.match(/\$?([\d,]+)k?/i);
  if (valueMatch) {
    let value = parseInt(valueMatch[1].replace(/,/g, ""));
    if (message.includes("k") || message.includes("K")) value *= 1000;
    updates.value = value;
    updates.currency = "USD";
  } else {
    missingInputs.push("Trade value");
  }

  const goodsPatterns = ["cotton", "textile", "coffee", "cocoa", "steel", "machinery", "electronics", "grain", "oil", "gas", "chemicals"];
  for (const good of goodsPatterns) {
    if (message.includes(good)) {
      updates.goods = good.charAt(0).toUpperCase() + good.slice(1);
      break;
    }
  }
  if (!updates.goods) {
    missingInputs.push("Type of goods");
  }

  const incotermsPatterns = ["fob", "cif", "exw", "dap", "ddp", "cfr"];
  for (const term of incotermsPatterns) {
    if (message.includes(term)) {
      updates.incoterms = term.toUpperCase();
      break;
    }
  }
  if (!updates.incoterms) {
    updates.incoterms = "FOB";
  }

  if (updates.goods && updates.corridor) {
    updates.title = `${updates.goods} Trade - ${updates.corridor}`;
  } else if (updates.goods) {
    updates.title = `${updates.goods} Trade`;
  } else {
    updates.title = "New Trade";
  }

  return { updates, missingInputs };
}

export async function createStructuredChatCompletion(
  messages: Array<{ role: string; content: string }>,
  mode: string = "auto"
): Promise<AIResponse> {
  if (!hasValidApiKey) {
    return generateDemoResponse(messages, mode);
  }

  let systemPrompt = "";
  
  if (mode === "deal-assistant") {
    systemPrompt = `You are a Deal Assistant for trade financiers. Analyze funding requests and provide:
{
  "summary": "Brief analysis summary",
  "risk_assessment": {"level": "low|medium|high", "factors": ["risk factor 1", "risk factor 2"]},
  "missing_evidence": ["Document 1", "Document 2"],
  "recommended_terms": {"tenor": 60, "rate": 2.5, "fees": 5000, "conditions": ["Condition 1"]},
  "next_actions": [{"type": "action-type", "label": "Button Label", "description": "What this does"}],
  "missing_inputs": []
}

Focus on: credit risk, corridor risk, documentation gaps, pricing recommendations.
Be concise and professional.`;
  } else {
    systemPrompt = `You are TRAIBOX, an AI trade assistant. ALWAYS respond with valid JSON in this exact format:
{
  "summary": "Brief 1-2 sentence response",
  "missing_inputs": ["List of missing info needed"],
  "next_actions": [{"type": "action-type", "label": "Button Label", "description": "What this does"}],
  "trade_updates": {"title": "...", "corridor": "...", "goods": "...", "value": 0, "currency": "USD", "incoterms": "FOB"}
}

Action types: create-trade, compliance, funding, payment, proof-pack, invite-partner
Only include trade_updates if creating/updating a trade.
Keep responses concise and actionable.`;
  }

  const allMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: allMessages as any,
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content || "";
    try {
      return JSON.parse(content) as AIResponse;
    } catch {
      return {
        summary: content,
        missing_inputs: [],
        next_actions: [],
      };
    }
  } catch (error: any) {
    console.error("OpenAI error, falling back to demo mode:", error);
    return generateDemoResponse(messages, mode);
  }
}

export async function* streamChatCompletion(
  messages: Array<{ role: string; content: string }>,
  mode: string = "auto"
) {
  const response = await createStructuredChatCompletion(messages, mode);
  const jsonStr = JSON.stringify(response);
  
  for (const char of jsonStr) {
    yield char;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

export function detectIntent(message: string, mode: string): string[] {
  const lower = message.toLowerCase();
  const intents: string[] = [];

  if (mode === "auto" || mode === "trade-plan") {
    if (lower.includes("plan") || lower.includes("corridor") || lower.includes("trade") || lower.includes("shipment")) {
      intents.push("create-trade");
    }
  }

  if (mode === "auto" || mode === "compliance") {
    if (lower.includes("compliance") || lower.includes("kyc") || lower.includes("sanction") || lower.includes("check") || lower.includes("verify")) {
      intents.push("compliance");
    }
  }

  if (mode === "auto" || mode === "funding") {
    if (lower.includes("fund") || lower.includes("financ") || lower.includes("capital") || lower.includes("offer") || lower.includes("lc") || lower.includes("credit")) {
      intents.push("funding");
    }
  }

  if (mode === "auto" || mode === "payments") {
    if (lower.includes("pay") || lower.includes("settlement") || lower.includes("transfer") || lower.includes("route") || lower.includes("swift") || lower.includes("remit")) {
      intents.push("payment");
    }
  }

  if (mode === "auto" || mode === "docs") {
    if (lower.includes("doc") || lower.includes("invoice") || lower.includes("certificate") || lower.includes("proof") || lower.includes("evidence")) {
      intents.push("proof-pack");
    }
  }

  if (mode === "auto") {
    if (lower.includes("partner") || lower.includes("invite") || lower.includes("network") || lower.includes("connect")) {
      intents.push("invite-partner");
    }
  }

  return intents;
}
