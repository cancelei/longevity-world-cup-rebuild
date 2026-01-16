import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/events - Get recent events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const type = searchParams.get("type");
    const athleteId = searchParams.get("athleteId");

    const where: Record<string, unknown> = {};

    if (type) {
      where.type = type;
    }

    if (athleteId) {
      where.athleteId = athleteId;
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        athlete: {
          select: {
            displayName: true,
            slug: true,
            profilePicture: true,
          },
        },
        season: {
          select: {
            name: true,
            year: true,
          },
        },
      },
    });

    return NextResponse.json({
      events: events.map((event) => ({
        id: event.id,
        type: event.type,
        message: event.message,
        data: event.data,
        athleteName: event.athlete?.displayName,
        athleteSlug: event.athlete?.slug,
        athleteImage: event.athlete?.profilePicture,
        seasonName: event.season
          ? `${event.season.name} ${event.season.year}`
          : null,
        createdAt: event.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
