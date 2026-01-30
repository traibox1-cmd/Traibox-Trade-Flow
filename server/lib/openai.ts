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
  if (!hasValidApiKey) {
    const demoResponse = DEMO_RESPONSES[mode] || DEMO_RESPONSES.auto;
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
    if (error?.status === 429 || error?.code === "insufficient_quota") {
      const demoResponse = DEMO_RESPONSES[mode] || DEMO_RESPONSES.auto;
      for (const char of demoResponse) {
        yield char;
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
    } else {
      throw error;
    }
  }
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
    if (lower.includes("compliance") || lower.includes("kyc") || lower.includes("sanction") || lower.includes("check")) {
      intents.push("compliance");
    }
  }

  if (mode === "auto" || mode === "funding") {
    if (lower.includes("fund") || lower.includes("financ") || lower.includes("capital") || lower.includes("offer")) {
      intents.push("funding");
    }
  }

  if (mode === "auto" || mode === "payments") {
    if (lower.includes("pay") || lower.includes("settlement") || lower.includes("transfer") || lower.includes("route")) {
      intents.push("payment");
    }
  }

  if (mode === "auto" || mode === "docs") {
    if (lower.includes("doc") || lower.includes("invoice") || lower.includes("certificate") || lower.includes("proof")) {
      intents.push("proof-pack");
    }
  }

  return intents;
}
