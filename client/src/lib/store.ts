import { create } from 'zustand';

export type Trade = {
  id: string;
  title: string;
  corridor: string;
  status: 'planning' | 'active' | 'completed';
  value: number;
  createdAt: Date;
};

export type FundingRequest = {
  id: string;
  tradeId?: string;
  amount: number;
  type: 'lc' | 'factoring' | 'supply-chain';
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  requesterName: string;
  createdAt: Date;
  notes?: string;
};

export type ComplianceRun = {
  id: string;
  tradeId?: string;
  targetEntity: string;
  checks: string[];
  status: 'pending' | 'running' | 'passed' | 'failed';
  findings: { type: 'pass' | 'warn' | 'fail'; message: string }[];
  createdAt: Date;
};

export type ProofPack = {
  id: string;
  tradeId?: string;
  title: string;
  documents: string[];
  status: 'draft' | 'ready' | 'verified';
  createdAt: Date;
};

export type PartnerInvite = {
  id: string;
  partnerName: string;
  email: string;
  status: 'sent' | 'accepted' | 'declined';
  createdAt: Date;
};

export type Payment = {
  id: string;
  tradeId?: string;
  amount: number;
  currency: string;
  beneficiary: string;
  rail: 'swift' | 'ach' | 'stablecoin';
  status: 'draft' | 'pending' | 'completed' | 'failed';
  createdAt: Date;
  notes?: string;
};

export type Partner = {
  id: string;
  name: string;
  region: string;
  capabilities: string[];
  trust: 'verified' | 'partner' | 'new';
  visibility: 'private' | 'shared';
  connectionStatus: 'none' | 'pending' | 'connected';
};

type AppStore = {
  trades: Trade[];
  fundingRequests: FundingRequest[];
  complianceRuns: ComplianceRun[];
  proofPacks: ProofPack[];
  partnerInvites: PartnerInvite[];
  payments: Payment[];
  partners: Partner[];
  
  addTrade: (trade: Omit<Trade, 'id' | 'createdAt'>) => void;
  addFundingRequest: (request: Omit<FundingRequest, 'id' | 'createdAt'>) => void;
  updateFundingRequest: (id: string, updates: Partial<FundingRequest>) => void;
  addComplianceRun: (run: Omit<ComplianceRun, 'id' | 'createdAt'>) => void;
  updateComplianceRun: (id: string, updates: Partial<ComplianceRun>) => void;
  addProofPack: (pack: Omit<ProofPack, 'id' | 'createdAt'>) => void;
  addPartnerInvite: (invite: Omit<PartnerInvite, 'id' | 'createdAt'>) => void;
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  updatePartner: (id: string, updates: Partial<Partner>) => void;
};

const initialPartners: Partner[] = [
  {
    id: "p1",
    name: "NordWerk Logistics",
    region: "EU",
    capabilities: ["Forwarding", "Customs", "Trade docs"],
    trust: "verified",
    visibility: "private",
    connectionStatus: "connected",
  },
  {
    id: "p2",
    name: "Aster Mills",
    region: "SEA",
    capabilities: ["Manufacturing", "QA", "Insurance"],
    trust: "partner",
    visibility: "shared",
    connectionStatus: "connected",
  },
  {
    id: "p3",
    name: "Kijani Cooperative",
    region: "Africa",
    capabilities: ["Aggregation", "Fulfillment", "Local compliance"],
    trust: "new",
    visibility: "private",
    connectionStatus: "none",
  },
];

export const useAppStore = create<AppStore>((set) => ({
  trades: [],
  fundingRequests: [],
  complianceRuns: [],
  proofPacks: [],
  partnerInvites: [],
  payments: [],
  partners: initialPartners,

  addTrade: (trade) =>
    set((state) => ({
      trades: [
        ...state.trades,
        { ...trade, id: `trade-${Date.now()}`, createdAt: new Date() },
      ],
    })),

  addFundingRequest: (request) =>
    set((state) => ({
      fundingRequests: [
        ...state.fundingRequests,
        { ...request, id: `funding-${Date.now()}`, createdAt: new Date() },
      ],
    })),

  updateFundingRequest: (id, updates) =>
    set((state) => ({
      fundingRequests: state.fundingRequests.map((req) =>
        req.id === id ? { ...req, ...updates } : req
      ),
    })),

  addComplianceRun: (run) =>
    set((state) => ({
      complianceRuns: [
        ...state.complianceRuns,
        { ...run, id: `compliance-${Date.now()}`, createdAt: new Date() },
      ],
    })),

  updateComplianceRun: (id, updates) =>
    set((state) => ({
      complianceRuns: state.complianceRuns.map((run) =>
        run.id === id ? { ...run, ...updates } : run
      ),
    })),

  addProofPack: (pack) =>
    set((state) => ({
      proofPacks: [
        ...state.proofPacks,
        { ...pack, id: `proof-${Date.now()}`, createdAt: new Date() },
      ],
    })),

  addPartnerInvite: (invite) =>
    set((state) => ({
      partnerInvites: [
        ...state.partnerInvites,
        { ...invite, id: `invite-${Date.now()}`, createdAt: new Date() },
      ],
    })),

  addPayment: (payment) =>
    set((state) => ({
      payments: [
        ...state.payments,
        { ...payment, id: `payment-${Date.now()}`, createdAt: new Date() },
      ],
    })),

  updatePayment: (id, updates) =>
    set((state) => ({
      payments: state.payments.map((payment) =>
        payment.id === id ? { ...payment, ...updates } : payment
      ),
    })),

  updatePartner: (id, updates) =>
    set((state) => ({
      partners: state.partners.map((partner) =>
        partner.id === id ? { ...partner, ...updates } : partner
      ),
    })),
}));
