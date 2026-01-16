import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/stats - Get platform statistics
export async function GET() {
  try {
    // Get active season
    const activeSeason = await prisma.season.findFirst({
      where: { status: "ACTIVE" },
    });

    if (!activeSeason) {
      return NextResponse.json({
        athleteCount: 0,
        prizePoolBTC: 0,
        prizePoolUSD: 0,
        prizeGoalBTC: 1,
        prizeGoalUSD: 100000,
        year: new Date().getFullYear(),
      });
    }

    // Get verified athlete count
    const athleteCount = await prisma.athlete.count({
      where: { status: "VERIFIED" },
    });

    return NextResponse.json({
      athleteCount,
      prizePoolBTC: activeSeason.prizePoolBTC,
      prizePoolUSD: activeSeason.prizePoolUSD,
      prizeGoalBTC: activeSeason.prizeGoalBTC,
      prizeGoalUSD: activeSeason.prizeGoalUSD,
      year: activeSeason.year,
      seasonId: activeSeason.id,
      seasonName: activeSeason.name,
      seasonStatus: activeSeason.status,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
