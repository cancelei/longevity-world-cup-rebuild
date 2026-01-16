"use client";

import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/ui/skeleton";

// Lazy load chart components to reduce initial bundle size
// recharts is a heavy library (~150KB) that shouldn't block initial page load

export const LazyPhenoAgeChart = dynamic(
  () => import("./biomarker-chart").then((mod) => ({ default: mod.PhenoAgeChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const LazyBiomarkerTrendChart = dynamic(
  () => import("./biomarker-chart").then((mod) => ({ default: mod.BiomarkerTrendChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

export const LazyZScoreChart = dynamic(
  () => import("./biomarker-chart").then((mod) => ({ default: mod.ZScoreChart })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);
