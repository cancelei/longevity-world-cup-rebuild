import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/leagues/[slug] - Get league details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const league = await prisma.league.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        members: {
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
              },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
        _count: {
          select: {
            members: true,
            submissions: true,
          },
        },
      },
    });

    if (!league) {
      return NextResponse.json(
        { error: "League not found" },
        { status: 404 }
      );
    }

    // Get active season for leaderboard entry
    const activeSeason = await prisma.season.findFirst({
      where: { status: "ACTIVE" },
    });

    let leaderboardEntry = null;
    if (activeSeason) {
      leaderboardEntry = await prisma.leagueLeaderboardEntry.findUnique({
        where: {
          leagueId_seasonId: {
            leagueId: league.id,
            seasonId: activeSeason.id,
          },
        },
      });
    }

    return NextResponse.json({
      id: league.id,
      name: league.name,
      slug: league.slug,
      description: league.description,
      logo: league.logo,
      type: league.type,
      tier: league.tier,
      country: league.country,
      city: league.city,
      status: league.status,
      verified: league.verified,
      verifiedAt: league.verifiedAt,
      owner: league.owner,
      members: league.members.map((m) => ({
        id: m.id,
        role: m.role,
        joinedAt: m.joinedAt,
        athlete: m.athlete,
      })),
      memberCount: league._count.members,
      submissionCount: league._count.submissions,
      leaderboardEntry: leaderboardEntry
        ? {
            rank: leaderboardEntry.rank,
            previousRank: leaderboardEntry.previousRank,
            avgAgeReduction: leaderboardEntry.avgAgeReduction,
            activeMembers: leaderboardEntry.activeMembers,
            bestIndividual: leaderboardEntry.bestIndividual,
          }
        : null,
      createdAt: league.createdAt,
      updatedAt: league.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching league:", error);
    return NextResponse.json(
      { error: "Failed to fetch league" },
      { status: 500 }
    );
  }
}

// PATCH /api/leagues/[slug] - Update league
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get league and check ownership
    const league = await prisma.league.findUnique({
      where: { slug },
    });

    if (!league) {
      return NextResponse.json(
        { error: "League not found" },
        { status: 404 }
      );
    }

    if (league.ownerId !== user.id) {
      // Check if user is an admin member
      const athlete = await prisma.athlete.findFirst({
        where: { userId: user.id },
      });

      if (!athlete) {
        return NextResponse.json(
          { error: "Forbidden: Only league owners or admins can update leagues" },
          { status: 403 }
        );
      }

      const membership = await prisma.leagueMember.findUnique({
        where: {
          leagueId_athleteId: {
            leagueId: league.id,
            athleteId: athlete.id,
          },
        },
      });

      if (!membership || membership.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Forbidden: Only league owners or admins can update leagues" },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { name, description, logo, country, city } = body;

    // Update league (can't change type or tier via this endpoint)
    const updatedLeague = await prisma.league.update({
      where: { id: league.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(logo !== undefined && { logo }),
        ...(country !== undefined && { country }),
        ...(city !== undefined && { city }),
      },
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
          select: { members: true },
        },
      },
    });

    return NextResponse.json({
      ...updatedLeague,
      memberCount: updatedLeague._count.members,
    });
  } catch (error) {
    console.error("Error updating league:", error);
    return NextResponse.json(
      { error: "Failed to update league" },
      { status: 500 }
    );
  }
}

// DELETE /api/leagues/[slug] - Delete league
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get league and check ownership
    const league = await prisma.league.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
    });

    if (!league) {
      return NextResponse.json(
        { error: "League not found" },
        { status: 404 }
      );
    }

    // Only owner can delete
    if (league.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Forbidden: Only league owners can delete leagues" },
        { status: 403 }
      );
    }

    // Prevent deletion if there are submissions
    if (league._count.submissions > 0) {
      return NextResponse.json(
        { error: "Cannot delete league with existing biomarker submissions. Contact support for assistance." },
        { status: 400 }
      );
    }

    // Delete league (cascades to members, leaderboard entries)
    await prisma.league.delete({
      where: { id: league.id },
    });

    return NextResponse.json({ message: "League deleted successfully" });
  } catch (error) {
    console.error("Error deleting league:", error);
    return NextResponse.json(
      { error: "Failed to delete league" },
      { status: 500 }
    );
  }
}
