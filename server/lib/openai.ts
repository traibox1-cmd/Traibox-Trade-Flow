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
  
  // Generate concise contextual demo responses
  if (lower.includes("compliance") || lower.includes("check") || lower.includes("kyc") || lower.includes("sanction")) {
    return `I can run compliance checks including sanctions screening (OFAC, EU, UN), KYC verification, and document review. This ensures your trade meets regulatory requirements and maintains audit readiness. (Demo mode active)`;
  }
  
  if (lower.includes("fund") || lower.includes("financ") || lower.includes("capital") || lower.includes("offer")) {
    return `I'll help you explore trade finance options: Letter of Credit (1.5-2.5%, 5-7 days), Invoice Factoring (2-4%, 1-2 days), or Supply Chain Finance (1-3% APR, 3-5 days). Each option has different cost-speed tradeoffs. (Demo mode)`;
  }
  
  if (lower.includes("pay") || lower.includes("payment") || lower.includes("settlement") || lower.includes("transfer")) {
    return `I can set up cross-border payment routing via SWIFT (2-3 days, $25-45), ACH/SEPA (1-2 days, lower fees), or stablecoin rails (same-day). I'll help you compare settlement speed vs cost for your corridor. (Demo mode)`;
  }
  
  if (lower.includes("proof") || lower.includes("doc") || lower.includes("evidence") || lower.includes("certificate")) {
    return `I'll generate a comprehensive proof pack with commercial invoice, bill of lading, certificates (origin, inspection, insurance), and compliance records. All documents will be timestamped and ready for blockchain anchoring. (Demo mode)`;
  }
  
  if (lower.includes("partner") || lower.includes("invite") || lower.includes("network") || lower.includes("connect")) {
    return `I can help manage your trade network with private-by-default security. I'll assist with partner invitations, credential verification, and matchmaking opportunities in your corridor. (Demo mode)`;
  }
  
  // Default concise response
  return `I'm TRAIBOX, your AI trade assistant. I help with compliance checks, funding requests, payment routing, documentation, and partner management. What specific operation can I assist with? (Demo mode active)`;
}

function getSystemPromptForMode(mode: string): string {
  const basePrompt = `You are TRAIBOX, an AI-first trade intelligence assistant. Respond in 2-3 concise sentences. Keep responses short, professional, and actionable. Avoid long essays.`;

  const modePrompts: Record<string, string> = {
    auto: `${basePrompt} Analyze requests and provide focused guidance on trade planning, compliance, funding, payments, or documentation.`,
    
    "trade-plan": `${basePrompt} Help create trade plans with corridor analysis, counterparty details, Incoterms, and milestones.`,
    
    compliance: `${basePrompt} Guide on compliance checks, sanctions screening, KYC/AML, and regulatory requirements.`,
    
    funding: `${basePrompt} Compare trade finance options (LC, factoring, supply chain finance) with clear APR and timeline guidance.`,
    
    payments: `${basePrompt} Advise on cross-border payment routing, SWIFT vs ACH vs stablecoin rails, with cost-speed tradeoffs.`,
    
    docs: `${basePrompt} Guide on trade documentation: invoices, bills of lading, certificates, compliance records.`,
    
    "contracts-escrow": `${basePrompt} Help structure contracts, escrow terms, and automated settlement mechanisms.`,
    
    "track-trace": `${basePrompt} Provide shipment tracking and milestone verification guidance.`,
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
