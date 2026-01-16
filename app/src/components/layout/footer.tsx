import Link from "next/link";
import { Trophy, Github, Twitter, Youtube, Mail, AlertCircle } from "lucide-react";

const footerLinks = {
  competition: [
    { href: "/", label: "Leaderboard" },
    { href: "/athletes", label: "Athletes" },
    { href: "/rules", label: "Rules" },
    { href: "/prizes", label: "Prizes" },
  ],
  resources: [
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/history", label: "History" },
    { href: "https://github.com/LongevityWorldCup", label: "GitHub", external: true },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

const socialLinks = [
  { href: "https://twitter.com/LongevityWorldC", icon: Twitter, label: "Twitter" },
  { href: "https://github.com/LongevityWorldCup", icon: Github, label: "GitHub" },
  { href: "https://youtube.com", icon: Youtube, label: "YouTube" },
  { href: "mailto:longevityworldcup@gmail.com", icon: Mail, label: "Email" },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background-secondary)]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Trophy className="h-6 w-6 text-[var(--color-primary)]" />
              <span className="font-display text-lg font-bold text-gradient">
                Longevity World Cup
              </span>
            </Link>
            <p className="text-sm text-[var(--foreground-secondary)] mb-4">
              Too old for your sport? Not this one! Reverse your age and rise on the leaderboard.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--background-card)] transition-all"
                  aria-label={link.label}
                >
                  <link.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Competition Links */}
          <div>
            <h3 className="font-semibold text-[var(--foreground)] mb-4">Competition</h3>
            <ul className="space-y-2">
              {footerLinks.competition.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold text-[var(--foreground)] mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-[var(--foreground)] mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Medical Disclaimer */}
        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--background-card)] border border-[var(--border)]">
            <AlertCircle className="h-5 w-5 text-[var(--foreground-muted)] shrink-0 mt-0.5" />
            <div className="text-xs text-[var(--foreground-muted)] leading-relaxed">
              <p className="font-semibold mb-1">Medical Disclaimer</p>
              <p>
                The Longevity World Cup is for informational and educational purposes only.
                PhenoAge calculations and biological age estimates are based on the peer-reviewed research by{" "}
                <a
                  href="https://doi.org/10.18632/aging.101414"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-primary)] hover:underline"
                >
                  Levine et al. (2018)
                </a>
                {" "}but should not be used as a substitute for professional medical advice, diagnosis, or treatment.
                Always consult with a qualified healthcare provider before making any health-related decisions.
                Individual results may vary and are not guaranteed.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[var(--foreground-muted)]">
            &copy; {new Date().getFullYear()} Longevity World Cup. All rights reserved.
          </p>
          <p className="text-sm text-[var(--foreground-muted)]">
            Organized by{" "}
            <a
              href="https://github.com/nopara73"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] hover:underline"
            >
              nopara73
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
