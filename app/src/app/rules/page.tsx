"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle,
  AlertCircle,
  Calendar,
  Award,
  FileCheck,
  Users,
  Clock,
  Scale,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

const rules = [
  {
    id: 1,
    title: "Eligibility",
    icon: Users,
    items: [
      "Must be at least 18 years of age",
      "Must submit valid biomarkers from an accredited laboratory",
      "Must provide proof of identity for verification",
      "Open to participants worldwide",
    ],
  },
  {
    id: 2,
    title: "Biomarker Submission",
    icon: FileCheck,
    items: [
      "All 9 required biomarkers must be submitted together",
      "Lab results must be from the current competition season",
      "Lab reports must include patient name matching your profile",
      "One submission per competition period allowed",
      "Digital copies of lab reports required for verification",
    ],
  },
  {
    id: 3,
    title: "Verification Process",
    icon: CheckCircle,
    items: [
      "All submissions are reviewed by our verification team",
      "Identity verification required for leaderboard placement",
      "Lab report authenticity is verified",
      "Submissions typically verified within 48-72 hours",
      "Rejected submissions can be resubmitted with corrections",
    ],
  },
  {
    id: 4,
    title: "Rankings",
    icon: Award,
    items: [
      "Rankings are based on Age Reduction (chronological age - biological age)",
      "Higher age reduction = higher ranking",
      "Ties are broken by earliest submission time",
      "Rankings are updated in real-time upon verification",
      "Separate leaderboards for divisions and generations",
    ],
  },
  {
    id: 5,
    title: "Season Structure",
    icon: Calendar,
    items: [
      "Each season runs for one calendar year",
      "Submission deadline is November 30th of each year",
      "Winners announced in December",
      "Prize pool distributed to top 3 finishers",
      "Historical data is preserved for future reference",
    ],
  },
  {
    id: 6,
    title: "Fair Play",
    icon: Scale,
    items: [
      "No falsification of lab results or identity",
      "No manipulation of biomarker data",
      "Disputes reviewed by organizing committee",
      "Violations may result in disqualification",
      "All decisions by the committee are final",
    ],
  },
];

const biomarkerRequirements = [
  { name: "Albumin", unit: "g/dL", range: "3.5-5.0" },
  { name: "Creatinine", unit: "mg/dL", range: "0.6-1.2" },
  { name: "Glucose", unit: "mg/dL", range: "70-100" },
  { name: "C-Reactive Protein (CRP)", unit: "mg/L", range: "0-3.0" },
  { name: "Lymphocyte %", unit: "%", range: "20-40" },
  { name: "Mean Corpuscular Volume (MCV)", unit: "fL", range: "80-100" },
  { name: "Red Cell Distribution Width (RDW)", unit: "%", range: "11.5-14.5" },
  { name: "Alkaline Phosphatase (ALP)", unit: "U/L", range: "44-147" },
  { name: "White Blood Cell Count", unit: "K/uL", range: "4.5-11.0" },
];

const prizeDistribution = [
  { place: "1st Place", percentage: "60%", color: "var(--color-gold)" },
  { place: "2nd Place", percentage: "25%", color: "var(--color-silver)" },
  { place: "3rd Place", percentage: "15%", color: "var(--color-bronze)" },
];

export default function RulesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-radial py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-[var(--color-primary)]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="text-gradient">Competition</span>{" "}
            <span className="text-[var(--foreground)]">Rules</span>
          </h1>
          <p className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
            Everything you need to know about participating in the Longevity World Cup
          </p>
        </motion.div>

        {/* Quick Summary */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card variant="elevated">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-4 text-[var(--foreground)]">Quick Summary</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[var(--color-success)]/10">
                    <CheckCircle className="h-5 w-5 text-[var(--color-success)]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--foreground)]">Submit Biomarkers</h3>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      Upload your lab results with all 9 required biomarkers
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[var(--color-primary)]/10">
                    <Clock className="h-5 w-5 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--foreground)]">Get Verified</h3>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      Our team verifies your submission within 48-72 hours
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[var(--color-secondary)]/10">
                    <Award className="h-5 w-5 text-[var(--color-secondary)]" />
                  </div>
                  <div>
                    <h3 className="font-medium text-[var(--foreground)]">Compete & Win</h3>
                    <p className="text-sm text-[var(--foreground-secondary)]">
                      Rank on the leaderboard and win prizes
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Detailed Rules */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-8 text-[var(--foreground)]">
            Detailed Rules
          </h2>
          <div className="space-y-6">
            {rules.map((rule, index) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-3 min-w-fit">
                        <Badge variant="outline" className="text-lg font-bold px-3 py-1">
                          {rule.id}
                        </Badge>
                        <div className="p-2 rounded-lg bg-[var(--color-primary)]/10">
                          <rule.icon className="h-5 w-5 text-[var(--color-primary)]" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-3 text-[var(--foreground)]">
                          {rule.title}
                        </h3>
                        <ul className="space-y-2">
                          {rule.items.map((item, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-[var(--foreground-secondary)]"
                            >
                              <CheckCircle className="h-4 w-4 text-[var(--color-success)] mt-0.5 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Biomarker Requirements */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-8 text-[var(--foreground)]">
            Required Biomarkers
          </h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-left p-4 font-semibold text-[var(--foreground)]">
                        Biomarker
                      </th>
                      <th className="text-left p-4 font-semibold text-[var(--foreground)]">Unit</th>
                      <th className="text-left p-4 font-semibold text-[var(--foreground)]">
                        Normal Range
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {biomarkerRequirements.map((biomarker, index) => (
                      <tr
                        key={biomarker.name}
                        className={
                          index !== biomarkerRequirements.length - 1
                            ? "border-b border-[var(--border)]"
                            : ""
                        }
                      >
                        <td className="p-4 text-[var(--foreground)]">{biomarker.name}</td>
                        <td className="p-4 text-[var(--foreground-secondary)]">{biomarker.unit}</td>
                        <td className="p-4">
                          <Badge variant="outline">{biomarker.range}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <p className="mt-4 text-sm text-[var(--foreground-muted)] flex items-start gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            These ranges are for reference only. Your actual values may vary and still be valid for
            competition.
          </p>
        </motion.section>

        {/* Prize Distribution */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-8 text-[var(--foreground)]">
            Prize Distribution
          </h2>
          <Card variant="elevated">
            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-3 gap-6">
                {prizeDistribution.map((prize) => (
                  <div
                    key={prize.place}
                    className="text-center p-6 rounded-lg border border-[var(--border)]"
                  >
                    <Award
                      className="h-12 w-12 mx-auto mb-4"
                      style={{ color: prize.color }}
                    />
                    <h3 className="text-lg font-semibold mb-2 text-[var(--foreground)]">
                      {prize.place}
                    </h3>
                    <p className="text-3xl font-bold text-gradient">{prize.percentage}</p>
                    <p className="text-sm text-[var(--foreground-muted)]">of prize pool</p>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-center text-[var(--foreground-secondary)]">
                Prize pool is funded by donations and distributed at the end of each season.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Dispute Resolution */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-12"
        >
          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-[var(--color-warning)]/10">
                  <Scale className="h-6 w-6 text-[var(--color-warning)]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-[var(--foreground)]">
                    Dispute Resolution
                  </h2>
                  <p className="text-[var(--foreground-secondary)] mb-4">
                    All disputes regarding rankings, verification, or prize distribution will be
                    reviewed by the Longevity World Cup organizing committee. Decisions made by the
                    committee are final and binding.
                  </p>
                  <p className="text-[var(--foreground-secondary)]">
                    To file a dispute, contact us at{" "}
                    <a
                      href="mailto:disputes@longevityworldcup.com"
                      className="text-[var(--color-primary)] hover:underline"
                    >
                      disputes@longevityworldcup.com
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-4 text-[var(--foreground)]">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-[var(--foreground-secondary)] mb-8 max-w-2xl mx-auto">
            Now that you know the rules, join the competition and start your journey to reverse
            your biological age.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="xl" onClick={() => router.push("/onboarding")}>
              Join the Competition
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="xl" onClick={() => router.push("/athletes")}>
              View Athletes
            </Button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
