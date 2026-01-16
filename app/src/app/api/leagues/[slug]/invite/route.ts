import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendLeagueInvite } from "@/lib/email";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

// Tier limits for member count
const TIER_LIMITS: Record<string, number> = {
  FREE: 10,
  STARTER: 50,
  PRO: 250,
  ENTERPRISE: Infinity,
};

// GET /api/leagues/[slug]/invite - List pending invites
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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
          { error: "Forbidden" },
          { status: 403 }
        );
      }

      const membership = await prisma.leagueMember.findUnique({
        where: {
          leagueId_athleteId: {
            leagueId: league.id,
            athleteId: userAthlete.id,
          },
        },
      });

      if (!membership || !["ADMIN", "CAPTAIN"].includes(membership.role)) {
        return NextResponse.json(
          { error: "Forbidden: Only admins and captains can view invites" },
          { status: 403 }
        );
      }
    }

    const invites = await prisma.leagueInvite.findMany({
      where: {
        leagueId: league.id,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: invites });
  } catch (error) {
    console.error("Error fetching invites:", error);
    return NextResponse.json(
      { error: "Failed to fetch invites" },
      { status: 500 }
    );
  }
}

// POST /api/leagues/[slug]/invite - Create invite(s)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const { emails, role = "MEMBER" } = body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: "At least one email is required" },
        { status: 400 }
      );
    }

    const validRoles = ["MEMBER", "CAPTAIN"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role for invite. Must be one of: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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
        { error: "Cannot send invites: League is not active" },
        { status: 400 }
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
          { error: "Forbidden" },
          { status: 403 }
        );
      }

      const membership = await prisma.leagueMember.findUnique({
        where: {
          leagueId_athleteId: {
            leagueId: league.id,
            athleteId: userAthlete.id,
          },
        },
      });

      if (!membership || !["ADMIN", "CAPTAIN"].includes(membership.role)) {
        return NextResponse.json(
          { error: "Forbidden: Only owners, admins, and captains can send invites" },
          { status: 403 }
        );
      }
    }

    // Check capacity
    const tierLimit = TIER_LIMITS[league.tier] || 10;
    const pendingInvites = await prisma.leagueInvite.count({
      where: {
        leagueId: league.id,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    const totalPotential = league._count.members + pendingInvites + emails.length;
    if (totalPotential > tierLimit) {
      return NextResponse.json(
        { error: `Cannot send ${emails.length} invites: would exceed member limit (${tierLimit}). Current: ${league._count.members} members, ${pendingInvites} pending invites.` },
        { status: 400 }
      );
    }

    // Create invites
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiration

    const invites = await Promise.all(
      emails.map(async (email: string) => {
        // Check if already a member
        const existingUser = await prisma.user.findFirst({
          where: { email: email.toLowerCase() },
          include: {
            athlete: true,
          },
        });

        if (existingUser?.athlete) {
          const existingMembership = await prisma.leagueMember.findUnique({
            where: {
              leagueId_athleteId: {
                leagueId: league.id,
                athleteId: existingUser.athlete.id,
              },
            },
          });

          if (existingMembership) {
            return { email, status: "already_member" };
          }
        }

        // Check for existing pending invite
        const existingInvite = await prisma.leagueInvite.findFirst({
          where: {
            leagueId: league.id,
            email: email.toLowerCase(),
            acceptedAt: null,
            expiresAt: { gt: new Date() },
          },
        });

        if (existingInvite) {
          return { email, status: "already_invited", invite: existingInvite };
        }

        // Create new invite
        const invite = await prisma.leagueInvite.create({
          data: {
            leagueId: league.id,
            email: email.toLowerCase(),
            role,
            token: randomBytes(32).toString("hex"),
            expiresAt,
          },
        });

        // Send email notification (fire and forget to avoid blocking)
        const inviterName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
        sendLeagueInvite(email.toLowerCase(), {
          inviteeName: email.split("@")[0],
          leagueName: league.name,
          inviterName,
          inviteCode: invite.token,
        }).catch((err) => {
          console.error(`Failed to send invite email to ${email}:`, err);
        });

        return { email, status: "invited", invite };
      })
    );

    return NextResponse.json({ data: invites }, { status: 201 });
  } catch (error) {
    console.error("Error creating invites:", error);
    return NextResponse.json(
      { error: "Failed to create invites" },
      { status: 500 }
    );
  }
}

// DELETE /api/leagues/[slug]/invite - Cancel/revoke invite
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get("inviteId");

    if (!inviteId) {
      return NextResponse.json(
        { error: "inviteId is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const league = await prisma.league.findUnique({
      where: { slug },
    });

    if (!league) {
      return NextResponse.json(
        { error: "League not found" },
        { status: 404 }
      );
    }

    // Check permission
    const isOwner = league.ownerId === user.id;

    if (!isOwner) {
      const userAthlete = await prisma.athlete.findFirst({
        where: { userId: user.id },
      });

      if (!userAthlete) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }

      const membership = await prisma.leagueMember.findUnique({
        where: {
          leagueId_athleteId: {
            leagueId: league.id,
            athleteId: userAthlete.id,
          },
        },
      });

      if (!membership || !["ADMIN", "CAPTAIN"].includes(membership.role)) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }
    }

    // Delete invite
    await prisma.leagueInvite.delete({
      where: {
        id: inviteId,
        leagueId: league.id,
      },
    });

    return NextResponse.json({ message: "Invite cancelled" });
  } catch (error) {
    console.error("Error cancelling invite:", error);
    return NextResponse.json(
      { error: "Failed to cancel invite" },
      { status: 500 }
    );
  }
}
