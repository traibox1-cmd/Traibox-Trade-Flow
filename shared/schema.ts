import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, numeric, jsonb, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const orgs = pgTable("orgs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  country: text("country"),
  legalName: text("legal_name"),
  taxId: text("tax_id"),
  addressJson: jsonb("address_json"),
  onboardingStatus: text("onboarding_status").notNull().default("demo_active"),
  demoSeeded: boolean("demo_seeded").notNull().default(false),
  financePolicyJson: jsonb("finance_policy_json"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: varchar("org_id").notNull().references(() => orgs.id),
  email: text("email").notNull(),
  name: text("name"),
  role: text("role").notNull().default("ops"),
  passwordHash: text("password_hash").notNull(),
  onboardingStatus: text("onboarding_status").notNull().default("quick_complete"),
  lastLoginAt: timestamp("last_login_at"),
  twoFactorSecret: text("two_factor_secret"),
  isTwoFactorEnabled: boolean("is_two_factor_enabled").notNull().default(false),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [uniqueIndex("users_org_email_idx").on(table.orgId, table.email)]);

export const invites = pgTable("invites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: varchar("org_id").notNull().references(() => orgs.id),
  email: text("email").notNull(),
  role: text("role").notNull().default("finance"),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orgId: varchar("org_id"),
  userId: varchar("user_id"),
  action: text("action").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  mode: text("mode").notNull().default("auto"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const trades = pgTable("trades", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  value: numeric("value").notNull(),
  currency: text("currency").notNull().default("USD"),
  status: text("status").notNull().default("draft"),
  commodity: text("commodity"),
  incoterm: text("incoterm"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const parties = pgTable("parties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull().default("supplier"),
  capabilities: jsonb("capabilities").default([]),
  country: text("country"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tradeParties = pgTable("trade_parties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tradeId: varchar("trade_id").notNull().references(() => trades.id, { onDelete: "cascade" }),
  partyId: varchar("party_id").notNull().references(() => parties.id, { onDelete: "cascade" }),
  roles: jsonb("roles").default([]),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tradeId: varchar("trade_id").references(() => trades.id, { onDelete: "set null" }),
  filename: text("filename").notNull(),
  mime: text("mime").notNull(),
  size: integer("size").notNull(),
  storagePath: text("storage_path").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tradeId: varchar("trade_id").references(() => trades.id, { onDelete: "cascade" }),
  mode: text("mode").notNull().default("explore"),
  agent: text("agent"),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertOrgSchema = createInsertSchema(orgs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
  role: true,
  passwordHash: true,
  orgId: true,
  onboardingStatus: true,
});

export const insertInviteSchema = createInsertSchema(invites).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).pick({
  title: true,
  mode: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  role: true,
  content: true,
});

export const insertTradeSchema = createInsertSchema(trades).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPartySchema = createInsertSchema(parties).omit({
  id: true,
  createdAt: true,
});

export const insertTradePartySchema = createInsertSchema(tradeParties).omit({
  id: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export type Org = typeof orgs.$inferSelect;
export type InsertOrg = z.infer<typeof insertOrgSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Invite = typeof invites.$inferSelect;
export type InsertInvite = z.infer<typeof insertInviteSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Trade = typeof trades.$inferSelect;
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Party = typeof parties.$inferSelect;
export type InsertParty = z.infer<typeof insertPartySchema>;
export type TradeParty = typeof tradeParties.$inferSelect;
export type InsertTradeParty = z.infer<typeof insertTradePartySchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

// ── Compliance v5.0 Tables ──────────────────────────────────────────

export const complianceChecks = pgTable("compliance_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tradeId: varchar("trade_id").notNull().references(() => trades.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // KYC, KYB, SANCTIONS, PEP, ADVERSE_MEDIA, EXPORT, JURISDICTION, ESG, CBAM, AML, INCOTERMS
  status: text("status").notNull(), // pass, warn, fail
  score: numeric("score"),
  reasonsJson: jsonb("reasons_json").default([]),
  provider: text("provider"),
  providerRef: text("provider_ref"),
  policyId: text("policy_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const complianceReports = pgTable("compliance_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tradeId: varchar("trade_id").notNull().references(() => trades.id, { onDelete: "cascade" }),
  policyId: text("policy_id"),
  overall: text("overall").notNull(), // passed, warnings, failed
  riskLevel: text("risk_level").notNull(), // low, medium, high
  jsonBlob: jsonb("json_blob"),
  pdfUrl: text("pdf_url"),
  hash: text("hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sanctionsCache = pgTable("sanctions_cache", {
  key: varchar("key").primaryKey(),
  valueJson: jsonb("value_json"),
  expiresAt: timestamp("expires_at").notNull(),
});

export const exportFlags = pgTable("export_flags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tradeId: varchar("trade_id").notNull().references(() => trades.id, { onDelete: "cascade" }),
  hsCode: text("hs_code").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const auditEvents = pgTable("audit_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tradeId: varchar("trade_id").notNull().references(() => trades.id, { onDelete: "cascade" }),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  payloadJson: jsonb("payload_json"),
  hash: text("hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type ComplianceCheckRecord = typeof complianceChecks.$inferSelect;
export type ComplianceReport = typeof complianceReports.$inferSelect;
export type ExportFlag = typeof exportFlags.$inferSelect;
export type AuditEventRecord = typeof auditEvents.$inferSelect;

// ─── CBAM Schemas ────────────────────────────────────────────────────────────

export const cbamScopeCheckRequestSchema = z.object({
  items: z.array(
    z.object({
      hs_code: z.string().min(1),
      description: z.string().optional(),
    })
  ).min(1),
  corridor: z.string().optional(),
});

export const cbamScopeItemResultSchema = z.object({
  hs_code: z.string(),
  in_scope: z.boolean(),
  category: z.string().nullable(),
  cn_code: z.string().nullable(),
  notes: z.string(),
});

export const cbamScopeResultSchema = z.object({
  in_scope: z.boolean(),
  items: z.array(cbamScopeItemResultSchema),
});

export const cbamRequestItemSchema = z.object({
  hs_code: z.string().min(1),
  quantity_tonnes: z.number().positive(),
  origin_country: z.string().min(1),
  embedded_emissions_tco2: z.number().nullable().optional(),
  default_values: z.boolean().default(true),
});

export const cbamCalculateRequestSchema = z.object({
  trade_id: z.string().min(1),
  items: z.array(cbamRequestItemSchema).min(1),
  reporting_quarter: z.string().optional(),
});

export const cbamCalculationItemSchema = z.object({
  hs_code: z.string(),
  category: z.string(),
  quantity_tonnes: z.number(),
  embedded_emissions_tco2: z.number(),
  emission_source: z.enum(["actual", "default", "mixed"]),
  cbam_certificates_required: z.number().nullable(),
  estimated_cost_eur: z.number().nullable(),
});

export const cbamCalculationSchema = z.object({
  trade_id: z.string(),
  in_scope: z.boolean(),
  items: z.array(cbamCalculationItemSchema),
  totals: z.object({
    total_emissions_tco2: z.number(),
    total_certificates: z.number().nullable(),
    estimated_total_cost_eur: z.number().nullable(),
  }),
  carbon_price_reference: z.object({
    ets_price_eur_per_tco2: z.number(),
    as_of: z.string(),
  }),
  reporting_obligations: z.array(z.string()),
  glass_box: z.object({
    reasons: z.array(z.string()),
  }),
  trace_id: z.string(),
});

export type CBAMScopeCheckRequest = z.infer<typeof cbamScopeCheckRequestSchema>;
export type CBAMScopeResult = z.infer<typeof cbamScopeResultSchema>;
export type CBAMCalculateRequest = z.infer<typeof cbamCalculateRequestSchema>;
export type CBAMCalculation = z.infer<typeof cbamCalculationSchema>;
