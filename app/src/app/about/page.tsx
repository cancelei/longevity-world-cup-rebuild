"use client";

import { motion } from "framer-motion";
import {
  Trophy,
  Activity,
  Users,
  Heart,
  Dna,
  Globe,
  ArrowRight,
  CheckCircle,
  Beaker,
  Building2,
  Briefcase,
  LineChart,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: Activity,
    title: "Know Your Real Age",
    description:
      "Upload your blood work, get your biological age in seconds. The PhenoAge algorithm reveals if you're aging faster or slower than your birth certificate suggests.",
  },
  {
    icon: Trophy,
    title: "See Where You Rank",
    description:
      "Compare your biological age reduction against thousands of optimizers globally. Filter by division, generation, or league to find your peers.",
  },
  {
    icon: Users,
    title: "Join the Longevity Elite",
    description:
      "Connect with the world's most serious longevity practitioners. Learn what protocols are actually moving the needle.",
  },
  {
    icon: LineChart,
    title: "Watch Your Age Drop",
    description:
      "Chart your biological age across seasons. See the real impact of your diet, exercise, supplements, and lifestyle interventions.",
  },
];

const leagueTypes = [
  {
    icon: Building2,
    title: "Longevity Clinics",
    description:
      "Prove your protocols work. Track patient outcomes with verified data and compete against other leading clinics worldwide.",
    color: "var(--color-primary)",
  },
  {
    icon: Briefcase,
    title: "Corporate Wellness",
    description:
      "The wellness benefit employees actually use. Gamify health outcomes and build team engagement through friendly competition.",
    color: "var(--color-secondary)",
  },
  {
    icon: Users,
    title: "Biohacker Collectives",
    description:
      "Benchmark your biohacks against serious optimizers. Share protocols, compare results, and push each other to new records.",
    color: "var(--color-success)",
  },
];

const biomarkers = [
  "Albumin",
  "Creatinine",
  "Glucose",
  "C-Reactive Protein (CRP)",
  "Lymphocyte %",
  "Mean Corpuscular Volume (MCV)",
  "Red Cell Distribution Width (RDW)",
  "Alkaline Phosphatase (ALP)",
  "White Blood Cell Count",
];

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-radial py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
            <span className="text-gradient">The Scoreboard</span>{" "}
            <span className="text-[var(--foreground)]">for Longevity</span>
          </h1>
          <p className="text-xl text-[var(--foreground-secondary)] max-w-3xl mx-auto">
            PhenoAge gives you a number. We give you a leaderboard, a community, and a reason to keep improving.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <Card variant="elevated">
            <CardContent className="p-8 md:p-12">
              <div className="flex items-start gap-6">
                <div className="p-4 rounded-xl bg-[var(--color-primary)]/10 hidden md:block">
                  <Heart className="h-8 w-8 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold mb-4 text-[var(--foreground)]">
                    Why We Built This
                  </h2>
                  <p className="text-lg text-[var(--foreground-secondary)] mb-4">
                    Longevity science has a measurement problem. People try interventions, but rarely know if they&apos;re
                    actually working. Clinics claim results, but can&apos;t prove them. Biohackers experiment in isolation.
                  </p>
                  <p className="text-lg text-[var(--foreground-secondary)] mb-4">
                    The Longevity World Cup changes that. We use the scientifically validated PhenoAge algorithm to give
                    everyone a single, comparable score. Track your progress. Compare with peers. Win prizes for getting younger.
                  </p>
                  <p className="text-lg font-semibold text-[var(--foreground)]">
                    Stop guessing. Start measuring.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Who It's For */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-8 text-center text-[var(--foreground)]">
            Built for Those Who Take Longevity Seriously
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {leagueTypes.map((type, index) => (
              <motion.div
                key={type.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="p-3 rounded-lg w-fit mb-4" style={{ backgroundColor: `${type.color}15` }}>
                      <type.icon className="h-6 w-6" style={{ color: type.color }} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-[var(--foreground)]">
                      {type.title}
                    </h3>
                    <p className="text-[var(--foreground-secondary)]">{type.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-8 text-center text-[var(--foreground)]">
            How It Works
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-[var(--color-primary)]/10">
                        <feature.icon className="h-6 w-6 text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2 text-[var(--foreground)]">
                          {feature.title}
                        </h3>
                        <p className="text-[var(--foreground-secondary)]">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* PhenoAge Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <Card>
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-[var(--color-secondary)]/10">
                      <Dna className="h-6 w-6 text-[var(--color-secondary)]" />
                    </div>
                    <h2 className="text-2xl font-display font-bold text-[var(--foreground)]">
                      The Science: PhenoAge
                    </h2>
                  </div>
                  <p className="text-[var(--foreground-secondary)] mb-4">
                    PhenoAge was developed by Dr. Morgan Levine at Yale. Published in the journal Aging in 2018,
                    it&apos;s one of the most validated biological age calculators available.
                  </p>
                  <p className="text-[var(--foreground-secondary)] mb-4">
                    The algorithm uses nine routine blood biomarkers to predict mortality risk and estimate
                    biological age. A PhenoAge 5 years younger than your chronological age means your body
                    is functioning like someone 5 years younger.
                  </p>
                  <p className="text-[var(--foreground-secondary)] mb-6">
                    Unlike DNA methylation tests that cost $300+, these biomarkers are available from any
                    standard blood panel at your local lab.
                  </p>
                  <a
                    href="https://doi.org/10.18632/aging.101414"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
                  >
                    Read the peer-reviewed research
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
                <div className="md:w-64 lg:w-80">
                  <div className="bg-[var(--background)] rounded-lg p-4 border border-[var(--border)]">
                    <div className="flex items-center gap-2 mb-4">
                      <Beaker className="h-5 w-5 text-[var(--foreground-muted)]" />
                      <h3 className="font-semibold text-[var(--foreground)]">9 Required Biomarkers</h3>
                    </div>
                    <ul className="space-y-2">
                      {biomarkers.map((biomarker) => (
                        <li
                          key={biomarker}
                          className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)]"
                        >
                          <CheckCircle className="h-4 w-4 text-[var(--color-success)]" />
                          {biomarker}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 text-xs text-[var(--foreground-muted)]">
                      Available from any standard blood panel ($30-100)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Competition Structure */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-8 text-center text-[var(--foreground)]">
            Competition Structure
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="h-6 w-6 text-[var(--color-primary)]" />
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">Individual Rankings</h3>
                </div>
                <ul className="space-y-3 text-[var(--foreground-secondary)]">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                    Men&apos;s Division
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-secondary)]" />
                    Women&apos;s Division
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
                    Open Division
                  </li>
                </ul>
                <p className="mt-4 text-sm text-[var(--foreground-muted)]">
                  Plus generational categories: Silent Gen, Boomers, Gen X, Millennials, Gen Z
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="h-6 w-6 text-[var(--color-secondary)]" />
                  <h3 className="text-lg font-semibold text-[var(--foreground)]">League Rankings</h3>
                </div>
                <ul className="space-y-3 text-[var(--foreground-secondary)]">
                  <li className="flex items-center gap-2">
                    <span className="text-lg">🏥</span>
                    Longevity Clinics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-lg">🏢</span>
                    Corporate Wellness
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-lg">👥</span>
                    Biohacker Collectives
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-lg">🌍</span>
                    Geographic Leagues
                  </li>
                </ul>
                <p className="mt-4 text-sm text-[var(--foreground-muted)]">
                  Leagues ranked by average member age reduction
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Global */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <Card variant="elevated">
            <CardContent className="p-8 md:p-12 text-center">
              <Globe className="h-12 w-12 mx-auto text-[var(--color-primary)] mb-4" />
              <h2 className="text-2xl font-display font-bold mb-4 text-[var(--foreground)]">
                Compete From Anywhere
              </h2>
              <p className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
                The Longevity World Cup is open worldwide. Get your blood work at any lab,
                upload your results, and join the global leaderboard. Prizes paid in Bitcoin.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-4 text-[var(--foreground)]">
            Ready to See Where You Rank?
          </h2>
          <p className="text-lg text-[var(--foreground-secondary)] mb-8 max-w-2xl mx-auto">
            Get your biological age calculated and start competing against the world&apos;s top longevity optimizers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" onClick={() => router.push("/sign-up")}>
              Get Your Biological Age
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="xl" onClick={() => router.push("/leagues/new")}>
              Create a League
              <Building2 className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
