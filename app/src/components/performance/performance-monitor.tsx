"use client";

import { useEffect } from "react";
import { useReportWebVitals } from "next/web-vitals";
import { reportWebVitals, observePerformance } from "@/lib/web-vitals";

/**
 * Performance monitoring component
 * Add this to your root layout to track Web Vitals and performance metrics
 */
export function PerformanceMonitor() {
  // Report Web Vitals using Next.js hook
  useReportWebVitals(reportWebVitals);

  useEffect(() => {
    // Set up additional performance observers
    observePerformance();
  }, []);

  return null;
}
