"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[var(--background-elevated)]",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonText({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-4 w-full", className)} />;
}

export function SkeletonCircle({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-10 w-10 rounded-full", className)} />;
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-xl border border-[var(--border)] p-6 space-y-4", className)}>
      <div className="flex items-center gap-3">
        <SkeletonCircle className="h-12 w-12" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

export function LeaderboardRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-[var(--border)]">
      <Skeleton className="h-8 w-8" />
      <SkeletonCircle className="h-12 w-12" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <div className="space-y-2 text-right">
        <Skeleton className="h-5 w-16 ml-auto" />
        <Skeleton className="h-3 w-12 ml-auto" />
      </div>
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 10 }).map((_, i) => (
        <LeaderboardRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function AthleteCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--border)] overflow-hidden">
      <Skeleton className="h-24 w-full" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <SkeletonCircle className="h-16 w-16 -mt-12 border-4 border-[var(--background-card)]" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function PodiumSkeleton() {
  return (
    <div className="flex items-end justify-center gap-4 md:gap-8 py-12">
      {[32, 44, 24].map((height, i) => (
        <div key={i} className="flex flex-col items-center">
          <SkeletonCircle className="h-16 w-16 mb-3" />
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-6 w-16 mb-4" />
          <Skeleton className={`w-24 md:w-32 rounded-t-xl h-${height}`} />
        </div>
      ))}
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--border)] p-6">
      <Skeleton className="h-3 w-1/2 mb-3" />
      <Skeleton className="h-10 w-2/3 mb-1" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}

const chartBarHeights = [65, 45, 78, 52, 88, 42, 72, 58, 82, 48, 68, 55];

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--border)] p-6">
      <Skeleton className="h-5 w-1/3 mb-6" />
      <div className="h-[300px] flex items-end justify-around gap-2">
        {chartBarHeights.map((height, i) => (
          <Skeleton
            key={i}
            className="w-full"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Hero */}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden">
        <Skeleton className="h-32 w-full" />
        <div className="p-6 -mt-16">
          <div className="flex flex-col md:flex-row gap-6">
            <SkeletonCircle className="h-32 w-32 border-4 border-[var(--background-card)]" />
            <div className="flex-1 pt-8 space-y-3">
              <Skeleton className="h-8 w-1/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
