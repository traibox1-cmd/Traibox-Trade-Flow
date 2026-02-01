import OpenAI from "openai";

export const hasValidApiKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "demo-key";

// Server-side timeout for OpenAI calls (8 seconds to leave buffer for streaming)
const OPENAI_TIMEOUT_MS = 8000;

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-demo-key-placeholder",
});

export type ActionCard = {
  type: string;
  label: string;
  description: string;
};

export type AIResponse = {
  assistant_text: string;
  actions?: ActionCard[];
  meta?: {
    mode?: string;
    agent?: string;
    tradeId?: string;
  };
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

function generateDemoResponse(messages: Array<{ role: string; content: string; attachments?: any[] }>, mode: string, tradeContext?: any, chatMode?: string): AIResponse {
  const lastUserMessage = messages[messages.length - 1]?.content || "";
  const lower = lastUserMessage.toLowerCase();
  const hasAttachments = messages[messages.length - 1]?.attachments && messages[messages.length - 1].attachments!.length > 0;
  const isExploreMode = chatMode === "explore";

  if (mode === "deal-assistant") {
    if (lower.includes("risk") || lower.includes("assess") || lower.includes("analyze")) {
      return {
        assistant_text: "Based on the funding request parameters, this deal presents **medium risk** due to corridor volatility but has strong fundamentals.\n\n**Key risk factors:**\n• Emerging market corridor adds currency volatility\n• Requester has limited trade history\n• Commodity price fluctuations may impact margins\n\n**Missing evidence needed:**\n• Audited financial statements (last 2 years)\n• Trade contract or purchase order\n• Counterparty credit report\n\nWould you like me to request these documents from the operator?",
        actions: [
          { type: "review", label: "Review in Funding Desk", description: "Take action on this request" }
        ],
        meta: { mode: "deal-assistant" },
        risk_assessment: { level: "medium", factors: ["Emerging market corridor", "Limited trade history", "Commodity volatility"] },
        recommended_terms: { tenor: 60, rate: 2.8, fees: 5500, conditions: ["20% cash collateral", "Weekly monitoring", "ESG certification"] }
      };
    }

    if (lower.includes("term") || lower.includes("recommend") || lower.includes("pricing")) {
      return {
        assistant_text: "For this request size and corridor, I recommend:\n\n• **Tenor:** 60 days\n• **Rate:** 2.5% flat\n• **Fees:** $5,000\n\n**Standard covenants:**\n• Proof of shipment within 30 days\n• Insurance coverage minimum 110%\n• Right to audit trade documents\n\nDoes this align with your risk appetite?",
        meta: { mode: "deal-assistant" },
        recommended_terms: { tenor: 60, rate: 2.5, fees: 5000, conditions: ["Proof of shipment within 30 days", "Insurance 110%", "Audit rights"] }
      };
    }

    return {
      assistant_text: "I can help you analyze deals, assess risks, and recommend financing terms. What would you like to know about this funding request?\n\n• Risk assessment\n• Recommended terms and pricing\n• Missing documentation",
      meta: { mode: "deal-assistant" }
    };
  }

  // Trade Mode but no trade selected - still answer questions but offer to create/select trade
  const isTradeModeNoTrade = chatMode === "trade" && !tradeContext;
  
  // Handle Incoterm questions (common in both modes)
  if (lower.includes("incoterm") || lower.includes("fob") || lower.includes("cif") || lower.includes("exw") || lower.includes("dap") || lower.includes("ddp")) {
    const baseActions: any[] = [];
    
    if (isTradeModeNoTrade) {
      baseActions.push(
        { type: "create-trade", label: "Create Trade", description: "Create a trade to apply Incoterms" },
        { type: "select-trade", label: "Select Trade", description: "Choose an existing trade" }
      );
    }
    
    return {
      assistant_text: `**Incoterms** define the responsibilities between buyer and seller. Here's a quick guide:\n\n**Most Common:**\n• **FOB (Free on Board)** - Seller delivers goods on board the vessel; risk transfers at that point\n• **CIF (Cost, Insurance & Freight)** - Seller pays for freight and insurance to destination port\n• **EXW (Ex Works)** - Buyer takes all responsibility from seller's premises\n• **DAP (Delivered at Place)** - Seller delivers to a named destination\n• **DDP (Delivered Duty Paid)** - Seller bears all costs including customs/duties\n\n**Recommendation:**\n• For exports: FOB or CIF gives you control over logistics\n• For imports: DAP or DDP reduces your risk\n\n${isTradeModeNoTrade ? "To apply Incoterms to a specific trade, please create or select a trade first." : "Would you like me to update the Incoterms for your trade?"}`,
      actions: baseActions,
      meta: { mode: chatMode }
    };
  }

  // Explore Mode: Conversational with insights
  if (isExploreMode) {
    if (lower.includes("route") || lower.includes("corridor") || lower.includes("best")) {
      const corridorMatch = lower.match(/(\w{2})\s*(to|→|->)\s*(\w{2})/i) || lower.match(/from\s+(\w+)\s+to\s+(\w+)/i);
      return {
        assistant_text: `Great question! Here's what I know about this corridor:\n\n**Recommended routes:**\n• Sea freight via Rotterdam (14-18 days, most cost-effective)\n• Road freight for smaller loads (3-5 days, faster but higher cost)\n• Rail via EU network (7-10 days, good balance)\n\n**Key considerations:**\n• EU customs clearance typically smooth for wine\n• Temperature-controlled containers recommended\n• Consider insurance for fragile cargo\n\n**Common partners on this route:**\n• NordWerk Logistics (Forwarding, Customs)\n• EU Trade Partners (Insurance, Documentation)\n\nWould you like me to check compliance requirements or connect you with partners?`,
        actions: [
          { type: "compliance", label: "Check Compliance", description: "Verify regulatory requirements for this route" }
        ],
        meta: { mode: "explore" }
      };
    }

    if (lower.includes("compliance") || lower.includes("check") || lower.includes("kyc") || lower.includes("sanction")) {
      return {
        assistant_text: "Compliance is essential for smooth trade operations. Here's an overview:\n\n**Available checks:**\n• **Sanctions screening** - OFAC, EU, UN lists\n• **KYC verification** - Identity and business verification\n• **Document review** - Certificate of origin, invoices, etc.\n\n**Why it matters:**\n• Protects against regulatory penalties\n• Builds trust with financiers\n• Speeds up customs clearance\n\nShall I run a compliance check on specific parties or a trade corridor?",
        actions: [
          { type: "compliance", label: "Run Compliance Check", description: "Screen parties and verify documents" }
        ],
        meta: { mode: "explore" }
      };
    }

    if (lower.includes("fund") || lower.includes("financ") || lower.includes("capital") || lower.includes("lc") || lower.includes("credit")) {
      return {
        assistant_text: "Trade finance can significantly improve your cash flow. Here are your options:\n\n**Letter of Credit (LC)**\n• Cost: 1.5-2.5% of value\n• Timeline: 5-7 days to arrange\n• Best for: Large transactions, new relationships\n\n**Invoice Factoring**\n• Cost: 2-4% discount\n• Timeline: 1-2 days\n• Best for: Quick cash, established buyers\n\n**Supply Chain Finance**\n• Cost: 1-3% APR\n• Timeline: Flexible\n• Best for: Ongoing relationships\n\nWhat's your typical trade value and timeline? I can recommend the best option.",
        actions: [
          { type: "funding", label: "Request Trade Funding", description: "Submit a funding request" }
        ],
        meta: { mode: "explore" }
      };
    }

    return {
      assistant_text: "Hello! I'm your TRAIBOX assistant, here to help with international trade.\n\n**I can help you with:**\n• Route analysis and corridor insights\n• Compliance requirements and screening\n• Trade finance options\n• Payment routing\n• Documentation and proof packs\n\nWhat would you like to explore today?",
      meta: { mode: "explore" }
    };
  }

  // Trade Mode: Execution-focused (handles both with and without trade context)
  if (lower.includes("compliance") || lower.includes("check") || lower.includes("kyc") || lower.includes("sanction")) {
    const actions: any[] = [
      { type: "compliance", label: "Run Compliance Check", description: "Screen parties against sanctions lists and verify KYC" }
    ];
    if (isTradeModeNoTrade) {
      actions.unshift(
        { type: "create-trade", label: "Create Trade", description: "Create a trade first" },
        { type: "select-trade", label: "Select Trade", description: "Choose an existing trade" }
      );
    }
    return {
      assistant_text: isTradeModeNoTrade 
        ? "Compliance checks include **sanctions screening**, **KYC verification**, and **document review**.\n\nTo run compliance on a specific trade, please create or select a trade first."
        : "I'll run compliance checks for this trade including sanctions screening and KYC verification.",
      actions,
      meta: { mode: "trade" }
    };
  }

  if (lower.includes("fund") || lower.includes("financ") || lower.includes("capital") || lower.includes("offer") || lower.includes("lc") || lower.includes("credit")) {
    const actions: any[] = [
      { type: "funding", label: "Request Trade Funding", description: "Submit funding request" }
    ];
    if (isTradeModeNoTrade) {
      actions.unshift(
        { type: "create-trade", label: "Create Trade", description: "Create a trade first" },
        { type: "select-trade", label: "Select Trade", description: "Choose an existing trade" }
      );
    }
    return {
      assistant_text: isTradeModeNoTrade
        ? "Trade financing options include:\n• **LC (Letter of Credit)** - 1.5-2.5%\n• **Invoice Factoring** - 2-4%\n• **Supply Chain Finance** - 1-3% APR\n\nTo request funding, please create or select a trade first."
        : "I'll help you set up trade financing. Options include LC (1.5-2.5%), Invoice Factoring (2-4%), or Supply Chain Finance (1-3% APR).",
      actions,
      meta: { mode: "trade" }
    };
  }

  if (lower.includes("pay") || lower.includes("payment") || lower.includes("settlement") || lower.includes("transfer") || lower.includes("swift")) {
    const actions: any[] = [
      { type: "payment", label: "Create Payment", description: "Set up payment routing" }
    ];
    if (isTradeModeNoTrade) {
      actions.unshift(
        { type: "create-trade", label: "Create Trade", description: "Create a trade first" },
        { type: "select-trade", label: "Select Trade", description: "Choose an existing trade" }
      );
    }
    return {
      assistant_text: isTradeModeNoTrade
        ? "Available payment rails:\n• **SWIFT** - 2-3 days, global coverage\n• **ACH/SEPA** - 1-2 days, regional\n• **Stablecoin** - Same-day settlement\n\nTo set up payments, please create or select a trade first."
        : "I'll set up cross-border payment routing. Available rails: SWIFT (2-3 days), ACH/SEPA (1-2 days), or stablecoin (same-day).",
      actions,
      meta: { mode: "trade" }
    };
  }

  if (lower.includes("proof") || lower.includes("doc") || lower.includes("evidence") || lower.includes("certificate") || lower.includes("pack")) {
    const actions: any[] = [
      { type: "proof-pack", label: "Generate Proof Pack", description: "Create document package" }
    ];
    if (isTradeModeNoTrade) {
      actions.unshift(
        { type: "create-trade", label: "Create Trade", description: "Create a trade first" },
        { type: "select-trade", label: "Select Trade", description: "Choose an existing trade" }
      );
    }
    return {
      assistant_text: isTradeModeNoTrade
        ? "A **Proof Pack** includes:\n• Commercial invoice\n• Bill of lading\n• Certificates of origin\n• Compliance records\n\nTo generate a proof pack, please create or select a trade first."
        : "I'll generate a proof pack with commercial invoice, bill of lading, certificates, and compliance records.",
      actions,
      meta: { mode: "trade" }
    };
  }

  if (lower.includes("partner") || lower.includes("invite") || lower.includes("network") || lower.includes("connect")) {
    return {
      assistant_text: "I can help manage your trade network with partner invitations and matchmaking.",
      actions: [
        { type: "invite-partner", label: "Invite Partner", description: "Send secure invitation" }
      ],
      meta: { mode: "trade" }
    };
  }

  if (lower.includes("trade") || lower.includes("plan") || lower.includes("shipment") || lower.includes("export") || lower.includes("import") || lower.includes("buy") || lower.includes("sell")) {
    const extractedTrade = extractTradeFromMessage(lower);
    return {
      assistant_text: "I've extracted the trade details. Let's create a workspace to manage the full lifecycle.",
      actions: [
        { type: "create-trade", label: "Create Trade Workspace", description: "Set up trade management" }
      ],
      trade_updates: extractedTrade.updates,
      meta: { mode: "trade" }
    };
  }

  // Default response for Trade Mode
  const defaultActions: any[] = [];
  if (isTradeModeNoTrade) {
    defaultActions.push(
      { type: "create-trade", label: "Create Trade", description: "Start a new trade" },
      { type: "select-trade", label: "Select Trade", description: "Choose an existing trade" }
    );
  } else {
    defaultActions.push(
      { type: "create-trade", label: "Plan New Trade", description: "Start a new trade" },
      { type: "compliance", label: "Run Compliance", description: "Check compliance" },
      { type: "funding", label: "Request Funding", description: "Explore finance options" }
    );
  }

  return {
    assistant_text: isTradeModeNoTrade
      ? "I'm ready to help with your trade. What would you like to know?\n\nFor **workflow actions** (compliance, funding, payments, proof packs), please create or select a trade first."
      : "I'm TRAIBOX, your AI trade assistant. I can help with trade planning, compliance, funding, payments, and documentation. What would you like to do?",
    actions: defaultActions,
    meta: { mode: "trade" }
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
  messages: Array<{ role: string; content: string; attachments?: any[] }>,
  mode: string = "auto",
  tradeContext?: any,
  chatMode: string = "explore"
): Promise<AIResponse> {
  if (!hasValidApiKey) {
    return generateDemoResponse(messages, mode, tradeContext, chatMode);
  }

  let systemPrompt = "";
  
  // Add trade context to system prompt if available
  let contextSection = "";
  if (tradeContext && chatMode === "trade") {
    contextSection = `\n\nCURRENT TRADE CONTEXT (T-${tradeContext.id}) - Trade mode:\n`;
    if (tradeContext.title) contextSection += `Title: ${tradeContext.title}\n`;
    if (tradeContext.corridor) contextSection += `Corridor: ${tradeContext.corridor}\n`;
    if (tradeContext.goods) contextSection += `Goods: ${tradeContext.goods}\n`;
    if (tradeContext.value) contextSection += `Value: ${tradeContext.currency || 'USD'} ${tradeContext.value.toLocaleString()}\n`;
    if (tradeContext.incoterms) contextSection += `Incoterms: ${tradeContext.incoterms}\n`;
    if (tradeContext.parties && tradeContext.parties.length > 0) {
      contextSection += `Parties: ${tradeContext.parties.map((p: any) => `${p.name} (${p.role})`).join(', ')}\n`;
    }
    if (tradeContext.timelineStep) contextSection += `Current step: ${tradeContext.timelineStep}\n`;
    contextSection += `\nAll responses must be scoped to this trade. Reference it by T-${tradeContext.id}. Focus on execution.`;
  } else if (chatMode === "trade" && !tradeContext) {
    // Trade mode but no trade selected - still answer questions but suggest creating/selecting a trade for workflow actions
    contextSection = `\n\nTRADE MODE (no trade selected): Answer the user's question helpfully. If they ask about trade workflows (compliance, funding, payments, proof packs), include actions to create or select a trade. For general trade questions, just provide helpful information.`;
  } else if (chatMode === "explore") {
    contextSection = `\n\nEXPLORE MODE: Provide insights, best practices, route analysis. Keep structured but conversational.`;
  }
  
  if (mode === "deal-assistant") {
    systemPrompt = `You are a Deal Assistant for trade financiers. Respond conversationally but provide valid JSON:
{
  "assistant_text": "Your full conversational response with **markdown** formatting. Be helpful and natural.",
  "actions": [{"type": "action-type", "label": "Button Label", "description": "What this does"}],
  "risk_assessment": {"level": "low|medium|high", "factors": ["factor 1"]},
  "recommended_terms": {"tenor": 60, "rate": 2.5, "fees": 5000, "conditions": ["condition"]}
}

Write assistant_text as if speaking to a colleague. Use bullet points and bold for key info.
Focus on: credit risk, corridor risk, documentation gaps, pricing recommendations.${contextSection}`;
  } else {
    systemPrompt = `You are TRAIBOX, an AI trade assistant. Respond conversationally with valid JSON:
{
  "assistant_text": "Your full conversational response. Use **markdown** formatting, bullet points, and follow-up questions.",
  "actions": [{"type": "action-type", "label": "Button Label", "description": "What this does"}],
  "trade_updates": {"title": "...", "corridor": "...", "goods": "...", "value": 0, "currency": "USD"}
}

IMPORTANT: assistant_text should be a natural, helpful response like a human colleague would give.
Use markdown: **bold** for emphasis, bullet points for lists, line breaks for readability.
Action types: create-trade, compliance, funding, payment, proof-pack, invite-partner
Only include trade_updates when creating/updating a trade. Keep actions to 1-3 max.${contextSection}`;
  }

  // Add attachment context if present
  const lastMsg = messages[messages.length - 1];
  if (lastMsg?.attachments && lastMsg.attachments.length > 0) {
    const attachmentSummary = lastMsg.attachments.map((att: any) => `${att.name} (${att.type})`).join(', ');
    systemPrompt += `\n\nATTACHMENTS: User has attached: ${attachmentSummary}. Content extraction not available yet - acknowledge files and ask for specifics if needed.`;
  }

  const allMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  try {
    // Create a timeout promise to prevent hanging
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("OpenAI timeout")), OPENAI_TIMEOUT_MS);
    });

    // Race between OpenAI call and timeout
    const completion = await Promise.race([
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: allMessages as any,
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      }),
      timeoutPromise
    ]);

    const content = completion.choices[0]?.message?.content || "";
    try {
      const parsed = JSON.parse(content);
      // Handle legacy format with summary/next_actions
      if (parsed.summary && !parsed.assistant_text) {
        return {
          assistant_text: parsed.summary,
          actions: parsed.next_actions || [],
          trade_updates: parsed.trade_updates,
          risk_assessment: parsed.risk_assessment,
          missing_evidence: parsed.missing_evidence,
          recommended_terms: parsed.recommended_terms,
          meta: { mode: chatMode }
        };
      }
      return parsed as AIResponse;
    } catch {
      return {
        assistant_text: content,
        meta: { mode: chatMode }
      };
    }
  } catch (error: any) {
    const isTimeout = error.message === "OpenAI timeout";
    console.error(isTimeout ? "OpenAI timeout, falling back to demo mode" : "OpenAI error, falling back to demo mode:", error);
    return generateDemoResponse(messages, mode, tradeContext, chatMode);
  }
}

export async function* streamChatCompletion(
  messages: Array<{ role: string; content: string; attachments?: any[] }>,
  mode: string = "auto",
  tradeContext?: any,
  chatMode: string = "explore"
) {
  const response = await createStructuredChatCompletion(messages, mode, tradeContext, chatMode);
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
