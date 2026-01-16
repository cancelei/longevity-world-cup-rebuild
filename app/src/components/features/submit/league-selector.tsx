"use client";

import { useRouter } from "next/navigation";
import { Building2, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LeagueMembership } from "./types";

interface LeagueSelectorProps {
  leagueMemberships: LeagueMembership[];
  selectedLeagueId: string | null;
  onSelectLeague: (leagueId: string) => void;
  isLoading: boolean;
}

export function LeagueSelector({
  leagueMemberships,
  selectedLeagueId,
  onSelectLeague,
  isLoading,
}: LeagueSelectorProps) {
  const router = useRouter();

  return (
    <Card variant="elevated">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[var(--color-primary)]" />
          Submit for League
        </CardTitle>
        <CardDescription>
          Your biomarkers will be submitted under your selected league
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--color-primary)]" />
          </div>
        ) : leagueMemberships.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-[var(--foreground-secondary)] mb-3">
              You must join a league before submitting biomarkers.
            </p>
            <Button onClick={() => router.push("/leagues")}>
              Browse Leagues
            </Button>
          </div>
        ) : leagueMemberships.length === 1 ? (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background-elevated)] border border-[var(--color-primary)]/30">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <p className="font-medium text-[var(--foreground)]">{leagueMemberships[0].league.name}</p>
              <p className="text-sm text-[var(--foreground-muted)] capitalize">{leagueMemberships[0].league.type.toLowerCase()}</p>
            </div>
            <Check className="w-5 h-5 text-[var(--color-success)] ml-auto" />
          </div>
        ) : (
          <div className="space-y-2">
            {leagueMemberships.map((membership) => (
              <button
                key={membership.league.id}
                onClick={() => onSelectLeague(membership.league.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                  selectedLeagueId === membership.league.id
                    ? "bg-[var(--background-elevated)] border-[var(--color-primary)]/50"
                    : "border-[var(--border)] hover:border-[var(--border-light)]"
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--background-card)] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[var(--foreground-muted)]" />
                </div>
                <div>
                  <p className="font-medium text-[var(--foreground)]">{membership.league.name}</p>
                  <p className="text-sm text-[var(--foreground-muted)] capitalize">{membership.league.type.toLowerCase()}</p>
                </div>
                {selectedLeagueId === membership.league.id && (
                  <Check className="w-5 h-5 text-[var(--color-primary)] ml-auto" />
                )}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
