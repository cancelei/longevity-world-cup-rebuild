import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { LeagueProfileClient, LeagueProfileData } from "./league-profile-client";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getLeague(slug: string) {
  const league = await prisma.league.findUnique({
    where: { slug },
    include: {
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      members: {
        include: {
          athlete: {
            select: {
              id: true,
              displayName: true,
              slug: true,
              profilePicture: true,
              chronologicalAge: true,
              division: true,
              generation: true,
              verified: true,
            },
          },
        },
        orderBy: {
          joinedAt: "asc",
        },
      },
      leaderboardEntries: {
        orderBy: {
          updatedAt: "desc",
        },
        take: 1,
      },
      _count: {
        select: {
          members: true,
          submissions: true,
        },
      },
    },
  });

  if (!league) {
    return null;
  }

  // Get latest submission for each member
  const membersWithSubmissions = await Promise.all(
    league.members.map(async (member) => {
      const latestSubmission = await prisma.biomarkerSubmission.findFirst({
        where: {
          athleteId: member.athleteId,
          status: "APPROVED",
        },
        orderBy: {
          submittedAt: "desc",
        },
        select: {
          ageReduction: true,
          phenoAge: true,
          submittedAt: true,
        },
      });

      return {
        ...member,
        latestSubmission,
      };
    })
  );

  return {
    ...league,
    members: membersWithSubmissions,
    memberCount: league._count.members,
    submissionCount: league._count.submissions,
    leaderboardEntry: league.leaderboardEntries[0] || null,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const league = await getLeague(slug);

  if (!league) {
    return {
      title: "League Not Found | Longevity World Cup",
    };
  }

  const description = league.description
    ? league.description
    : `Join ${league.name} on Longevity World Cup. ${league.memberCount} members competing for biological age reversal.`;

  const location = league.city && league.country
    ? `${league.city}, ${league.country}`
    : league.country || "";

  return {
    title: `${league.name} | Longevity World Cup`,
    description,
    openGraph: {
      title: `${league.name} | Longevity World Cup`,
      description,
      type: "website",
      url: `https://longevityworldcup.com/leagues/${league.slug}`,
      images: league.logo
        ? [{ url: league.logo, width: 400, height: 400, alt: league.name }]
        : [{ url: "/og-image.png", width: 1200, height: 630, alt: "Longevity World Cup" }],
    },
    twitter: {
      card: "summary",
      title: `${league.name} | Longevity World Cup`,
      description,
      images: league.logo ? [league.logo] : ["/og-image.png"],
    },
    other: {
      ...(location && { "geo.placename": location }),
    },
  };
}

export default async function LeagueProfilePage({ params }: Props) {
  const { slug } = await params;
  const league = await getLeague(slug);

  if (!league) {
    notFound();
  }

  // Generate Organization structured data for SEO
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: league.name,
    url: `https://longevityworldcup.com/leagues/${league.slug}`,
    logo: league.logo || undefined,
    description: league.description || `Longevity World Cup league competing for biological age reversal`,
    ...(league.city && league.country && {
      location: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: league.city,
          addressCountry: league.country,
        },
      },
    }),
    numberOfEmployees: league.memberCount,
    foundingDate: league.createdAt,
    ...(league.leaderboardEntry && {
      award: `Global Rank #${league.leaderboardEntry.rank} with ${league.leaderboardEntry.avgAgeReduction.toFixed(1)} years average age reduction`,
    }),
  };

  // Transform data for client component
  const leagueData: LeagueProfileData = {
    id: league.id,
    name: league.name,
    slug: league.slug,
    description: league.description || undefined,
    type: league.type,
    tier: league.tier,
    logo: league.logo || undefined,
    city: league.city || undefined,
    country: league.country || undefined,
    verified: league.verified,
    createdAt: league.createdAt.toISOString(),
    memberCount: league.memberCount,
    submissionCount: league.submissionCount,
    members: league.members.map((m) => ({
      id: m.id,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
      athlete: {
        id: m.athlete.id,
        displayName: m.athlete.displayName,
        slug: m.athlete.slug,
        profilePicture: m.athlete.profilePicture || undefined,
        chronologicalAge: m.athlete.chronologicalAge,
        division: m.athlete.division,
        generation: m.athlete.generation,
        verified: m.athlete.verified,
      },
      latestSubmission: m.latestSubmission
        ? {
            ageReduction: m.latestSubmission.ageReduction,
            phenoAge: m.latestSubmission.phenoAge,
            submittedAt: m.latestSubmission.submittedAt.toISOString(),
          }
        : null,
    })),
    leaderboardEntry: league.leaderboardEntry
      ? {
          rank: league.leaderboardEntry.rank,
          previousRank: league.leaderboardEntry.previousRank || undefined,
          avgAgeReduction: league.leaderboardEntry.avgAgeReduction,
          activeMembers: league.leaderboardEntry.activeMembers,
          bestIndividual: league.leaderboardEntry.bestIndividual,
        }
      : null,
    owner: league.owner
      ? {
          id: league.owner.id,
          firstName: league.owner.firstName || undefined,
          lastName: league.owner.lastName || undefined,
          email: league.owner.email,
        }
      : null,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />
      <LeagueProfileClient league={leagueData} />
    </>
  );
}
