/**
 * Badge Service Tests
 *
 * Tests for badge eligibility checking and awarding logic.
 */

import { describe, it, expect, vi } from "vitest";
import { BADGE_RULES, BadgeContext } from "./badge-service";

// Mock Prisma
vi.mock("@/lib/db", () => ({
  prisma: {
    badge: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    athleteBadge: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    biomarkerSubmission: {
      count: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    athlete: {
      findUnique: vi.fn(),
    },
    leagueMember: {
      findMany: vi.fn(),
    },
    leaderboardEntry: {
      findFirst: vi.fn(),
    },
    season: {
      findFirst: vi.fn(),
    },
    event: {
      create: vi.fn(),
    },
  },
}));

describe("Badge Rules", () => {
  describe("ACHIEVEMENT badges", () => {
    const verifiedRule = BADGE_RULES.find((r) => r.slug === "verified");
    const consistencyRule = BADGE_RULES.find((r) => r.slug === "consistency");

    it("verified badge - should be eligible when athlete is verified", async () => {
      const context: BadgeContext = {
        athleteId: "athlete-1",
        athlete: {
          id: "athlete-1",
          displayName: "Test Athlete",
          verified: true,
          createdAt: new Date(),
        },
      };

      expect(await verifiedRule?.check(context)).toBe(true);
    });

    it("verified badge - should not be eligible when athlete is not verified", async () => {
      const context: BadgeContext = {
        athleteId: "athlete-1",
        athlete: {
          id: "athlete-1",
          displayName: "Test Athlete",
          verified: false,
          createdAt: new Date(),
        },
      };

      expect(await verifiedRule?.check(context)).toBe(false);
    });

    it("consistency badge - should be eligible with 3+ seasons", async () => {
      const context: BadgeContext = {
        athleteId: "athlete-1",
        submissions: [
          { id: "1", phenoAge: 30, ageReduction: 5, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date(), seasonId: "s1" },
          { id: "2", phenoAge: 29, ageReduction: 6, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date(), seasonId: "s2" },
          { id: "3", phenoAge: 28, ageReduction: 7, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date(), seasonId: "s3" },
        ],
      };

      expect(await consistencyRule?.check(context)).toBe(true);
    });

    it("consistency badge - should not be eligible with less than 3 seasons", async () => {
      const context: BadgeContext = {
        athleteId: "athlete-1",
        submissions: [
          { id: "1", phenoAge: 30, ageReduction: 5, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date(), seasonId: "s1" },
          { id: "2", phenoAge: 29, ageReduction: 6, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date(), seasonId: "s2" },
        ],
      };

      expect(await consistencyRule?.check(context)).toBe(false);
    });
  });

  describe("MILESTONE badges", () => {
    const ageBenderRule = BADGE_RULES.find((r) => r.slug === "age-bender");
    const superAgerRule = BADGE_RULES.find((r) => r.slug === "super-ager");
    const dataScientistRule = BADGE_RULES.find((r) => r.slug === "data-scientist");

    it("age-bender - should be eligible with 5+ years age reduction", async () => {
      const context: BadgeContext = {
        athleteId: "athlete-1",
        submissions: [
          { id: "1", phenoAge: 30, ageReduction: 5.5, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date(), seasonId: "s1" },
        ],
      };

      expect(await ageBenderRule?.check(context)).toBe(true);
    });

    it("age-bender - should not be eligible with less than 5 years", async () => {
      const context: BadgeContext = {
        athleteId: "athlete-1",
        submissions: [
          { id: "1", phenoAge: 30, ageReduction: 4.9, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date(), seasonId: "s1" },
        ],
      };

      expect(await ageBenderRule?.check(context)).toBe(false);
    });

    it("super-ager - should be eligible with 10+ years age reduction", async () => {
      const context: BadgeContext = {
        athleteId: "athlete-1",
        submissions: [
          { id: "1", phenoAge: 25, ageReduction: 10, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date(), seasonId: "s1" },
        ],
      };

      expect(await superAgerRule?.check(context)).toBe(true);
    });

    it("data-scientist - should be eligible with 10+ approved submissions", async () => {
      const submissions = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        phenoAge: 30,
        ageReduction: 5,
        status: "APPROVED",
        entryMethod: "MANUAL",
        submittedAt: new Date(),
        seasonId: "s1",
      }));

      const context: BadgeContext = {
        athleteId: "athlete-1",
        submissions,
      };

      expect(await dataScientistRule?.check(context)).toBe(true);
    });

    it("data-scientist - should not count pending submissions", async () => {
      const submissions = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        phenoAge: 30,
        ageReduction: 5,
        status: i < 5 ? "APPROVED" : "PENDING",
        entryMethod: "MANUAL",
        submittedAt: new Date(),
        seasonId: "s1",
      }));

      const context: BadgeContext = {
        athleteId: "athlete-1",
        submissions,
      };

      expect(await dataScientistRule?.check(context)).toBe(false);
    });
  });

  describe("COMPETITION badges", () => {
    const top10Rule = BADGE_RULES.find((r) => r.slug === "top-10");
    const podiumRule = BADGE_RULES.find((r) => r.slug === "podium");

    it("top-10 - should be eligible when rank <= 10", async () => {
      const context: BadgeContext = {
        athleteId: "athlete-1",
        leaderboardEntry: { rank: 10, bestAgeReduction: 8 },
      };

      expect(await top10Rule?.check(context)).toBe(true);
    });

    it("top-10 - should not be eligible when rank > 10", async () => {
      const context: BadgeContext = {
        athleteId: "athlete-1",
        leaderboardEntry: { rank: 11, bestAgeReduction: 7 },
      };

      expect(await top10Rule?.check(context)).toBe(false);
    });

    it("podium - should be eligible when rank <= 3", async () => {
      const context: BadgeContext = {
        athleteId: "athlete-1",
        leaderboardEntry: { rank: 3, bestAgeReduction: 12 },
      };

      expect(await podiumRule?.check(context)).toBe(true);
    });

    it("podium - should not be eligible when rank > 3", async () => {
      const context: BadgeContext = {
        athleteId: "athlete-1",
        leaderboardEntry: { rank: 4, bestAgeReduction: 11 },
      };

      expect(await podiumRule?.check(context)).toBe(false);
    });
  });

  describe("LEAGUE badges", () => {
    const teamPlayerRule = BADGE_RULES.find((r) => r.slug === "team-player");

    it("team-player - should be eligible with 3+ league memberships", async () => {
      const context: BadgeContext = {
        athleteId: "athlete-1",
        leagueMemberships: [
          { leagueId: "l1", role: "MEMBER", league: { id: "l1", ownerId: "other", _count: { members: 5 } } },
          { leagueId: "l2", role: "MEMBER", league: { id: "l2", ownerId: "other", _count: { members: 10 } } },
          { leagueId: "l3", role: "CAPTAIN", league: { id: "l3", ownerId: "other", _count: { members: 3 } } },
        ],
      };

      expect(await teamPlayerRule?.check(context)).toBe(true);
    });

    it("team-player - should not be eligible with less than 3 leagues", async () => {
      const context: BadgeContext = {
        athleteId: "athlete-1",
        leagueMemberships: [
          { leagueId: "l1", role: "MEMBER", league: { id: "l1", ownerId: "other", _count: { members: 5 } } },
          { leagueId: "l2", role: "MEMBER", league: { id: "l2", ownerId: "other", _count: { members: 10 } } },
        ],
      };

      expect(await teamPlayerRule?.check(context)).toBe(false);
    });
  });

  describe("IMPROVEMENT badges", () => {
    const breakthroughRule = BADGE_RULES.find((r) => r.slug === "breakthrough");
    const steadyClimberRule = BADGE_RULES.find((r) => r.slug === "steady-climber");
    const comebackKidRule = BADGE_RULES.find((r) => r.slug === "comeback-kid");

    it("breakthrough - should be eligible when first 5+ year reduction achieved", async () => {
      const context: BadgeContext = {
        athleteId: "athlete-1",
        submissions: [
          { id: "1", phenoAge: 30, ageReduction: 5, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date(), seasonId: "s1" },
        ],
      };

      expect(await breakthroughRule?.check(context)).toBe(true);
    });

    it("steady-climber - should be eligible with 5 consecutive improvements", async () => {
      const baseDate = new Date("2024-01-01");
      const context: BadgeContext = {
        athleteId: "athlete-1",
        submissions: [
          { id: "1", phenoAge: 35, ageReduction: 1, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date(baseDate.getTime() + 1000), seasonId: "s1" },
          { id: "2", phenoAge: 34, ageReduction: 2, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date(baseDate.getTime() + 2000), seasonId: "s1" },
          { id: "3", phenoAge: 33, ageReduction: 3, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date(baseDate.getTime() + 3000), seasonId: "s1" },
          { id: "4", phenoAge: 32, ageReduction: 4, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date(baseDate.getTime() + 4000), seasonId: "s1" },
          { id: "5", phenoAge: 31, ageReduction: 5, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date(baseDate.getTime() + 5000), seasonId: "s1" },
        ],
      };

      expect(await steadyClimberRule?.check(context)).toBe(true);
    });

    it("steady-climber - should not be eligible with broken streak", async () => {
      const baseDate = new Date("2024-01-01");
      const context: BadgeContext = {
        athleteId: "athlete-1",
        submissions: [
          { id: "1", phenoAge: 35, ageReduction: 1, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date(baseDate.getTime() + 1000), seasonId: "s1" },
          { id: "2", phenoAge: 34, ageReduction: 2, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date(baseDate.getTime() + 2000), seasonId: "s1" },
          { id: "3", phenoAge: 36, ageReduction: 0, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date(baseDate.getTime() + 3000), seasonId: "s1" }, // decline
          { id: "4", phenoAge: 35, ageReduction: 1, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date(baseDate.getTime() + 4000), seasonId: "s1" },
          { id: "5", phenoAge: 34, ageReduction: 2, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date(baseDate.getTime() + 5000), seasonId: "s1" },
        ],
      };

      expect(await steadyClimberRule?.check(context)).toBe(false);
    });

    it("comeback-kid - should be eligible after decline followed by 3+ year improvement", async () => {
      const baseDate = new Date("2024-01-01");
      const context: BadgeContext = {
        athleteId: "athlete-1",
        submissions: [
          { id: "1", phenoAge: 30, ageReduction: 5, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date(baseDate.getTime() + 1000), seasonId: "s1" },
          { id: "2", phenoAge: 33, ageReduction: 2, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date(baseDate.getTime() + 2000), seasonId: "s1" }, // decline
          { id: "3", phenoAge: 28, ageReduction: 7, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date(baseDate.getTime() + 3000), seasonId: "s1" }, // comeback (7 - 2 = 5 >= 3)
        ],
      };

      expect(await comebackKidRule?.check(context)).toBe(true);
    });
  });

  describe("SEASONAL badges", () => {
    const winterWarriorRule = BADGE_RULES.find((r) => r.slug === "winter-warrior");
    const summerSoldierRule = BADGE_RULES.find((r) => r.slug === "summer-soldier");
    const anniversaryRule = BADGE_RULES.find((r) => r.slug === "anniversary");

    it("winter-warrior - should be eligible with December submission", async () => {
      const context: BadgeContext = {
        athleteId: "athlete-1",
        submissions: [
          { id: "1", phenoAge: 30, ageReduction: 5, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date("2024-12-15"), seasonId: "s1" },
        ],
      };

      expect(await winterWarriorRule?.check(context)).toBe(true);
    });

    it("winter-warrior - should not be eligible without December submission", async () => {
      const context: BadgeContext = {
        athleteId: "athlete-1",
        submissions: [
          { id: "1", phenoAge: 30, ageReduction: 5, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date("2024-11-15"), seasonId: "s1" },
        ],
      };

      expect(await winterWarriorRule?.check(context)).toBe(false);
    });

    it("summer-soldier - should be eligible with June/July/August submission", async () => {
      const context: BadgeContext = {
        athleteId: "athlete-1",
        submissions: [
          { id: "1", phenoAge: 30, ageReduction: 5, status: "APPROVED", entryMethod: "MANUAL", submittedAt: new Date("2024-07-15"), seasonId: "s1" },
        ],
      };

      expect(await summerSoldierRule?.check(context)).toBe(true);
    });

    it("anniversary - should be eligible after 1 year on platform", async () => {
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

      const context: BadgeContext = {
        athleteId: "athlete-1",
        athlete: {
          id: "athlete-1",
          displayName: "Test",
          verified: true,
          createdAt: twoYearsAgo,
        },
      };

      expect(await anniversaryRule?.check(context)).toBe(true);
    });

    it("anniversary - should not be eligible before 1 year", async () => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const context: BadgeContext = {
        athleteId: "athlete-1",
        athlete: {
          id: "athlete-1",
          displayName: "Test",
          verified: true,
          createdAt: sixMonthsAgo,
        },
      };

      expect(await anniversaryRule?.check(context)).toBe(false);
    });
  });
});

describe("Badge Rules Coverage", () => {
  it("should have rules for all expected badge categories", () => {
    const categories = new Set(BADGE_RULES.map((r) => r.category));

    expect(categories.has("ACHIEVEMENT")).toBe(true);
    expect(categories.has("MILESTONE")).toBe(true);
    expect(categories.has("COMPETITION")).toBe(true);
    expect(categories.has("LEAGUE")).toBe(true);
    expect(categories.has("BIOMARKER")).toBe(true);
    expect(categories.has("IMPROVEMENT")).toBe(true);
    expect(categories.has("SEASONAL")).toBe(true);
    expect(categories.has("SCIENCE")).toBe(true);
  });

  it("should have unique slugs for all rules", () => {
    const slugs = BADGE_RULES.map((r) => r.slug);
    const uniqueSlugs = new Set(slugs);

    expect(slugs.length).toBe(uniqueSlugs.size);
  });
});
