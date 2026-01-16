import { Skeleton, SkeletonCard, StatsCardSkeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Pending Submissions */}
          <div className="lg:col-span-2 space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-1">
            <SkeletonCard className="h-96" />
          </div>
        </div>
      </div>
    </div>
  );
}
