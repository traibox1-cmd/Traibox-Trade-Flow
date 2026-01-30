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
  status: 'pending' | 'reviewing' | 'info-requested' | 'offered' | 'approved' | 'rejected';
  requesterName: string;
  createdAt: Date;
  notes?: string;
  corridor?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
};

export type Offer = {
  id: string;
  fundingRequestId: string;
  tradeId?: string;
  tenor: number;
  rate: number;
  fees: number;
  conditions: string;
  esgTag?: string;
  status: 'proposed' | 'accepted' | 'rejected' | 'expired';
  proposedBy: string;
  createdAt: Date;
};

export type InfoRequest = {
  id: string;
  fundingRequestId: string;
  tradeId?: string;
  requestedBy: string;
  message: string;
  status: 'pending' | 'provided' | 'closed';
  response?: string;
  respondedAt?: Date;
  createdAt: Date;
};

export type Notification = {
  id: string;
  type: 'offer' | 'info-request' | 'approval' | 'rejection' | 'proof-verified';
  targetRole: 'operator' | 'financier';
  tradeId?: string;
  fundingRequestId?: string;
  message: string;
  read: boolean;
  createdAt: Date;
};

export type TimelineEvent = {
  id: string;
  tradeId?: string;
  fundingRequestId?: string;
  type: 'created' | 'info-requested' | 'info-provided' | 'offer-proposed' | 'approved' | 'rejected' | 'verified';
  actor: string;
  message: string;
  createdAt: Date;
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
  offers: Offer[];
  infoRequests: InfoRequest[];
  notifications: Notification[];
  timelineEvents: TimelineEvent[];
  
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
  addOffer: (offer: Omit<Offer, 'id' | 'createdAt'>) => string;
  updateOffer: (id: string, updates: Partial<Offer>) => void;
  addInfoRequest: (request: Omit<InfoRequest, 'id' | 'createdAt'>) => string;
  updateInfoRequest: (id: string, updates: Partial<InfoRequest>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => string;
  markNotificationRead: (id: string) => void;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id' | 'createdAt'>) => string;
  getUnreadNotifications: (role: 'operator' | 'financier') => Notification[];
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
  offers: [],
  infoRequests: [],
  notifications: [],
  timelineEvents: [],

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

  addOffer: (offer) => {
    const id = `offer-${Date.now()}`;
    set((state) => ({
      offers: [...state.offers, { ...offer, id, createdAt: new Date() }],
    }));
    return id;
  },

  updateOffer: (id, updates) =>
    set((state) => ({
      offers: state.offers.map((offer) =>
        offer.id === id ? { ...offer, ...updates } : offer
      ),
    })),

  addInfoRequest: (request) => {
    const id = `info-${Date.now()}`;
    set((state) => ({
      infoRequests: [...state.infoRequests, { ...request, id, createdAt: new Date() }],
    }));
    return id;
  },

  updateInfoRequest: (id, updates) =>
    set((state) => ({
      infoRequests: state.infoRequests.map((req) =>
        req.id === id ? { ...req, ...updates } : req
      ),
    })),

  addNotification: (notification) => {
    const id = `notif-${Date.now()}`;
    set((state) => ({
      notifications: [...state.notifications, { ...notification, id, read: false, createdAt: new Date() }],
    }));
    return id;
  },

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  addTimelineEvent: (event) => {
    const id = `event-${Date.now()}`;
    set((state) => ({
      timelineEvents: [...state.timelineEvents, { ...event, id, createdAt: new Date() }],
    }));
    return id;
  },

  getUnreadNotifications: (role) =>
    get().notifications.filter((n) => n.targetRole === role && !n.read),
}));
