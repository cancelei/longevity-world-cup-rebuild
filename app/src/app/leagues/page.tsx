"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  Search,
  Plus,
  Users,
  Trophy,
  MapPin,
  Filter,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { League, LeagueType, LeagueTier } from "@/types";

interface LeagueWithStats extends League {
  memberCount: number;
  leaderboardEntry?: {
    rank: number;
    avgAgeReduction: number;
  } | null;
}

interface LeaguesApiResponse {
  data: LeagueWithStats[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
}

const leagueTypes: { value: LeagueType | "all"; label: string; icon: string }[] = [
  { value: "all", label: "All Types", icon: "🏆" },
  { value: "CLINIC", label: "Clinics", icon: "🏥" },
  { value: "CORPORATE", label: "Corporate", icon: "🏢" },
  { value: "COLLECTIVE", label: "Collectives", icon: "👥" },
  { value: "GEOGRAPHIC", label: "Geographic", icon: "🌍" },
  { value: "CUSTOM", label: "Custom", icon: "⭐" },
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
  FREE: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  STARTER: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PRO: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  ENTERPRISE: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

export default function LeaguesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [leagues, setLeagues] = useState<LeagueWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedType, setSelectedType] = useState<LeagueType | "all">(
    (searchParams.get("type") as LeagueType) || "all"
  );
  const [selectedTier, setSelectedTier] = useState<LeagueTier | "all">(
    (searchParams.get("tier") as LeagueTier) || "all"
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchLeagues();
  }, [selectedType, selectedTier, page]);

  async function fetchLeagues() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "12");
      params.set("status", "ACTIVE");
      if (selectedType !== "all") params.set("type", selectedType);
      if (selectedTier !== "all") params.set("tier", selectedTier);
      if (search) params.set("search", search);

      const response = await fetch(`/api/leagues?${params}`);
      const data: LeaguesApiResponse = await response.json();

      if (page === 1) {
        setLeagues(data.data);
      } else {
        setLeagues((prev) => [...prev, ...data.data]);
      }
      setHasMore(data.pagination.hasMore);
      setTotalCount(data.pagination.totalCount);
    } catch (error) {
      console.error("Failed to fetch leagues:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchLeagues();
  }

  function handleTypeChange(type: LeagueType | "all") {
    setSelectedType(type);
    setPage(1);
  }

  function handleTierChange(tier: LeagueTier | "all") {
    setSelectedTier(tier);
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-gradient-radial py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-[var(--foreground)]">
              Longevity Leagues
            </h1>
            <p className="text-[var(--foreground-secondary)] mt-2">
              {totalCount} leagues competing for biological age reversal
            </p>
          </div>
          <Button size="lg" onClick={() => router.push("/leagues/new")}>
            <Plus className="mr-2 h-5 w-5" />
            Create League
          </Button>
        </div>

        {/* Filters */}
        <Card variant="elevated" className="mb-8">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col gap-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-muted)]" />
                  <Input
                    placeholder="Search leagues..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" variant="secondary">
                  Search
                </Button>
              </form>

              {/* Type filters */}
              <div className="flex flex-wrap gap-2">
                {leagueTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={selectedType === type.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTypeChange(type.value)}
                  >
                    <span className="mr-1">{type.icon}</span>
                    {type.label}
                  </Button>
                ))}
              </div>

              {/* Tier filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[var(--foreground-muted)]" />
                <select
                  value={selectedTier}
                  onChange={(e) => handleTierChange(e.target.value as LeagueTier | "all")}
                  className="h-9 px-3 rounded-lg bg-[var(--background-card)] border border-[var(--border)] text-sm text-[var(--foreground)] focus:border-[var(--color-primary)] focus:outline-none"
                >
                  {leagueTiers.map((tier) => (
                    <option key={tier.value} value={tier.value}>
                      {tier.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* League Grid */}
        {loading && page === 1 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
          </div>
        ) : leagues.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leagues.map((league, index) => (
                <motion.div
                  key={league.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    variant="elevated"
                    className="h-full cursor-pointer hover:border-[var(--color-primary)]/50 transition-colors"
                    onClick={() => router.push(`/leagues/${league.slug}`)}
                  >
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-[var(--background-elevated)] flex items-center justify-center text-2xl shrink-0">
                          {league.logo ? (
                            <img
                              src={league.logo}
                              alt={league.name}
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            typeIcons[league.type]
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[var(--foreground)] truncate">
                            {league.name}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                            {league.city && league.country ? (
                              <>
                                <MapPin className="h-3 w-3" />
                                {league.city}, {league.country}
                              </>
                            ) : league.country ? (
                              <>
                                <MapPin className="h-3 w-3" />
                                {league.country}
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {league.description ? <p className="text-sm text-[var(--foreground-secondary)] line-clamp-2 mb-4">
                          {league.description}
                        </p> : null}

                      {/* Stats */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-sm">
                            <Users className="h-4 w-4 text-[var(--foreground-muted)]" />
                            <span className="text-[var(--foreground)]">
                              {league.memberCount}
                            </span>
                          </div>
                          {league.leaderboardEntry ? <div className="flex items-center gap-1 text-sm">
                              <Trophy className="h-4 w-4 text-yellow-400" />
                              <span className="text-[var(--foreground)]">
                                #{league.leaderboardEntry.rank}
                              </span>
                            </div> : null}
                        </div>
                        {league.leaderboardEntry ? <span className="text-[var(--color-success)] font-semibold">
                            -{league.leaderboardEntry.avgAgeReduction.toFixed(1)} yrs
                          </span> : null}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={tierColors[league.tier]}
                          >
                            {league.tier}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {league.type.toLowerCase()}
                          </Badge>
                        </div>
                        <ArrowRight className="h-4 w-4 text-[var(--foreground-muted)]" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            {hasMore ? <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Load More
                </Button>
              </div> : null}
          </>
        ) : (
          <Card>
            <CardContent className="py-20 text-center">
              <Building2 className="h-16 w-16 mx-auto text-[var(--foreground-muted)] mb-4" />
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                No leagues found
              </h3>
              <p className="text-[var(--foreground-secondary)] mb-6">
                {search || selectedType !== "all" || selectedTier !== "all"
                  ? "Try adjusting your filters or search query"
                  : "Be the first to create a league!"}
              </p>
              <Button onClick={() => router.push("/leagues/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Create a League
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
