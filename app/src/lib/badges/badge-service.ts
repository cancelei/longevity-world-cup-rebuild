/**
 * Badge Awarding Service - Domain Service
 *
 * Centralized logic for checking badge eligibility and awarding badges.
 * This service encapsulates all badge-related business rules.
 *
 * ## Usage
 * ```typescript
 * import { badgeService } from '@/lib/badges';
 *
 * // Check and award all eligible badges for an athlete
 * await badgeService.checkAndAwardBadges(athleteId);
 *
 * // Check specific badge category
 * await badgeService.checkMilestoneBadges(athleteId);
 * ```
 *
 * ## Extension Points
 * - Add new badge rules in BADGE_RULES
 * - Add new check functions for complex eligibility logic
 * - Integrate with notification service for badge earned alerts
 *
 * @module lib/badges/badge-service
 */

import { prisma } from "@/lib/db";
import { BadgeCategory } from "@/components/features/badges/badge-display";

// ============================================
// Types
// ============================================

export interface BadgeRule {
  slug: string;
  category: BadgeCategory;
  check: (context: BadgeContext) => Promise<boolean> | boolean;
}

export interface BadgeContext {
  athleteId: string;
  // Cached data to avoid repeated queries
  athlete?: AthleteData;
  submissions?: SubmissionData[];
  leagueMemberships?: LeagueMembershipData[];
  leaderboardEntry?: LeaderboardEntryData;
}

interface AthleteData {
  id: string;
  displayName: string;
  verified: boolean;
  createdAt: Date;
}

interface SubmissionData {
  id: string;
  phenoAge: number;
  ageReduction: number;
  status: string;
  entryMethod: string;
  submittedAt: Date;
  seasonId: string;
}

interface LeagueMembershipData {
  leagueId: string;
  role: string;
  league: {
    id: string;
    ownerId: string;
    _count: { members: number };
  };
}

interface LeaderboardEntryData {
  rank: number;
  bestAgeReduction: number;
}

export interface BadgeAwardResult {
  awarded: string[];
  alreadyHad: string[];
  notEligible: string[];
  errors: Array<{ slug: string; error: string }>;
}

// ============================================
// Badge Rules Configuration
// ============================================

/**
 * Badge eligibility rules organized by category
 * Each rule defines the condition for earning a badge
 */
export const BADGE_RULES: BadgeRule[] = [
  // ============================================
  // ACHIEVEMENT
  // ============================================
  {
    slug: "verified",
    category: "ACHIEVEMENT",
    check: (ctx) => ctx.athlete?.verified === true,
  },
  {
    slug: "consistency",
    category: "ACHIEVEMENT",
    check: async (ctx) => {
      const submissions = ctx.submissions || [];
      const approvedSubmissions = submissions.filter((s) => s.status === "APPROVED");
      const seasons = new Set(approvedSubmissions.map((s) => s.seasonId));
      return seasons.size >= 3;
    },
  },

  // ============================================
  // MILESTONE
  // ============================================
  {
    slug: "age-bender",
    category: "MILESTONE",
    check: (ctx) => {
      const submissions = ctx.submissions || [];
      return submissions.some((s) => s.status === "APPROVED" && s.ageReduction >= 5);
    },
  },
  {
    slug: "super-ager",
    category: "MILESTONE",
    check: (ctx) => {
      const submissions = ctx.submissions || [];
      return submissions.some((s) => s.status === "APPROVED" && s.ageReduction >= 10);
    },
  },
  {
    slug: "data-scientist",
    category: "MILESTONE",
    check: (ctx) => {
      const submissions = ctx.submissions || [];
      const approved = submissions.filter((s) => s.status === "APPROVED");
      return approved.length >= 10;
    },
  },

  // ============================================
  // COMPETITION
  // ============================================
  {
    slug: "top-10",
    category: "COMPETITION",
    check: (ctx) => {
      return ctx.leaderboardEntry !== undefined && ctx.leaderboardEntry.rank <= 10;
    },
  },
  {
    slug: "podium",
    category: "COMPETITION",
    check: (ctx) => {
      return ctx.leaderboardEntry !== undefined && ctx.leaderboardEntry.rank <= 3;
    },
  },

  // ============================================
  // LEAGUE
  // ============================================
  {
    slug: "league-founder",
    category: "LEAGUE",
    check: async (ctx) => {
      const memberships = ctx.leagueMemberships || [];
      // Check if athlete owns a league with 10+ members
      return memberships.some(
        (m) => m.league.ownerId === ctx.athlete?.id && m.league._count.members >= 10
      );
    },
  },
  {
    slug: "team-player",
    category: "LEAGUE",
    check: (ctx) => {
      const memberships = ctx.leagueMemberships || [];
      return memberships.length >= 3;
    },
  },
  {
    slug: "league-mvp",
    category: "LEAGUE",
    check: async (ctx) => {
      // Check if athlete is top performer in any league
      // This requires checking league-specific leaderboards
      const memberships = ctx.leagueMemberships || [];
      if (memberships.length === 0) return false;

      for (const membership of memberships) {
        const topMember = await prisma.biomarkerSubmission.findFirst({
          where: {
            leagueId: membership.leagueId,
            status: "APPROVED",
          },
          orderBy: { ageReduction: "desc" },
          select: { athleteId: true },
        });

        if (topMember?.athleteId === ctx.athleteId) {
          return true;
        }
      }
      return false;
    },
  },

  // ============================================
  // BIOMARKER
  // ============================================
  {
    slug: "inflammation-fighter",
    category: "BIOMARKER",
    check: async (ctx) => {
      // Check for 3 submissions with CRP < 1.0
      const lowCrpCount = await prisma.biomarkerSubmission.count({
        where: {
          athleteId: ctx.athleteId,
          status: "APPROVED",
          crp: { lt: 1.0 },
        },
      });
      return lowCrpCount >= 3;
    },
  },
  {
    slug: "metabolic-master",
    category: "BIOMARKER",
    check: async (ctx) => {
      // Check for 5 submissions with glucose in optimal range (70-100)
      const optimalGlucoseCount = await prisma.biomarkerSubmission.count({
        where: {
          athleteId: ctx.athleteId,
          status: "APPROVED",
          glucose: { gte: 70, lte: 100 },
        },
      });
      return optimalGlucoseCount >= 5;
    },
  },
  {
    slug: "kidney-king",
    category: "BIOMARKER",
    check: async (ctx) => {
      // Check for 5 submissions with creatinine in optimal range (0.6-1.2)
      const optimalCount = await prisma.biomarkerSubmission.count({
        where: {
          athleteId: ctx.athleteId,
          status: "APPROVED",
          creatinine: { gte: 0.6, lte: 1.2 },
        },
      });
      return optimalCount >= 5;
    },
  },
  {
    slug: "liver-legend",
    category: "BIOMARKER",
    check: async (ctx) => {
      // Check for 5 submissions with ALP in optimal range (44-147)
      const optimalCount = await prisma.biomarkerSubmission.count({
        where: {
          athleteId: ctx.athleteId,
          status: "APPROVED",
          alp: { gte: 44, lte: 147 },
        },
      });
      return optimalCount >= 5;
    },
  },

  // ============================================
  // IMPROVEMENT
  // ============================================
  {
    slug: "breakthrough",
    category: "IMPROVEMENT",
    check: (ctx) => {
      const submissions = ctx.submissions || [];
      return submissions.some((s) => s.status === "APPROVED" && s.ageReduction >= 5);
    },
  },
  {
    slug: "steady-climber",
    category: "IMPROVEMENT",
    check: (ctx) => {
      const submissions = ctx.submissions || [];
      const approved = submissions
        .filter((s) => s.status === "APPROVED")
        .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

      if (approved.length < 5) return false;

      // Check for 5 consecutive improvements
      let streak = 1;
      for (let i = 1; i < approved.length; i++) {
        if (approved[i].ageReduction > approved[i - 1].ageReduction) {
          streak++;
          if (streak >= 5) return true;
        } else {
          streak = 1;
        }
      }
      return false;
    },
  },
  {
    slug: "comeback-kid",
    category: "IMPROVEMENT",
    check: (ctx) => {
      const submissions = ctx.submissions || [];
      const approved = submissions
        .filter((s) => s.status === "APPROVED")
        .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

      if (approved.length < 3) return false;

      // Check for decline followed by 3+ year improvement
      for (let i = 1; i < approved.length - 1; i++) {
        if (approved[i].ageReduction < approved[i - 1].ageReduction) {
          // Found a decline, check if subsequent submission improved by 3+
          for (let j = i + 1; j < approved.length; j++) {
            if (approved[j].ageReduction - approved[i].ageReduction >= 3) {
              return true;
            }
          }
        }
      }
      return false;
    },
  },

  // ============================================
  // SCIENCE
  // ============================================
  {
    slug: "ocr-pioneer",
    category: "SCIENCE",
    check: async (ctx) => {
      // Check if athlete used OCR and was among first 100
      const ocrSubmission = await prisma.biomarkerSubmission.findFirst({
        where: {
          athleteId: ctx.athleteId,
          entryMethod: "OCR_ASSISTED",
        },
      });

      if (!ocrSubmission) return false;

      // Count how many athletes used OCR before this one
      const earlierOcrUsers = await prisma.biomarkerSubmission.findMany({
        where: {
          entryMethod: "OCR_ASSISTED",
          submittedAt: { lt: ocrSubmission.submittedAt },
        },
        select: { athleteId: true },
        distinct: ["athleteId"],
      });

      return earlierOcrUsers.length < 100;
    },
  },

  // ============================================
  // SEASONAL (time-based checks)
  // ============================================
  {
    slug: "founding-season",
    category: "SEASONAL",
    check: async (ctx) => {
      // Check if athlete has submission in Season 1
      const season1 = await prisma.season.findFirst({
        where: { slug: "season-1" },
      });

      if (!season1) return false;

      const submissions = ctx.submissions || [];
      return submissions.some((s) => s.seasonId === season1.id && s.status === "APPROVED");
    },
  },
  {
    slug: "anniversary",
    category: "SEASONAL",
    check: (ctx) => {
      if (!ctx.athlete?.createdAt) return false;
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      return new Date(ctx.athlete.createdAt) <= oneYearAgo;
    },
  },
  {
    slug: "winter-warrior",
    category: "SEASONAL",
    check: (ctx) => {
      const submissions = ctx.submissions || [];
      return submissions.some((s) => {
        const month = new Date(s.submittedAt).getMonth();
        return s.status === "APPROVED" && month === 11; // December
      });
    },
  },
  {
    slug: "summer-soldier",
    category: "SEASONAL",
    check: (ctx) => {
      const submissions = ctx.submissions || [];
      return submissions.some((s) => {
        const month = new Date(s.submittedAt).getMonth();
        return s.status === "APPROVED" && (month === 5 || month === 6 || month === 7); // Jun-Aug
      });
    },
  },
];

// ============================================
// Badge Service Class
// ============================================

class BadgeService {
  /**
   * Check and award all eligible badges for an athlete
   */
  async checkAndAwardBadges(athleteId: string): Promise<BadgeAwardResult> {
    const result: BadgeAwardResult = {
      awarded: [],
      alreadyHad: [],
      notEligible: [],
      errors: [],
    };

    // Load context data once
    const context = await this.loadContext(athleteId);

    // Get all badges from database
    const allBadges = await prisma.badge.findMany();
    const badgesBySlug = new Map(allBadges.map((b) => [b.slug, b]));

    // Get already awarded badges
    const awardedBadges = await prisma.athleteBadge.findMany({
      where: { athleteId },
      select: { badge: { select: { slug: true } } },
    });
    const awardedSlugs = new Set(awardedBadges.map((ab) => ab.badge.slug));

    // Check each rule
    for (const rule of BADGE_RULES) {
      const badge = badgesBySlug.get(rule.slug);
      if (!badge) continue; // Badge not in database

      if (awardedSlugs.has(rule.slug)) {
        result.alreadyHad.push(rule.slug);
        continue;
      }

      try {
        const isEligible = await rule.check(context);

        if (isEligible) {
          await this.awardBadge(athleteId, badge.id, context.athlete?.displayName || "Athlete");
          result.awarded.push(rule.slug);
        } else {
          result.notEligible.push(rule.slug);
        }
      } catch (error) {
        result.errors.push({
          slug: rule.slug,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return result;
  }

  /**
   * Check badges for a specific category
   */
  async checkCategoryBadges(
    athleteId: string,
    category: BadgeCategory
  ): Promise<BadgeAwardResult> {
    const categoryRules = BADGE_RULES.filter((r) => r.category === category);

    const result: BadgeAwardResult = {
      awarded: [],
      alreadyHad: [],
      notEligible: [],
      errors: [],
    };

    const context = await this.loadContext(athleteId);

    const badges = await prisma.badge.findMany({
      where: { category },
    });
    const badgesBySlug = new Map(badges.map((b) => [b.slug, b]));

    const awardedBadges = await prisma.athleteBadge.findMany({
      where: {
        athleteId,
        badge: { category },
      },
      select: { badge: { select: { slug: true } } },
    });
    const awardedSlugs = new Set(awardedBadges.map((ab) => ab.badge.slug));

    for (const rule of categoryRules) {
      const badge = badgesBySlug.get(rule.slug);
      if (!badge) continue;

      if (awardedSlugs.has(rule.slug)) {
        result.alreadyHad.push(rule.slug);
        continue;
      }

      try {
        const isEligible = await rule.check(context);

        if (isEligible) {
          await this.awardBadge(athleteId, badge.id, context.athlete?.displayName || "Athlete");
          result.awarded.push(rule.slug);
        } else {
          result.notEligible.push(rule.slug);
        }
      } catch (error) {
        result.errors.push({
          slug: rule.slug,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return result;
  }

  /**
   * Award a specific badge to an athlete
   */
  async awardBadge(
    athleteId: string,
    badgeId: string,
    athleteName: string
  ): Promise<boolean> {
    try {
      // Check if already awarded
      const existing = await prisma.athleteBadge.findUnique({
        where: {
          athleteId_badgeId: { athleteId, badgeId },
        },
      });

      if (existing) return false;

      // Award badge
      await prisma.athleteBadge.create({
        data: { athleteId, badgeId },
      });

      // Get badge details for event
      const badge = await prisma.badge.findUnique({
        where: { id: badgeId },
      });

      if (badge) {
        // Create event
        await prisma.event.create({
          data: {
            type: "BADGE_EARNED",
            athleteId,
            message: `${athleteName} earned the "${badge.name}" badge`,
            data: {
              badgeId: badge.id,
              badgeName: badge.name,
              badgeSlug: badge.slug,
              badgeCategory: badge.category,
            },
          },
        });
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all badges for an athlete
   */
  async getAthleteBadges(athleteId: string) {
    return prisma.athleteBadge.findMany({
      where: { athleteId },
      include: { badge: true },
      orderBy: { earnedAt: "desc" },
    });
  }

  /**
   * Check eligibility for a specific badge without awarding
   */
  async checkEligibility(athleteId: string, badgeSlug: string): Promise<boolean> {
    const rule = BADGE_RULES.find((r) => r.slug === badgeSlug);
    if (!rule) return false;

    const context = await this.loadContext(athleteId);
    return rule.check(context);
  }

  /**
   * Load all context data needed for badge checks
   */
  private async loadContext(athleteId: string): Promise<BadgeContext> {
    const [athlete, submissions, leagueMemberships, leaderboardEntry] = await Promise.all([
      prisma.athlete.findUnique({
        where: { id: athleteId },
        select: {
          id: true,
          displayName: true,
          verified: true,
          createdAt: true,
          userId: true,
        },
      }),
      prisma.biomarkerSubmission.findMany({
        where: { athleteId },
        orderBy: { submittedAt: "desc" },
      }),
      prisma.leagueMember.findMany({
        where: { athleteId },
        include: {
          league: {
            select: {
              id: true,
              ownerId: true,
              _count: { select: { members: true } },
            },
          },
        },
      }),
      prisma.leaderboardEntry.findFirst({
        where: { athleteId },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return {
      athleteId,
      athlete: athlete || undefined,
      submissions: submissions.map((s) => ({
        id: s.id,
        phenoAge: s.phenoAge,
        ageReduction: s.ageReduction,
        status: s.status,
        entryMethod: s.entryMethod,
        submittedAt: s.submittedAt,
        seasonId: s.seasonId,
      })),
      leagueMemberships: leagueMemberships.map((m) => ({
        leagueId: m.leagueId,
        role: m.role,
        league: {
          id: m.league.id,
          ownerId: m.league.ownerId,
          _count: { members: m.league._count.members },
        },
      })),
      leaderboardEntry: leaderboardEntry
        ? {
            rank: leaderboardEntry.rank,
            bestAgeReduction: leaderboardEntry.bestAgeReduction,
          }
        : undefined,
    };
  }
}

// Export singleton instance
export const badgeService = new BadgeService();
