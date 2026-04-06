import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "@shared/schema";
import path from "path";
import fs from "fs";

if (!process.env.DATABASE_URL) {
  console.error("[db] DATABASE_URL is not set. Database operations will fail.");
}

// Enable SSL for cloud databases (Neon, Supabase, etc.) —
// required on Vercel serverless where the DB is remote.
const dbUrl = process.env.DATABASE_URL || "";
const isRemote = dbUrl && !dbUrl.includes("localhost") && !dbUrl.includes("127.0.0.1");

export const pool = new Pool({
  connectionString: dbUrl || undefined,
  ...(isRemote ? { ssl: { rejectUnauthorized: false } } : {}),
  connectionTimeoutMillis: 10_000,
});

export const db = drizzle(pool, { schema });

// Inline SQL to create all tables — used as fallback when migration files
// are not available (e.g. Vercel serverless deployments)
const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS "orgs" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "country" text,
  "legal_name" text,
  "tax_id" text,
  "address_json" jsonb,
  "onboarding_status" text DEFAULT 'demo_active' NOT NULL,
  "demo_seeded" boolean DEFAULT false NOT NULL,
  "finance_policy_json" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" varchar NOT NULL,
  "email" text NOT NULL,
  "name" text,
  "role" text DEFAULT 'ops' NOT NULL,
  "password_hash" text NOT NULL,
  "onboarding_status" text DEFAULT 'quick_complete' NOT NULL,
  "last_login_at" timestamp,
  "two_factor_secret" text,
  "is_two_factor_enabled" boolean DEFAULT false NOT NULL,
  "reset_password_token" text,
  "reset_password_expires" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "invites" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" varchar NOT NULL,
  "email" text NOT NULL,
  "role" text DEFAULT 'finance' NOT NULL,
  "token_hash" text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "accepted_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "org_id" varchar,
  "user_id" varchar,
  "action" text NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "conversations" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "mode" text DEFAULT 'auto' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "messages" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "conversation_id" varchar NOT NULL,
  "role" text NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "trades" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" text NOT NULL,
  "origin" text NOT NULL,
  "destination" text NOT NULL,
  "value" numeric NOT NULL,
  "currency" text DEFAULT 'USD' NOT NULL,
  "status" text DEFAULT 'draft' NOT NULL,
  "commodity" text,
  "incoterm" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "parties" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "type" text DEFAULT 'supplier' NOT NULL,
  "capabilities" jsonb DEFAULT '[]'::jsonb,
  "country" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "trade_parties" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "trade_id" varchar NOT NULL,
  "party_id" varchar NOT NULL,
  "roles" jsonb DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS "documents" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "trade_id" varchar,
  "filename" text NOT NULL,
  "mime" text NOT NULL,
  "size" integer NOT NULL,
  "storage_path" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "chat_messages" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "trade_id" varchar,
  "mode" text DEFAULT 'explore' NOT NULL,
  "agent" text,
  "role" text NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "compliance_checks" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "trade_id" varchar NOT NULL,
  "type" text NOT NULL,
  "status" text NOT NULL,
  "score" numeric,
  "reasons_json" jsonb DEFAULT '[]'::jsonb,
  "provider" text,
  "provider_ref" text,
  "policy_id" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "compliance_reports" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "trade_id" varchar NOT NULL,
  "policy_id" text,
  "overall" text NOT NULL,
  "risk_level" text NOT NULL,
  "json_blob" jsonb,
  "pdf_url" text,
  "hash" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "sanctions_cache" (
  "key" varchar PRIMARY KEY NOT NULL,
  "value_json" jsonb,
  "expires_at" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS "export_flags" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "trade_id" varchar NOT NULL,
  "hs_code" text NOT NULL,
  "reason" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "audit_events" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "trade_id" varchar NOT NULL,
  "actor" text NOT NULL,
  "action" text NOT NULL,
  "payload_json" jsonb,
  "hash" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Foreign keys (use DO blocks to skip if already exist)
DO $$ BEGIN
  ALTER TABLE "users" ADD CONSTRAINT "users_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "invites" ADD CONSTRAINT "invites_org_id_orgs_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."orgs"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "trade_parties" ADD CONSTRAINT "trade_parties_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "trade_parties" ADD CONSTRAINT "trade_parties_party_id_parties_id_fk" FOREIGN KEY ("party_id") REFERENCES "public"."parties"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "documents" ADD CONSTRAINT "documents_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "compliance_checks" ADD CONSTRAINT "compliance_checks_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "compliance_reports" ADD CONSTRAINT "compliance_reports_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "export_flags" ADD CONSTRAINT "export_flags_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_trade_id_trades_id_fk" FOREIGN KEY ("trade_id") REFERENCES "public"."trades"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "users_org_email_idx" ON "users" USING btree ("org_id","email");
`;

// Auto-create tables on first use if they don't exist
let migrationDone = false;
let migrationPromise: Promise<void> | null = null;

export async function ensureTablesExist(): Promise<void> {
  if (migrationDone) return;
  if (migrationPromise) return migrationPromise;

  migrationPromise = (async () => {
    try {
      // Quick check: if core table already exists, skip entirely
      const result = await pool.query(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orgs')"
      );
      if (result.rows[0].exists) {
        migrationDone = true;
        return;
      }

      // Tables don't exist — try migration files first, fall back to inline SQL
      const migrationsFolder = path.resolve(process.cwd(), "migrations");
      if (fs.existsSync(migrationsFolder)) {
        try {
          await migrate(db, { migrationsFolder });
          migrationDone = true;
          console.log("[db] Tables created via migration files");
          return;
        } catch (migErr) {
          const msg = migErr instanceof Error ? migErr.message : String(migErr);
          if (msg.includes("already exists")) {
            migrationDone = true;
            return;
          }
          console.warn("[db] Migration files failed, falling back to inline SQL:", msg);
        }
      }

      // Fallback: create tables using inline SQL (works on Vercel where migrations/ is absent)
      await pool.query(CREATE_TABLES_SQL);
      migrationDone = true;
      console.log("[db] Tables created via inline SQL fallback");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes("already exists")) {
        migrationDone = true;
      } else {
        console.error("[db] Table creation error:", msg);
        // Don't throw — the actual DB operations will fail with clear errors
        // if tables are truly missing. Re-throwing here blocks ALL requests.
        migrationDone = true;
      }
    }
  })();

  return migrationPromise;
}
