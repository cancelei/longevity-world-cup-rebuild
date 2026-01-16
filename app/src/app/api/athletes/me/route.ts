import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  ensureAuth,
  handleApiError,
  athleteFullInclude,
} from "@/lib/api-utils";

// GET /api/athletes/me - Get current user's athlete profile
export async function GET() {
  try {
    const authResult = await ensureAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const athlete = await prisma.athlete.findFirst({
      where: {
        user: {
          clerkId: authResult.context.clerkId,
        },
      },
      include: athleteFullInclude,
    });

    if (!athlete) {
      return NextResponse.json(
        { error: "Athlete profile not found", needsOnboarding: true },
        { status: 404 }
      );
    }

    return NextResponse.json(athlete);
  } catch (error) {
    return handleApiError(error, "fetch athlete profile");
  }
}

// PATCH /api/athletes/me - Update current user's athlete profile
export async function PATCH(request: NextRequest) {
  try {
    const authResult = await ensureAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const athlete = await prisma.athlete.findFirst({
      where: {
        user: {
          clerkId: authResult.context.clerkId,
        },
      },
    });

    if (!athlete) {
      return NextResponse.json(
        { error: "Athlete profile not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const allowedFields = [
      "displayName",
      "bio",
      "profilePicture",
      "mediaContact",
      "website",
      "twitter",
      "instagram",
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const updatedAthlete = await prisma.athlete.update({
      where: { id: athlete.id },
      data: updateData,
    });

    return NextResponse.json(updatedAthlete);
  } catch (error) {
    return handleApiError(error, "update athlete profile");
  }
}
