import OpenAI from "openai";

const hasValidApiKey = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "demo-key";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-demo-key-placeholder",
});

const DEMO_RESPONSES: Record<string, string> = {
  auto: "I'm TRAIBOX, your AI trade assistant. I can help you with compliance checks, funding requests, payment processing, and partner management. (Demo mode: OpenAI quota limit reached)",
  "trade-plan": "I can help plan your international trade. Consider logistics, timelines, documentation requirements, and risk factors for your corridor. (Demo mode active)",
  compliance: "I'll assist with compliance checks including sanctions screening, KYC verification, and regulatory documentation review. (Demo mode active)",
  funding: "I can help explore trade finance options: letters of credit, invoice financing, and supply chain finance solutions. (Demo mode active)",
  payments: "For cross-border payments, consider traditional banking rails (SWIFT/ACH) or stablecoin settlements for faster processing. (Demo mode active)",
  docs: "I'll help organize trade documents: commercial invoices, bills of lading, certificates of origin, and inspection certificates. (Demo mode active)",
  "contracts-escrow": "Let me help structure your trade agreement with appropriate escrow terms and automated settlement milestones. (Demo mode active)",
  "track-trace": "I can track your shipment and identify any delays or customs issues in your trade corridor. (Demo mode active)",
};

export async function createChatCompletion(
  messages: Array<{ role: string; content: string }>,
  mode: string = "auto"
) {
  if (!hasValidApiKey) {
    return DEMO_RESPONSES[mode] || DEMO_RESPONSES.auto;
  }

  const systemPrompt = getSystemPromptForMode(mode);
  
  const allMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: allMessages as any,
      temperature: 0.7,
      max_tokens: 2000,
    });

    return completion.choices[0]?.message?.content || "";
  } catch (error: any) {
    if (error?.status === 429 || error?.code === "insufficient_quota") {
      return DEMO_RESPONSES[mode] || DEMO_RESPONSES.auto;
    }
    throw error;
  }
}

export async function* streamChatCompletion(
  messages: Array<{ role: string; content: string }>,
  mode: string = "auto"
) {
  // Demo fallback if no API key
  if (!hasValidApiKey) {
    const demoResponse = generateDemoResponse(messages, mode);
    for (const char of demoResponse) {
      yield char;
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    return;
  }

  const systemPrompt = getSystemPromptForMode(mode);
  
  const allMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: allMessages as any,
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error: any) {
    // Bulletproof demo fallback: catch ANY error (429, 401, network, server error, etc.)
    console.error("OpenAI error, falling back to demo mode:", error);
    const demoResponse = generateDemoResponse(messages, mode);
    for (const char of demoResponse) {
      yield char;
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  }
}

function generateDemoResponse(messages: Array<{ role: string; content: string }>, mode: string): string {
  const lastUserMessage = messages[messages.length - 1]?.content || "";
  const lower = lastUserMessage.toLowerCase();
  
  // Generate contextual demo responses based on user query
  if (lower.includes("compliance") || lower.includes("check") || lower.includes("kyc") || lower.includes("sanction")) {
    return `I can help with compliance checks for your trade. Based on your query, here's what I recommend:\n\n1. **Sanctions Screening**: Run automated checks against OFAC, EU, and UN sanctions lists\n2. **KYC Verification**: Verify counterparty identity and business registration\n3. **Document Review**: Ensure all required compliance documentation is complete\n\nWould you like me to initiate a compliance check for a specific counterparty? (Demo mode active - using simulated AI responses)`;
  }
  
  if (lower.includes("fund") || lower.includes("financ") || lower.includes("capital") || lower.includes("offer")) {
    return `I can assist with trade finance options for your transaction. Here are potential funding structures:\n\n**Option 1: Letter of Credit (LC)**\n- Cost: 1.5-2.5% of transaction value\n- Timeline: 5-7 business days\n- Best for: High-value trades with established banks\n\n**Option 2: Invoice Factoring**\n- Cost: 2-4% of invoice value\n- Timeline: 1-2 business days\n- Best for: Immediate liquidity needs\n\n**Option 3: Supply Chain Finance**\n- Cost: 1-3% APR\n- Timeline: 3-5 business days\n- Best for: Long-term relationships\n\nShall I help you request funding? (Demo mode - OpenAI quota limit reached)`;
  }
  
  if (lower.includes("pay") || lower.includes("payment") || lower.includes("settlement") || lower.includes("transfer")) {
    return `I'll help you set up cross-border payment routing. Here are your options:\n\n**Traditional Rails:**\n- SWIFT: 2-3 days, $25-45 fees, widely accepted\n- ACH/SEPA: 1-2 days, lower fees, regional\n\n**Alternative Settlement:**\n- Stablecoin rails: Same-day, lower fees, requires crypto infrastructure\n- Payment providers: Instant, competitive FX rates\n\nFor your corridor, I recommend comparing settlement speed vs. cost. Would you like me to create a payment instruction? (Demo mode active)`;
  }
  
  if (lower.includes("proof") || lower.includes("doc") || lower.includes("evidence") || lower.includes("certificate")) {
    return `I can generate a comprehensive proof pack for your trade. This will include:\n\n- Commercial Invoice\n- Bill of Lading / Airway Bill\n- Certificate of Origin\n- Inspection Certificate\n- Insurance Certificate\n- Compliance verification records\n\nAll documents will be timestamped and ready for blockchain anchoring if needed. Shall I prepare the proof pack? (Demo mode - simulated response)`;
  }
  
  if (lower.includes("partner") || lower.includes("invite") || lower.includes("network") || lower.includes("connect")) {
    return `I can help you manage your trade network. Here's what I can do:\n\n- **Invite Partners**: Send private invitations to new counterparties\n- **Verify Credentials**: Check KYC status and trust level\n- **Match Opportunities**: Find verified partners for your corridor\n\nYour network operates on a private-by-default model — you control what's shared. Would you like to invite a partner or explore matchmaking? (Demo mode active)`;
  }
  
  // Default response with context awareness
  return `I'm TRAIBOX, your AI trade intelligence assistant. I can help you with:\n\n- **Trade Planning**: Corridor analysis, documentation, milestones\n- **Compliance**: Sanctions screening, KYC, policy checks\n- **Funding**: Compare financing options and request capital\n- **Payments**: Route cross-border payments efficiently\n- **Documentation**: Generate proof packs and certificates\n- **Network**: Invite partners and manage relationships\n\nWhat would you like to work on? (Demo mode active - OpenAI API unavailable)`;
}

function getSystemPromptForMode(mode: string): string {
  const basePrompt = `You are TRAIBOX, an AI-first trade intelligence assistant designed to help operators and financiers execute cross-border trade with trust-first workflows. You provide calm, professional, evidence-linked guidance.`;

  const modePrompts: Record<string, string> = {
    auto: `${basePrompt} Analyze the user's request and provide the most relevant assistance across trade planning, compliance, funding, payments, documentation, contracts, or tracking.`,
    
    "trade-plan": `${basePrompt} Focus on helping create comprehensive trade plans including corridor analysis, counterparty details, Incoterms, milestones, and documentation requirements.`,
    
    compliance: `${basePrompt} Focus on compliance checks, sanctions screening, KYC/AML requirements, policy verification, and regulatory guidance. Always emphasize evidence collection and audit readiness.`,
    
    funding: `${basePrompt} Focus on trade finance options, comparing funding offers (APR, tenor, collateral), and helping select the best financing approach based on risk and timeline.`,
    
    payments: `${basePrompt} Focus on payment routing, settlement options, FX considerations, and comparing different rails (bank transfer, SWIFT, alternative settlement). Present blockchain/stablecoin options neutrally as "stable rails" when relevant.`,
    
    docs: `${basePrompt} Focus on trade documentation requirements, document generation, verification, and ensuring all paperwork is complete and compliant.`,
    
    "contracts-escrow": `${basePrompt} Focus on contract structuring, escrow arrangements, release conditions, and settlement mechanisms. Present smart contract options as "automated settlement" when relevant.`,
    
    "track-trace": `${basePrompt} Focus on shipment tracking, milestone verification, and providing status updates on trade execution progress.`,
  };

  return modePrompts[mode] || modePrompts.auto;
}

export function detectIntent(message: string, mode: string): string[] {
  const lower = message.toLowerCase();
  const intents: string[] = [];

  if (mode === "auto" || mode === "trade-plan") {
    if (lower.includes("plan") || lower.includes("corridor") || lower.includes("trade")) {
      intents.push("trade-plan");
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
