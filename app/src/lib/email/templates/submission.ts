/**
 * Submission-related email templates
 * Sent for submission confirmations and approvals
 */

import { baseTemplate } from "./base";

interface SubmissionConfirmationOptions {
  displayName: string;
  submissionId: string;
  phenoAge: number;
  chronologicalAge: number;
  ageReduction: number;
}

interface SubmissionApprovedOptions {
  displayName: string;
  phenoAge: number;
  ageReduction: number;
  newRank: number;
  previousRank?: number;
  leagueName?: string;
}

interface SubmissionRejectedOptions {
  displayName: string;
  reason: string;
  submissionId: string;
}

/**
 * Confirmation email sent immediately after submission
 */
export function submissionConfirmation({
  displayName,
  submissionId,
  phenoAge,
  chronologicalAge,
  ageReduction,
}: SubmissionConfirmationOptions): { subject: string; html: string } {
  const subject = "Biomarker Submission Received";

  const content = `
    <h1>Submission Received!</h1>
    <p>Hey ${displayName},</p>
    <p>We've received your biomarker submission and it's now pending review.</p>

    <div style="background-color: #252525; border-radius: 12px; padding: 24px; margin: 24px 0;">
      <h3 style="margin: 0 0 16px 0; color: #ffffff;">Your Results Preview</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #333;">
            <span style="color: #888;">Chronological Age</span>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #333; text-align: right; font-weight: bold; color: #fff;">
            ${chronologicalAge} years
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #333;">
            <span style="color: #888;">Biological Age (PhenoAge)</span>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #333; text-align: right; font-weight: bold; color: #00bcd4;">
            ${phenoAge.toFixed(1)} years
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0;">
            <span style="color: #888;">Age Reduction</span>
          </td>
          <td style="padding: 12px 0; text-align: right; font-weight: bold; color: #4caf50;">
            -${ageReduction.toFixed(1)} years
          </td>
        </tr>
      </table>
    </div>

    <p style="color: #888; font-size: 14px;">
      Submission ID: ${submissionId}
    </p>
    <p>
      Our team will review your submission within 24-48 hours. You'll receive another email once it's approved.
    </p>
  `;

  return {
    subject,
    html: baseTemplate({
      title: subject,
      preheader: `Your biomarker submission is pending review`,
      content,
    }),
  };
}

/**
 * Email sent when submission is approved
 */
export function submissionApproved({
  displayName,
  phenoAge,
  ageReduction,
  newRank,
  previousRank,
  leagueName,
}: SubmissionApprovedOptions): { subject: string; html: string } {
  const rankImproved = previousRank && newRank < previousRank;
  const rankChange = previousRank ? previousRank - newRank : 0;
  const subject = rankImproved
    ? `Congrats! You climbed ${rankChange} spots on the leaderboard!`
    : "Your submission has been approved!";

  const content = `
    <h1>${rankImproved ? "You're Moving Up!" : "Submission Approved!"}</h1>
    <p>Hey ${displayName},</p>
    <p>Great news! Your biomarker submission has been verified and approved.</p>

    <div style="text-align: center; margin: 32px 0;">
      <div style="display: inline-block; background: linear-gradient(135deg, #252525, #1a1a1a); border-radius: 16px; padding: 32px 48px;">
        <div style="font-size: 48px; font-weight: bold; color: #00bcd4;">
          #${newRank}
        </div>
        <div style="font-size: 14px; color: #888; margin-top: 8px; text-transform: uppercase;">
          Global Rank
        </div>
        ${
          rankImproved
            ? `<div style="margin-top: 16px; color: #4caf50; font-weight: bold;">
            ↑ ${rankChange} positions
          </div>`
            : ""
        }
      </div>
    </div>

    <table style="width: 100%; margin: 24px 0;">
      <tr>
        <td style="width: 50%; text-align: center; padding: 16px;">
          <div style="font-size: 32px; font-weight: bold; color: #00bcd4;">${phenoAge.toFixed(1)}</div>
          <div style="font-size: 12px; color: #888; margin-top: 4px; text-transform: uppercase;">Biological Age</div>
        </td>
        <td style="width: 50%; text-align: center; padding: 16px;">
          <div style="font-size: 32px; font-weight: bold; color: #4caf50;">-${ageReduction.toFixed(1)}</div>
          <div style="font-size: 12px; color: #888; margin-top: 4px; text-transform: uppercase;">Age Reduction</div>
        </td>
      </tr>
    </table>

    ${
      leagueName
        ? `<p>Your results also contribute to <span class="highlight">${leagueName}</span>'s team score!</p>`
        : ""
    }

    <div style="text-align: center;">
      <a href="https://longevityworldcup.com/athletes" class="button">View Full Leaderboard</a>
    </div>

    <hr class="divider" />
    <p style="font-size: 14px; color: #888;">
      Keep up the great work! Consistent improvements in your biomarkers will help you climb the ranks.
    </p>
  `;

  return {
    subject,
    html: baseTemplate({
      title: subject,
      preheader: `Your new rank: #${newRank} with -${ageReduction.toFixed(1)} years age reduction`,
      content,
    }),
  };
}

/**
 * Email sent when submission is rejected
 */
export function submissionRejected({
  displayName,
  reason,
  submissionId,
}: SubmissionRejectedOptions): { subject: string; html: string } {
  const subject = "Submission Requires Attention";

  const content = `
    <h1>Submission Review Update</h1>
    <p>Hey ${displayName},</p>
    <p>Unfortunately, we couldn't approve your recent biomarker submission.</p>

    <div style="background-color: #2a1a1a; border-left: 4px solid #f44336; padding: 16px 20px; margin: 24px 0; border-radius: 4px;">
      <div style="color: #f44336; font-weight: bold; margin-bottom: 8px;">Reason:</div>
      <div style="color: #cccccc;">${reason}</div>
    </div>

    <p style="color: #888; font-size: 14px;">
      Submission ID: ${submissionId}
    </p>

    <h3>What to do next:</h3>
    <ul style="color: #cccccc; line-height: 1.8;">
      <li>Review the reason above</li>
      <li>Ensure your lab report is clear and complete</li>
      <li>Submit again with corrected information</li>
    </ul>

    <div style="text-align: center;">
      <a href="https://longevityworldcup.com/submit" class="button">Submit Again</a>
    </div>

    <hr class="divider" />
    <p style="font-size: 14px; color: #888;">
      If you believe this was a mistake, please contact support.
    </p>
  `;

  return {
    subject,
    html: baseTemplate({
      title: subject,
      preheader: "Your submission needs attention",
      content,
    }),
  };
}
