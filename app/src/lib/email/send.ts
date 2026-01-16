/**
 * High-level email sending functions
 * Use these functions throughout the application to send emails
 */

import { emailClient } from "./client";
import { welcomeEmail } from "./templates/welcome";
import {
  submissionConfirmation,
  submissionApproved,
  submissionRejected,
} from "./templates/submission";
import {
  leagueInvite,
  leagueMemberJoined,
  leagueRankUpdate,
} from "./templates/league";

// Re-export client for direct access if needed
export { emailClient };

/**
 * Send welcome email to new athlete
 */
export async function sendWelcomeEmail(
  to: string,
  displayName: string,
  leagueName?: string
) {
  const { subject, html } = welcomeEmail({ displayName, leagueName });
  return emailClient.send({
    to,
    subject,
    html,
    tags: ["welcome", "onboarding"],
  });
}

/**
 * Send submission confirmation email
 */
export async function sendSubmissionConfirmation(
  to: string,
  data: {
    displayName: string;
    submissionId: string;
    phenoAge: number;
    chronologicalAge: number;
    ageReduction: number;
  }
) {
  const { subject, html } = submissionConfirmation(data);
  return emailClient.send({
    to,
    subject,
    html,
    tags: ["submission", "confirmation"],
  });
}

/**
 * Send submission approved email
 */
export async function sendSubmissionApproved(
  to: string,
  data: {
    displayName: string;
    phenoAge: number;
    ageReduction: number;
    newRank: number;
    previousRank?: number;
    leagueName?: string;
  }
) {
  const { subject, html } = submissionApproved(data);
  return emailClient.send({
    to,
    subject,
    html,
    tags: ["submission", "approved"],
  });
}

/**
 * Send submission rejected email
 */
export async function sendSubmissionRejected(
  to: string,
  data: {
    displayName: string;
    reason: string;
    submissionId: string;
  }
) {
  const { subject, html } = submissionRejected(data);
  return emailClient.send({
    to,
    subject,
    html,
    tags: ["submission", "rejected"],
  });
}

/**
 * Send league invitation email
 */
export async function sendLeagueInvite(
  to: string,
  data: {
    inviteeName: string;
    leagueName: string;
    inviterName: string;
    inviteCode: string;
  }
) {
  const { subject, html } = leagueInvite(data);
  return emailClient.send({
    to,
    subject,
    html,
    tags: ["league", "invite"],
  });
}

/**
 * Send league member joined notification to owner
 */
export async function sendLeagueMemberJoined(
  to: string,
  data: {
    ownerName: string;
    leagueName: string;
    newMemberName: string;
    memberCount: number;
  }
) {
  const { subject, html } = leagueMemberJoined(data);
  return emailClient.send({
    to,
    subject,
    html,
    tags: ["league", "member-joined"],
  });
}

/**
 * Send league rank update notification
 */
export async function sendLeagueRankUpdate(
  to: string,
  data: {
    memberName: string;
    leagueName: string;
    newRank: number;
    previousRank: number;
    avgAgeReduction: number;
  }
) {
  const { subject, html } = leagueRankUpdate(data);
  return emailClient.send({
    to,
    subject,
    html,
    tags: ["league", "rank-update"],
  });
}
