import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { sendSubmissionRejected } from "@/lib/email";

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

    const body = await request.json();
    const { reason } = body;

    // Get the submission
    const submission = await prisma.biomarkerSubmission.findUnique({
      where: { id },
      include: { athlete: true },
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

    // Reject the submission
    const updatedSubmission = await prisma.biomarkerSubmission.update({
      where: { id },
      data: {
        status: "REJECTED",
        verifiedBy: user.id,
        verifiedAt: new Date(),
        rejectionReason: reason || "Submission rejected",
      },
    });

    // Create event
    await prisma.event.create({
      data: {
        type: "SUBMISSION_REJECTED",
        athleteId: submission.athleteId,
        seasonId: submission.seasonId,
        message: `${submission.athlete.displayName}'s biomarker submission was rejected`,
        data: {
          reason: reason || "Submission rejected",
        },
      },
    });

    // Send rejection email (async, non-blocking)
    const athleteUser = await prisma.user.findUnique({
      where: { id: submission.athlete.userId },
      select: { email: true },
    });
    if (athleteUser?.email) {
      sendSubmissionRejected(athleteUser.email, {
        displayName: submission.athlete.displayName,
        reason: reason || "Submission rejected",
        submissionId: submission.id,
      }).catch((err) => {
        console.error("Failed to send submission rejected email:", err);
      });
    }

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error("Error rejecting submission:", error);
    return NextResponse.json(
      { error: "Failed to reject submission" },
      { status: 500 }
    );
  }
}
