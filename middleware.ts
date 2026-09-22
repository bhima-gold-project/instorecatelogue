import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const authToken = req.cookies.get("auth_token")?.value;
  const isMobile = req.cookies.get("is_mobile")?.value;
  const { pathname } = req.nextUrl;

  // Main site authentication is strictly based on auth_token or is_mobile (store mobile login)
  const isMainSiteAuthenticated = Boolean(authToken || isMobile);

  // If already authenticated and accessing login page, redirect to home
  if (isMainSiteAuthenticated && pathname.startsWith("/auth/login")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If not authenticated and trying to access protected paths (bypassing auth and mobile routes so auth/mobile handles verification directly)
  if (!isMainSiteAuthenticated && !pathname.startsWith("/auth") && !pathname.startsWith("/mobile")) {
    const loginUrl = new URL("/auth/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Protect specific routes
export const config = {
  matcher: [
    "/",
    "/newcart",
    "/cart",
    "/categories/:path*",
    "/products/:path*",
    "/header",
    "/order/:path*",
    "/admin/:path*",
    "/admin"
  ],
};


