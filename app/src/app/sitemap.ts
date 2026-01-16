import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://longevityworldcup.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/rules`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/athletes`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/leagues`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/games/guess-age`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  // Dynamic athlete pages
  let athletePages: MetadataRoute.Sitemap = [];
  try {
    const athletes = await prisma.athlete.findMany({
      where: { status: "VERIFIED" },
      select: { slug: true, updatedAt: true },
    });

    athletePages = athletes.map((athlete) => ({
      url: `${baseUrl}/athletes/${athlete.slug}`,
      lastModified: athlete.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    // Database not available during build, skip dynamic athlete pages
  }

  // Dynamic league pages
  let leaguePages: MetadataRoute.Sitemap = [];
  try {
    const leagues = await prisma.league.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    });

    leaguePages = leagues.map((league) => ({
      url: `${baseUrl}/leagues/${league.slug}`,
      lastModified: league.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // Database not available during build, skip dynamic league pages
  }

  return [...staticPages, ...athletePages, ...leaguePages];
}
