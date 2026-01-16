"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Trophy,
  Calendar,
  TrendingDown,
  TrendingUp,
  Award,
  Twitter,
  Instagram,
  Globe,
  BadgeCheck,
  Clock,
  Users,
  Target,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AthleteData {
  id: string;
  displayName: string;
  slug: string;
  profilePicture: string | null;
  bio: string | null;
  birthYear: number;
  chronologicalAge: number;
  division: string;
  generation: string;
  status: string;
  verified: boolean;
  verifiedAt?: string;
  website: string | null;
  twitter: string | null;
  instagram: string | null;
  createdAt: string;
  currentRank: number | null;
  totalAthletes: number;
  badges: {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    category: string;
    earnedAt: string;
  }[];
  submissions: {
    id: string;
    submittedAt: string;
    phenoAge: number;
    ageReduction: number;
    paceOfAging: number;
    albumin: number;
    creatinine: number;
    glucose: number;
    crp: number;
    lymphocytePercent: number;
    mcv: number;
    rdw: number;
    alp: number;
    wbc: number;
    seasonName: string;
    seasonYear: number;
  }[];
  leaderboardHistory: {
    rank: number;
    previousRank: number | null;
    bestAgeReduction: number;
    seasonName: string;
    seasonYear: number;
    seasonStatus: string;
  }[];
  guessMyAgeGame: {
    totalGuesses: number;
    averageGuess: number;
  } | null;
}

interface AthleteProfileClientProps {
  athlete: AthleteData;
}

const generationLabels: Record<string, string> = {
  silent: "Silent Generation",
  boomer: "Baby Boomer",
  genx: "Gen X",
  millennial: "Millennial",
  genz: "Gen Z",
  genalpha: "Gen Alpha",
};

const divisionLabels: Record<string, string> = {
  mens: "Men's Division",
  womens: "Women's Division",
  open: "Open Division",
};

export function AthleteProfileClient({ athlete }: AthleteProfileClientProps) {
  const latestSubmission = athlete.submissions[0];
  const percentile = athlete.currentRank
    ? Math.round((1 - athlete.currentRank / athlete.totalAthletes) * 100)
    : null;

  return (
    <div className="min-h-screen bg-gradient-radial py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Leaderboard
            </Button>
          </Link>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="overflow-hidden">
            <div className="relative h-32 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]">
              {athlete.currentRank && athlete.currentRank <= 3 ? <div className="absolute top-4 right-4">
                  <Trophy
                    className={cn(
                      "w-12 h-12",
                      athlete.currentRank === 1 && "text-yellow-400",
                      athlete.currentRank === 2 && "text-gray-300",
                      athlete.currentRank === 3 && "text-orange-400"
                    )}
                  />
                </div> : null}
            </div>
            <CardContent className="relative pt-0">
              <div className="flex flex-col md:flex-row gap-6 -mt-16">
                {/* Avatar */}
                <Avatar className="w-32 h-32 border-4 border-[var(--background-card)] shadow-lg">
                  <AvatarImage src={athlete.profilePicture || undefined} />
                  <AvatarFallback className="text-3xl">
                    {athlete.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 pt-4 md:pt-8">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h1 className="text-3xl font-display font-bold text-[var(--foreground)]">
                      {athlete.displayName}
                    </h1>
                    {athlete.verified ? <BadgeCheck className="w-6 h-6 text-[var(--color-info)]" /> : null}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="capitalize">
                      {divisionLabels[athlete.division] || athlete.division}
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {generationLabels[athlete.generation] || athlete.generation}
                    </Badge>
                    <Badge variant="muted">Age {athlete.chronologicalAge}</Badge>
                  </div>

                  {athlete.bio ? <p className="text-[var(--foreground-secondary)] mb-4 max-w-2xl">
                      {athlete.bio}
                    </p> : null}

                  {/* Social Links */}
                  <div className="flex gap-3">
                    {athlete.website ? <a
                        href={athlete.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--foreground-muted)] hover:text-[var(--color-primary)] transition-colors"
                      >
                        <Globe className="w-5 h-5" />
                      </a> : null}
                    {athlete.twitter ? <a
                        href={`https://twitter.com/${athlete.twitter.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--foreground-muted)] hover:text-[var(--color-primary)] transition-colors"
                      >
                        <Twitter className="w-5 h-5" />
                      </a> : null}
                    {athlete.instagram ? <a
                        href={`https://instagram.com/${athlete.instagram.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--foreground-muted)] hover:text-[var(--color-primary)] transition-colors"
                      >
                        <Instagram className="w-5 h-5" />
                      </a> : null}
                  </div>
                </div>

                {/* Stats Summary */}
                {latestSubmission ? <div className="flex flex-col items-end gap-2 pt-4 md:pt-8">
                    {athlete.currentRank ? <div className="text-right">
                        <p className="text-sm text-[var(--foreground-muted)]">Current Rank</p>
                        <p className="text-3xl font-bold text-gradient">#{athlete.currentRank}</p>
                        {percentile !== null && (
                          <p className="text-xs text-[var(--foreground-muted)]">
                            Top {100 - percentile}%
                          </p>
                        )}
                      </div> : null}
                  </div> : null}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid */}
        {latestSubmission ? <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-[var(--foreground-muted)] mb-1">Biological Age</p>
                <p className="text-4xl font-bold text-gradient">
                  {latestSubmission.phenoAge.toFixed(1)}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">years</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-[var(--foreground-muted)] mb-1">Age Reduction</p>
                <p
                  className={cn(
                    "text-4xl font-bold",
                    latestSubmission.ageReduction > 0
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-error)]"
                  )}
                >
                  {latestSubmission.ageReduction > 0 ? "-" : "+"}
                  {Math.abs(latestSubmission.ageReduction).toFixed(1)}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">years younger</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-[var(--foreground-muted)] mb-1">Pace of Aging</p>
                <p
                  className={cn(
                    "text-4xl font-bold",
                    latestSubmission.paceOfAging < 1
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-warning)]"
                  )}
                >
                  {(latestSubmission.paceOfAging * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  {latestSubmission.paceOfAging < 1 ? "Aging slower" : "Aging faster"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-[var(--foreground-muted)] mb-1">Submissions</p>
                <p className="text-4xl font-bold text-[var(--foreground)]">
                  {athlete.submissions.length}
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">verified results</p>
              </CardContent>
            </Card>
          </motion.div> : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Latest Biomarkers */}
            {latestSubmission ? <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-[var(--color-primary)]" />
                      Latest Biomarkers
                    </CardTitle>
                    <p className="text-sm text-[var(--foreground-muted)]">
                      Submitted on {new Date(latestSubmission.submittedAt).toLocaleDateString()}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {[
                        { label: "Albumin", value: latestSubmission.albumin, unit: "g/dL" },
                        { label: "Creatinine", value: latestSubmission.creatinine, unit: "mg/dL" },
                        { label: "Glucose", value: latestSubmission.glucose, unit: "mg/dL" },
                        { label: "CRP", value: latestSubmission.crp, unit: "mg/L" },
                        { label: "Lymphocyte %", value: latestSubmission.lymphocytePercent, unit: "%" },
                        { label: "MCV", value: latestSubmission.mcv, unit: "fL" },
                        { label: "RDW", value: latestSubmission.rdw, unit: "%" },
                        { label: "ALP", value: latestSubmission.alp, unit: "U/L" },
                        { label: "WBC", value: latestSubmission.wbc, unit: "K/uL" },
                      ].map((biomarker) => (
                        <div
                          key={biomarker.label}
                          className="p-3 rounded-lg bg-[var(--background-elevated)]"
                        >
                          <p className="text-xs text-[var(--foreground-muted)]">{biomarker.label}</p>
                          <p className="text-lg font-semibold text-[var(--foreground)]">
                            {biomarker.value.toFixed(2)}
                            <span className="text-xs font-normal text-[var(--foreground-muted)] ml-1">
                              {biomarker.unit}
                            </span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div> : null}

            {/* Submission History */}
            {athlete.submissions.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[var(--color-secondary)]" />
                      Submission History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {athlete.submissions.map((submission, index) => (
                        <div
                          key={submission.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg",
                            index === 0
                              ? "bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20"
                              : "bg-[var(--background-elevated)]"
                          )}
                        >
                          <div>
                            <p className="font-medium text-[var(--foreground)]">
                              {submission.seasonName}
                            </p>
                            <p className="text-xs text-[var(--foreground-muted)]">
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[var(--foreground)]">
                              {submission.phenoAge.toFixed(1)} yrs
                            </p>
                            <p
                              className={cn(
                                "text-sm",
                                submission.ageReduction > 0
                                  ? "text-[var(--color-success)]"
                                  : "text-[var(--color-error)]"
                              )}
                            >
                              {submission.ageReduction > 0 ? "-" : "+"}
                              {Math.abs(submission.ageReduction).toFixed(1)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Badges */}
            {athlete.badges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-yellow-500" />
                      Badges ({athlete.badges.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {athlete.badges.map((badge) => (
                        <div
                          key={badge.id}
                          className="p-3 rounded-lg bg-[var(--background-elevated)] text-center group hover:bg-[var(--background-card)] transition-colors"
                          title={badge.description}
                        >
                          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                          </div>
                          <p className="text-sm font-medium text-[var(--foreground)]">
                            {badge.name}
                          </p>
                          <p className="text-xs text-[var(--foreground-muted)] capitalize">
                            {badge.category}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Leaderboard History */}
            {athlete.leaderboardHistory.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-[var(--color-warning)]" />
                      Ranking History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {athlete.leaderboardHistory.map((entry) => (
                        <div
                          key={`${entry.seasonYear}-${entry.rank}`}
                          className="flex items-center justify-between p-3 rounded-lg bg-[var(--background-elevated)]"
                        >
                          <div>
                            <p className="font-medium text-[var(--foreground)]">
                              {entry.seasonName}
                            </p>
                            <Badge
                              variant={entry.seasonStatus === "active" ? "success" : "muted"}
                              className="mt-1 capitalize"
                            >
                              {entry.seasonStatus}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-[var(--foreground)]">
                              #{entry.rank}
                            </p>
                            {entry.previousRank && entry.previousRank !== entry.rank ? <div
                                className={cn(
                                  "flex items-center justify-end text-xs",
                                  entry.previousRank > entry.rank
                                    ? "text-[var(--color-success)]"
                                    : "text-[var(--color-error)]"
                                )}
                              >
                                {entry.previousRank > entry.rank ? (
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                ) : (
                                  <TrendingDown className="w-3 h-3 mr-1" />
                                )}
                                {Math.abs(entry.previousRank - entry.rank)}
                              </div> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Guess My Age Preview */}
            {athlete.guessMyAgeGame ? <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-[var(--color-info)]" />
                      Guess My Age
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-4xl font-bold text-[var(--foreground)] mb-2">
                      {athlete.guessMyAgeGame.averageGuess.toFixed(1)}
                    </p>
                    <p className="text-sm text-[var(--foreground-muted)] mb-4">
                      Average guess from {athlete.guessMyAgeGame.totalGuesses} players
                    </p>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      People think {athlete.displayName.split(" ")[0]} is{" "}
                      <span
                        className={cn(
                          "font-medium",
                          athlete.guessMyAgeGame.averageGuess < athlete.chronologicalAge
                            ? "text-[var(--color-success)]"
                            : "text-[var(--color-warning)]"
                        )}
                      >
                        {Math.abs(
                          athlete.chronologicalAge - athlete.guessMyAgeGame.averageGuess
                        ).toFixed(1)}{" "}
                        years{" "}
                        {athlete.guessMyAgeGame.averageGuess < athlete.chronologicalAge
                          ? "younger"
                          : "older"}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </motion.div> : null}

            {/* Member Since */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[var(--foreground-muted)]" />
                    <div>
                      <p className="text-sm text-[var(--foreground-muted)]">Member since</p>
                      <p className="font-medium text-[var(--foreground)]">
                        {new Date(athlete.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
