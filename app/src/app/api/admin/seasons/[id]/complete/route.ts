import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  ensureAdmin,
  checkRateLimitOrError,
  handleApiError,
  createEvent,
} from "@/lib/api-utils";
import { badgeService } from "@/lib/badges";

/**
 * POST /api/admin/seasons/[id]/complete
 *
 * Completes a season and awards competition badges to top athletes.
 * This endpoint should be called when a season ends to:
 * 1. Mark the season as COMPLETED
 * 2. Finalize leaderboard rankings
 * 3. Award competition badges (champion, podium-finisher, rising-star) to top athletes
 *
 * Competition badge awarding logic:
 * - Top 3 athletes: podium-finisher badge
 * - 1st place: champion badge
 * - Athletes who improved significantly from previous season: rising-star badge
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting for admin actions
    const rateLimitError = checkRateLimitOrError(request, "admin");
    if (rateLimitError) return rateLimitError;

    // Ensure user is admin
    const adminResult = await ensureAdmin();
    if (!adminResult.success) {
      return adminResult.response;
    }

    const { id } = await params;

    // Get the season
    const season = await prisma.season.findUnique({
      where: { id },
    });

    if (!season) {
      return NextResponse.json({ error: "Season not found" }, { status: 404 });
    }

    if (season.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Season already completed" },
        { status: 400 }
      );
    }

    // Update season status to COMPLETED
    const completedSeason = await prisma.season.update({
      where: { id },
      data: {
        status: "COMPLETED",
      },
    });

    // Get final rankings (top 10 to check for rising stars)
    const finalRankings = await prisma.leaderboardEntry.findMany({
      where: { seasonId: id },
      orderBy: { rank: "asc" },
      take: 10,
      include: {
        athlete: {
          select: {
            id: true,
            displayName: true,
          },
        },
      },
    });

    // Award badges to top athletes (async, non-blocking)
    const badgeAwardPromises: Promise<void>[] = [];

    for (const entry of finalRankings) {
      badgeAwardPromises.push(
        badgeService.checkAndAwardBadges(entry.athleteId).catch((err) => {
          console.error(
            `Failed to check and award badges for athlete ${entry.athleteId}:`,
            err
          );
        })
      );
    }

    // Wait for all badge awarding to complete before sending response
    await Promise.allSettled(badgeAwardPromises);

    // Create season completion event
    await createEvent({
      type: "SEASON_COMPLETED",
      seasonId: id,
      message: `${season.name} has been completed`,
      data: {
        topThree: finalRankings.slice(0, 3).map((entry) => ({
          rank: entry.rank,
          athleteId: entry.athleteId,
          athleteName: entry.athlete.displayName,
          ageReduction: entry.bestAgeReduction,
        })),
      },
    });

    return NextResponse.json({
      success: true,
      season: completedSeason,
      finalRankings: finalRankings.slice(0, 3), // Return top 3 for display
      message: "Season completed successfully. Competition badges awarded to top athletes.",
    });
  } catch (error) {
    return handleApiError(error, "complete season");
  }
}
