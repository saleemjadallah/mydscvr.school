import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/saved(.*)",
  "/profile(.*)",
  "/dashboard(.*)",
  "/school-admin(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

// Public pages that should be cacheable by CDNs and search engine crawlers
const isPublicCacheableRoute = createRouteMatcher([
  "/schools/(.*)",
  "/nurseries(.*)",
  "/compare",
  "/map",
  "/best-schools(.*)",
  "/terms",
  "/privacy",
  "/cookies",
  "/about",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  if (isAdminRoute(req)) {
    const session = await auth.protect();
    const role = session.sessionClaims?.metadata?.role;
    if (role !== "admin") {
      const url = new URL("/", req.url);
      return Response.redirect(url);
    }
    return;
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
    return;
  }

  // Override Clerk's default no-cache headers for public pages so that
  // CDNs (Cloudflare, Fastly) and search engine crawlers can cache them
  if (isPublicCacheableRoute(req)) {
    const response = NextResponse.next();
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=86400"
    );
    return response;
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
