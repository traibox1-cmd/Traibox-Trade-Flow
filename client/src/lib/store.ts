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

// ── Compliance v5.0 Types ──────────────────────────────────────────

export type ComplianceCheckType =
  | 'KYC' | 'KYB' | 'SANCTIONS' | 'PEP' | 'ADVERSE_MEDIA'
  | 'EXPORT' | 'JURISDICTION' | 'ESG' | 'CBAM' | 'AML' | 'INCOTERMS';

export type ComplianceCheckStatus = 'pass' | 'warn' | 'fail';

export type ComplianceOverall = 'passed' | 'warnings' | 'failed';

export type OperationalStatus = 'clear' | 'warning' | 'blocked' | 'missing' | 'expiring';

export type ComplianceCheck = {
  type: ComplianceCheckType;
  status: ComplianceCheckStatus;
  score?: number | null;
  reasons: string[];
  provider?: string | null;
  provider_ref?: string | null;
  updated_at: string;
};

export type ComplianceRun = {
  id: string;
  tradeId: string;
  targetEntity: string;
  checks: ComplianceCheck[];
  overall: ComplianceOverall;
  operational_status: OperationalStatus;
  risk_level: 'low' | 'medium' | 'high';
  next_actions: string[];
  requirements_pending: number;
  report_url: string;
  trace_id: string;
  createdAt: Date;
};

export type RequirementState =
  | 'required_now' | 'required_soon' | 'optional_recommended'
  | 'blocked_until_resolved' | 'expired' | 'completed';

export type RequirementPriority = 'blocking' | 'high' | 'medium' | 'low';

export type Requirement = {
  id: string;
  tradeId: string;
  type: 'document' | 'data' | 'check' | 'approval' | 'evidence';
  category: 'identity' | 'screening' | 'export' | 'sustainability' | 'incoterms' | 'corridor' | 'financing';
  title: string;
  description: string;
  who_should_provide: string;
  what_happens_after: string;
  state: RequirementState;
  priority: RequirementPriority;
  linked_check_type?: ComplianceCheckType | null;
  evidence_id?: string | null;
  created_at: string;
  resolved_at?: string | null;
};

export type ComplianceEvidence = {
  id: string;
  tradeId?: string | null;
  partyId?: string | null;
  type: 'registration' | 'kyb_doc' | 'sanctions_clearance' | 'export_license' | 'esg_cert' | 'cbam_evidence' | 'lca_carbon' | 'uop_declaration' | 'incoterm_doc' | 'other';
  file_url: string;
  extracted_fields?: Record<string, unknown> | null;
  valid_from?: string | null;
  valid_to?: string | null;
  validation_state: 'pending' | 'validated' | 'rejected' | 'expired';
  source: string;
  reusable: boolean;
  created_at: string;
};

export type SustainabilityScreening = {
  tradeId: string;
  esg: { flags: string[]; risk_level: 'low' | 'medium' | 'high' };
  ghg_scope3: { applicable: boolean; estimate_tco2?: number | null; confidence: 'high' | 'medium' | 'low' | 'unknown'; notes: string };
  cbam: { in_scope: boolean; items_in_scope: { hs_code: string; category: string }[] };
  next_actions: string[];
  trace_id: string;
};

export type CBAMCalculation = {
  tradeId: string;
  in_scope: boolean;
  items: {
    hs_code: string;
    category: string;
    quantity_tonnes: number;
    embedded_emissions_tco2: number;
    emission_source: 'actual' | 'default' | 'mixed';
    cbam_certificates_required?: number | null;
    estimated_cost_eur?: number | null;
  }[];
  totals: {
    total_emissions_tco2: number;
    total_certificates?: number | null;
    estimated_total_cost_eur?: number | null;
  };
  carbon_price_reference: { ets_price_eur_per_tco2: number; as_of: string };
  reporting_obligations: string[];
  glass_box: { reasons: string[] };
  trace_id: string;
};

export type AuditEvent = {
  id: string;
  tradeId: string;
  actor: string;
  action: string;
  payload: Record<string, unknown>;
  hash: string;
  created_at: string;
};

export type CompliancePolicy = {
  id: string;
  thresholds: {
    sanctions_fail_on_match: boolean;
    pep_warn_on_level: number;
    export_warn_on_chapters: string[];
  };
  sustainability: {
    esg_enabled: boolean;
    cbam_enabled: boolean;
    ghg_scope3_enabled: boolean;
  };
  incoterms_checks_enabled: boolean;
  retention_days: number;
  escalation: {
    notify_roles: string[];
    block_on_fail: boolean;
  };
};

// Legacy compat: flatten to simple findings for old consumers
export type ComplianceFinding = { type: 'pass' | 'warn' | 'fail'; message: string };

export type ProofPack = {
  id: string;
  tradeId: string;
  title: string;
  documents: string[];
  status: 'draft' | 'ready' | 'verified';
  createdAt: Date;
};

export type PartnerInviteStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired' | 'revoked';

export type PartnerInvite = {
  id: string;
  partnerName: string;
  email: string;
  status: PartnerInviteStatus;
  direction: 'sent' | 'received';
  scope?: 'platform' | 'trade' | 'network';
  assignedRole?: PartnerRole;
  tradeId?: string;
  networkId?: string;
  message?: string;
  createdAt: Date;
};

export type NetworkGroup = {
  id: string;
  name: string;
  theme: 'geography' | 'industry' | 'corridor' | 'custom';
  description: string;
  purpose?: string;
  regionScope?: string;
  tags: string[];
  memberCount: number;
  visibility: 'private' | 'invite-only' | 'open';
  governanceMode?: 'private' | 'invite-only' | 'partner-approved' | 'selectively-open';
  isOwner: boolean;
  isMember: boolean;
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

export type PartnerRole = 'Buyer' | 'Supplier' | 'Financier' | 'Logistics' | 'Customs' | 'Insurance' | 'Broker' | 'Auditor/Certifier';

export const ALL_PARTNER_ROLES: PartnerRole[] = [
  'Buyer',
  'Supplier',
  'Financier',
  'Logistics',
  'Customs',
  'Insurance',
  'Broker',
  'Auditor/Certifier'
];

export type Partner = {
  id: string;
  name: string;
  legalName?: string;
  tradingName?: string;
  region: string;
  country?: string;
  capabilities: string[]; // Services: Forwarding, Customs, Trade docs, etc.
  canActAs: PartnerRole[]; // Roles: Buyer, Supplier, Financier, Logistics, Customs, Insurance
  trust: 'verified' | 'partner' | 'new';
  visibility: 'private' | 'shared';
  connectionStatus: 'none' | 'pending' | 'connected';
  type?: 'counterparty' | 'participant' | 'organization';
  industry?: string;
  sectors?: string[];
  corridorRelevance?: string[];
  website?: string;
  tradePassportReady?: boolean;
  tradePassportSummary?: string;
  relationshipOwner?: string;
  activeTradeIds?: string[];
  networkIds?: string[];
  notes?: string;
};

export type MatchSignal = {
  label: string;
  strength: 'strong' | 'moderate' | 'weak';
};

export type Match = {
  id: string;
  name: string;
  role: PartnerRole;
  fitScore: string;
  reason: string;
  signals: MatchSignal[];
  unknowns: string[];
  tags: string[];
  suggestedActions: string[];
};

type AppStore = {
  trades: Trade[];
  fundingRequests: FundingRequest[];
  complianceRuns: ComplianceRun[];
  proofPacks: ProofPack[];
  requirements: Requirement[];
  evidence: ComplianceEvidence[];
  auditEvents: AuditEvent[];
  compliancePolicies: CompliancePolicy[];
  partnerInvites: PartnerInvite[];
  payments: Payment[];
  partners: Partner[];
  networkGroups: NetworkGroup[];
  matches: Match[];
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
  addRequirement: (req: Omit<Requirement, 'id'>) => string;
  resolveRequirement: (id: string, evidenceId?: string) => void;
  addEvidence: (ev: Omit<ComplianceEvidence, 'id'>) => string;
  removeEvidence: (id: string) => void;
  addAuditEvent: (event: Omit<AuditEvent, 'id'>) => string;
  addProofPack: (pack: Omit<ProofPack, 'id' | 'createdAt'>) => string;
  updateProofPack: (id: string, updates: Partial<ProofPack>) => void;
  addPartnerInvite: (invite: Omit<PartnerInvite, 'id' | 'createdAt'>) => void;
  updatePartnerInvite: (id: string, updates: Partial<PartnerInvite>) => void;
  addNetworkGroup: (group: Omit<NetworkGroup, 'id' | 'createdAt'>) => string;
  updateNetworkGroup: (id: string, updates: Partial<NetworkGroup>) => void;
  joinNetworkGroup: (id: string) => void;
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => string;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  updatePartner: (id: string, updates: Partial<Partner>) => void;
  addMatch: (match: Match) => void;
  addOffer: (offer: Omit<Offer, 'id' | 'createdAt'>) => string;
  updateOffer: (id: string, updates: Partial<Offer>) => void;
  addInfoRequest: (request: Omit<InfoRequest, 'id' | 'createdAt'>) => string;
  updateInfoRequest: (id: string, updates: Partial<InfoRequest>) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => string;
  markNotificationRead: (id: string) => void;
  addTimelineEvent: (event: Omit<TimelineEvent, 'id' | 'createdAt'>) => string;
  getUnreadNotifications: (role: 'operator' | 'financier') => Notification[];
  setAIStatus: (status: 'connected' | 'demo') => void;
  loadDemoData: (force?: boolean) => void;
  resetDemoData: () => void;
  fetchTradesFromAPI: () => Promise<void>;
  syncTradeFromAPI: (id: string) => Promise<void>;
  linkPartyToTrade: (tradeId: string, partnerId: string, roles: string[]) => void;
  unlinkPartyFromTrade: (tradeId: string, partnerId: string) => void;
  updateLinkedPartyRoles: (tradeId: string, partnerId: string, roles: string[]) => void;
  getPartnerById: (id: string) => Partner | undefined;
};

const initialPartners: Partner[] = [
  {
    id: "p1",
    name: "NordWerk Logistics",
    legalName: "NordWerk Logistics GmbH",
    region: "EU",
    country: "Germany",
    capabilities: ["Forwarding", "Customs", "Trade docs"],
    canActAs: ["Logistics", "Customs"],
    trust: "verified",
    visibility: "private",
    connectionStatus: "connected",
    type: "participant",
    industry: "Logistics & Freight",
    sectors: ["Freight Forwarding", "Customs Brokerage"],
    corridorRelevance: ["EU–Africa", "EU–SEA"],
    tradePassportReady: true,
    tradePassportSummary: "Identity verified, KYC complete, all trade documents current",
    activeTradeIds: [],
    networkIds: ["ng1"],
  },
  {
    id: "p2",
    name: "Aster Mills",
    legalName: "Aster Mills Pte Ltd",
    region: "SEA",
    country: "Vietnam",
    capabilities: ["Manufacturing", "QA", "Insurance"],
    canActAs: ["Supplier"],
    trust: "partner",
    visibility: "shared",
    connectionStatus: "connected",
    type: "counterparty",
    industry: "Textiles & Apparel",
    sectors: ["Manufacturing", "Quality Assurance"],
    corridorRelevance: ["SEA–EU", "SEA–US"],
    tradePassportReady: true,
    tradePassportSummary: "Identity verified, compliance documents up to date",
    activeTradeIds: [],
    networkIds: ["ng2"],
  },
  {
    id: "p3",
    name: "Kijani Cooperative",
    region: "Africa",
    country: "Kenya",
    capabilities: ["Aggregation", "Fulfillment", "Local compliance"],
    canActAs: ["Supplier", "Buyer"],
    trust: "new",
    visibility: "private",
    connectionStatus: "none",
    type: "counterparty",
    industry: "Agriculture & Commodities",
    sectors: ["Agriculture", "Commodities"],
    corridorRelevance: ["Kenya–EU"],
    tradePassportReady: false,
    tradePassportSummary: "Incomplete — missing KYC documentation and UBO declaration",
    activeTradeIds: [],
    networkIds: [],
  },
  {
    id: "p4",
    name: "Meridian Trade Finance",
    legalName: "Meridian Trade Finance AG",
    region: "EU",
    country: "Switzerland",
    capabilities: ["LC issuance", "Invoice factoring", "Trade guarantees"],
    canActAs: ["Financier"],
    trust: "verified",
    visibility: "shared",
    connectionStatus: "connected",
    type: "participant",
    industry: "Trade Finance",
    sectors: ["Trade Finance", "Structured Finance"],
    corridorRelevance: ["Global"],
    tradePassportReady: true,
    tradePassportSummary: "Fully verified, regulated entity, compliance current",
    activeTradeIds: [],
    networkIds: ["ng1"],
  },
  {
    id: "p5",
    name: "Solano Energy Group",
    region: "LATAM",
    country: "Brazil",
    capabilities: ["Energy supply", "Local compliance", "Aggregation"],
    canActAs: ["Supplier", "Buyer"],
    trust: "partner",
    visibility: "private",
    connectionStatus: "pending",
    type: "counterparty",
    industry: "Energy",
    sectors: ["Renewable Energy", "Energy Trading"],
    corridorRelevance: ["LATAM–EU", "LATAM–US"],
    tradePassportReady: false,
    tradePassportSummary: "Partial — identity confirmed, compliance documents pending",
    activeTradeIds: [],
    networkIds: ["ng3"],
  },
  {
    id: "p6",
    name: "Pacific Risk Brokers",
    legalName: "Pacific Risk Brokers Pte Ltd",
    region: "APAC",
    country: "Singapore",
    capabilities: ["Cargo insurance", "Risk assessment", "Policy docs"],
    canActAs: ["Insurance", "Broker"],
    trust: "verified",
    visibility: "shared",
    connectionStatus: "connected",
    type: "participant",
    industry: "Insurance & Risk",
    sectors: ["Marine Insurance", "Trade Risk"],
    corridorRelevance: ["APAC–EU", "APAC–US"],
    tradePassportReady: true,
    tradePassportSummary: "Fully verified, regulated insurer, all certifications current",
    activeTradeIds: [],
    networkIds: ["ng2"],
  },
];

const initialNetworkGroups: NetworkGroup[] = [
  {
    id: "ng1",
    name: "EU–Africa Trade Corridor",
    theme: "corridor",
    description: "Structured network for EU exporters and African importers. Focused on agri, textiles, and industrial goods.",
    purpose: "Facilitate cross-border trade between EU and African markets",
    regionScope: "EU, East Africa, West Africa",
    tags: ["EU", "Africa", "Agri", "Textiles"],
    memberCount: 34,
    visibility: "invite-only",
    governanceMode: "invite-only",
    isOwner: true,
    isMember: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: "ng2",
    name: "SEA Sourcing Network",
    theme: "geography",
    description: "Vetted manufacturers, logistics, and compliance partners across Southeast Asia.",
    purpose: "Sourcing and supply chain coordination",
    regionScope: "Southeast Asia",
    tags: ["SEA", "Manufacturing", "Sourcing", "Vietnam", "Thailand"],
    memberCount: 61,
    visibility: "invite-only",
    governanceMode: "partner-approved",
    isOwner: false,
    isMember: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
  {
    id: "ng3",
    name: "Low-Emission Materials Network",
    theme: "industry",
    description: "Connecting buyers and producers of certified low-carbon materials globally.",
    purpose: "Sustainability-focused trade and material sourcing",
    regionScope: "Global",
    tags: ["ESG", "Low-carbon", "Materials", "Sustainability"],
    memberCount: 22,
    visibility: "open",
    governanceMode: "selectively-open",
    isOwner: false,
    isMember: false,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  },
  {
    id: "ng4",
    name: "LATAM Market-Entry Network",
    theme: "geography",
    description: "Helping international companies establish trade operations in Latin America through local partners.",
    purpose: "Market entry and local partnership development",
    regionScope: "Brazil, Mexico, Colombia, Chile",
    tags: ["LATAM", "Brazil", "Mexico", "Market entry"],
    memberCount: 18,
    visibility: "invite-only",
    governanceMode: "invite-only",
    isOwner: false,
    isMember: false,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  },
];

export const useAppStore = create<AppStore>((set, get) => ({
  trades: [],
  fundingRequests: [],
  complianceRuns: [],
  proofPacks: [],
  requirements: [],
  evidence: [],
  auditEvents: [],
  compliancePolicies: [],
  partnerInvites: [
    {
      id: "invite-demo-1",
      partnerName: "Solano Energy Group",
      email: "trade@solano.com.br",
      status: "sent",
      direction: "sent",
      scope: "network",
      networkId: "ng3",
      assignedRole: "Supplier",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: "invite-demo-2",
      partnerName: "Vortex Commodities AG",
      email: "ops@vortexcommodities.ch",
      status: "sent",
      direction: "received",
      scope: "trade",
      assignedRole: "Buyer",
      message: "We'd like to connect on the Kenya coffee corridor. Our team specializes in East African supply chains.",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  ],
  payments: [],
  partners: initialPartners,
  networkGroups: initialNetworkGroups,
  matches: [],
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

  addRequirement: (req) => {
    const id = `req-${Date.now()}`;
    set((state) => ({
      requirements: [...state.requirements, { ...req, id }],
    }));
    return id;
  },

  resolveRequirement: (id, evidenceId) =>
    set((state) => ({
      requirements: state.requirements.map((r) =>
        r.id === id
          ? { ...r, state: 'completed' as const, resolved_at: new Date().toISOString(), evidence_id: evidenceId || r.evidence_id }
          : r
      ),
    })),

  addEvidence: (ev) => {
    const id = `ev-${Date.now()}`;
    set((state) => ({
      evidence: [...state.evidence, { ...ev, id }],
    }));
    return id;
  },

  removeEvidence: (id) =>
    set((state) => ({
      evidence: state.evidence.filter((e) => e.id !== id),
    })),

  addAuditEvent: (event) => {
    const id = `audit-${Date.now()}`;
    set((state) => ({
      auditEvents: [...state.auditEvents, { ...event, id }],
    }));
    return id;
  },

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

  updatePartnerInvite: (id, updates) =>
    set((state) => ({
      partnerInvites: state.partnerInvites.map((invite) =>
        invite.id === id ? { ...invite, ...updates } : invite
      ),
    })),

  addMatch: (match) =>
    set((state) => ({
      matches: [...state.matches, match],
    })),

  addNetworkGroup: (group) => {
    const id = `ng-${Date.now()}`;
    set((state) => ({
      networkGroups: [
        ...state.networkGroups,
        { ...group, id, createdAt: new Date() },
      ],
    }));
    return id;
  },

  updateNetworkGroup: (id, updates) =>
    set((state) => ({
      networkGroups: state.networkGroups.map((ng) =>
        ng.id === id ? { ...ng, ...updates } : ng
      ),
    })),

  joinNetworkGroup: (id) =>
    set((state) => ({
      networkGroups: state.networkGroups.map((ng) =>
        ng.id === id ? { ...ng, isMember: true, memberCount: ng.memberCount + 1 } : ng
      ),
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

  loadDemoData: (force = false) => {
    const state = get();
    
    // Check if demo data already exists (prevent duplicates)
    const hasDemoData = state.trades.some(t => t.title === "Kenya Coffee Import" || t.title === "Medical Supplies Export");
    if (hasDemoData && !force) return;

    // Create demo trades with stable IDs
    const trade1Id = `trade-demo-coffee-${Date.now()}`;
    const trade2Id = `trade-demo-medical-${Date.now() + 1}`;
    const now = Date.now();
    
    set({
      trades: [
        {
          id: trade1Id,
          title: "Kenya Coffee Import",
          corridor: "Kenya → EU",
          status: "active",
          value: 250000,
          currency: "USD",
          createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000),
          parties: [
            { name: "Kijani Cooperative", role: "seller", region: "Kenya" },
            { name: "NordWerk Logistics", role: "shipper", region: "EU" },
            { name: "Hamburg Port Authority", role: "insurer", region: "EU" }
          ],
          linkedParties: [
            { partnerId: "p1", roles: ["logistics", "customs"] },
            { partnerId: "p2", roles: ["buyer"] },
            { partnerId: "p3", roles: ["supplier"] }
          ],
          goods: "Coffee Beans (Arabica)",
          incoterms: "FOB Mombasa",
          timelineStep: "funding",
          documents: ["Commercial Invoice", "Packing List", "Certificate of Origin"],
          uploadedDocuments: [],
          notes: "Premium grade coffee beans, organic certified",
          fundingType: "factoring",
          paymentTerms: "Net 60",
          logisticsMilestones: [
            { key: 'booking', label: 'Booking', status: 'confirmed', timestamp: new Date(now - 6 * 24 * 60 * 60 * 1000) },
            { key: 'picked-up', label: 'Picked up', status: 'confirmed', timestamp: new Date(now - 5 * 24 * 60 * 60 * 1000) },
            { key: 'export-cleared', label: 'Export cleared', status: 'confirmed', timestamp: new Date(now - 4 * 24 * 60 * 60 * 1000) },
            { key: 'departed', label: 'Departed', status: 'confirmed', timestamp: new Date(now - 3 * 24 * 60 * 60 * 1000) },
            { key: 'arrived', label: 'Arrived', status: 'pending' },
            { key: 'import-cleared', label: 'Import cleared', status: 'pending' },
            { key: 'delivered', label: 'Delivered/POD', status: 'pending' },
          ],
          logisticsEvents: [
            { id: `evt-1-${now}`, timestamp: new Date(now - 6 * 24 * 60 * 60 * 1000), source: "CargoSmart", description: "Booking confirmed: Container MSCU1234567", confidence: "high" },
            { id: `evt-2-${now}`, timestamp: new Date(now - 5 * 24 * 60 * 60 * 1000), source: "Carrier API", description: "Container picked up from Kijani warehouse, Nairobi", confidence: "high" },
            { id: `evt-3-${now}`, timestamp: new Date(now - 4 * 24 * 60 * 60 * 1000), source: "Kenya Customs", description: "Export clearance approved, duties paid", confidence: "high" },
            { id: `evt-4-${now}`, timestamp: new Date(now - 3 * 24 * 60 * 60 * 1000), source: "Maersk Tracking", description: "Vessel MSC AURORA departed Mombasa, ETA Hamburg 12 days", confidence: "high" },
            { id: `evt-5-${now}`, timestamp: new Date(now - 1 * 24 * 60 * 60 * 1000), source: "AIS Signal", description: "Vessel transiting Suez Canal", confidence: "medium" },
          ],
          logisticsVisibility: 'parties'
        },
        {
          id: trade2Id,
          title: "Medical Supplies Export",
          corridor: "US → SEA",
          status: "active",
          value: 450000,
          currency: "USD",
          createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000),
          parties: [
            { name: "MedTech Solutions", role: "seller", region: "US" },
            { name: "Aster Mills", role: "buyer", region: "Singapore" }
          ],
          linkedParties: [{ partnerId: "p2", roles: ["buyer"] }],
          goods: "Diagnostic Equipment",
          incoterms: "CIF Singapore",
          timelineStep: "compliance",
          documents: ["Invoice", "FDA Certificate", "Insurance Certificate"],
          uploadedDocuments: [],
          notes: "Temperature-controlled shipping required",
          fundingType: "credit-line",
          paymentTerms: "Net 30",
          logisticsMilestones: [
            { key: 'booking', label: 'Booking', status: 'confirmed', timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000) },
            { key: 'picked-up', label: 'Picked up', status: 'pending' },
            { key: 'export-cleared', label: 'Export cleared', status: 'pending' },
            { key: 'departed', label: 'Departed', status: 'pending' },
            { key: 'arrived', label: 'Arrived', status: 'pending' },
            { key: 'import-cleared', label: 'Import cleared', status: 'pending' },
            { key: 'delivered', label: 'Delivered/POD', status: 'pending' },
          ],
          logisticsEvents: [
            { id: `evt-6-${now}`, timestamp: new Date(now - 2 * 24 * 60 * 60 * 1000), source: "FedEx Freight", description: "Booking confirmed for temperature-controlled container", confidence: "high" },
          ],
          logisticsVisibility: 'internal'
        }
      ],
      fundingRequests: [
        {
          id: `funding-demo-1-${now}`,
          tradeId: trade1Id,
          amount: 200000,
          type: "lc",
          status: "pending",
          requesterName: "Kenya Coffee Trader",
          createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
          notes: "LC needed for coffee shipment - 80% advance requested",
          corridor: "Kenya → EU"
        }
      ],
      proofPacks: [
        {
          id: `proof-demo-1-${now}`,
          tradeId: trade2Id,
          title: "Medical Supplies Compliance Pack",
          documents: ["FDA Certificate", "Product Specifications", "Safety Data Sheet", "Quality Assurance Report"],
          status: "ready",
          createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000)
        },
        {
          id: `proof-demo-2-${now}`,
          tradeId: trade1Id,
          title: "Kenya Coffee Export Pack",
          documents: ["Certificate of Origin", "Phytosanitary Certificate", "Commercial Invoice"],
          status: "draft",
          createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000)
        }
      ],
      complianceRuns: [
        {
          id: `compliance-demo-1-${now}`,
          tradeId: trade1Id,
          targetEntity: "Kijani Cooperative",
          checks: [
            { type: "KYB", status: "pass", provider: "provA", provider_ref: "A-9912", reasons: [], updated_at: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString() },
            { type: "SANCTIONS", status: "pass", provider: "provA", reasons: [], updated_at: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString() },
            { type: "PEP", status: "pass", provider: "provA", reasons: [], updated_at: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString() },
            { type: "EXPORT", status: "warn", reasons: ["HS 0901 flagged; confirm end-use/end-user statement"], provider: "provB", updated_at: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString() },
            { type: "ESG", status: "pass", reasons: [], updated_at: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString() },
            { type: "CBAM", status: "warn", reasons: ["Corridor to EU; product may fall under CBAM reporting"], updated_at: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString() },
          ],
          overall: "warnings",
          operational_status: "warning",
          risk_level: "medium",
          next_actions: ["Collect end-use statement", "Attach ESG evidence for STF"],
          requirements_pending: 2,
          report_url: `/reports/compliance/${trade1Id}.pdf`,
          trace_id: "trc_cmp_demo1",
          createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000)
        },
        {
          id: `compliance-demo-2-${now}`,
          tradeId: trade2Id,
          targetEntity: "MedTech Solutions",
          checks: [
            { type: "KYB", status: "fail", reasons: ["Missing: Proof of address (required)", "Missing: UBO declaration (required)"], updated_at: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString() },
            { type: "SANCTIONS", status: "pass", provider: "provA", reasons: [], updated_at: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString() },
            { type: "EXPORT", status: "warn", reasons: ["Export license pending FDA review"], provider: "provB", updated_at: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString() },
            { type: "INCOTERMS", status: "pass", reasons: [], updated_at: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString() },
          ],
          overall: "failed",
          operational_status: "blocked",
          risk_level: "high",
          next_actions: ["Upload proof of address", "Submit UBO declaration", "Await FDA export license review"],
          requirements_pending: 3,
          report_url: `/reports/compliance/${trade2Id}.pdf`,
          trace_id: "trc_cmp_demo2",
          createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000)
        }
      ],
      partnerInvites: [
        {
          id: `invite-demo-1-${now}`,
          partnerName: "Global Trade Finance Ltd",
          email: "partnerships@gtf-trade.example",
          status: "sent",
          direction: "sent",
          scope: "trade",
          createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000)
        },
        {
          id: `invite-demo-2-${now}`,
          partnerName: "Singapore Freight Services",
          email: "ops@sgfreight.example",
          status: "accepted",
          direction: "sent",
          scope: "network",
          createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000)
        },
        {
          id: `invite-demo-3-${now}`,
          partnerName: "Vortex Commodities AG",
          email: "ops@vortexcommodities.ch",
          status: "sent",
          direction: "received",
          scope: "trade",
          message: "We'd like to connect on the Kenya coffee corridor.",
          createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000)
        }
      ],
      timelineEvents: [
        {
          id: `timeline-1-${now}`,
          tradeId: trade1Id,
          type: "created",
          actor: "System",
          message: "Trade created: Kenya Coffee Import",
          createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000)
        },
        {
          id: `timeline-2-${now}`,
          tradeId: trade1Id,
          fundingRequestId: `funding-demo-1-${now}`,
          type: "created",
          actor: "Operator",
          message: "Funding request submitted for $200,000 LC",
          createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: `timeline-3-${now}`,
          tradeId: trade2Id,
          type: "created",
          actor: "System",
          message: "Trade created: Medical Supplies Export",
          createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000)
        }
      ],
      payments: [
        {
          id: `payment-demo-1-${now}`,
          tradeId: trade1Id,
          amount: 50000,
          currency: "USD",
          beneficiary: "Kijani Cooperative",
          rail: "swift",
          status: "completed",
          createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000),
          notes: "Advance payment - 20% of trade value"
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
      requirements: [],
      evidence: [],
      auditEvents: [],
      compliancePolicies: [],
      partnerInvites: [],
      payments: [],
      matches: [],
      offers: [],
      infoRequests: [],
      notifications: [],
      timelineEvents: [],
      networkGroups: initialNetworkGroups,
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

  linkPartyToTrade: (tradeId: string, partnerId: string, roles: string[]) =>
    set((state) => ({
      trades: state.trades.map((trade) =>
        trade.id === tradeId
          ? {
              ...trade,
              linkedParties: trade.linkedParties.some((lp) => lp.partnerId === partnerId)
                ? trade.linkedParties.map((lp) =>
                    lp.partnerId === partnerId ? { ...lp, roles } : lp
                  )
                : [...trade.linkedParties, { partnerId, roles }],
            }
          : trade
      ),
    })),

  unlinkPartyFromTrade: (tradeId: string, partnerId: string) =>
    set((state) => ({
      trades: state.trades.map((trade) =>
        trade.id === tradeId
          ? {
              ...trade,
              linkedParties: trade.linkedParties.filter((lp) => lp.partnerId !== partnerId),
            }
          : trade
      ),
    })),

  updateLinkedPartyRoles: (tradeId: string, partnerId: string, roles: string[]) =>
    set((state) => ({
      trades: state.trades.map((trade) =>
        trade.id === tradeId
          ? {
              ...trade,
              linkedParties: trade.linkedParties.map((lp) =>
                lp.partnerId === partnerId ? { ...lp, roles } : lp
              ),
            }
          : trade
      ),
    })),

  getPartnerById: (id: string) => get().partners.find((p) => p.id === id),
}));
