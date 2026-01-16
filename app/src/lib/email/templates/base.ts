/**
 * Base email template layout
 * Provides consistent styling across all emails
 */

interface BaseTemplateOptions {
  title: string;
  preheader?: string;
  content: string;
}

export function baseTemplate({ title, preheader, content }: BaseTemplateOptions): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  ${preheader ? `<span style="display:none;font-size:0;color:#fff;line-height:0;">${preheader}</span>` : ""}
  <style>
    /* Reset styles */
    body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
    }
    /* Remove default link styles */
    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
    }
    /* Main styles */
    body {
      margin: 0;
      padding: 0;
      width: 100%;
      background-color: #0a0a0a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      padding: 30px 0;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #00bcd4;
      text-decoration: none;
    }
    .content {
      background-color: #1a1a1a;
      border-radius: 12px;
      padding: 30px;
      color: #ffffff;
    }
    .content h1 {
      color: #ffffff;
      font-size: 24px;
      margin: 0 0 20px 0;
    }
    .content p {
      color: #cccccc;
      font-size: 16px;
      line-height: 1.6;
      margin: 0 0 16px 0;
    }
    .button {
      display: inline-block;
      padding: 14px 28px;
      background: linear-gradient(135deg, #00bcd4, #00acc1);
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
    }
    .button:hover {
      background: linear-gradient(135deg, #00acc1, #0097a7);
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin: 20px 0;
    }
    .stat-card {
      background-color: #252525;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .stat-value {
      font-size: 28px;
      font-weight: bold;
      color: #00bcd4;
    }
    .stat-label {
      font-size: 12px;
      color: #888888;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .highlight {
      color: #00bcd4;
    }
    .success {
      color: #4caf50;
    }
    .warning {
      color: #ff9800;
    }
    .footer {
      text-align: center;
      padding: 30px 0;
      color: #666666;
      font-size: 12px;
    }
    .footer a {
      color: #00bcd4;
      text-decoration: none;
    }
    .divider {
      border: 0;
      height: 1px;
      background-color: #333333;
      margin: 24px 0;
    }
    @media only screen and (max-width: 600px) {
      .wrapper {
        padding: 10px;
      }
      .content {
        padding: 20px;
      }
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <a href="https://longevityworldcup.com" class="logo">Longevity World Cup</a>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Longevity World Cup. All rights reserved.</p>
      <p>
        <a href="https://longevityworldcup.com/rules">Rules</a> |
        <a href="https://longevityworldcup.com/about">About</a> |
        <a href="https://twitter.com/LongevityWorldC">Twitter</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
