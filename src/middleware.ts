import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
