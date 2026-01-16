"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LeagueLeaderboardTable } from "@/components/features/leaderboard/league-leaderboard-table";
import type { LeagueLeaderboardEntry } from "@/types";

interface LeaderboardSectionProps {
  entries: LeagueLeaderboardEntry[];
  isLoading?: boolean;
}

export function LeaderboardSection({ entries, isLoading = false }: LeaderboardSectionProps) {
  const router = useRouter();

  const handleLeagueClick = (leagueSlug: string) => {
    router.push(`/leagues/${leagueSlug}`);
  };

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-[var(--foreground)]">
            League Rankings
          </h2>
          <Button variant="ghost" onClick={() => router.push("/leagues")}>
            View All Leagues
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {Boolean(isLoading) && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
          </div>
        )}

        {!isLoading && entries.length > 0 && (
          <LeagueLeaderboardTable
            entries={entries}
            showFilters={false}
            onLeagueClick={handleLeagueClick}
          />
        )}

        {!isLoading && entries.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-[var(--foreground-muted)] mb-4" />
              <p className="text-[var(--foreground-secondary)]">
                No leagues competing yet. Create the first league!
              </p>
              <Button className="mt-4" onClick={() => router.push("/leagues/new")}>
                Create a League
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
