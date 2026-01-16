"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LeaderboardEntry } from "@/types";

interface PodiumProps {
  entries: LeaderboardEntry[];
  prizePool?: {
    first: number;
    second: number;
    third: number;
    currency: string;
  };
  onAthleteClick?: (athleteId: string) => void;
}

const podiumConfig = [
  {
    position: 2,
    label: "2nd",
    icon: Medal,
    height: "h-32",
    bgGradient: "from-gray-400 to-gray-500",
    iconColor: "text-gray-300",
    badgeVariant: "silver" as const,
    delay: 0.2,
  },
  {
    position: 1,
    label: "1st",
    icon: Trophy,
    height: "h-44",
    bgGradient: "from-yellow-400 to-amber-500",
    iconColor: "text-yellow-300",
    badgeVariant: "gold" as const,
    delay: 0,
  },
  {
    position: 3,
    label: "3rd",
    icon: Award,
    height: "h-24",
    bgGradient: "from-orange-600 to-orange-700",
    iconColor: "text-orange-300",
    badgeVariant: "bronze" as const,
    delay: 0.4,
  },
];

export function Podium({ entries, prizePool, onAthleteClick }: PodiumProps) {
  // Reorder entries to match podium display (2nd, 1st, 3rd)
  const orderedEntries = [entries[1], entries[0], entries[2]].filter(Boolean);

  return (
    <div className="w-full py-12">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl md:text-4xl font-display font-bold text-center mb-12 text-gradient"
      >
        Top Athletes
      </motion.h2>

      <div className="flex items-end justify-center gap-4 md:gap-8 max-w-4xl mx-auto px-4">
        {podiumConfig.map((config, index) => {
          const entry = orderedEntries[index];
          if (!entry) return null;

          const Icon = config.icon;

          return (
            <motion.div
              key={config.position}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: config.delay, duration: 0.5 }}
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => onAthleteClick?.(entry.athlete.id)}
            >
              {/* Athlete Info */}
              <div className="flex flex-col items-center mb-4">
                <div className="relative mb-3">
                  <Avatar size="xl" className={cn(
                    "border-4",
                    config.position === 1 ? "border-yellow-400" :
                    config.position === 2 ? "border-gray-400" : "border-orange-500"
                  )}>
                    <AvatarImage src={entry.athlete.profilePicture} />
                    <AvatarFallback>
                      {entry.athlete.displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Badge
                    variant={config.badgeVariant}
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3"
                  >
                    {config.label}
                  </Badge>
                </div>

                <h3 className="font-semibold text-lg text-center text-[var(--foreground)]">
                  {entry.athlete.displayName}
                </h3>

                <div className="text-center mt-1">
                  <p className="text-2xl font-bold text-[var(--color-primary)]">
                    -{entry.bestAgeReduction.toFixed(1)} years
                  </p>
                  <p className="text-xs text-[var(--foreground-secondary)]">
                    Biological Age: {entry.latestSubmission.phenoAge.toFixed(1)}
                  </p>
                </div>

                {prizePool ? <div className="mt-2 text-sm font-medium text-[var(--color-secondary)]">
                    {config.position === 1 && `$${prizePool.first.toLocaleString()}`}
                    {config.position === 2 && `$${prizePool.second.toLocaleString()}`}
                    {config.position === 3 && `$${prizePool.third.toLocaleString()}`}
                  </div> : null}
              </div>

              {/* Podium Stand */}
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: config.delay + 0.3, duration: 0.4 }}
                style={{ transformOrigin: "bottom" }}
                className={cn(
                  "w-24 md:w-32 rounded-t-xl flex items-start justify-center pt-4",
                  config.height,
                  `bg-gradient-to-b ${config.bgGradient}`
                )}
              >
                <Icon className={cn("w-8 h-8 md:w-10 md:h-10", config.iconColor)} />
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
