import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { calculatePhenoAge, validateBiomarkers, type BiomarkerInput } from "@/lib/phenoage";
import { uploadProofImage } from "@/lib/storage";
import { sendSubmissionConfirmation } from "@/lib/email";
import { rateLimiters, getClientIdentifier, createRateLimitResponse } from "@/lib/rate-limit";

// GET /api/submissions - Get user's submissions
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = rateLimiters.api(clientId);
    if (!rateLimit.success) {
      const { headers } = createRateLimitResponse(rateLimit);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers }
      );
    }

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const athlete = await prisma.athlete.findFirst({
      where: {
        user: {
          clerkId: userId,
        },
      },
    });

    if (!athlete) {
      return NextResponse.json(
        { error: "Athlete profile not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const [submissions, total] = await Promise.all([
      prisma.biomarkerSubmission.findMany({
        where: { athleteId: athlete.id },
        orderBy: { submittedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          season: {
            select: {
              name: true,
              year: true,
            },
          },
        },
      }),
      prisma.biomarkerSubmission.count({
        where: { athleteId: athlete.id },
      }),
    ]);

    return NextResponse.json({
      data: submissions,
      pagination: {
        page,
        pageSize: limit,
        totalCount: total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

// POST /api/submissions - Create new submission
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - stricter for submissions (resource intensive)
    const clientId = getClientIdentifier(request);
    const rateLimit = rateLimiters.submission(clientId);
    if (!rateLimit.success) {
      const { headers } = createRateLimitResponse(rateLimit);
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429, headers }
      );
    }

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get athlete profile
    const athlete = await prisma.athlete.findFirst({
      where: {
        user: {
          clerkId: userId,
        },
      },
    });

    if (!athlete) {
      return NextResponse.json(
        { error: "Athlete profile not found. Please complete onboarding first." },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const biomarkersJson = formData.get("biomarkers") as string;
    const chronologicalAge = parseInt(formData.get("chronologicalAge") as string);
    const leagueId = formData.get("leagueId") as string;
    const proofFile = formData.get("proof") as File | null;

    if (!biomarkersJson) {
      return NextResponse.json(
        { error: "Biomarkers data is required" },
        { status: 400 }
      );
    }

    if (!leagueId) {
      return NextResponse.json(
        { error: "League ID is required. All submissions must be within a league context." },
        { status: 400 }
      );
    }

    // Verify athlete is a member of the league
    const membership = await prisma.leagueMember.findUnique({
      where: {
        leagueId_athleteId: {
          leagueId,
          athleteId: athlete.id,
        },
      },
      include: {
        league: true,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You must be a member of this league to submit biomarkers" },
        { status: 403 }
      );
    }

    if (membership.league.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "This league is not active" },
        { status: 400 }
      );
    }

    let biomarkers;
    try {
      biomarkers = JSON.parse(biomarkersJson);
    } catch {
      return NextResponse.json(
        { error: "Invalid biomarkers JSON format" },
        { status: 400 }
      );
    }

    // Validate biomarkers
    const input: BiomarkerInput = {
      albumin: biomarkers.albumin,
      creatinine: biomarkers.creatinine,
      glucose: biomarkers.glucose,
      crp: biomarkers.crp,
      lymphocytePercent: biomarkers.lymphocytePercent,
      mcv: biomarkers.mcv,
      rdw: biomarkers.rdw,
      alp: biomarkers.alp,
      wbc: biomarkers.wbc,
      chronologicalAge,
    };

    const validation = validateBiomarkers(input);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Invalid biomarker values", details: validation.errors },
        { status: 400 }
      );
    }

    // Calculate PhenoAge
    const phenoAge = calculatePhenoAge(input);
    const ageReduction = chronologicalAge - phenoAge;
    const paceOfAging = phenoAge / chronologicalAge;

    // Get active season
    let season = await prisma.season.findFirst({
      where: { status: "ACTIVE" },
    });

    // If no active season, create one for the current year
    if (!season) {
      const currentYear = new Date().getFullYear();
      season = await prisma.season.upsert({
        where: { slug: `season-${currentYear}` },
        update: {},
        create: {
          name: `${currentYear} Season`,
          year: currentYear,
          slug: `season-${currentYear}`,
          startDate: new Date(`${currentYear}-01-01`),
          endDate: new Date(`${currentYear}-12-31`),
          submissionDeadline: new Date(`${currentYear}-01-15`),
          status: "ACTIVE",
        },
      });
    }

    // Create submission first to get ID for proof image path
    const submission = await prisma.biomarkerSubmission.create({
      data: {
        athleteId: athlete.id,
        seasonId: season.id,
        leagueId,
        albumin: biomarkers.albumin,
        creatinine: biomarkers.creatinine,
        glucose: biomarkers.glucose,
        crp: biomarkers.crp,
        lymphocytePercent: biomarkers.lymphocytePercent,
        mcv: biomarkers.mcv,
        rdw: biomarkers.rdw,
        alp: biomarkers.alp,
        wbc: biomarkers.wbc,
        phenoAge,
        ageReduction,
        paceOfAging,
        proofImages: [],
        status: "PENDING",
      },
    });

    // Handle proof file upload to S3
    const proofImages: string[] = [];
    if (proofFile) {
      try {
        const arrayBuffer = await proofFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await uploadProofImage(buffer, {
          athleteId: athlete.id,
          submissionId: submission.id,
          filename: proofFile.name,
          contentType: proofFile.type,
        });

        proofImages.push(uploadResult.url);

        // Update submission with proof image URL
        await prisma.biomarkerSubmission.update({
          where: { id: submission.id },
          data: { proofImages },
        });
      } catch (uploadError) {
        console.error("Failed to upload proof image to S3:", uploadError);
        // Continue without proof image - submission is still valid
        // The image can be uploaded later via admin panel
      }
    }

    // Update athlete's chronological age if needed
    if (athlete.chronologicalAge !== chronologicalAge) {
      await prisma.athlete.update({
        where: { id: athlete.id },
        data: { chronologicalAge },
      });
    }

    // Create event
    await prisma.event.create({
      data: {
        type: "SUBMISSION_VERIFIED",
        athleteId: athlete.id,
        seasonId: season.id,
        message: `${athlete.displayName} submitted new biomarkers`,
        data: {
          phenoAge,
          ageReduction,
        },
      },
    });

    // Send submission confirmation email (async, non-blocking)
    const user = await prisma.user.findUnique({
      where: { id: athlete.userId },
      select: { email: true },
    });
    if (user?.email) {
      sendSubmissionConfirmation(user.email, {
        displayName: athlete.displayName,
        submissionId: submission.id,
        phenoAge,
        chronologicalAge,
        ageReduction,
      }).catch((err) => {
        console.error("Failed to send submission confirmation email:", err);
      });
    }

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Error creating submission:", error);
    return NextResponse.json(
      { error: "Failed to create submission" },
      { status: 500 }
    );
  }
}
