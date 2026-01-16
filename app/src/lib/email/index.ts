/**
 * Email Service Module
 *
 * Usage:
 * ```ts
 * import { sendWelcomeEmail, sendSubmissionApproved } from "@/lib/email";
 *
 * await sendWelcomeEmail("user@example.com", "John Doe", "Team Alpha");
 * await sendSubmissionApproved("user@example.com", {
 *   displayName: "John Doe",
 *   phenoAge: 35.5,
 *   ageReduction: 4.5,
 *   newRank: 42,
 * });
 * ```
 */

// Export email client for direct access
export { emailClient } from "./client";
export type { SendEmailOptions, SendEmailResult } from "./client";

// Export all sending functions
export {
  sendWelcomeEmail,
  sendSubmissionConfirmation,
  sendSubmissionApproved,
  sendSubmissionRejected,
  sendLeagueInvite,
  sendLeagueMemberJoined,
  sendLeagueRankUpdate,
} from "./send";

// Export templates for customization
export * from "./templates";
