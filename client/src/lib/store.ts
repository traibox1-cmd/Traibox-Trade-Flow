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

type AppStore = {
  trades: Trade[];
  fundingRequests: FundingRequest[];
  complianceRuns: ComplianceRun[];
  proofPacks: ProofPack[];
  partnerInvites: PartnerInvite[];
  
  addTrade: (trade: Omit<Trade, 'id' | 'createdAt'>) => void;
  addFundingRequest: (request: Omit<FundingRequest, 'id' | 'createdAt'>) => void;
  updateFundingRequest: (id: string, updates: Partial<FundingRequest>) => void;
  addComplianceRun: (run: Omit<ComplianceRun, 'id' | 'createdAt'>) => void;
  updateComplianceRun: (id: string, updates: Partial<ComplianceRun>) => void;
  addProofPack: (pack: Omit<ProofPack, 'id' | 'createdAt'>) => void;
  addPartnerInvite: (invite: Omit<PartnerInvite, 'id' | 'createdAt'>) => void;
};

export const useAppStore = create<AppStore>((set) => ({
  trades: [],
  fundingRequests: [],
  complianceRuns: [],
  proofPacks: [],
  partnerInvites: [],

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
}));
