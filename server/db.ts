import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "@shared/schema";
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

// Auto-run migrations on first use to ensure tables exist
let migrationDone = false;
let migrationPromise: Promise<void> | null = null;

export async function ensureTablesExist(): Promise<void> {
  if (migrationDone) return;
  if (migrationPromise) return migrationPromise;

  migrationPromise = (async () => {
    try {
      const migrationsFolder = path.resolve(process.cwd(), "migrations");
      await migrate(db, { migrationsFolder });
      migrationDone = true;
    } catch (error) {
      // If migrations fail (e.g. tables already exist from drizzle-kit push), that's OK
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes("already exists")) {
        migrationDone = true;
      } else {
        console.error("[db] Migration error:", msg);
        migrationPromise = null;
        throw error;
      }
    }
  })();

  return migrationPromise;
}
