import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureUser } from "@/lib/api-utils";

// Helper to generate URL-friendly slug
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// GET /api/leagues - List all leagues
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type");
    const tier = searchParams.get("tier");
    const search = searchParams.get("search");
    const status = searchParams.get("status") || "ACTIVE";

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    if (type && type !== "all") {
      where.type = type.toUpperCase();
    }

    if (tier && tier !== "all") {
      where.tier = tier.toUpperCase();
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [leagues, total] = await Promise.all([
      prisma.league.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
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
      }),
      prisma.league.count({ where }),
    ]);

    const enrichedLeagues = leagues.map((league) => ({
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
      memberCount: league._count.members,
      createdAt: league.createdAt,
      updatedAt: league.updatedAt,
    }));

    return NextResponse.json({
      data: enrichedLeagues,
      pagination: {
        page,
        pageSize: limit,
        totalCount: total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching leagues:", error);
    return NextResponse.json(
      { error: "Failed to fetch leagues" },
      { status: 500 }
    );
  }
}

// POST /api/leagues - Create a new league
export async function POST(request: NextRequest) {
  try {
    // Ensure user is authenticated and has a User record (creates one if needed)
    const userResult = await ensureUser();
    if (!userResult.success) {
      return userResult.response;
    }
    const { user } = userResult.context;

    const body = await request.json();
    const { name, description, type, country, city, logo } = body;

    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ["CLINIC", "CORPORATE", "COLLECTIVE", "GEOGRAPHIC", "CUSTOM"];
    if (!validTypes.includes(type.toUpperCase())) {
      return NextResponse.json(
        { error: `Invalid league type. Must be one of: ${validTypes.join(", ")}` },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = generateSlug(name);
    let slugExists = await prisma.league.findUnique({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(name)}-${counter}`;
      slugExists = await prisma.league.findUnique({ where: { slug } });
      counter++;
    }

    // Create the league
    const league = await prisma.league.create({
      data: {
        name,
        slug,
        description,
        logo,
        type: type.toUpperCase(),
        tier: "FREE", // All new leagues start as FREE
        country,
        city,
        status: "PENDING", // FREE tier needs admin approval
        ownerId: user.id,
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
      },
    });

    // If the owner has an athlete profile, auto-add them as ADMIN member
    const ownerAthlete = await prisma.athlete.findFirst({
      where: { userId: user.id },
    });

    if (ownerAthlete) {
      await prisma.leagueMember.create({
        data: {
          leagueId: league.id,
          athleteId: ownerAthlete.id,
          role: "ADMIN",
        },
      });
    }

    return NextResponse.json(
      {
        ...league,
        memberCount: ownerAthlete ? 1 : 0,
        message: "League created! FREE tier leagues require admin approval before becoming active.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating league:", error);
    return NextResponse.json(
      { error: "Failed to create league" },
      { status: 500 }
    );
  }
}
