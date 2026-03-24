import { NextResponse } from "next/server";

/**
 * Check whether an error originates from the PostgreSQL driver (pg).
 * pg errors carry a 5-char SQLSTATE code such as "28P01" or "42P01".
 * Also handles AggregateError (Node wraps multiple connection failures).
 */
export function isDbError(error: unknown): boolean {
  // AggregateError wraps connection failures in Node.js
  if (error instanceof AggregateError) return true;

  const code = (error as any)?.code;
  if (typeof code === "string" && /^[0-9A-Z]{5}$/.test(code)) return true;

  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("ECONNREFUSED") ||
    msg.includes("ENOTFOUND") ||
    msg.includes("Connection terminated") ||
    msg.includes("timeout") ||
    msg.includes("connect ETIMEDOUT") ||
    msg.includes("password authentication failed") ||
    msg.includes("no pg_hba.conf entry") ||
    msg.includes("database") && msg.includes("does not exist")
  );
}

/**
 * Return a 503 JSON response when the database is unreachable,
 * or a generic 500 for any other unexpected error.
 *
 * When DATABASE_URL is not configured at all, the message explicitly
 * tells the operator so they can fix the Vercel env-var setup.
 */
export function dbAwareErrorResponse(error: unknown): NextResponse {
  if (isDbError(error)) {
    const hasDbUrl = !!process.env.DATABASE_URL;
    const detail = hasDbUrl
      ? "Database is temporarily unavailable. Please try again in a moment."
      : "DATABASE_URL is not configured. Add it in your Vercel project settings → Environment Variables.";

    return NextResponse.json(
      { error: detail, hint: hasDbUrl ? undefined : "See GET /api/health for diagnostics." },
      { status: 503 },
    );
  }
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 },
  );
}
