"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import type { LeagueLeaderboardEntry } from "@/types";

interface PodiumSectionProps {
  entries: LeagueLeaderboardEntry[];
  prizeDistribution: {
    first: number;
    second: number;
    third: number;
  };
}

export function PodiumSection({ entries, prizeDistribution }: PodiumSectionProps) {
  const router = useRouter();

  const handleLeagueClick = (leagueSlug: string) => {
    router.push(`/leagues/${leagueSlug}`);
  };

  if (entries.length < 3) {
    return null;
  }

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-end justify-center gap-4 md:gap-8">
          {/* Second Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="order-1 md:order-1"
          >
            <Card
              variant="elevated"
              className="w-[160px] md:w-[200px] cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => handleLeagueClick(entries[1].league.slug)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">🥈</div>
                <p className="font-semibold text-sm truncate">{entries[1].league.name}</p>
                <p className="text-lg font-bold text-[var(--color-success)]">
                  -{entries[1].avgAgeReduction.toFixed(1)} yrs
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  ${Math.round(prizeDistribution.second).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* First Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="order-0 md:order-2"
          >
            <Card
              variant="elevated"
              className="w-[180px] md:w-[240px] border-yellow-400/50 cursor-pointer hover:border-yellow-400 transition-colors"
              onClick={() => handleLeagueClick(entries[0].league.slug)}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-2">🏆</div>
                <p className="font-bold truncate">{entries[0].league.name}</p>
                <p className="text-2xl font-bold text-[var(--color-success)]">
                  -{entries[0].avgAgeReduction.toFixed(1)} yrs
                </p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  ${Math.round(prizeDistribution.first).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Third Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="order-2 md:order-3"
          >
            <Card
              variant="elevated"
              className="w-[160px] md:w-[200px] cursor-pointer hover:border-orange-500 transition-colors"
              onClick={() => handleLeagueClick(entries[2].league.slug)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">🥉</div>
                <p className="font-semibold text-sm truncate">{entries[2].league.name}</p>
                <p className="text-lg font-bold text-[var(--color-success)]">
                  -{entries[2].avgAgeReduction.toFixed(1)} yrs
                </p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  ${Math.round(prizeDistribution.third).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
