import { create } from 'zustand';

export type TradeParty = {
  name: string;
  role: 'buyer' | 'seller' | 'shipper' | 'financier' | 'insurer';
  region: string;
};

export type LinkedTradeParty = {
  partnerId: string;
  roles: string[]; // Multi-select: supplier, buyer, financier, logistics, insurer, customs, etc.
};

export type LogisticsMilestone = {
  key: 'booking' | 'picked-up' | 'export-cleared' | 'departed' | 'arrived' | 'import-cleared' | 'delivered';
  label: string;
  status: 'pending' | 'confirmed' | 'issue';
  timestamp?: Date;
  notes?: string;
};

export type LogisticsEvent = {
  id: string;
  timestamp: Date;
  source: string;
  description: string;
  confidence: 'high' | 'medium' | 'low';
  linkedDocId?: string;
};

export type TradeDocument = {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'other';
  uploadedAt: Date;
  linkedMilestone?: string;
  extractedFields?: Record<string, any>;
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
  linkedParties: LinkedTradeParty[];
  goods: string;
  incoterms: string;
  timelineStep: TradeTimelineStep;
  documents: string[];
  uploadedDocuments: TradeDocument[];
  notes?: string;
  fundingType?: 'self-funding' | 'credit-line' | 'factoring' | 'payables-finance' | 'open-account' | 'guarantees';
  paymentTerms?: string;
  logisticsMilestones: LogisticsMilestone[];
  logisticsEvents: LogisticsEvent[];
  logisticsVisibility: 'internal' | 'parties' | 'financier';
};

export type FundingRequest = {
  id: string;
  tradeId: string;
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
  tradeId: string;
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
  tradeId: string;
  requestedBy: string;
  message: string;
  status: 'pending' | 'provided' | 'closed';
  response?: string;
  respondedAt?: Date;
  createdAt: Date;
};

export type Notification = {
  id: string;
  type: 'offer' | 'info-request' | 'info-provided' | 'approval' | 'rejection' | 'proof-verified';
  targetRole: 'operator' | 'financier';
  tradeId: string;
  fundingRequestId?: string;
  message: string;
  read: boolean;
  createdAt: Date;
};

export type TimelineEvent = {
  id: string;
  tradeId: string;
  fundingRequestId?: string;
  type: 'created' | 'info-requested' | 'info-provided' | 'offer-proposed' | 'approved' | 'rejected' | 'verified';
  actor: string;
  message: string;
  createdAt: Date;
};

export type ComplianceRun = {
  id: string;
  tradeId: string;
  targetEntity: string;
  checks: string[];
  status: 'pending' | 'running' | 'passed' | 'failed';
  findings: { type: 'pass' | 'warn' | 'fail'; message: string }[];
  createdAt: Date;
};

export type ProofPack = {
  id: string;
  tradeId: string;
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
  tradeId: string;
  amount: number;
  currency: string;
  beneficiary: string;
  rail: 'swift' | 'ach' | 'stablecoin';
  status: 'draft' | 'pending' | 'completed' | 'failed';
  createdAt: Date;
  notes?: string;
};

export type PartnerRole = 'Buyer' | 'Supplier' | 'Financier' | 'Logistics' | 'Customs' | 'Insurance';

export type Partner = {
  id: string;
  name: string;
  region: string;
  capabilities: string[]; // Services: Forwarding, Customs, Trade docs, etc.
  canActAs: PartnerRole[]; // Roles: Buyer, Supplier, Financier, Logistics, Customs, Insurance
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
  aiStatus: 'connected' | 'demo';
  aiLastChecked: Date | null;
  
  // Tutorial state
  tutorialActive: boolean;
  tutorialStep: number;
  tutorialCompleted: boolean;
  startTutorial: () => void;
  nextTutorialStep: () => void;
  prevTutorialStep: () => void;
  skipTutorial: () => void;
  resetTutorial: () => void;
  
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
  setAIStatus: (status: 'connected' | 'demo') => void;
  loadDemoData: () => void;
  resetDemoData: () => void;
  fetchTradesFromAPI: () => Promise<void>;
  syncTradeFromAPI: (id: string) => Promise<void>;
};

const initialPartners: Partner[] = [
  {
    id: "p1",
    name: "NordWerk Logistics",
    region: "EU",
    capabilities: ["Forwarding", "Customs", "Trade docs"],
    canActAs: ["Logistics", "Customs"],
    trust: "verified",
    visibility: "private",
    connectionStatus: "connected",
  },
  {
    id: "p2",
    name: "Aster Mills",
    region: "SEA",
    capabilities: ["Manufacturing", "QA", "Insurance"],
    canActAs: ["Supplier"],
    trust: "partner",
    visibility: "shared",
    connectionStatus: "connected",
  },
  {
    id: "p3",
    name: "Kijani Cooperative",
    region: "Africa",
    capabilities: ["Aggregation", "Fulfillment", "Local compliance"],
    canActAs: ["Supplier", "Buyer"],
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
  aiStatus: 'demo',
  aiLastChecked: null,
  
  // Tutorial state - check localStorage for completion
  tutorialActive: false,
  tutorialStep: 0,
  tutorialCompleted: typeof window !== 'undefined' && localStorage.getItem('traibox-tutorial-completed') === 'true',

  startTutorial: () => set({ tutorialActive: true, tutorialStep: 0 }),
  
  nextTutorialStep: () => set((state) => {
    const totalSteps = 6; // Total tutorial steps
    if (state.tutorialStep >= totalSteps - 1) {
      localStorage.setItem('traibox-tutorial-completed', 'true');
      return { tutorialActive: false, tutorialStep: 0, tutorialCompleted: true };
    }
    return { tutorialStep: state.tutorialStep + 1 };
  }),
  
  prevTutorialStep: () => set((state) => ({
    tutorialStep: Math.max(0, state.tutorialStep - 1)
  })),
  
  skipTutorial: () => {
    localStorage.setItem('traibox-tutorial-completed', 'true');
    set({ tutorialActive: false, tutorialStep: 0, tutorialCompleted: true });
  },
  
  resetTutorial: () => {
    localStorage.removeItem('traibox-tutorial-completed');
    set({ tutorialActive: false, tutorialStep: 0, tutorialCompleted: false });
  },

  setAIStatus: (status) =>
    set({ aiStatus: status, aiLastChecked: new Date() }),

  addTrade: (trade) => {
    const id = `trade-${Date.now()}`;
    const defaultMilestones: LogisticsMilestone[] = [
      { key: 'booking', label: 'Booking', status: 'pending' },
      { key: 'picked-up', label: 'Picked up', status: 'pending' },
      { key: 'export-cleared', label: 'Export cleared', status: 'pending' },
      { key: 'departed', label: 'Departed', status: 'pending' },
      { key: 'arrived', label: 'Arrived', status: 'pending' },
      { key: 'import-cleared', label: 'Import cleared', status: 'pending' },
      { key: 'delivered', label: 'Delivered/POD', status: 'pending' },
    ];
    set((state) => ({
      trades: [
        ...state.trades,
        { 
          ...trade, 
          id, 
          createdAt: new Date(),
          linkedParties: trade.linkedParties || [],
          uploadedDocuments: trade.uploadedDocuments || [],
          logisticsMilestones: trade.logisticsMilestones || defaultMilestones,
          logisticsEvents: trade.logisticsEvents || [],
          logisticsVisibility: trade.logisticsVisibility || 'internal',
        },
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

  loadDemoData: () => {
    const state = get();
    
    // Only load if no trades exist (idempotent)
    if (state.trades.length > 0) return;

    // Create demo trades
    const trade1Id = `trade-demo-1-${Date.now()}`;
    const trade2Id = `trade-demo-2-${Date.now() + 1}`;
    
    set({
      trades: [
        {
          id: trade1Id,
          title: "Kenya Coffee Import",
          corridor: "Kenya → EU",
          status: "active",
          value: 250000,
          currency: "USD",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          parties: [
            { name: "Kijani Cooperative", role: "seller", region: "Kenya" },
            { name: "NordWerk Logistics", role: "shipper", region: "EU" }
          ],
          linkedParties: [{ partnerId: "p1", roles: ["logistics", "customs"] }],
          goods: "Coffee Beans (Arabica)",
          incoterms: "FOB Mombasa",
          timelineStep: "funding",
          documents: ["Commercial Invoice", "Packing List", "Certificate of Origin"],
          uploadedDocuments: [],
          notes: "Premium grade coffee beans, organic certified",
          fundingType: "factoring",
          paymentTerms: "Net 60",
          logisticsMilestones: [
            { key: 'booking', label: 'Booking', status: 'confirmed', timestamp: new Date() },
            { key: 'picked-up', label: 'Picked up', status: 'confirmed', timestamp: new Date() },
            { key: 'export-cleared', label: 'Export cleared', status: 'pending' },
            { key: 'departed', label: 'Departed', status: 'pending' },
            { key: 'arrived', label: 'Arrived', status: 'pending' },
            { key: 'import-cleared', label: 'Import cleared', status: 'pending' },
            { key: 'delivered', label: 'Delivered/POD', status: 'pending' },
          ],
          logisticsEvents: [],
          logisticsVisibility: 'parties'
        },
        {
          id: trade2Id,
          title: "Medical Supplies Export",
          corridor: "US → SEA",
          status: "active",
          value: 450000,
          currency: "USD",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          parties: [
            { name: "MedTech Solutions", role: "seller", region: "US" },
            { name: "Aster Mills", role: "buyer", region: "Singapore" }
          ],
          linkedParties: [],
          goods: "Diagnostic Equipment",
          incoterms: "CIF Singapore",
          timelineStep: "compliance",
          documents: ["Invoice", "FDA Certificate", "Insurance Certificate"],
          uploadedDocuments: [],
          notes: "Temperature-controlled shipping required",
          fundingType: "credit-line",
          paymentTerms: "Net 30",
          logisticsMilestones: [
            { key: 'booking', label: 'Booking', status: 'pending' },
            { key: 'picked-up', label: 'Picked up', status: 'pending' },
            { key: 'export-cleared', label: 'Export cleared', status: 'pending' },
            { key: 'departed', label: 'Departed', status: 'pending' },
            { key: 'arrived', label: 'Arrived', status: 'pending' },
            { key: 'import-cleared', label: 'Import cleared', status: 'pending' },
            { key: 'delivered', label: 'Delivered/POD', status: 'pending' },
          ],
          logisticsEvents: [],
          logisticsVisibility: 'internal'
        }
      ],
      fundingRequests: [
        {
          id: `funding-demo-1-${Date.now()}`,
          tradeId: trade1Id,
          amount: 200000,
          type: "lc",
          status: "pending",
          requesterName: "Kenya Coffee Trader",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          notes: "LC needed for coffee shipment",
          corridor: "Kenya → EU"
        }
      ],
      proofPacks: [
        {
          id: `proof-demo-1-${Date.now()}`,
          tradeId: trade2Id,
          title: "Medical Supplies Compliance Pack",
          documents: ["FDA Certificate", "Product Specifications", "Safety Data Sheet", "Quality Assurance Report"],
          status: "ready",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        }
      ],
      partnerInvites: [
        {
          id: `invite-demo-1-${Date.now()}`,
          partnerName: "Global Trade Finance Ltd",
          email: "partnerships@gtf-trade.example",
          status: "sent",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        }
      ]
    });
  },

  resetDemoData: () => {
    set({
      trades: [],
      fundingRequests: [],
      complianceRuns: [],
      proofPacks: [],
      partnerInvites: [],
      payments: [],
      offers: [],
      infoRequests: [],
      notifications: [],
      timelineEvents: [],
    });
  },

  fetchTradesFromAPI: async () => {
    try {
      const response = await fetch('/api/trades');
      if (!response.ok) return;
      const apiTrades = await response.json();
      
      const formattedTrades: Trade[] = apiTrades.map((t: any) => ({
        id: t.id,
        title: t.title,
        corridor: `${t.origin} → ${t.destination}`,
        status: t.status === 'draft' ? 'planning' : t.status === 'active' ? 'active' : 'completed',
        value: parseFloat(t.value),
        currency: t.currency,
        createdAt: new Date(t.createdAt),
        parties: (t.parties || []).map((p: any) => ({
          name: p.name,
          role: p.type as any,
          region: p.country || '',
        })),
        linkedParties: [],
        goods: t.commodity || '',
        incoterms: t.incoterm || 'FOB',
        timelineStep: 'plan' as TradeTimelineStep,
        documents: [],
        uploadedDocuments: (t.documents || []).map((d: any) => ({
          id: d.id,
          name: d.filename,
          type: 'pdf' as const,
          uploadedAt: new Date(d.createdAt),
        })),
        logisticsMilestones: [
          { key: 'booking' as const, label: 'Booking', status: 'pending' as const },
          { key: 'picked-up' as const, label: 'Picked up', status: 'pending' as const },
          { key: 'export-cleared' as const, label: 'Export cleared', status: 'pending' as const },
          { key: 'departed' as const, label: 'Departed', status: 'pending' as const },
          { key: 'arrived' as const, label: 'Arrived', status: 'pending' as const },
          { key: 'import-cleared' as const, label: 'Import cleared', status: 'pending' as const },
          { key: 'delivered' as const, label: 'Delivered/POD', status: 'pending' as const },
        ],
        logisticsEvents: [],
        logisticsVisibility: 'internal' as const,
      }));
      
      set({ trades: formattedTrades });
    } catch (error) {
      console.error('Failed to fetch trades from API:', error);
    }
  },

  syncTradeFromAPI: async (id: string) => {
    try {
      const response = await fetch(`/api/trades/${id}`);
      if (!response.ok) return;
      const t = await response.json();
      
      const formattedTrade: Trade = {
        id: t.id,
        title: t.title,
        corridor: `${t.origin} → ${t.destination}`,
        status: t.status === 'draft' ? 'planning' : t.status === 'active' ? 'active' : 'completed',
        value: parseFloat(t.value),
        currency: t.currency,
        createdAt: new Date(t.createdAt),
        parties: (t.parties || []).map((p: any) => ({
          name: p.name,
          role: p.type as any,
          region: p.country || '',
        })),
        linkedParties: [],
        goods: t.commodity || '',
        incoterms: t.incoterm || 'FOB',
        timelineStep: 'plan' as TradeTimelineStep,
        documents: [],
        uploadedDocuments: (t.documents || []).map((d: any) => ({
          id: d.id,
          name: d.filename,
          type: 'pdf' as const,
          uploadedAt: new Date(d.createdAt),
        })),
        logisticsMilestones: [
          { key: 'booking' as const, label: 'Booking', status: 'pending' as const },
          { key: 'picked-up' as const, label: 'Picked up', status: 'pending' as const },
          { key: 'export-cleared' as const, label: 'Export cleared', status: 'pending' as const },
          { key: 'departed' as const, label: 'Departed', status: 'pending' as const },
          { key: 'arrived' as const, label: 'Arrived', status: 'pending' as const },
          { key: 'import-cleared' as const, label: 'Import cleared', status: 'pending' as const },
          { key: 'delivered' as const, label: 'Delivered/POD', status: 'pending' as const },
        ],
        logisticsEvents: [],
        logisticsVisibility: 'internal' as const,
      };
      
      set((state) => ({
        trades: state.trades.some(tr => tr.id === id)
          ? state.trades.map(tr => tr.id === id ? formattedTrade : tr)
          : [...state.trades, formattedTrade],
      }));
    } catch (error) {
      console.error('Failed to sync trade from API:', error);
    }
  },
}));
