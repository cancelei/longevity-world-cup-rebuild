import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  ensureAdmin,
  checkRateLimitOrError,
  handleApiError,
  createEvent,
} from "@/lib/api-utils";
import { badgeService } from "@/lib/badges";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Rate limiting for admin actions
    const rateLimitError = checkRateLimitOrError(request, "admin");
    if (rateLimitError) return rateLimitError;

    // Ensure user is admin
    const adminResult = await ensureAdmin();
    if (!adminResult.success) {
      return adminResult.response;
    }

    const { id } = await params;

    // Get the athlete
    const athlete = await prisma.athlete.findUnique({
      where: { id },
    });

    if (!athlete) {
      return NextResponse.json({ error: "Athlete not found" }, { status: 404 });
    }

    if (athlete.status === "VERIFIED") {
      return NextResponse.json(
        { error: "Athlete already verified" },
        { status: 400 }
      );
    }

    // Verify the athlete
    const updatedAthlete = await prisma.athlete.update({
      where: { id },
      data: {
        status: "VERIFIED",
        verified: true,
        verifiedAt: new Date(),
        verifiedBy: adminResult.context.user.id,
      },
    });

    // Update user role
    await prisma.user.update({
      where: { id: athlete.userId },
      data: { role: "ATHLETE" },
    });

    // Create event
    await createEvent({
      type: "ATHLETE_JOINED",
      athleteId: id,
      message: `${athlete.displayName} joined the competition`,
    });

    // Check and award all eligible badges (async, non-blocking)
    badgeService.checkAndAwardBadges(id).catch((err) => {
      console.error("Failed to check and award badges:", err);
    });

    return NextResponse.json({
      success: true,
      athlete: updatedAthlete,
    });
  } catch (error) {
    return handleApiError(error, "verify athlete");
  }
}
