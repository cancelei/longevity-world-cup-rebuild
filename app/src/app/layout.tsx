import type { Metadata } from "next";
import { Inter, Orbitron, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@/components/providers/clerk-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PerformanceMonitor } from "@/components/performance/performance-monitor";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://longevityworldcup.com"),
  title: {
    default: "Longevity World Cup",
    template: "%s | Longevity World Cup",
  },
  description:
    "Too old for your sport? Not this one! In the Longevity World Cup, you don't age out - you age in. Reverse your age and rise on the leaderboard.",
  keywords: [
    "longevity",
    "biological age",
    "PhenoAge",
    "biomarkers",
    "health competition",
    "anti-aging",
    "biohacking",
    "reverse aging",
    "age reversal competition",
    "longevity clinic",
    "corporate wellness",
    "biological age test",
    "healthspan optimization",
    "longevity leaderboard",
    "age reduction",
    "biomarker tracking",
  ],
  authors: [{ name: "Longevity World Cup" }],
  creator: "nopara73",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://longevityworldcup.com",
    siteName: "Longevity World Cup",
    title: "Longevity World Cup",
    description:
      "Too old for your sport? Not this one! Reverse your biological age and compete on the global leaderboard.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Longevity World Cup",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Longevity World Cup",
    description:
      "Too old for your sport? Not this one! Reverse your biological age and compete.",
    creator: "@LongevityWorldC",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// Organization structured data for SEO
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Longevity World Cup",
  url: "https://longevityworldcup.com",
  logo: "https://longevityworldcup.com/logo.png",
  description:
    "The world's first competitive platform for biological age reversal. Athletes compete by reducing their PhenoAge through biomarker optimization.",
  sameAs: [
    "https://twitter.com/LongevityWorldC",
  ],
};

// Website structured data
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Longevity World Cup",
  url: "https://longevityworldcup.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://longevityworldcup.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

// Medical web page structured data (YMYL/E-E-A-T compliance)
const medicalWebPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  name: "Longevity World Cup - Biological Age Competition",
  url: "https://longevityworldcup.com",
  about: {
    "@type": "MedicalCondition",
    name: "Biological Aging",
    description: "The process of biological aging as measured by biomarkers and PhenoAge calculation",
  },
  specialty: {
    "@type": "MedicalSpecialty",
    name: "Longevity Medicine",
  },
  mainContentOfPage: {
    "@type": "WebPageElement",
    description: "Competitive platform for tracking and comparing biological age reversal using the scientifically validated PhenoAge algorithm",
  },
  lastReviewed: new Date().toISOString().split("T")[0],
  reviewedBy: {
    "@type": "Organization",
    name: "Longevity World Cup Scientific Advisory",
    url: "https://longevityworldcup.com/about",
  },
  citation: {
    "@type": "ScholarlyArticle",
    name: "An epigenetic biomarker of aging for lifespan and healthspan",
    author: {
      "@type": "Person",
      name: "Morgan E. Levine",
    },
    url: "https://doi.org/10.18632/aging.101414",
    datePublished: "2018",
  },
};

// FAQ structured data for rich snippets
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is PhenoAge?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PhenoAge is a biological age calculator developed by Dr. Morgan Levine and colleagues. It uses nine routine blood biomarkers to estimate your biological age, which can be significantly different from your chronological age. A lower PhenoAge indicates slower aging.",
      },
    },
    {
      "@type": "Question",
      name: "What biomarkers are required to calculate PhenoAge?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nine biomarkers are required: Albumin, Creatinine, Glucose, C-Reactive Protein (CRP), Lymphocyte %, Mean Corpuscular Volume (MCV), Red Cell Distribution Width (RDW), Alkaline Phosphatase (ALP), and White Blood Cell Count. These are available from standard blood tests.",
      },
    },
    {
      "@type": "Question",
      name: "How do I join the Longevity World Cup?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can join by creating a free account, completing your athlete profile, and submitting your biomarker data from a recent blood test. You can compete individually or join/create a league for your clinic, company, or community.",
      },
    },
    {
      "@type": "Question",
      name: "What is a league in the Longevity World Cup?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A league is a group of participants competing together. Leagues can be created by longevity clinics, corporations for wellness programs, biohacker collectives, or geographic communities. Leagues compete based on their members' average biological age reduction.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationJsonLd),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(websiteJsonLd),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(medicalWebPageJsonLd),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(faqJsonLd),
            }}
          />
        </head>
        <body
          className={`${inter.variable} ${orbitron.variable} ${jetbrainsMono.variable} font-sans antialiased min-h-screen flex flex-col`}
        >
          <ToastProvider>
            <PerformanceMonitor />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
