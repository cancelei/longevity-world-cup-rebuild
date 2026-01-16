/**
 * Badge Service Module
 *
 * Centralized badge awarding and eligibility checking.
 *
 * @example
 * ```typescript
 * import { badgeService, BADGE_RULES } from '@/lib/badges';
 *
 * // Check and award all eligible badges
 * const result = await badgeService.checkAndAwardBadges(athleteId);
 * console.log(`Awarded: ${result.awarded.join(', ')}`);
 *
 * // Check specific category
 * await badgeService.checkCategoryBadges(athleteId, 'MILESTONE');
 *
 * // Check eligibility without awarding
 * const isEligible = await badgeService.checkEligibility(athleteId, 'super-ager');
 * ```
 *
 * @module lib/badges
 */

export { badgeService, BADGE_RULES } from "./badge-service";
export type { BadgeRule, BadgeContext, BadgeAwardResult } from "./badge-service";
