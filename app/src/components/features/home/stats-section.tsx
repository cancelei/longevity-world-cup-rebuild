"use client";

import { motion } from "framer-motion";
import { Building2, Users, Trophy } from "lucide-react";

interface StatsSectionProps {
  leagueCount: number;
  athleteCount: number;
  prizePoolUSD: number;
}

export function StatsSection({ leagueCount, athleteCount, prizePoolUSD }: StatsSectionProps) {
  const displayStats = [
    { label: "Leagues", value: leagueCount.toString(), icon: Building2 },
    { label: "Athletes", value: athleteCount.toString(), icon: Users },
    { label: "Prize Pool", value: `$${prizePoolUSD.toLocaleString()}`, icon: Trophy },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="flex flex-wrap items-center justify-center gap-8 mt-16 px-4"
    >
      {displayStats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[var(--background-card)] border border-[var(--border)]">
            <stat.icon className="h-6 w-6 text-[var(--color-primary)]" />
          </div>
          <div className="text-left">
            <p className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</p>
            <p className="text-sm text-[var(--foreground-secondary)]">{stat.label}</p>
          </div>
        </div>
      ))}
    </motion.div>
  );
}
