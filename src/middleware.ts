import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Skip middleware for static files and API routes for better performance
    if (
      req.nextUrl.pathname.startsWith("/_next") ||
      req.nextUrl.pathname.startsWith("/api") ||
      req.nextUrl.pathname.includes(".")
    ) {
      return NextResponse.next();
    }

    // Allow access to auth pages when not authenticated
    if (req.nextUrl.pathname.startsWith("/auth/")) {
      return NextResponse.next();
    }

    // Redirect unauthenticated users to signin
    if (!req.nextauth.token) {
      return NextResponse.redirect(new URL("/auth/signin", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Skip authorization for static files and API routes
        if (
          req.nextUrl.pathname.startsWith("/_next") ||
          req.nextUrl.pathname.startsWith("/api") ||
          req.nextUrl.pathname.includes(".")
        ) {
          return true;
        }

        // Allow access to auth pages without authentication
        if (req.nextUrl.pathname.startsWith("/auth/")) {
          return true;
        }

        // Require authentication for all other pages
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Optimized matcher - exclude more static resources for better performance
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
