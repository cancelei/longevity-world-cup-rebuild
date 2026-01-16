import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/onboarding(.*)",
  "/submit(.*)",
  "/settings(.*)",
  "/api/athletes/me(.*)",
  "/api/submissions(.*)",
]);

// Skip middleware if Clerk is not configured
const hasClerkConfig = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

function noAuthMiddleware(request: NextRequest) {
  // Without Clerk, redirect protected routes to home
  if (isProtectedRoute(request)) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

const clerkHandler = hasClerkConfig
  ? clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        await auth.protect();
      }
    })
  : noAuthMiddleware;

export default clerkHandler;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
