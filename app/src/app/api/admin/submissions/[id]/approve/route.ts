import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { onSubmissionApproved } from "@/lib/league-scoring";
import { sendSubmissionApproved } from "@/lib/email";
import { badgeService } from "@/lib/badges";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    const { id } = await params;

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the submission
    const submission = await prisma.biomarkerSubmission.findUnique({
      where: { id },
      include: { athlete: true, season: true, league: true },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (submission.status !== "PENDING") {
      return NextResponse.json(
        { error: "Submission already processed" },
        { status: 400 }
      );
    }

    // Approve the submission
    const updatedSubmission = await prisma.biomarkerSubmission.update({
      where: { id },
      data: {
        status: "APPROVED",
        verifiedBy: user.id,
        verifiedAt: new Date(),
      },
    });

    // Update or create leaderboard entry
    const existingEntry = await prisma.leaderboardEntry.findUnique({
      where: {
        athleteId_seasonId: {
          athleteId: submission.athleteId,
          seasonId: submission.seasonId,
        },
      },
    });

    if (existingEntry) {
      // Update if this submission is better
      if (submission.ageReduction > existingEntry.bestAgeReduction) {
        await prisma.leaderboardEntry.update({
          where: { id: existingEntry.id },
          data: {
            bestPhenoAge: submission.phenoAge,
            bestAgeReduction: submission.ageReduction,
            bestPaceOfAging: submission.paceOfAging,
            submissionCount: { increment: 1 },
          },
        });
      } else {
        await prisma.leaderboardEntry.update({
          where: { id: existingEntry.id },
          data: {
            submissionCount: { increment: 1 },
          },
        });
      }
    } else {
      // Get current rank count
      const entryCount = await prisma.leaderboardEntry.count({
        where: { seasonId: submission.seasonId },
      });

      await prisma.leaderboardEntry.create({
        data: {
          athleteId: submission.athleteId,
          seasonId: submission.seasonId,
          rank: entryCount + 1,
          bestPhenoAge: submission.phenoAge,
          bestAgeReduction: submission.ageReduction,
          bestPaceOfAging: submission.paceOfAging,
          submissionCount: 1,
        },
      });
    }

    // Recalculate ranks
    const allEntries = await prisma.leaderboardEntry.findMany({
      where: { seasonId: submission.seasonId },
      orderBy: { bestAgeReduction: "desc" },
    });

    for (let i = 0; i < allEntries.length; i++) {
      await prisma.leaderboardEntry.update({
        where: { id: allEntries[i].id },
        data: {
          previousRank: allEntries[i].rank,
          rank: i + 1,
        },
      });
    }

    // Update league leaderboard if submission has a league
    if (submission.leagueId) {
      await onSubmissionApproved(
        submission.athleteId,
        submission.leagueId,
        submission.seasonId
      );
    }

    // Create event
    await prisma.event.create({
      data: {
        type: "SUBMISSION_VERIFIED",
        athleteId: submission.athleteId,
        seasonId: submission.seasonId,
        message: `${submission.athlete.displayName}'s biomarker submission was verified`,
        data: {
          phenoAge: submission.phenoAge,
          ageReduction: submission.ageReduction,
        },
      },
    });

    // Check and award badges (async, non-blocking)
    badgeService.checkAndAwardBadges(submission.athleteId).catch((err) => {
      console.error("Failed to check and award badges:", err);
    });

    // Get athlete's new rank and previous rank
    const athleteEntry = allEntries.find((e) => e.athleteId === submission.athleteId);
    const newRank = athleteEntry?.rank ?? 1;
    const previousRank = athleteEntry?.previousRank ?? undefined;

    // Send approval email (async, non-blocking)
    const athleteUser = await prisma.user.findUnique({
      where: { id: submission.athlete.userId },
      select: { email: true },
    });
    if (athleteUser?.email) {
      sendSubmissionApproved(athleteUser.email, {
        displayName: submission.athlete.displayName,
        phenoAge: submission.phenoAge,
        ageReduction: submission.ageReduction,
        newRank,
        previousRank,
        leagueName: submission.league?.name,
      }).catch((err) => {
        console.error("Failed to send submission approved email:", err);
      });
    }

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error("Error approving submission:", error);
    return NextResponse.json(
      { error: "Failed to approve submission" },
      { status: 500 }
    );
  }
}
