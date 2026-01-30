import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is required");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function createChatCompletion(
  messages: Array<{ role: string; content: string }>,
  mode: string = "auto"
) {
  const systemPrompt = getSystemPromptForMode(mode);
  
  const allMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: allMessages as any,
    temperature: 0.7,
    max_tokens: 2000,
  });

  return completion.choices[0]?.message?.content || "";
}

export async function* streamChatCompletion(
  messages: Array<{ role: string; content: string }>,
  mode: string = "auto"
) {
  const systemPrompt = getSystemPromptForMode(mode);
  
  const allMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

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
