import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "@shared/schema";
import path from "path";
import fs from "fs";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

// Auto-create tables on first use if they don't exist
let migrationDone = false;
let migrationPromise: Promise<void> | null = null;

export async function ensureTablesExist(): Promise<void> {
  if (migrationDone) return;
  if (migrationPromise) return migrationPromise;

  migrationPromise = (async () => {
    try {
      // Quick check: if core table already exists, skip migration entirely
      const result = await pool.query(
        "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orgs')"
      );
      if (result.rows[0].exists) {
        migrationDone = true;
        return;
      }

      // Tables don't exist — try to create them via migration
      const migrationsFolder = path.resolve(process.cwd(), "migrations");
      if (!fs.existsSync(migrationsFolder)) {
        console.warn("[db] Migrations folder not found at", migrationsFolder, "— run 'npm run db:push' to create tables");
        migrationDone = true;
        return;
      }

      await migrate(db, { migrationsFolder });
      migrationDone = true;
      console.log("[db] Tables created via migration");
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes("already exists")) {
        // Tables were created between our check and the migration — that's fine
        migrationDone = true;
      } else {
        console.error("[db] Migration error:", msg);
        // Don't block the app — tables might have been created by drizzle-kit push
        // The actual DB operations will fail with clear errors if tables are truly missing
        migrationDone = true;
      }
    }
  })();

  return migrationPromise;
}
