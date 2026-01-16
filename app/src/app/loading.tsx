import { PodiumSkeleton, LeaderboardSkeleton, StatsCardSkeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-gradient-radial">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        {/* Podium */}
        <PodiumSkeleton />

        {/* Leaderboard */}
        <div className="mt-8">
          <div className="rounded-xl border border-[var(--border)] overflow-hidden">
            <LeaderboardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
