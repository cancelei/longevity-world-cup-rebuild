import { Suspense } from "react";
import { prisma } from "@/lib/db";
import {
  HeroSection,
  StatsSection,
  PodiumSection,
  PrizePoolSection,
  LeaderboardSection,
  CTASection,
} from "@/components/features/home";
import type { LeagueLeaderboardEntry } from "@/types";

// Revalidate every 60 seconds for fresh leaderboard data
export const revalidate = 60;

async function getLeaderboardData(): Promise<{
  entries: LeagueLeaderboardEntry[];
  stats: {
    athleteCount: number;
    leagueCount: number;
    prizePoolBTC: number;
    prizePoolUSD: number;
    prizeGoalBTC: number;
    prizeGoalUSD: number;
    year: number;
  };
}> {
  try {
    // Fetch active season
    const season = await prisma.season.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { year: "desc" },
    });

    // Fetch league leaderboard entries
    const leagueEntries = await prisma.leagueLeaderboardEntry.findMany({
      where: season ? { seasonId: season.id } : undefined,
      select: {
        id: true,
        leagueId: true,
        seasonId: true,
        rank: true,
        previousRank: true,
        avgAgeReduction: true,
        totalMembers: true,
        activeMembers: true,
        bestIndividual: true,
        worstIndividual: true,
        updatedAt: true,
        league: {
          select: {
            id: true,
            name: true,
            slug: true,
            type: true,
            tier: true,
            logo: true,
            city: true,
            country: true,
            verified: true,
            _count: {
              select: { members: true },
            },
          },
        },
      },
      orderBy: { rank: "asc" },
      take: 20,
    });

    // Transform to match expected type
    const entries: LeagueLeaderboardEntry[] = leagueEntries.map((entry) => ({
      rank: entry.rank,
      previousRank: entry.previousRank ?? undefined,
      avgAgeReduction: entry.avgAgeReduction,
      totalMembers: entry.totalMembers,
      activeMembers: entry.activeMembers,
      bestIndividual: entry.bestIndividual,
      worstIndividual: entry.worstIndividual,
      rankChange: entry.previousRank ? entry.previousRank - entry.rank : undefined,
      isNew: !entry.previousRank,
      league: {
        id: entry.league.id,
        name: entry.league.name,
        slug: entry.league.slug,
        type: entry.league.type,
        tier: entry.league.tier,
        logo: entry.league.logo ?? undefined,
        city: entry.league.city ?? undefined,
        country: entry.league.country ?? undefined,
        status: "ACTIVE" as const,
        verified: entry.league.verified,
        ownerId: "",
        memberCount: entry.league._count.members,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }));

    // Get counts
    const [athleteCount, leagueCount] = await Promise.all([
      prisma.athlete.count({ where: { status: "VERIFIED" } }),
      prisma.league.count({ where: { status: "ACTIVE" } }),
    ]);

    return {
      entries,
      stats: {
        athleteCount,
        leagueCount: leagueCount || entries.length,
        prizePoolBTC: season?.prizePoolBTC || 0.85,
        prizePoolUSD: season?.prizePoolUSD || 85420,
        prizeGoalBTC: 1.0,
        prizeGoalUSD: 100000,
        year: season?.year || new Date().getFullYear(),
      },
    };
  } catch (error) {
    console.error("Failed to fetch leaderboard data:", error);
    // Return fallback data
    return {
      entries: [],
      stats: {
        athleteCount: 0,
        leagueCount: 0,
        prizePoolBTC: 0.85,
        prizePoolUSD: 85420,
        prizeGoalBTC: 1.0,
        prizeGoalUSD: 100000,
        year: new Date().getFullYear(),
      },
    };
  }
}

export default async function HomePage() {
  const { entries, stats } = await getLeaderboardData();

  // Calculate prize distribution (60/25/15)
  const prizeDistribution = {
    first: Math.round(stats.prizePoolUSD * 0.6),
    second: Math.round(stats.prizePoolUSD * 0.25),
    third: Math.round(stats.prizePoolUSD * 0.15),
  };

  return (
    <div className="min-h-screen bg-gradient-radial">
      {/* Hero Section */}
      <HeroSection year={stats.year} />

      {/* Stats */}
      <StatsSection
        leagueCount={stats.leagueCount}
        athleteCount={stats.athleteCount}
        prizePoolUSD={stats.prizePoolUSD}
      />

      {/* Prize Pool Section */}
      <PrizePoolSection
        currentBTC={stats.prizePoolBTC}
        goalBTC={stats.prizeGoalBTC}
        currentUSD={stats.prizePoolUSD}
        goalUSD={stats.prizeGoalUSD}
      />

      {/* Top Leagues Showcase (Podium) */}
      <Suspense fallback={null}>
        <PodiumSection entries={entries} prizeDistribution={prizeDistribution} />
      </Suspense>

      {/* League Leaderboard */}
      <LeaderboardSection entries={entries} />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
