import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

// POST /api/games/guess-age - Submit a guess
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { athleteId, guessedAge } = body;

    if (!athleteId || typeof guessedAge !== "number") {
      return NextResponse.json(
        { error: "athleteId and guessedAge are required" },
        { status: 400 }
      );
    }

    if (guessedAge < 18 || guessedAge > 100) {
      return NextResponse.json(
        { error: "Guessed age must be between 18 and 100" },
        { status: 400 }
      );
    }

    // Get athlete and their game
    const athlete = await prisma.athlete.findUnique({
      where: { id: athleteId },
      include: { guessMyAgeGame: true },
    });

    if (!athlete) {
      return NextResponse.json(
        { error: "Athlete not found" },
        { status: 404 }
      );
    }

    // Get or create game for athlete
    let game = athlete.guessMyAgeGame;
    if (!game) {
      game = await prisma.guessMyAgeGame.create({
        data: {
          athleteId,
          totalGuesses: 0,
          averageGuess: 0,
        },
      });
    }

    // Get user if authenticated
    const { userId: clerkId } = await auth();
    let userId: string | null = null;
    let visitorId: string | null = null;

    if (clerkId) {
      const user = await prisma.user.findUnique({
        where: { clerkId },
      });
      userId = user?.id ?? null;
    } else {
      // Generate or use visitor ID from cookie/header
      visitorId = request.headers.get("x-visitor-id") || `anon-${Date.now()}`;
    }

    // Check if user/visitor already guessed for this athlete
    const existingGuess = await prisma.ageGuess.findFirst({
      where: {
        gameId: game.id,
        OR: [
          { userId: userId ?? undefined },
          { visitorId: visitorId ?? undefined },
        ],
      },
    });

    if (existingGuess) {
      return NextResponse.json(
        {
          error: "You have already guessed for this athlete",
          previousGuess: existingGuess.guessedAge,
        },
        { status: 409 }
      );
    }

    const difference = Math.abs(guessedAge - athlete.chronologicalAge);

    // Create the guess
    const guess = await prisma.ageGuess.create({
      data: {
        gameId: game.id,
        userId,
        visitorId,
        guessedAge,
        actualAge: athlete.chronologicalAge,
        difference,
      },
    });

    // Update game statistics
    const newTotalGuesses = game.totalGuesses + 1;
    const newAverageGuess =
      (game.averageGuess * game.totalGuesses + guessedAge) / newTotalGuesses;

    await prisma.guessMyAgeGame.update({
      where: { id: game.id },
      data: {
        totalGuesses: newTotalGuesses,
        averageGuess: newAverageGuess,
      },
    });

    // Calculate accuracy score (0-100)
    const accuracy = Math.max(0, 100 - difference * 5);

    return NextResponse.json({
      success: true,
      guess: {
        id: guess.id,
        guessedAge,
        actualAge: athlete.chronologicalAge,
        difference,
        accuracy,
      },
      gameStats: {
        totalGuesses: newTotalGuesses,
        averageGuess: newAverageGuess,
      },
    });
  } catch (error) {
    console.error("Error submitting guess:", error);
    return NextResponse.json(
      { error: "Failed to submit guess" },
      { status: 500 }
    );
  }
}

// GET /api/games/guess-age - Get random athlete for game or leaderboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "random";
    const athleteId = searchParams.get("athleteId");

    if (type === "leaderboard") {
      // Get top guessers
      const topGuessers = await prisma.user.findMany({
        where: {
          ageGuesses: {
            some: {},
          },
        },
        include: {
          ageGuesses: true,
        },
        take: 10,
      });

      const leaderboard = topGuessers
        .map((user) => {
          const totalGuesses = user.ageGuesses.length;
          const totalAccuracy = user.ageGuesses.reduce((acc, guess) => {
            return acc + Math.max(0, 100 - guess.difference * 5);
          }, 0);
          const averageAccuracy = totalGuesses > 0 ? totalAccuracy / totalGuesses : 0;

          return {
            userId: user.id,
            displayName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Anonymous",
            totalGuesses,
            averageAccuracy,
          };
        })
        .sort((a, b) => b.averageAccuracy - a.averageAccuracy)
        .slice(0, 10);

      return NextResponse.json({ leaderboard });
    }

    if (type === "stats" && athleteId) {
      // Get stats for a specific athlete's game
      const game = await prisma.guessMyAgeGame.findUnique({
        where: { athleteId },
        include: {
          guesses: {
            orderBy: { guessedAt: "desc" },
            take: 100,
          },
          athlete: {
            select: {
              displayName: true,
              chronologicalAge: true,
              profilePicture: true,
            },
          },
        },
      });

      if (!game) {
        return NextResponse.json(
          { error: "Game not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        athlete: game.athlete,
        totalGuesses: game.totalGuesses,
        averageGuess: game.averageGuess,
        recentGuesses: game.guesses.slice(0, 10).map((g) => ({
          guessedAge: g.guessedAge,
          difference: g.difference,
          guessedAt: g.guessedAt,
        })),
      });
    }

    // Get random athlete for game
    // Exclude athletes the user has already guessed
    const { userId: clerkId } = await auth();
    let excludeAthleteIds: string[] = [];

    if (clerkId) {
      const user = await prisma.user.findUnique({
        where: { clerkId },
        include: {
          ageGuesses: {
            include: {
              game: true,
            },
          },
        },
      });

      if (user) {
        excludeAthleteIds = user.ageGuesses.map((g) => g.game.athleteId);
      }
    }

    // Get all verified athletes with profile pictures
    const athletes = await prisma.athlete.findMany({
      where: {
        status: "VERIFIED",
        profilePicture: { not: null },
        id: { notIn: excludeAthleteIds },
      },
      select: {
        id: true,
        displayName: true,
        slug: true,
        profilePicture: true,
        chronologicalAge: true,
        guessMyAgeGame: {
          select: {
            totalGuesses: true,
            averageGuess: true,
          },
        },
      },
    });

    if (athletes.length === 0) {
      // If all athletes guessed, return a random one anyway
      const anyAthlete = await prisma.athlete.findFirst({
        where: {
          status: "VERIFIED",
          profilePicture: { not: null },
        },
        select: {
          id: true,
          displayName: true,
          slug: true,
          profilePicture: true,
          chronologicalAge: true,
          guessMyAgeGame: {
            select: {
              totalGuesses: true,
              averageGuess: true,
            },
          },
        },
      });

      if (!anyAthlete) {
        return NextResponse.json(
          { error: "No athletes available" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        athlete: anyAthlete,
        allGuessed: true,
      });
    }

    // Return random athlete
    const randomIndex = Math.floor(Math.random() * athletes.length);
    const selectedAthlete = athletes[randomIndex];

    return NextResponse.json({
      athlete: selectedAthlete,
      remainingCount: athletes.length,
    });
  } catch (error) {
    console.error("Error getting game data:", error);
    return NextResponse.json(
      { error: "Failed to get game data" },
      { status: 500 }
    );
  }
}
