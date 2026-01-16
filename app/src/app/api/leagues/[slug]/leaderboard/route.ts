import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/leagues/[slug]/leaderboard - Get individual rankings within a league
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const seasonId = searchParams.get("seasonId");

    // Get league
    const league = await prisma.league.findUnique({
      where: { slug },
    });

    if (!league) {
      return NextResponse.json(
        { error: "League not found" },
        { status: 404 }
      );
    }

    // Get active season if not specified
    let season;
    if (seasonId) {
      season = await prisma.season.findUnique({
        where: { id: seasonId },
      });
    } else {
      season = await prisma.season.findFirst({
        where: { status: "ACTIVE" },
      });
    }

    if (!season) {
      return NextResponse.json({
        data: [],
        league: {
          id: league.id,
          name: league.name,
          slug: league.slug,
          type: league.type,
          tier: league.tier,
        },
        pagination: {
          page: 1,
          pageSize: limit,
          totalCount: 0,
          totalPages: 0,
          hasMore: false,
        },
        season: null,
      });
    }

    // Get all members with their best submissions for this league
    const members = await prisma.leagueMember.findMany({
      where: { leagueId: league.id },
      include: {
        athlete: {
          select: {
            id: true,
            displayName: true,
            slug: true,
            profilePicture: true,
            chronologicalAge: true,
            division: true,
            generation: true,
            verified: true,
          },
        },
      },
    });

    // Get submissions for each member in this league for this season
    const memberStats = await Promise.all(
      members.map(async (member) => {
        // Get all approved submissions for this athlete in this league
        const submissions = await prisma.biomarkerSubmission.findMany({
          where: {
            athleteId: member.athleteId,
            leagueId: league.id,
            seasonId: season.id,
            status: "APPROVED",
          },
          orderBy: { submittedAt: "desc" },
        });

        if (submissions.length === 0) {
          return null; // No active submissions
        }

        const latestSubmission = submissions[0];
        const bestAgeReduction = Math.max(...submissions.map((s) => s.ageReduction));

        return {
          member,
          latestSubmission,
          bestAgeReduction,
          submissionCount: submissions.length,
        };
      })
    );

    // Filter out members with no submissions and sort by age reduction
    const activeMembers = memberStats
      .filter((m): m is NonNullable<typeof m> => m !== null)
      .sort((a, b) => b.bestAgeReduction - a.bestAgeReduction);

    // Apply pagination
    const paginatedMembers = activeMembers.slice(
      (page - 1) * limit,
      page * limit
    );

    // Format response with ranks
    const leaderboardEntries = paginatedMembers.map((entry, index) => ({
      rank: (page - 1) * limit + index + 1,
      athlete: entry.member.athlete,
      role: entry.member.role,
      latestSubmission: {
        phenoAge: entry.latestSubmission.phenoAge,
        ageReduction: entry.latestSubmission.ageReduction,
        paceOfAging: entry.latestSubmission.paceOfAging,
        submittedAt: entry.latestSubmission.submittedAt,
      },
      bestAgeReduction: entry.bestAgeReduction,
      submissionCount: entry.submissionCount,
    }));

    // Get league's overall leaderboard entry
    const leagueLeaderboardEntry = await prisma.leagueLeaderboardEntry.findUnique({
      where: {
        leagueId_seasonId: {
          leagueId: league.id,
          seasonId: season.id,
        },
      },
    });

    return NextResponse.json({
      data: leaderboardEntries,
      league: {
        id: league.id,
        name: league.name,
        slug: league.slug,
        type: league.type,
        tier: league.tier,
        leaderboardEntry: leagueLeaderboardEntry
          ? {
              rank: leagueLeaderboardEntry.rank,
              avgAgeReduction: leagueLeaderboardEntry.avgAgeReduction,
              activeMembers: leagueLeaderboardEntry.activeMembers,
              totalMembers: leagueLeaderboardEntry.totalMembers,
            }
          : null,
      },
      pagination: {
        page,
        pageSize: limit,
        totalCount: activeMembers.length,
        totalPages: Math.ceil(activeMembers.length / limit),
        hasMore: page * limit < activeMembers.length,
      },
      season: {
        id: season.id,
        name: season.name,
        year: season.year,
        status: season.status,
      },
    });
  } catch (error) {
    console.error("Error fetching league leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch league leaderboard" },
      { status: 500 }
    );
  }
}
