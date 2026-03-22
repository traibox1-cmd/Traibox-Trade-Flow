import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "traibox-dev-secret-change-in-production"
);
const COOKIE_NAME = "tb-session";

// Routes that require authentication
const PROTECTED_PREFIXES = ["/dashboard", "/space", "/trade", "/network", "/finance", "/compliance", "/settings", "/capital-console", "/funding-desk", "/deal-assistant", "/counterparties", "/risk-policy", "/settlement", "/evidence", "/assurance", "/risk-assessment", "/trade-passport", "/trade-trends", "/trade-workspace", "/trades", "/proofs", "/payments"];

// Routes that should NOT be protected (auth pages, API, static)
const PUBLIC_PREFIXES = ["/api/", "/onboarding", "/_next", "/favicon", "/opengraph"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Check if route needs protection
  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));
  if (!isProtected) {
    return NextResponse.next();
  }

  // Verify session
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL("/onboarding/quick", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const orgOnboardingStatus = payload.orgOnboardingStatus as string;

    // If org is in demo_active and user tries to access certain pages,
    // allow but the UI will show demo banner
    // If org is full_incomplete, redirect to complete onboarding
    if (orgOnboardingStatus === "full_incomplete" && !pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/onboarding/full", request.url));
    }

    return NextResponse.next();
  } catch {
    // Invalid token - clear cookie and redirect to login
    const response = NextResponse.redirect(new URL("/onboarding/quick", request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
