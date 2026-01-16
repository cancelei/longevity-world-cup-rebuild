import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { getGenerationFromBirthYear } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { sendWelcomeEmail } from "@/lib/email";

// GET /api/athletes - List athletes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("pageSize") || searchParams.get("limit") || "20");
    const division = searchParams.get("division");
    const generation = searchParams.get("generation");
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    const where: Prisma.AthleteWhereInput = {};

    // Filter by status (default to VERIFIED if not specified)
    if (status) {
      where.status = status.toUpperCase();
    } else {
      where.status = "VERIFIED";
    }

    if (division && division !== "All" && division !== "all") {
      where.division = division.toUpperCase();
    }

    if (generation && generation !== "All" && generation !== "all") {
      where.generation = generation.toUpperCase();
    }

    if (search) {
      where.displayName = {
        contains: search,
      };
    }

    // Get active season for rank info
    const activeSeason = await prisma.season.findFirst({
      where: { status: "ACTIVE" },
    });

    const [athletes, total] = await Promise.all([
      prisma.athlete.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          badges: {
            include: {
              badge: true,
            },
          },
          submissions: {
            where: { status: "APPROVED" },
            orderBy: { submittedAt: "desc" },
            take: 1,
          },
          leaderboardEntries: activeSeason
            ? {
                where: { seasonId: activeSeason.id },
                take: 1,
              }
            : false,
        },
      }),
      prisma.athlete.count({ where }),
    ]);

    // Transform the data
    const transformedAthletes = athletes.map((athlete) => {
      const latestSubmission = athlete.submissions[0];
      const leaderboardEntry = athlete.leaderboardEntries?.[0];

      return {
        id: athlete.id,
        displayName: athlete.displayName,
        slug: athlete.slug,
        profilePicture: athlete.profilePicture,
        bio: athlete.bio,
        division: athlete.division,
        generation: athlete.generation,
        status: athlete.status,
        verified: athlete.verified,
        chronologicalAge: athlete.chronologicalAge,
        latestPhenoAge: latestSubmission?.phenoAge ?? null,
        ageReduction: latestSubmission?.ageReduction ?? null,
        rank: leaderboardEntry?.rank ?? null,
        badgeCount: athlete.badges.length,
      };
    });

    return NextResponse.json({
      data: transformedAthletes,
      pagination: {
        page,
        pageSize: limit,
        totalCount: total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching athletes:", error);
    return NextResponse.json(
      { error: "Failed to fetch athletes" },
      { status: 500 }
    );
  }
}

// POST /api/athletes - Create athlete profile
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if athlete profile already exists
    const existingAthlete = await prisma.athlete.findFirst({
      where: {
        user: {
          clerkId: userId,
        },
      },
    });

    if (existingAthlete) {
      return NextResponse.json(
        { error: "Athlete profile already exists" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { displayName, birthYear, division: divisionInput, leagueId } = body;

    // Validate input
    if (!displayName || !birthYear || !divisionInput) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate league exists and is active (leagues-first architecture)
    if (leagueId) {
      const league = await prisma.league.findUnique({
        where: { id: leagueId },
      });

      if (!league) {
        return NextResponse.json(
          { error: "Selected league not found" },
          { status: 400 }
        );
      }

      if (league.status !== "ACTIVE") {
        return NextResponse.json(
          { error: "Selected league is not accepting new members" },
          { status: 400 }
        );
      }
    }

    // Map division input to string value
    const divisionMap: Record<string, string> = {
      mens: "MENS",
      womens: "WOMENS",
      open: "OPEN",
    };
    const division = divisionMap[divisionInput.toLowerCase()] || "OPEN";

    const currentYear = new Date().getFullYear();
    const chronologicalAge = currentYear - birthYear;

    if (chronologicalAge < 18) {
      return NextResponse.json(
        { error: "You must be at least 18 years old" },
        { status: 400 }
      );
    }

    // Determine generation
    const generationLabel = getGenerationFromBirthYear(birthYear);
    const generationMap: Record<string, string> = {
      "Gen Alpha": "GENALPHA",
      "Gen Z": "GENZ",
      "Millennial": "MILLENNIAL",
      "Gen X": "GENX",
      "Baby Boomer": "BOOMER",
      "Silent Generation": "SILENT",
    };
    const generation = generationMap[generationLabel] || "GENX";

    // Create or get user record
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: user.emailAddresses[0]?.emailAddress || "",
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          role: "ATHLETE",
        },
      });
    }

    // Create slug from display name
    const baseSlug = displayName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    let slug = baseSlug;
    let counter = 1;
    while (await prisma.athlete.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create athlete profile
    const athlete = await prisma.athlete.create({
      data: {
        userId: dbUser.id,
        displayName,
        slug,
        birthYear,
        chronologicalAge,
        division,
        generation,
        status: "PENDING",
        profilePicture: user.imageUrl,
      },
    });

    // Create league membership if leagueId provided (leagues-first architecture)
    if (leagueId) {
      await prisma.leagueMember.create({
        data: {
          leagueId,
          athleteId: athlete.id,
          role: "MEMBER",
        },
      });
    }

    // Return athlete with league info
    const athleteWithLeague = await prisma.athlete.findUnique({
      where: { id: athlete.id },
      include: {
        leagueMemberships: {
          include: {
            league: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    // Send welcome email (async, non-blocking)
    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (userEmail) {
      const leagueName = athleteWithLeague?.leagueMemberships[0]?.league.name;
      sendWelcomeEmail(userEmail, displayName, leagueName).catch((err) => {
        console.error("Failed to send welcome email:", err);
      });
    }

    return NextResponse.json(athleteWithLeague, { status: 201 });
  } catch (error) {
    console.error("Error creating athlete:", error);
    return NextResponse.json(
      { error: "Failed to create athlete profile" },
      { status: 500 }
    );
  }
}
