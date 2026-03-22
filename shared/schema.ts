import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").notNull().default("operator"),
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

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
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
