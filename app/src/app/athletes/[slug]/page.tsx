import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { AthleteProfileClient } from "./athlete-profile-client";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getAthlete(slug: string) {
  const athlete = await prisma.athlete.findUnique({
    where: { slug },
    include: {
      user: {
        select: {
          email: true,
          imageUrl: true,
        },
      },
      badges: {
        include: {
          badge: true,
        },
        orderBy: {
          earnedAt: "desc",
        },
      },
      submissions: {
        where: {
          status: "APPROVED",
        },
        orderBy: {
          submittedAt: "desc",
        },
        take: 10,
        include: {
          season: {
            select: {
              name: true,
              year: true,
            },
          },
        },
      },
      leaderboardEntries: {
        orderBy: {
          season: {
            year: "desc",
          },
        },
        take: 5,
        include: {
          season: {
            select: {
              name: true,
              year: true,
              status: true,
            },
          },
        },
      },
      guessMyAgeGame: true,
    },
  });

  if (!athlete) {
    return null;
  }

  // Get current season rank
  const activeSeason = await prisma.season.findFirst({
    where: { status: "ACTIVE" },
  });

  let currentRank = null;
  if (activeSeason) {
    const leaderboardEntry = await prisma.leaderboardEntry.findUnique({
      where: {
        athleteId_seasonId: {
          athleteId: athlete.id,
          seasonId: activeSeason.id,
        },
      },
    });
    currentRank = leaderboardEntry?.rank ?? null;
  }

  // Get total athlete count for percentile
  const totalAthletes = await prisma.athlete.count({
    where: { status: "VERIFIED" },
  });

  return {
    ...athlete,
    currentRank,
    totalAthletes,
    activeSeason,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const athlete = await getAthlete(slug);

  if (!athlete) {
    return {
      title: "Athlete Not Found | Longevity World Cup",
    };
  }

  const latestSubmission = athlete.submissions[0];
  const description = latestSubmission
    ? `${athlete.displayName} has achieved a biological age of ${latestSubmission.phenoAge.toFixed(1)} years with an age reduction of ${latestSubmission.ageReduction.toFixed(1)} years.`
    : `View ${athlete.displayName}'s profile on Longevity World Cup.`;

  return {
    title: `${athlete.displayName} | Longevity World Cup`,
    description,
    openGraph: {
      title: `${athlete.displayName} | Longevity World Cup`,
      description,
      type: "profile",
      url: `https://longevityworldcup.com/athletes/${athlete.slug}`,
      images: athlete.profilePicture
        ? [{ url: athlete.profilePicture, width: 400, height: 400, alt: athlete.displayName }]
        : [{ url: "/og-image.png", width: 1200, height: 630, alt: "Longevity World Cup" }],
    },
    twitter: {
      card: "summary",
      title: `${athlete.displayName} | Longevity World Cup`,
      description,
      images: athlete.profilePicture ? [athlete.profilePicture] : ["/og-image.png"],
    },
  };
}

export default async function AthleteProfilePage({ params }: Props) {
  const { slug } = await params;
  const athlete = await getAthlete(slug);

  if (!athlete) {
    notFound();
  }

  // Generate Person structured data for SEO
  const latestSubmission = athlete.submissions[0];
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: athlete.displayName,
    url: `https://longevityworldcup.com/athletes/${athlete.slug}`,
    image: athlete.profilePicture || undefined,
    description: athlete.bio || `Longevity World Cup athlete competing for biological age reversal`,
    sameAs: [
      athlete.twitter ? `https://twitter.com/${athlete.twitter.replace("@", "")}` : null,
      athlete.instagram ? `https://instagram.com/${athlete.instagram.replace("@", "")}` : null,
      athlete.website,
    ].filter(Boolean),
    ...(latestSubmission && {
      award: `Age Reduction: ${latestSubmission.ageReduction.toFixed(1)} years`,
    }),
  };

  // Transform data for client component
  const athleteData = {
    id: athlete.id,
    displayName: athlete.displayName,
    slug: athlete.slug,
    profilePicture: athlete.profilePicture,
    bio: athlete.bio,
    birthYear: athlete.birthYear,
    chronologicalAge: athlete.chronologicalAge,
    division: athlete.division.toLowerCase(),
    generation: athlete.generation.toLowerCase(),
    status: athlete.status.toLowerCase(),
    verified: athlete.verified,
    verifiedAt: athlete.verifiedAt?.toISOString(),
    website: athlete.website,
    twitter: athlete.twitter,
    instagram: athlete.instagram,
    createdAt: athlete.createdAt.toISOString(),
    currentRank: athlete.currentRank,
    totalAthletes: athlete.totalAthletes,
    badges: athlete.badges.map((ab) => ({
      id: ab.badge.id,
      name: ab.badge.name,
      slug: ab.badge.slug,
      description: ab.badge.description,
      icon: ab.badge.icon,
      category: ab.badge.category.toLowerCase(),
      earnedAt: ab.earnedAt.toISOString(),
    })),
    submissions: athlete.submissions.map((s) => ({
      id: s.id,
      submittedAt: s.submittedAt.toISOString(),
      phenoAge: s.phenoAge,
      ageReduction: s.ageReduction,
      paceOfAging: s.paceOfAging,
      albumin: s.albumin,
      creatinine: s.creatinine,
      glucose: s.glucose,
      crp: s.crp,
      lymphocytePercent: s.lymphocytePercent,
      mcv: s.mcv,
      rdw: s.rdw,
      alp: s.alp,
      wbc: s.wbc,
      seasonName: s.season.name,
      seasonYear: s.season.year,
    })),
    leaderboardHistory: athlete.leaderboardEntries.map((entry) => ({
      rank: entry.rank,
      previousRank: entry.previousRank,
      bestAgeReduction: entry.bestAgeReduction,
      seasonName: entry.season.name,
      seasonYear: entry.season.year,
      seasonStatus: entry.season.status.toLowerCase(),
    })),
    guessMyAgeGame: athlete.guessMyAgeGame
      ? {
          totalGuesses: athlete.guessMyAgeGame.totalGuesses,
          averageGuess: athlete.guessMyAgeGame.averageGuess,
        }
      : null,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd),
        }}
      />
      <AthleteProfileClient athlete={athleteData} />
    </>
  );
}
