const secret = process.env.JWT_SECRET || "traibox-dev-secret-change-in-production";

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.warn("[security] JWT_SECRET is not set. Using insecure default. Set JWT_SECRET in production.");
}

export const JWT_SECRET = new TextEncoder().encode(secret);
export const COOKIE_NAME = "tb-session";
export const TOKEN_EXPIRY = "7d";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
