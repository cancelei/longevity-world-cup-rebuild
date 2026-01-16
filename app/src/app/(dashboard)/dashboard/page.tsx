"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  Activity,
  FileText,
  Settings,
  ArrowRight,
  Calendar,
  Target,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface AthleteData {
  id: string;
  displayName: string;
  chronologicalAge: number;
  submissions: {
    id: string;
    phenoAge: number;
    ageReduction: number;
    paceOfAging: number;
    submittedAt: string;
  }[];
  badges: {
    id: string;
    badge: {
      id: string;
      name: string;
      icon: string;
    };
  }[];
  leaderboardEntries: {
    rank: number;
    previousRank: number | null;
  }[];
  _count: {
    submissions: number;
  };
}

const quickActions = [
  {
    href: "/submit",
    icon: FileText,
    label: "Submit Biomarkers",
    description: "Upload your latest lab results",
    variant: "primary" as const,
  },
  {
    href: "/athletes",
    icon: Trophy,
    label: "View Leaderboard",
    description: "See where you rank",
    variant: "secondary" as const,
  },
  {
    href: "/settings",
    icon: Settings,
    label: "Settings",
    description: "Manage your profile",
    variant: "ghost" as const,
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [athlete, setAthlete] = useState<AthleteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAthleteData() {
      try {
        const response = await fetch("/api/athletes/me");
        if (response.status === 404) {
          // Redirect to onboarding if no athlete profile
          router.push("/onboarding");
          return;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch athlete data");
        }
        const data = await response.json();
        setAthlete(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchAthleteData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-radial flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (error || !athlete) {
    return (
      <div className="min-h-screen bg-gradient-radial flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-[var(--foreground-secondary)]">{error || "No data available"}</p>
            <Button onClick={() => router.push("/onboarding")} className="mt-4">
              Complete Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Derive computed values from real data
  const latestSubmission = athlete.submissions[0];
  const leaderboardEntry = athlete.leaderboardEntries[0];

  const displayName = athlete.displayName;
  const rank = leaderboardEntry?.rank ?? null;
  const previousRank = leaderboardEntry?.previousRank ?? null;
  const rankChange = previousRank && rank ? previousRank - rank : 0;
  const rankImproved = rankChange > 0;

  const chronologicalAge = athlete.chronologicalAge;
  const biologicalAge = latestSubmission?.phenoAge ?? null;
  const ageReduction = latestSubmission?.ageReduction ?? 0;
  const paceOfAging = latestSubmission?.paceOfAging ?? 1;

  const badges = athlete.badges.map(ab => ({
    id: ab.badge.id,
    name: ab.badge.name,
    icon: ab.badge.icon,
  }));

  const recentSubmissions = athlete.submissions.slice(0, 5).map(s => ({
    date: s.submittedAt,
    phenoAge: s.phenoAge,
    ageReduction: s.ageReduction,
  }));

  return (
    <div className="min-h-screen bg-gradient-radial py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-[var(--foreground)]">
            Welcome back, {displayName}
          </h1>
          <p className="text-[var(--foreground-secondary)] mt-1">
            Here&apos;s your longevity progress at a glance
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Rank */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[var(--foreground-secondary)]">Current Rank</p>
                    <p className="text-3xl font-bold text-[var(--foreground)]">
                      {rank ? `#${rank}` : "—"}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium",
                      rankImproved ? "text-[var(--color-success)]" : "text-[var(--color-error)]"
                    )}
                  >
                    {rankImproved ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(rankChange)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Biological Age */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[var(--foreground-secondary)]">Biological Age</p>
                    <p className="text-3xl font-bold text-[var(--color-primary)]">
                      {biologicalAge !== null ? biologicalAge.toFixed(1) : "—"}
                    </p>
                  </div>
                  <Activity className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <p className="text-xs text-[var(--foreground-muted)] mt-2">
                  Chrono: {chronologicalAge} years
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Age Reduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[var(--foreground-secondary)]">Age Reduction</p>
                    <p className={cn(
                      "text-3xl font-bold",
                      ageReduction > 0 ? "text-[var(--color-success)]" : "text-[var(--color-error)]"
                    )}>
                      {ageReduction > 0 ? "-" : "+"}{Math.abs(ageReduction).toFixed(1)}
                    </p>
                  </div>
                  <Target className="w-5 h-5 text-[var(--color-success)]" />
                </div>
                <p className="text-xs text-[var(--foreground-muted)] mt-2">
                  {ageReduction > 0 ? "years younger" : "years older"}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pace of Aging */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[var(--foreground-secondary)]">Pace of Aging</p>
                    <p className="text-3xl font-bold text-[var(--foreground)]">
                      {(paceOfAging * 100).toFixed(0)}%
                    </p>
                  </div>
                  <Calendar className="w-5 h-5 text-[var(--foreground-muted)]" />
                </div>
                <Progress
                  value={paceOfAging * 100}
                  variant={paceOfAging < 1 ? "success" : "warning"}
                  className="mt-3"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks to manage your competition</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                  <Link key={action.href} href={action.href}>
                    <div
                      className={cn(
                        "p-4 rounded-xl border transition-all cursor-pointer",
                        action.variant === "primary"
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20"
                          : action.variant === "secondary"
                          ? "border-[var(--color-secondary)] bg-[var(--color-secondary)]/10 hover:bg-[var(--color-secondary)]/20"
                          : "border-[var(--border)] hover:border-[var(--border-light)]"
                      )}
                    >
                      <action.icon
                        className={cn(
                          "w-6 h-6 mb-2",
                          action.variant === "primary"
                            ? "text-[var(--color-primary)]"
                            : action.variant === "secondary"
                            ? "text-[var(--color-secondary)]"
                            : "text-[var(--foreground-secondary)]"
                        )}
                      />
                      <p className="font-semibold text-[var(--foreground)]">{action.label}</p>
                      <p className="text-xs text-[var(--foreground-muted)] mt-1">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Your Badges</CardTitle>
                <CardDescription>{badges.length} earned</CardDescription>
              </CardHeader>
              <CardContent>
                {badges.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {badges.map((badge) => (
                      <Badge key={badge.id} variant="default" className="text-base py-2 px-3">
                        <span className="mr-1">{badge.icon}</span>
                        {badge.name}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Submit your first biomarkers to earn badges!
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Submissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Your biomarker submission history</CardDescription>
              </div>
              <Link href="/submit">
                <Button size="sm">
                  New Submission
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentSubmissions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-[var(--foreground-secondary)] border-b border-[var(--border)]">
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">PhenoAge</th>
                        <th className="pb-3 font-medium">Age Reduction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSubmissions.map((submission) => (
                        <tr
                          key={submission.date}
                          className="border-b border-[var(--border)] last:border-0"
                        >
                          <td className="py-4 text-[var(--foreground)]">
                            {new Date(submission.date).toLocaleDateString()}
                          </td>
                          <td className="py-4 text-[var(--color-primary)] font-semibold">
                            {submission.phenoAge.toFixed(1)}
                          </td>
                          <td className="py-4">
                            <span className={cn(
                              "font-semibold",
                              submission.ageReduction > 0 ? "text-[var(--color-success)]" : "text-[var(--color-error)]"
                            )}>
                              {submission.ageReduction > 0 ? "-" : "+"}{Math.abs(submission.ageReduction).toFixed(1)}
                            </span>
                            <span className="text-[var(--foreground-muted)]"> years</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-[var(--foreground-muted)] mb-3" />
                  <p className="text-[var(--foreground-secondary)]">No submissions yet</p>
                  <p className="text-sm text-[var(--foreground-muted)] mt-1">
                    Submit your first biomarkers to see your results here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
