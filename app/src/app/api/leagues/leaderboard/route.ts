import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/leagues/leaderboard - Get league leaderboard data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const type = searchParams.get("type"); // CLINIC, CORPORATE, COLLECTIVE, GEOGRAPHIC, CUSTOM
    const tier = searchParams.get("tier"); // FREE, STARTER, PRO, ENTERPRISE
    const seasonId = searchParams.get("seasonId");

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

    // Build where clause for leagues
    const leagueWhere: Record<string, unknown> = {
      status: "ACTIVE",
    };

    if (type && type !== "all") {
      leagueWhere.type = type.toUpperCase();
    }

    if (tier && tier !== "all") {
      leagueWhere.tier = tier.toUpperCase();
    }

    // Get league leaderboard entries
    const [entries, total] = await Promise.all([
      prisma.leagueLeaderboardEntry.findMany({
        where: {
          seasonId: season.id,
          league: leagueWhere,
        },
        orderBy: { rank: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          league: {
            include: {
              owner: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
              _count: {
                select: {
                  members: true,
                },
              },
            },
          },
        },
      }),
      prisma.leagueLeaderboardEntry.count({
        where: {
          seasonId: season.id,
          league: leagueWhere,
        },
      }),
    ]);

    // Format response
    const enrichedEntries = entries.map((entry) => ({
      rank: entry.rank,
      previousRank: entry.previousRank,
      league: {
        id: entry.league.id,
        name: entry.league.name,
        slug: entry.league.slug,
        description: entry.league.description,
        logo: entry.league.logo,
        type: entry.league.type,
        tier: entry.league.tier,
        country: entry.league.country,
        city: entry.league.city,
        status: entry.league.status,
        verified: entry.league.verified,
        owner: entry.league.owner,
        memberCount: entry.league._count.members,
      },
      avgAgeReduction: entry.avgAgeReduction,
      totalMembers: entry.totalMembers,
      activeMembers: entry.activeMembers,
      bestIndividual: entry.bestIndividual,
      worstIndividual: entry.worstIndividual,
      rankChange: entry.previousRank
        ? entry.previousRank - entry.rank
        : undefined,
      isNew: !entry.previousRank,
    }));

    return NextResponse.json({
      data: enrichedEntries,
      pagination: {
        page,
        pageSize: limit,
        totalCount: total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
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
