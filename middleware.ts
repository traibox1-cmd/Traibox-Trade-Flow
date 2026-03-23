import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { JWT_SECRET, COOKIE_NAME } from "@server/auth/config";

// Routes that should NOT be protected (auth pages, API, static)
const PUBLIC_PREFIXES = ["/api/", "/onboarding", "/_next", "/favicon", "/opengraph"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // All other routes require authentication (default-deny)
  const redirectTarget = pathname === "/" ? "/space" : pathname;

  // Verify session
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL("/onboarding/quick", request.url);
    loginUrl.searchParams.set("redirect", redirectTarget);
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
    // Invalid token - clear cookie and redirect to onboarding
    const loginUrl = new URL("/onboarding/quick", request.url);
    loginUrl.searchParams.set("redirect", redirectTarget);
    const response = NextResponse.redirect(loginUrl);
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
