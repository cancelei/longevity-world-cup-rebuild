"use client";

import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, Sparkles, Search, Building2, Users, MapPin } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { LeagueLeaderboardEntry, LeagueType, LeagueTier } from "@/types";

interface LeagueLeaderboardTableProps {
  entries: LeagueLeaderboardEntry[];
  showFilters?: boolean;
  onLeagueClick?: (leagueSlug: string) => void;
}

const leagueTypes: { value: LeagueType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "CLINIC", label: "Clinics" },
  { value: "CORPORATE", label: "Corporate" },
  { value: "COLLECTIVE", label: "Collectives" },
  { value: "GEOGRAPHIC", label: "Geographic" },
  { value: "CUSTOM", label: "Custom" },
];

const leagueTiers: { value: LeagueTier | "all"; label: string }[] = [
  { value: "all", label: "All Tiers" },
  { value: "ENTERPRISE", label: "Enterprise" },
  { value: "PRO", label: "Pro" },
  { value: "STARTER", label: "Starter" },
  { value: "FREE", label: "Free" },
];

const typeIcons: Record<LeagueType, string> = {
  CLINIC: "🏥",
  CORPORATE: "🏢",
  COLLECTIVE: "👥",
  GEOGRAPHIC: "🌍",
  CUSTOM: "⭐",
};

const tierColors: Record<LeagueTier, string> = {
  FREE: "text-gray-400",
  STARTER: "text-blue-400",
  PRO: "text-purple-400",
  ENTERPRISE: "text-yellow-400",
};

export function LeagueLeaderboardTable({
  entries,
  showFilters = true,
  onLeagueClick,
}: LeagueLeaderboardTableProps) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<LeagueType | "all">("all");
  const [selectedTier, setSelectedTier] = useState<LeagueTier | "all">("all");

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch = entry.league.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesType =
      selectedType === "all" || entry.league.type === selectedType;
    const matchesTier =
      selectedTier === "all" || entry.league.tier === selectedTier;
    return matchesSearch && matchesType && matchesTier;
  });

  return (
    <div className="w-full">
      {/* Filters */}
      {showFilters ? <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-muted)]" />
            <Input
              placeholder="Search leagues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as LeagueType | "all")}
              className="h-10 px-3 rounded-lg bg-[var(--background-card)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:border-[var(--color-primary)] focus:outline-none"
            >
              {leagueTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value as LeagueTier | "all")}
              className="h-10 px-3 rounded-lg bg-[var(--background-card)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:border-[var(--color-primary)] focus:outline-none"
            >
              {leagueTiers.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div> : null}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full">
          <thead className="bg-[var(--background-elevated)]">
            <tr className="text-left text-sm text-[var(--foreground-secondary)]">
              <th className="px-4 py-3 font-medium">Rank</th>
              <th className="px-4 py-3 font-medium">League</th>
              <th className="px-4 py-3 font-medium text-right">Avg Age Reduction</th>
              <th className="px-4 py-3 font-medium text-right hidden md:table-cell">Members</th>
              <th className="px-4 py-3 font-medium text-right hidden lg:table-cell">Best Individual</th>
              <th className="px-4 py-3 font-medium text-center hidden sm:table-cell">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredEntries.map((entry, index) => (
              <motion.tr
                key={entry.league.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onLeagueClick?.(entry.league.slug)}
                className={cn(
                  "hover:bg-[var(--background-card)] transition-colors cursor-pointer",
                  entry.rank <= 3 && "bg-[var(--background-card)]/50"
                )}
              >
                {/* Rank */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-bold text-lg",
                        entry.rank === 1 && "text-yellow-400",
                        entry.rank === 2 && "text-gray-400",
                        entry.rank === 3 && "text-orange-500"
                      )}
                    >
                      #{entry.rank}
                    </span>
                    {entry.rankChange !== undefined && entry.rankChange !== 0 && (
                      <span
                        className={cn(
                          "flex items-center text-xs",
                          entry.rankChange > 0 ? "rank-up" : "rank-down"
                        )}
                      >
                        {entry.rankChange > 0 ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )}
                        {Math.abs(entry.rankChange)}
                      </span>
                    )}
                    {entry.isNew ? <Sparkles className="h-4 w-4 text-[var(--color-info)]" /> : null}
                  </div>
                </td>

                {/* League */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--background-elevated)] flex items-center justify-center text-xl">
                      {entry.league.logo ? (
                        <img
                          src={entry.league.logo}
                          alt={entry.league.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        typeIcons[entry.league.type]
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--foreground)]">
                        {entry.league.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                        {entry.league.city && entry.league.country ? <>
                            <MapPin className="h-3 w-3" />
                            {entry.league.city}, {entry.league.country}
                          </> : null}
                        {!entry.league.city && entry.league.country ? <>
                            <MapPin className="h-3 w-3" />
                            {entry.league.country}
                          </> : null}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Avg Age Reduction */}
                <td className="px-4 py-4 text-right">
                  <span
                    className={cn(
                      "font-bold text-lg",
                      entry.avgAgeReduction > 0
                        ? "text-[var(--color-success)]"
                        : "text-[var(--color-error)]"
                    )}
                  >
                    {entry.avgAgeReduction > 0 ? "-" : "+"}
                    {Math.abs(entry.avgAgeReduction).toFixed(1)}
                  </span>
                  <span className="text-sm text-[var(--foreground-secondary)]"> yrs</span>
                </td>

                {/* Members */}
                <td className="px-4 py-4 text-right hidden md:table-cell">
                  <div className="flex items-center justify-end gap-1">
                    <Users className="h-4 w-4 text-[var(--foreground-muted)]" />
                    <span className="text-[var(--foreground)]">
                      {entry.activeMembers}/{entry.totalMembers}
                    </span>
                  </div>
                </td>

                {/* Best Individual */}
                <td className="px-4 py-4 text-right hidden lg:table-cell">
                  <span className="text-[var(--color-success)]">
                    -{entry.bestIndividual.toFixed(1)} yrs
                  </span>
                </td>

                {/* Type */}
                <td className="px-4 py-4 text-center hidden sm:table-cell">
                  <Badge variant="outline" className={cn("capitalize", tierColors[entry.league.tier])}>
                    {entry.league.type.toLowerCase()}
                  </Badge>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-[var(--foreground-muted)] mb-4" />
          <p className="text-[var(--foreground-secondary)]">No leagues found</p>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Create or join a league to compete as a team
          </p>
        </div>
      )}
    </div>
  );
}
