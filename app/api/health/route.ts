import { NextResponse } from "next/server";
import { pool } from "@server/db";

export async function GET() {
  const hasDbUrl = !!process.env.DATABASE_URL;
  const masked = hasDbUrl
    ? process.env.DATABASE_URL!.replace(
        /\/\/([^:]+):([^@]+)@/,
        "//$1:****@",
      )
    : "(not set)";

  let dbReachable = false;
  let dbError: string | null = null;

  if (hasDbUrl) {
    try {
      const result = await pool.query("SELECT 1 AS ok");
      dbReachable = result.rows[0]?.ok === 1;
    } catch (err) {
      dbError = err instanceof Error ? err.message : String(err);
    }
  }

  const status = dbReachable ? 200 : 503;
  return NextResponse.json(
    {
      status: dbReachable ? "healthy" : "unhealthy",
      database: {
        url_configured: hasDbUrl,
        url_masked: masked,
        reachable: dbReachable,
        error: dbError,
      },
      env: {
        NODE_ENV: process.env.NODE_ENV ?? "(not set)",
        VERCEL: process.env.VERCEL ?? "(not set)",
      },
      timestamp: new Date().toISOString(),
    },
    { status },
  );
}
