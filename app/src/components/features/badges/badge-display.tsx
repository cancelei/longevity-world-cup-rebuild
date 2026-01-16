"use client";

import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  Star,
  Flame,
  Heart,
  Zap,
  Award,
  Crown,
  Target,
  TrendingUp,
  Users,
  Calendar,
  Sparkles,
  Shield,
  Rocket,
  BadgeCheck,
  Clock,
  ChartLine,
  UserPlus,
  Building2,
  Swords,
  Activity,
  Beaker,
  FlaskConical,
  Microscope,
  TestTube,
  Dna,
  HeartPulse,
  Brain,
  Droplets,
  Snowflake,
  Sun,
  Gift,
  PartyPopper,
  Lightbulb,
  MessageSquare,
  FileSearch,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Badge Category Types
 *
 * Categories for organizing badges:
 * - ACHIEVEMENT: Completing specific actions
 * - MILESTONE: Reaching quantitative goals
 * - COMPETITION: Ranking-based achievements
 * - COMMUNITY: Social and helping others
 * - SPECIAL: Rare/unique achievements
 * - LEAGUE: Team-based achievements
 * - BIOMARKER: Specific biomarker excellence
 * - IMPROVEMENT: Progress tracking
 * - SEASONAL: Time-limited events
 * - SCIENCE: Research contribution
 */
export type BadgeCategory =
  | "ACHIEVEMENT"
  | "MILESTONE"
  | "COMPETITION"
  | "COMMUNITY"
  | "SPECIAL"
  | "LEAGUE"
  | "BIOMARKER"
  | "IMPROVEMENT"
  | "SEASONAL"
  | "SCIENCE";

interface Badge {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  earnedAt?: Date;
}

interface BadgeDisplayProps {
  badge: Badge;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  animated?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // Original icons
  trophy: Trophy,
  medal: Medal,
  star: Star,
  flame: Flame,
  heart: Heart,
  zap: Zap,
  award: Award,
  crown: Crown,
  target: Target,
  trending: TrendingUp,
  users: Users,
  calendar: Calendar,
  sparkles: Sparkles,
  // Extended icons for new badges
  shield: Shield,
  rocket: Rocket,
  "badge-check": BadgeCheck,
  clock: Clock,
  "clock-rewind": Clock,
  "chart-line": ChartLine,
  "user-plus": UserPlus,
  building: Building2,
  swords: Swords,
  activity: Activity,
  beaker: Beaker,
  flask: FlaskConical,
  microscope: Microscope,
  "test-tube": TestTube,
  dna: Dna,
  "heart-pulse": HeartPulse,
  brain: Brain,
  droplets: Droplets,
  snowflake: Snowflake,
  sun: Sun,
  gift: Gift,
  party: PartyPopper,
  "calendar-check": Calendar,
  lightbulb: Lightbulb,
  message: MessageSquare,
  "file-search": FileSearch,
  database: Database,
};

const categoryColors: Record<BadgeCategory, { bg: string; border: string; text: string }> = {
  // Original categories
  ACHIEVEMENT: {
    bg: "bg-amber-500/20",
    border: "border-amber-500/50",
    text: "text-amber-500",
  },
  MILESTONE: {
    bg: "bg-blue-500/20",
    border: "border-blue-500/50",
    text: "text-blue-500",
  },
  COMPETITION: {
    bg: "bg-purple-500/20",
    border: "border-purple-500/50",
    text: "text-purple-500",
  },
  COMMUNITY: {
    bg: "bg-green-500/20",
    border: "border-green-500/50",
    text: "text-green-500",
  },
  SPECIAL: {
    bg: "bg-gradient-to-br from-pink-500/20 to-yellow-500/20",
    border: "border-pink-500/50",
    text: "text-pink-500",
  },
  // New categories
  LEAGUE: {
    bg: "bg-indigo-500/20",
    border: "border-indigo-500/50",
    text: "text-indigo-500",
  },
  BIOMARKER: {
    bg: "bg-teal-500/20",
    border: "border-teal-500/50",
    text: "text-teal-500",
  },
  IMPROVEMENT: {
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/50",
    text: "text-emerald-500",
  },
  SEASONAL: {
    bg: "bg-orange-500/20",
    border: "border-orange-500/50",
    text: "text-orange-500",
  },
  SCIENCE: {
    bg: "bg-cyan-500/20",
    border: "border-cyan-500/50",
    text: "text-cyan-500",
  },
};

const sizeConfig = {
  sm: { container: "w-8 h-8", icon: "w-4 h-4" },
  md: { container: "w-12 h-12", icon: "w-6 h-6" },
  lg: { container: "w-16 h-16", icon: "w-8 h-8" },
};

export const BadgeDisplay = memo(function BadgeDisplay({
  badge,
  size = "md",
  showTooltip = true,
  animated = true,
}: BadgeDisplayProps) {
  const Icon = iconMap[badge.icon] || Award;
  const colors = categoryColors[badge.category];
  const sizes = sizeConfig[size];

  const badgeContent = (
    <motion.div
      initial={animated ? { scale: 0, rotate: -180 } : undefined}
      animate={animated ? { scale: 1, rotate: 0 } : undefined}
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className={cn(
        "relative rounded-full flex items-center justify-center border-2",
        sizes.container,
        colors.bg,
        colors.border
      )}
    >
      <Icon className={cn(sizes.icon, colors.text)} />
      {badge.category === "SPECIAL" && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(236, 72, 153, 0)",
              "0 0 0 8px rgba(236, 72, 153, 0.2)",
              "0 0 0 0 rgba(236, 72, 153, 0)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold text-[var(--foreground)]">{badge.name}</p>
            <p className="text-sm text-[var(--foreground-muted)]">{badge.description}</p>
            {badge.earnedAt ? <p className="text-xs text-[var(--foreground-secondary)]">
                Earned {new Date(badge.earnedAt).toLocaleDateString()}
              </p> : null}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
});

interface BadgeGridProps {
  badges: Badge[];
  size?: "sm" | "md" | "lg";
  maxDisplay?: number;
  className?: string;
}

export const BadgeGrid = memo(function BadgeGrid({
  badges,
  size = "md",
  maxDisplay,
  className,
}: BadgeGridProps) {
  const displayBadges = useMemo(
    () => (maxDisplay ? badges.slice(0, maxDisplay) : badges),
    [badges, maxDisplay]
  );
  const hiddenCount = maxDisplay ? Math.max(0, badges.length - maxDisplay) : 0;

  if (badges.length === 0) {
    return (
      <div className={cn("text-sm text-[var(--foreground-muted)]", className)}>
        No badges earned yet
      </div>
    );
  }

  return (
    <div className={cn("flex flex-wrap gap-2 items-center", className)}>
      {displayBadges.map((badge, index) => (
        <motion.div
          key={badge.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <BadgeDisplay badge={badge} size={size} />
        </motion.div>
      ))}
      {hiddenCount > 0 && (
        <span className="text-sm text-[var(--foreground-muted)] ml-1">
          +{hiddenCount} more
        </span>
      )}
    </div>
  );
});

interface BadgeShowcaseProps {
  badges: Badge[];
  title?: string;
  className?: string;
}

export const BadgeShowcase = memo(function BadgeShowcase({
  badges,
  title = "Badges",
  className,
}: BadgeShowcaseProps) {
  // Group badges by category - memoized to prevent recalculation
  const grouped = useMemo(
    () =>
      badges.reduce(
        (acc, badge) => {
          if (!acc[badge.category]) {
            acc[badge.category] = [];
          }
          acc[badge.category].push(badge);
          return acc;
        },
        {} as Record<Badge["category"], Badge[]>
      ),
    [badges]
  );

  const categoryLabels: Record<BadgeCategory, string> = {
    ACHIEVEMENT: "Achievements",
    MILESTONE: "Milestones",
    COMPETITION: "Competition",
    COMMUNITY: "Community",
    SPECIAL: "Special",
    LEAGUE: "League",
    BIOMARKER: "Biomarker",
    IMPROVEMENT: "Improvement",
    SEASONAL: "Seasonal",
    SCIENCE: "Science",
  };

  return (
    <div className={cn("space-y-6", className)}>
      <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
      {Object.entries(grouped).map(([category, categoryBadges]) => (
        <div key={category} className="space-y-3">
          <h4 className="text-sm font-medium text-[var(--foreground-secondary)]">
            {categoryLabels[category as Badge["category"]]}
          </h4>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {categoryBadges.map((badge) => (
              <BadgeDisplay key={badge.id} badge={badge} size="lg" />
            ))}
          </div>
        </div>
      ))}
      {badges.length === 0 && (
        <div className="text-center py-8 text-[var(--foreground-muted)]">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No badges earned yet</p>
          <p className="text-sm mt-1">Complete challenges to earn badges!</p>
        </div>
      )}
    </div>
  );
});

interface BadgeEarnedNotificationProps {
  badge: Badge;
  onClose?: () => void;
}

export const BadgeEarnedNotification = memo(function BadgeEarnedNotification({
  badge,
  onClose,
}: BadgeEarnedNotificationProps) {
  const Icon = iconMap[badge.icon] || Award;
  const colors = categoryColors[badge.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="bg-[var(--background-card)] border border-[var(--border)] rounded-xl p-4 shadow-xl max-w-sm">
        <div className="flex items-start gap-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center border-2",
              colors.bg,
              colors.border
            )}
          >
            <Icon className={cn("w-7 h-7", colors.text)} />
          </motion.div>
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-500">
                  Badge Earned!
                </span>
              </div>
              <h4 className="font-semibold text-[var(--foreground)] mt-1">
                {badge.name}
              </h4>
              <p className="text-sm text-[var(--foreground-muted)] mt-1">
                {badge.description}
              </p>
            </motion.div>
          </div>
          {onClose ? <button
              onClick={onClose}
              className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              ×
            </button> : null}
        </div>
      </div>
    </motion.div>
  );
});
