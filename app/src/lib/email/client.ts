/**
 * Email Service Client - Infrastructure Layer
 *
 * Transactional email delivery using EMAILIT API.
 *
 * ## Extension Points
 * Replace this client to use alternative providers:
 * - **SendGrid**: High deliverability, analytics dashboard
 * - **Resend**: Developer-friendly, React email templates
 * - **AWS SES**: Cost-effective at scale
 * - **Postmark**: Focused on transactional email
 *
 * ## Implementation Notes
 * - Client is a singleton (emailClient export)
 * - Gracefully handles missing configuration (logs warning, returns error)
 * - Auto-generates plain text from HTML
 * - Supports tags for analytics/filtering
 *
 * @see https://emailit.api-docs.io/
 * @module lib/email/client
 */

interface EmailitConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  tags?: string[];
}

interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailClient {
  private config: EmailitConfig | null = null;
  private baseUrl = "https://api.emailit.com/v1";

  constructor() {
    this.initConfig();
  }

  private initConfig() {
    const apiKey = process.env.EMAILIT_API_KEY;
    const fromEmail = process.env.EMAILIT_FROM_EMAIL || "noreply@longevityworldcup.com";
    const fromName = process.env.EMAILIT_FROM_NAME || "Longevity World Cup";

    if (apiKey) {
      this.config = { apiKey, fromEmail, fromName };
    }
  }

  /**
   * Check if email service is configured
   */
  isConfigured(): boolean {
    return this.config !== null;
  }

  /**
   * Send an email
   */
  async send(options: SendEmailOptions): Promise<SendEmailResult> {
    if (!this.config) {
      console.warn("[Email] Service not configured - skipping email send");
      return { success: false, error: "Email service not configured" };
    }

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: {
            email: this.config.fromEmail,
            name: this.config.fromName,
          },
          to: [{ email: options.to }],
          subject: options.subject,
          html: options.html,
          text: options.text || this.stripHtml(options.html),
          reply_to: options.replyTo,
          tags: options.tags,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("[Email] Send failed:", error);
        return { success: false, error };
      }

      const data = await response.json();
      return { success: true, messageId: data.id };
    } catch (error) {
      console.error("[Email] Send error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send a batch of emails
   */
  async sendBatch(
    emails: SendEmailOptions[]
  ): Promise<{ sent: number; failed: number; results: SendEmailResult[] }> {
    const results = await Promise.all(emails.map((email) => this.send(email)));
    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    return { sent, failed, results };
  }

  /**
   * Strip HTML tags for plain text version
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
}

// Export singleton instance
export const emailClient = new EmailClient();

// Re-export types
export type { SendEmailOptions, SendEmailResult };
