import { prisma } from "@/lib/db";

/**
 * League Scoring Algorithm
 *
 * League score = average of top N members' best age reductions
 * - For leagues with 10+ active members: use top 10
 * - For leagues with <10 active members: use all active members
 *
 * This prevents sandbagging (adding bad performers to lower average)
 * and rewards recruiting top performers.
 */

const TOP_N_MEMBERS = 10;

interface LeagueScoringResult {
  leagueId: string;
  seasonId: string;
  avgAgeReduction: number;
  totalMembers: number;
  activeMembers: number;
  bestIndividual: number;
  worstIndividual: number;
  topMemberScores: number[];
}

/**
 * Calculate aggregate score for a single league
 */
export async function calculateLeagueScore(
  leagueId: string,
  seasonId: string
): Promise<LeagueScoringResult | null> {
  // Get all members with their best submissions
  const members = await prisma.leagueMember.findMany({
    where: { leagueId },
    select: { athleteId: true },
  });

  if (members.length === 0) {
    return null;
  }

  // Get best age reduction for each member this season
  const memberScores = await Promise.all(
    members.map(async (member) => {
      const bestSubmission = await prisma.biomarkerSubmission.findFirst({
        where: {
          athleteId: member.athleteId,
          leagueId,
          seasonId,
          status: "APPROVED",
        },
        orderBy: { ageReduction: "desc" },
        select: { ageReduction: true },
      });

      return bestSubmission?.ageReduction ?? null;
    })
  );

  // Filter out members without submissions
  const activeScores = memberScores.filter((s): s is number => s !== null);

  if (activeScores.length === 0) {
    return {
      leagueId,
      seasonId,
      avgAgeReduction: 0,
      totalMembers: members.length,
      activeMembers: 0,
      bestIndividual: 0,
      worstIndividual: 0,
      topMemberScores: [],
    };
  }

  // Sort descending (best first)
  const sortedScores = [...activeScores].sort((a, b) => b - a);

  // Take top N or all if less than N
  const topScores = sortedScores.slice(0, TOP_N_MEMBERS);

  // Calculate average of top performers
  const avgAgeReduction =
    topScores.reduce((sum, score) => sum + score, 0) / topScores.length;

  return {
    leagueId,
    seasonId,
    avgAgeReduction,
    totalMembers: members.length,
    activeMembers: activeScores.length,
    bestIndividual: sortedScores[0],
    worstIndividual: sortedScores[sortedScores.length - 1],
    topMemberScores: topScores,
  };
}

/**
 * Update leaderboard entry for a single league
 */
export async function updateLeagueLeaderboardEntry(
  leagueId: string,
  seasonId: string
): Promise<void> {
  const score = await calculateLeagueScore(leagueId, seasonId);

  if (!score || score.activeMembers === 0) {
    // Remove from leaderboard if no active members
    await prisma.leagueLeaderboardEntry.deleteMany({
      where: { leagueId, seasonId },
    });
    return;
  }

  // Get current entry for previousRank
  const currentEntry = await prisma.leagueLeaderboardEntry.findUnique({
    where: {
      leagueId_seasonId: { leagueId, seasonId },
    },
  });

  // Upsert the entry
  await prisma.leagueLeaderboardEntry.upsert({
    where: {
      leagueId_seasonId: { leagueId, seasonId },
    },
    update: {
      avgAgeReduction: score.avgAgeReduction,
      totalMembers: score.totalMembers,
      activeMembers: score.activeMembers,
      bestIndividual: score.bestIndividual,
      worstIndividual: score.worstIndividual,
      previousRank: currentEntry?.rank,
    },
    create: {
      leagueId,
      seasonId,
      rank: 0, // Will be set by recalculateAllRanks
      avgAgeReduction: score.avgAgeReduction,
      totalMembers: score.totalMembers,
      activeMembers: score.activeMembers,
      bestIndividual: score.bestIndividual,
      worstIndividual: score.worstIndividual,
    },
  });
}

/**
 * Recalculate ranks for all leagues in a season
 */
export async function recalculateAllLeagueRanks(seasonId: string): Promise<void> {
  // Get all entries ordered by avgAgeReduction (descending)
  const entries = await prisma.leagueLeaderboardEntry.findMany({
    where: { seasonId },
    orderBy: { avgAgeReduction: "desc" },
  });

  // Update ranks
  await Promise.all(
    entries.map((entry, index) =>
      prisma.leagueLeaderboardEntry.update({
        where: { id: entry.id },
        data: { rank: index + 1 },
      })
    )
  );
}

/**
 * Full refresh: recalculate scores and ranks for all active leagues
 */
export async function refreshAllLeagueScores(seasonId: string): Promise<{
  processed: number;
  updated: number;
  errors: string[];
}> {
  const leagues = await prisma.league.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true },
  });

  const errors: string[] = [];
  let updated = 0;

  for (const league of leagues) {
    try {
      await updateLeagueLeaderboardEntry(league.id, seasonId);
      updated++;
    } catch (error) {
      errors.push(`Failed to update ${league.name}: ${error}`);
    }
  }

  // Recalculate all ranks
  await recalculateAllLeagueRanks(seasonId);

  return {
    processed: leagues.length,
    updated,
    errors,
  };
}

/**
 * Update league score when a new submission is approved
 * Call this after approving a biomarker submission
 */
export async function onSubmissionApproved(
  athleteId: string,
  leagueId: string,
  seasonId: string
): Promise<void> {
  // Update the league's score
  await updateLeagueLeaderboardEntry(leagueId, seasonId);

  // Recalculate all ranks (could be optimized to only update affected ranks)
  await recalculateAllLeagueRanks(seasonId);
}

/**
 * Get league tier info for display
 */
export function getLeagueTierInfo(tier: string): {
  name: string;
  memberLimit: number;
  features: string[];
} {
  const tiers: Record<string, { name: string; memberLimit: number; features: string[] }> = {
    FREE: {
      name: "Free",
      memberLimit: 10,
      features: ["Basic leaderboard", "Public league page"],
    },
    STARTER: {
      name: "Starter",
      memberLimit: 50,
      features: ["Custom branding", "CSV exports", "Priority support"],
    },
    PRO: {
      name: "Pro",
      memberLimit: 250,
      features: ["White-label options", "API access", "Custom domain", "Advanced analytics"],
    },
    ENTERPRISE: {
      name: "Enterprise",
      memberLimit: Infinity,
      features: ["Unlimited members", "Dedicated instance", "Custom features", "SLA"],
    },
  };

  return tiers[tier] || tiers.FREE;
}
