import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { sendLeagueMemberJoined } from "@/lib/email";
import { badgeService } from "@/lib/badges";

const MAX_LEAGUES_PER_ATHLETE = 3;

// Tier limits for member count
const TIER_LIMITS: Record<string, number> = {
  FREE: 10,
  STARTER: 50,
  PRO: 250,
  ENTERPRISE: Infinity,
};

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// GET /api/leagues/[slug]/members - List league members
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const league = await prisma.league.findUnique({
      where: { slug },
    });

    if (!league) {
      return NextResponse.json(
        { error: "League not found" },
        { status: 404 }
      );
    }

    const [members, total] = await Promise.all([
      prisma.leagueMember.findMany({
        where: { leagueId: league.id },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { joinedAt: "asc" },
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
      }),
      prisma.leagueMember.count({
        where: { leagueId: league.id },
      }),
    ]);

    // Get athlete IDs for batch query
    const athleteIds = members.map((m) => m.athleteId);

    // Batch fetch latest submissions for all members (fixes N+1 query)
    const latestSubmissions = await prisma.biomarkerSubmission.findMany({
      where: {
        athleteId: { in: athleteIds },
        leagueId: league.id,
        status: "APPROVED",
      },
      orderBy: { submittedAt: "desc" },
      select: {
        athleteId: true,
        ageReduction: true,
        phenoAge: true,
        submittedAt: true,
      },
      distinct: ["athleteId"],
    });

    // Create a map for O(1) lookup
    const submissionMap = new Map(
      latestSubmissions.map((s) => [s.athleteId, {
        ageReduction: s.ageReduction,
        phenoAge: s.phenoAge,
        submittedAt: s.submittedAt,
      }])
    );

    // Join data in memory
    const membersWithStats = members.map((member) => ({
      id: member.id,
      role: member.role,
      joinedAt: member.joinedAt,
      athlete: member.athlete,
      latestSubmission: submissionMap.get(member.athleteId) || null,
    }));

    return NextResponse.json({
      data: membersWithStats,
      pagination: {
        page,
        pageSize: limit,
        totalCount: total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

// POST /api/leagues/[slug]/members - Join league
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    // Get user's athlete profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const athlete = await prisma.athlete.findFirst({
      where: { userId: user.id },
    });

    if (!athlete) {
      return NextResponse.json(
        { error: "Athlete profile required. Please complete onboarding first." },
        { status: 400 }
      );
    }

    // Get league
    const league = await prisma.league.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { members: true },
        },
      },
    });

    if (!league) {
      return NextResponse.json(
        { error: "League not found" },
        { status: 404 }
      );
    }

    if (league.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "This league is not accepting new members" },
        { status: 400 }
      );
    }

    // Check if already a member
    const existingMembership = await prisma.leagueMember.findUnique({
      where: {
        leagueId_athleteId: {
          leagueId: league.id,
          athleteId: athlete.id,
        },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "You are already a member of this league" },
        { status: 400 }
      );
    }

    // Check athlete's current league count
    const athleteLeagueCount = await prisma.leagueMember.count({
      where: { athleteId: athlete.id },
    });

    if (athleteLeagueCount >= MAX_LEAGUES_PER_ATHLETE) {
      return NextResponse.json(
        { error: `Maximum ${MAX_LEAGUES_PER_ATHLETE} league memberships allowed per athlete` },
        { status: 400 }
      );
    }

    // Check league capacity
    const tierLimit = TIER_LIMITS[league.tier] || 10;
    if (league._count.members >= tierLimit) {
      return NextResponse.json(
        { error: `This league has reached its member limit (${tierLimit}). The league owner can upgrade to add more members.` },
        { status: 400 }
      );
    }

    // Create membership
    const membership = await prisma.leagueMember.create({
      data: {
        leagueId: league.id,
        athleteId: athlete.id,
        role: "MEMBER",
      },
      include: {
        athlete: {
          select: {
            id: true,
            displayName: true,
            slug: true,
            profilePicture: true,
          },
        },
        league: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Check and award badges (async, non-blocking)
    badgeService.checkAndAwardBadges(athlete.id).catch((err) => {
      console.error("Failed to check and award badges:", err);
    });

    // Notify league owner about new member (async, non-blocking)
    if (league.ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: league.ownerId },
        select: { email: true, firstName: true },
      });
      if (owner?.email) {
        const newMemberCount = league._count.members + 1;
        sendLeagueMemberJoined(owner.email, {
          ownerName: owner.firstName || "League Owner",
          leagueName: league.name,
          newMemberName: athlete.displayName,
          memberCount: newMemberCount,
        }).catch((err) => {
          console.error("Failed to send league member joined email:", err);
        });
      }
    }

    return NextResponse.json(membership, { status: 201 });
  } catch (error) {
    console.error("Error joining league:", error);
    return NextResponse.json(
      { error: "Failed to join league" },
      { status: 500 }
    );
  }
}

// DELETE /api/leagues/[slug]/members - Leave league
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const targetAthleteId = searchParams.get("athleteId");

    // Get user's athlete profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const athlete = await prisma.athlete.findFirst({
      where: { userId: user.id },
    });

    if (!athlete) {
      return NextResponse.json(
        { error: "Athlete profile required" },
        { status: 400 }
      );
    }

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

    // Determine which athlete to remove
    let athleteToRemove = athlete.id;

    if (targetAthleteId && targetAthleteId !== athlete.id) {
      // Removing someone else - check if user is admin/owner
      const userMembership = await prisma.leagueMember.findUnique({
        where: {
          leagueId_athleteId: {
            leagueId: league.id,
            athleteId: athlete.id,
          },
        },
      });

      const isOwner = league.ownerId === user.id;
      const isAdmin = userMembership?.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        return NextResponse.json(
          { error: "Only league owners and admins can remove other members" },
          { status: 403 }
        );
      }

      athleteToRemove = targetAthleteId;
    }

    // Get membership to remove
    const membershipToRemove = await prisma.leagueMember.findUnique({
      where: {
        leagueId_athleteId: {
          leagueId: league.id,
          athleteId: athleteToRemove,
        },
      },
    });

    if (!membershipToRemove) {
      return NextResponse.json(
        { error: "Membership not found" },
        { status: 404 }
      );
    }

    // Prevent owner from leaving if they're the only admin
    if (athleteToRemove === athlete.id && membershipToRemove.role === "ADMIN") {
      const adminCount = await prisma.leagueMember.count({
        where: {
          leagueId: league.id,
          role: "ADMIN",
        },
      });

      if (adminCount <= 1 && league.ownerId === user.id) {
        return NextResponse.json(
          { error: "Cannot leave: You are the only admin. Transfer ownership or delete the league instead." },
          { status: 400 }
        );
      }
    }

    // Delete membership
    await prisma.leagueMember.delete({
      where: { id: membershipToRemove.id },
    });

    return NextResponse.json({ message: "Successfully left the league" });
  } catch (error) {
    console.error("Error leaving league:", error);
    return NextResponse.json(
      { error: "Failed to leave league" },
      { status: 500 }
    );
  }
}

// PATCH /api/leagues/[slug]/members - Update member role
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const { athleteId, role } = body;

    if (!athleteId || !role) {
      return NextResponse.json(
        { error: "athleteId and role are required" },
        { status: 400 }
      );
    }

    const validRoles = ["MEMBER", "CAPTAIN", "ADMIN"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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

    // Check if user is owner or admin
    const isOwner = league.ownerId === user.id;

    if (!isOwner) {
      const userAthlete = await prisma.athlete.findFirst({
        where: { userId: user.id },
      });

      if (!userAthlete) {
        return NextResponse.json(
          { error: "Forbidden: Only owners and admins can change roles" },
          { status: 403 }
        );
      }

      const userMembership = await prisma.leagueMember.findUnique({
        where: {
          leagueId_athleteId: {
            leagueId: league.id,
            athleteId: userAthlete.id,
          },
        },
      });

      if (!userMembership || userMembership.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Forbidden: Only owners and admins can change roles" },
          { status: 403 }
        );
      }
    }

    // Update membership
    const membership = await prisma.leagueMember.update({
      where: {
        leagueId_athleteId: {
          leagueId: league.id,
          athleteId,
        },
      },
      data: { role },
      include: {
        athlete: {
          select: {
            id: true,
            displayName: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(membership);
  } catch (error) {
    console.error("Error updating member role:", error);
    return NextResponse.json(
      { error: "Failed to update member role" },
      { status: 500 }
    );
  }
}
