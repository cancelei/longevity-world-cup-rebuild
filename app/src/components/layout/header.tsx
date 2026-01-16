"use client";

import Link from "next/link";
import { Trophy, Menu, X } from "lucide-react";
import { useState } from "react";
import { AuthenticatedOnly, UnauthenticatedOnly, UserProfileButton } from "@/components/auth/clerk-components";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Leaderboard" },
  { href: "/athletes", label: "Athletes" },
  { href: "/about", label: "About" },
  { href: "/rules", label: "Rules" },
];

const authenticatedNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/submit", label: "Submit" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Trophy className="h-8 w-8 text-[var(--color-primary)] transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-[var(--color-primary)] blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
          </div>
          <span className="font-display text-xl font-bold text-gradient hidden sm:inline">
            Longevity World Cup
          </span>
          <span className="font-display text-xl font-bold text-gradient sm:hidden">
            LWC
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <AuthenticatedOnly>
            {authenticatedNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </AuthenticatedOnly>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <UnauthenticatedOnly>
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">
                Join Competition
              </Button>
            </Link>
          </UnauthenticatedOnly>
          <AuthenticatedOnly>
            <Link href="/submit">
              <Button size="sm">
                Submit Biomarkers
              </Button>
            </Link>
            <UserProfileButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 border-2 border-[var(--color-primary)]",
                },
              }}
            />
          </AuthenticatedOnly>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 border-b border-[var(--border)]",
          mobileMenuOpen ? "max-h-96" : "max-h-0 border-b-0"
        )}
      >
        <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[var(--foreground-secondary)] hover:text-[var(--foreground)] py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <AuthenticatedOnly>
            <div className="border-t border-[var(--border)] pt-4">
              {authenticatedNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </AuthenticatedOnly>

          <div className="flex flex-col gap-2 pt-4 border-t border-[var(--border)]">
            <UnauthenticatedOnly>
              <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">
                  Join Competition
                </Button>
              </Link>
            </UnauthenticatedOnly>
            <AuthenticatedOnly>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--foreground-secondary)]">Your Account</span>
                <UserProfileButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "h-9 w-9 border-2 border-[var(--color-primary)]",
                    },
                  }}
                />
              </div>
            </AuthenticatedOnly>
          </div>
        </nav>
      </div>
    </header>
  );
}
