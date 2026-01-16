"use client";

import { ReactNode } from "react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

// Wrapper for SignedIn - only renders children if Clerk is configured and user is signed in
export function AuthenticatedOnly({ children }: { children: ReactNode }) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return null; // Hide authenticated content when Clerk is not configured
  }

  return <SignedIn>{children}</SignedIn>;
}

// Wrapper for SignedOut - renders children if Clerk is not configured or user is signed out
export function UnauthenticatedOnly({ children }: { children: ReactNode }) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return <>{children}</>; // Show unauthenticated content when Clerk is not configured
  }

  return <SignedOut>{children}</SignedOut>;
}

// Wrapper for UserButton
export function UserProfileButton(props: Record<string, unknown>) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return null;
  }

  return <UserButton {...props} />;
}
