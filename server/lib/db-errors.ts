import { NextResponse } from "next/server";

/**
 * Check whether an error originates from the PostgreSQL driver (pg).
 * pg errors carry a 5-char SQLSTATE code such as "28P01" or "42P01".
 */
export function isDbError(error: unknown): boolean {
  const code = (error as any)?.code;
  if (typeof code === "string" && /^[0-9A-Z]{5}$/.test(code)) return true;

  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("ECONNREFUSED") ||
    msg.includes("ENOTFOUND") ||
    msg.includes("Connection terminated") ||
    msg.includes("timeout") ||
    msg.includes("connect ETIMEDOUT")
  );
}

/**
 * Return a 503 JSON response when the database is unreachable,
 * or a generic 500 for any other unexpected error.
 */
export function dbAwareErrorResponse(error: unknown): NextResponse {
  if (isDbError(error)) {
    return NextResponse.json(
      { error: "Database is temporarily unavailable. Please try again in a moment." },
      { status: 503 },
    );
  }
  return NextResponse.json(
    { error: "Internal server error" },
    { status: 500 },
  );
}
