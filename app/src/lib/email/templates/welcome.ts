/**
 * Welcome email template
 * Sent when a new athlete completes onboarding
 */

import { baseTemplate } from "./base";

interface WelcomeEmailOptions {
  displayName: string;
  leagueName?: string;
}

export function welcomeEmail({ displayName, leagueName }: WelcomeEmailOptions): {
  subject: string;
  html: string;
} {
  const subject = `Welcome to Longevity World Cup, ${displayName}!`;

  const content = `
    <h1>Welcome to the Competition!</h1>
    <p>Hey ${displayName},</p>
    <p>
      You've successfully joined the <strong>Longevity World Cup</strong> -
      the world's first competitive platform for biological age reversal.
    </p>
    ${
      leagueName
        ? `<p>You're now a member of <span class="highlight">${leagueName}</span>. Time to represent your team!</p>`
        : ""
    }
    <hr class="divider" />
    <h2>Getting Started</h2>
    <p>Here's what you can do next:</p>
    <ol style="color: #cccccc; line-height: 1.8;">
      <li><strong>Submit your biomarkers</strong> - Upload your lab results to calculate your PhenoAge</li>
      <li><strong>Track your progress</strong> - Monitor your biological age over time</li>
      <li><strong>Climb the leaderboard</strong> - Compete against athletes worldwide</li>
      <li><strong>Earn badges</strong> - Unlock achievements as you improve</li>
    </ol>
    <div style="text-align: center;">
      <a href="https://longevityworldcup.com/submit" class="button">Submit Your First Biomarkers</a>
    </div>
    <hr class="divider" />
    <p style="font-size: 14px; color: #888888;">
      Pro tip: Regular submissions help you track your longevity progress. Most athletes submit quarterly.
    </p>
  `;

  return {
    subject,
    html: baseTemplate({
      title: subject,
      preheader: "Your journey to biological age reversal starts now!",
      content,
    }),
  };
}
