import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { uploadProfilePicture, deleteFile, STORAGE_PATHS } from "@/lib/storage";

// Maximum file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// POST /api/athletes/me/photo - Upload profile picture
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Find the athlete
    const athlete = await prisma.athlete.findFirst({
      where: {
        user: {
          clerkId: userId,
        },
      },
      include: {
        user: true,
      },
    });

    if (!athlete) {
      return NextResponse.json(
        { error: "Athlete profile not found" },
        { status: 404 }
      );
    }

    // Parse the form data
    const formData = await request.formData();
    const file = formData.get("photo") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Delete old profile picture if exists
    if (athlete.profilePicture) {
      try {
        // Extract key from URL if it's a full URL
        const oldKey = athlete.profilePicture.includes(STORAGE_PATHS.PROFILE_PICTURES)
          ? athlete.profilePicture.split(STORAGE_PATHS.PROFILE_PICTURES + "/")[1]
          : null;

        if (oldKey) {
          await deleteFile(`${STORAGE_PATHS.PROFILE_PICTURES}/${oldKey}`);
        }
      } catch (error) {
        // Log but don't fail if we can't delete the old file
        console.warn("Failed to delete old profile picture:", error);
      }
    }

    // Upload new profile picture
    const result = await uploadProfilePicture(buffer, {
      userId: athlete.userId,
      filename: file.name,
      contentType: file.type,
    });

    // Update athlete profile with new picture URL
    const updatedAthlete = await prisma.athlete.update({
      where: { id: athlete.id },
      data: {
        profilePicture: result.url,
      },
    });

    return NextResponse.json({
      success: true,
      profilePicture: result.url,
      athlete: {
        id: updatedAthlete.id,
        displayName: updatedAthlete.displayName,
        profilePicture: updatedAthlete.profilePicture,
      },
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);

    // Check if it's an S3 configuration error
    if (error instanceof Error && error.message.includes("S3 credentials")) {
      return NextResponse.json(
        { error: "Storage service not configured. Please contact support." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to upload profile picture" },
      { status: 500 }
    );
  }
}

// DELETE /api/athletes/me/photo - Remove profile picture
export async function DELETE() {
  try {
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

    // Delete from S3 if exists
    if (athlete.profilePicture) {
      try {
        const oldKey = athlete.profilePicture.includes(STORAGE_PATHS.PROFILE_PICTURES)
          ? athlete.profilePicture.split(STORAGE_PATHS.PROFILE_PICTURES + "/")[1]
          : null;

        if (oldKey) {
          await deleteFile(`${STORAGE_PATHS.PROFILE_PICTURES}/${oldKey}`);
        }
      } catch (error) {
        console.warn("Failed to delete profile picture from storage:", error);
      }
    }

    // Clear profile picture in database
    const updatedAthlete = await prisma.athlete.update({
      where: { id: athlete.id },
      data: {
        profilePicture: null,
      },
    });

    return NextResponse.json({
      success: true,
      athlete: {
        id: updatedAthlete.id,
        displayName: updatedAthlete.displayName,
        profilePicture: null,
      },
    });
  } catch (error) {
    console.error("Error removing profile picture:", error);
    return NextResponse.json(
      { error: "Failed to remove profile picture" },
      { status: 500 }
    );
  }
}
