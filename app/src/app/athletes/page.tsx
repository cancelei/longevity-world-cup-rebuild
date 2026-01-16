"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Filter, Users, ChevronDown, Loader2, Trophy, Clock, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Athlete {
  id: string;
  displayName: string;
  slug: string;
  profilePicture: string | null;
  bio: string | null;
  division: string;
  generation: string;
  status: string;
  verified: boolean;
  chronologicalAge: number;
  latestPhenoAge: number | null;
  ageReduction: number | null;
  rank: number | null;
  badgeCount: number;
}

interface AthleteApiResponse {
  data: Athlete[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
}

const divisions = ["All", "MENS", "WOMENS", "OPEN"];
const generations = ["All", "SILENT", "BOOMER", "GENX", "MILLENNIAL", "GENZ", "GENALPHA"];

const generationLabels: Record<string, string> = {
  SILENT: "Silent Gen",
  BOOMER: "Boomer",
  GENX: "Gen X",
  MILLENNIAL: "Millennial",
  GENZ: "Gen Z",
  GENALPHA: "Gen Alpha",
};

const divisionLabels: Record<string, string> = {
  MENS: "Men's",
  WOMENS: "Women's",
  OPEN: "Open",
};

export default function AthletesPage() {
  const router = useRouter();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("All");
  const [selectedGeneration, setSelectedGeneration] = useState("All");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchAthletes();
  }, [selectedDivision, selectedGeneration, page]);

  async function fetchAthletes() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "12",
        status: "VERIFIED",
      });

      if (selectedDivision !== "All") {
        params.set("division", selectedDivision);
      }
      if (selectedGeneration !== "All") {
        params.set("generation", selectedGeneration);
      }
      if (searchQuery) {
        params.set("search", searchQuery);
      }

      const response = await fetch(`/api/athletes?${params}`);
      const data: AthleteApiResponse = await response.json();

      if (data.data) {
        setAthletes(page === 1 ? data.data : [...athletes, ...data.data]);
        setHasMore(data.pagination.hasMore);
        setTotalCount(data.pagination.totalCount);
      }
    } catch (error) {
      console.error("Failed to fetch athletes:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAthletes();
  };

  const handleAthleteClick = (slug: string) => {
    router.push(`/athletes/${slug}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-radial py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            <span className="text-gradient">Athletes</span>
          </h1>
          <p className="text-lg text-[var(--foreground-secondary)] max-w-2xl mx-auto">
            Meet the competitors pushing the boundaries of biological age reversal
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-4 md:p-6">
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-muted)]" />
                  <input
                    type="text"
                    placeholder="Search athletes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                {/* Division Filter */}
                <div className="relative">
                  <select
                    value={selectedDivision}
                    onChange={(e) => {
                      setSelectedDivision(e.target.value);
                      setPage(1);
                    }}
                    className="appearance-none w-full md:w-40 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
                  >
                    {divisions.map((div) => (
                      <option key={div} value={div}>
                        {div === "All" ? "All Divisions" : divisionLabels[div] || div}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-muted)] pointer-events-none" />
                </div>

                {/* Generation Filter */}
                <div className="relative">
                  <select
                    value={selectedGeneration}
                    onChange={(e) => {
                      setSelectedGeneration(e.target.value);
                      setPage(1);
                    }}
                    className="appearance-none w-full md:w-44 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
                  >
                    {generations.map((gen) => (
                      <option key={gen} value={gen}>
                        {gen === "All" ? "All Generations" : generationLabels[gen] || gen}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-muted)] pointer-events-none" />
                </div>

                <Button type="submit" variant="secondary">
                  <Filter className="h-4 w-4 mr-2" />
                  Apply
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 mb-6"
        >
          <Users className="h-4 w-4 text-[var(--foreground-muted)]" />
          <span className="text-sm text-[var(--foreground-secondary)]">
            {totalCount} verified athletes
          </span>
        </motion.div>

        {/* Athletes Grid */}
        {loading && page === 1 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
          </div>
        ) : athletes.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {athletes.map((athlete, index) => (
                <motion.div
                  key={athlete.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    variant="elevated"
                    className="cursor-pointer h-full hover:border-[var(--color-primary)]/50 transition-colors"
                    onClick={() => handleAthleteClick(athlete.slug)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar size="lg">
                          {athlete.profilePicture ? (
                            <AvatarImage src={athlete.profilePicture} alt={athlete.displayName} />
                          ) : null}
                          <AvatarFallback>{getInitials(athlete.displayName)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-[var(--foreground)] truncate">
                              {athlete.displayName}
                            </h3>
                            {athlete.verified ? <Badge variant="success">
                                Verified
                              </Badge> : null}
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="outline">
                              {divisionLabels[athlete.division] || athlete.division}
                            </Badge>
                            <Badge variant="outline">
                              {generationLabels[athlete.generation] || athlete.generation}
                            </Badge>
                          </div>

                          {athlete.bio ? <p className="text-sm text-[var(--foreground-secondary)] line-clamp-2 mb-4">
                              {athlete.bio}
                            </p> : null}

                          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--border)]">
                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-xs text-[var(--foreground-muted)] mb-1">
                                <Clock className="h-3 w-3" />
                                <span>Age</span>
                              </div>
                              <span className="text-sm font-medium text-[var(--foreground)]">
                                {athlete.chronologicalAge}
                              </span>
                            </div>

                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-xs text-[var(--foreground-muted)] mb-1">
                                <Activity className="h-3 w-3" />
                                <span>Reduction</span>
                              </div>
                              <span
                                className={`text-sm font-medium ${
                                  athlete.ageReduction && athlete.ageReduction > 0
                                    ? "text-[var(--color-success)]"
                                    : "text-[var(--foreground)]"
                                }`}
                              >
                                {athlete.ageReduction
                                  ? `${athlete.ageReduction > 0 ? "+" : ""}${athlete.ageReduction.toFixed(1)}y`
                                  : "N/A"}
                              </span>
                            </div>

                            <div className="text-center">
                              <div className="flex items-center justify-center gap-1 text-xs text-[var(--foreground-muted)] mb-1">
                                <Trophy className="h-3 w-3" />
                                <span>Rank</span>
                              </div>
                              <span className="text-sm font-medium text-[var(--foreground)]">
                                {athlete.rank ? `#${athlete.rank}` : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
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
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Load More Athletes
                </Button>
              </div> : null}
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-[var(--foreground-muted)] mb-4" />
              <p className="text-[var(--foreground-secondary)]">No athletes found matching your criteria.</p>
              <Button
                className="mt-4"
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDivision("All");
                  setSelectedGeneration("All");
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
