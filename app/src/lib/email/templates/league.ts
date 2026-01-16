/**
 * League-related email templates
 */

import { baseTemplate } from "./base";

interface LeagueInviteOptions {
  inviteeName: string;
  leagueName: string;
  inviterName: string;
  inviteCode: string;
}

interface LeagueMemberJoinedOptions {
  ownerName: string;
  leagueName: string;
  newMemberName: string;
  memberCount: number;
}

interface LeagueRankUpdateOptions {
  memberName: string;
  leagueName: string;
  newRank: number;
  previousRank: number;
  avgAgeReduction: number;
}

/**
 * League invitation email
 */
export function leagueInvite({
  inviteeName,
  leagueName,
  inviterName,
  inviteCode,
}: LeagueInviteOptions): { subject: string; html: string } {
  const subject = `You're invited to join ${leagueName}`;

  const content = `
    <h1>You've Been Invited!</h1>
    <p>Hey ${inviteeName},</p>
    <p>
      <strong>${inviterName}</strong> has invited you to join
      <span class="highlight">${leagueName}</span> on Longevity World Cup.
    </p>

    <div style="background-color: #252525; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
      <div style="font-size: 14px; color: #888; margin-bottom: 8px;">Invite Code</div>
      <div style="font-size: 32px; font-weight: bold; color: #00bcd4; letter-spacing: 4px;">${inviteCode}</div>
    </div>

    <p>
      Join the league to compete with your team, track collective progress,
      and climb the league leaderboard together!
    </p>

    <div style="text-align: center;">
      <a href="https://longevityworldcup.com/leagues/join?code=${inviteCode}" class="button">Accept Invitation</a>
    </div>

    <hr class="divider" />
    <p style="font-size: 14px; color: #888;">
      This invitation link will expire in 7 days.
    </p>
  `;

  return {
    subject,
    html: baseTemplate({
      title: subject,
      preheader: `${inviterName} wants you to join their league`,
      content,
    }),
  };
}

/**
 * Notify league owner when someone joins
 */
export function leagueMemberJoined({
  ownerName,
  leagueName,
  newMemberName,
  memberCount,
}: LeagueMemberJoinedOptions): { subject: string; html: string } {
  const subject = `${newMemberName} joined ${leagueName}`;

  const content = `
    <h1>New Team Member!</h1>
    <p>Hey ${ownerName},</p>
    <p>
      <strong>${newMemberName}</strong> has joined your league
      <span class="highlight">${leagueName}</span>.
    </p>

    <div style="background-color: #252525; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
      <div style="font-size: 48px; font-weight: bold; color: #00bcd4;">${memberCount}</div>
      <div style="font-size: 14px; color: #888; margin-top: 8px;">Total Members</div>
    </div>

    <p>
      The more members with verified biomarkers, the higher your league can climb on the leaderboard!
    </p>

    <div style="text-align: center;">
      <a href="https://longevityworldcup.com/leagues/${encodeURIComponent(leagueName.toLowerCase().replace(/\s+/g, "-"))}" class="button">View League</a>
    </div>
  `;

  return {
    subject,
    html: baseTemplate({
      title: subject,
      preheader: `Your league now has ${memberCount} members`,
      content,
    }),
  };
}

/**
 * League ranking update notification
 */
export function leagueRankUpdate({
  memberName,
  leagueName,
  newRank,
  previousRank,
  avgAgeReduction,
}: LeagueRankUpdateOptions): { subject: string; html: string } {
  const improved = newRank < previousRank;
  const change = Math.abs(previousRank - newRank);
  const subject = improved
    ? `${leagueName} climbed ${change} spots!`
    : `${leagueName} league update`;

  const content = `
    <h1>${improved ? "Your League Moved Up!" : "League Ranking Update"}</h1>
    <p>Hey ${memberName},</p>
    <p>
      Your league <span class="highlight">${leagueName}</span> has a new ranking on the leaderboard.
    </p>

    <div style="text-align: center; margin: 32px 0;">
      <div style="display: inline-block; background: linear-gradient(135deg, #252525, #1a1a1a); border-radius: 16px; padding: 32px 48px;">
        <div style="font-size: 48px; font-weight: bold; color: #00bcd4;">
          #${newRank}
        </div>
        <div style="font-size: 14px; color: #888; margin-top: 8px; text-transform: uppercase;">
          League Rank
        </div>
        ${
          change > 0
            ? `<div style="margin-top: 16px; color: ${improved ? "#4caf50" : "#f44336"}; font-weight: bold;">
            ${improved ? "↑" : "↓"} ${change} positions
          </div>`
            : ""
        }
      </div>
    </div>

    <div style="background-color: #252525; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
      <div style="font-size: 24px; font-weight: bold; color: #4caf50;">-${avgAgeReduction.toFixed(1)} years</div>
      <div style="font-size: 12px; color: #888; margin-top: 4px;">Team Average Age Reduction</div>
    </div>

    <p>
      ${
        improved
          ? "Keep up the great work! Your team's biomarker improvements are paying off."
          : "Encourage your team members to submit their latest biomarkers to climb back up!"
      }
    </p>

    <div style="text-align: center;">
      <a href="https://longevityworldcup.com/leagues/leaderboard" class="button">View League Leaderboard</a>
    </div>
  `;

  return {
    subject,
    html: baseTemplate({
      title: subject,
      preheader: `${leagueName} is now ranked #${newRank}`,
      content,
    }),
  };
}
