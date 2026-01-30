export type StructuredResponse = {
  summary: string;
  missingInputs?: string[];
  nextActions?: Array<{
    type: 'compliance' | 'funding' | 'payment' | 'proof-pack' | 'invite-partner' | 'trade-plan';
    label: string;
    payload?: Record<string, any>;
  }>;
  notes?: string;
};

export function generateStructuredDemoResponse(
  userMessage: string,
  mode: string
): StructuredResponse {
  const lower = userMessage.toLowerCase();

  // Compliance queries
  if (lower.includes("compliance") || lower.includes("check") || lower.includes("kyc") || lower.includes("sanction")) {
    return {
      summary: "I can help run compliance checks for your trade. This includes sanctions screening (OFAC, EU, UN lists), KYC verification, and document review.",
      missingInputs: ["Counterparty name", "Country of operation"],
      nextActions: [
        {
          type: "compliance",
          label: "Run Compliance Check",
          payload: { checkTypes: ["sanctions", "kyc", "documents"] },
        },
      ],
      notes: "Demo mode active - using simulated responses",
    };
  }

  // Funding queries
  if (lower.includes("fund") || lower.includes("financ") || lower.includes("capital") || lower.includes("offer")) {
    return {
      summary: "I can help you explore trade finance options: Letter of Credit (1.5-2.5%, 5-7 days), Invoice Factoring (2-4%, 1-2 days), or Supply Chain Finance (1-3% APR, 3-5 days).",
      missingInputs: ["Transaction amount", "Preferred timeline"],
      nextActions: [
        {
          type: "funding",
          label: "Request Trade Funding",
          payload: { options: ["lc", "factoring", "supply-chain"] },
        },
      ],
    };
  }

  // Payment queries
  if (lower.includes("pay") || lower.includes("payment") || lower.includes("settlement") || lower.includes("transfer")) {
    return {
      summary: "I'll help you set up cross-border payments. Options include SWIFT (2-3 days, $25-45), ACH/SEPA (1-2 days, lower fees), or stablecoin rails (same-day).",
      missingInputs: ["Beneficiary details", "Amount and currency"],
      nextActions: [
        {
          type: "payment",
          label: "Create Payment Instruction",
          payload: { rails: ["swift", "ach", "stablecoin"] },
        },
      ],
    };
  }

  // Documentation queries
  if (lower.includes("proof") || lower.includes("doc") || lower.includes("evidence") || lower.includes("certificate")) {
    return {
      summary: "I can generate a comprehensive proof pack including commercial invoice, bill of lading, certificates of origin/inspection/insurance, and compliance records.",
      nextActions: [
        {
          type: "proof-pack",
          label: "Generate Proof Pack",
          payload: { documents: ["invoice", "bol", "coo", "insurance"] },
        },
      ],
      notes: "Documents will be timestamped and ready for blockchain anchoring",
    };
  }

  // Partner/network queries
  if (lower.includes("partner") || lower.includes("invite") || lower.includes("network") || lower.includes("connect")) {
    return {
      summary: "I can help you manage your trade network with private-by-default security. Invite partners, verify credentials, or explore matchmaking opportunities.",
      missingInputs: ["Partner name or email"],
      nextActions: [
        {
          type: "invite-partner",
          label: "Invite Trade Partner",
          payload: {},
        },
      ],
    };
  }

  // Default response
  return {
    summary: "I'm TRAIBOX, your AI trade assistant. I can help with compliance checks, funding requests, payment routing, documentation, and partner management.",
    nextActions: [
      {
        type: "trade-plan",
        label: "Create Trade Plan",
        payload: {},
      },
    ],
    notes: "Demo mode active - ask me about a specific trade operation",
  };
}

export function parseStructuredResponse(text: string): StructuredResponse | null {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch {
    return null;
  }
}
