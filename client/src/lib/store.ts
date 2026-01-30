import { create } from 'zustand';

export type TradeParty = {
  name: string;
  role: 'buyer' | 'seller' | 'shipper' | 'financier' | 'insurer';
  region: string;
};

export type TradeTimelineStep = 'plan' | 'compliance' | 'funding' | 'payments' | 'proof-pack';

export type Trade = {
  id: string;
  title: string;
  corridor: string;
  status: 'planning' | 'active' | 'completed';
  value: number;
  currency: string;
  createdAt: Date;
  parties: TradeParty[];
  goods: string;
  incoterms: string;
  timelineStep: TradeTimelineStep;
  documents: string[];
  notes?: string;
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
  
  addTrade: (trade: Omit<Trade, 'id' | 'createdAt'>) => string;
  updateTrade: (id: string, updates: Partial<Trade>) => void;
  getTrade: (id: string) => Trade | undefined;
  addFundingRequest: (request: Omit<FundingRequest, 'id' | 'createdAt'>) => string;
  updateFundingRequest: (id: string, updates: Partial<FundingRequest>) => void;
  addComplianceRun: (run: Omit<ComplianceRun, 'id' | 'createdAt'>) => string;
  updateComplianceRun: (id: string, updates: Partial<ComplianceRun>) => void;
  addProofPack: (pack: Omit<ProofPack, 'id' | 'createdAt'>) => string;
  updateProofPack: (id: string, updates: Partial<ProofPack>) => void;
  addPartnerInvite: (invite: Omit<PartnerInvite, 'id' | 'createdAt'>) => void;
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => string;
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

export const useAppStore = create<AppStore>((set, get) => ({
  trades: [],
  fundingRequests: [],
  complianceRuns: [],
  proofPacks: [],
  partnerInvites: [],
  payments: [],
  partners: initialPartners,

  addTrade: (trade) => {
    const id = `trade-${Date.now()}`;
    set((state) => ({
      trades: [
        ...state.trades,
        { ...trade, id, createdAt: new Date() },
      ],
    }));
    return id;
  },

  updateTrade: (id, updates) =>
    set((state) => ({
      trades: state.trades.map((trade) =>
        trade.id === id ? { ...trade, ...updates } : trade
      ),
    })),

  getTrade: (id) => get().trades.find((t) => t.id === id),

  addFundingRequest: (request) => {
    const id = `funding-${Date.now()}`;
    set((state) => ({
      fundingRequests: [
        ...state.fundingRequests,
        { ...request, id, createdAt: new Date() },
      ],
    }));
    return id;
  },

  updateFundingRequest: (id, updates) =>
    set((state) => ({
      fundingRequests: state.fundingRequests.map((req) =>
        req.id === id ? { ...req, ...updates } : req
      ),
    })),

  addComplianceRun: (run) => {
    const id = `compliance-${Date.now()}`;
    set((state) => ({
      complianceRuns: [
        ...state.complianceRuns,
        { ...run, id, createdAt: new Date() },
      ],
    }));
    return id;
  },

  updateComplianceRun: (id, updates) =>
    set((state) => ({
      complianceRuns: state.complianceRuns.map((run) =>
        run.id === id ? { ...run, ...updates } : run
      ),
    })),

  addProofPack: (pack) => {
    const id = `proof-${Date.now()}`;
    set((state) => ({
      proofPacks: [
        ...state.proofPacks,
        { ...pack, id, createdAt: new Date() },
      ],
    }));
    return id;
  },

  updateProofPack: (id, updates) =>
    set((state) => ({
      proofPacks: state.proofPacks.map((pack) =>
        pack.id === id ? { ...pack, ...updates } : pack
      ),
    })),

  addPartnerInvite: (invite) =>
    set((state) => ({
      partnerInvites: [
        ...state.partnerInvites,
        { ...invite, id: `invite-${Date.now()}`, createdAt: new Date() },
      ],
    })),

  addPayment: (payment) => {
    const id = `payment-${Date.now()}`;
    set((state) => ({
      payments: [
        ...state.payments,
        { ...payment, id, createdAt: new Date() },
      ],
    }));
    return id;
  },

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
