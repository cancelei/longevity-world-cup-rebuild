import { type NextWebVitalsMetric } from "next/app";

// Web Vitals thresholds for performance monitoring
const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 }, // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 }, // First Input Delay
  CLS: { good: 0.1, needsImprovement: 0.25 }, // Cumulative Layout Shift
  FCP: { good: 1800, needsImprovement: 3000 }, // First Contentful Paint
  TTFB: { good: 800, needsImprovement: 1800 }, // Time to First Byte
  INP: { good: 200, needsImprovement: 500 }, // Interaction to Next Paint
};

type MetricName = keyof typeof THRESHOLDS;

function getRating(name: MetricName, value: number): "good" | "needs-improvement" | "poor" {
  const threshold = THRESHOLDS[name];
  if (!threshold) return "good";

  if (value <= threshold.good) return "good";
  if (value <= threshold.needsImprovement) return "needs-improvement";
  return "poor";
}

/**
 * Report Web Vitals metrics
 * In production, this could send to an analytics service
 */
export function reportWebVitals(metric: NextWebVitalsMetric) {
  const { name, value, id } = metric;

  // Only log in development, send to analytics in production
  if (process.env.NODE_ENV === "development") {
    const rating = getRating(name as MetricName, value);
    const color =
      rating === "good" ? "\x1b[32m" : rating === "needs-improvement" ? "\x1b[33m" : "\x1b[31m";
    const reset = "\x1b[0m";

    console.log(
      `${color}[Web Vitals]${reset} ${name}: ${value.toFixed(2)} (${rating})`
    );
  }

  // In production, send to analytics
  // Example: send to Google Analytics 4
  if (typeof window !== "undefined" && "gtag" in window) {
    const gtag = (window as typeof window & { gtag: (...args: unknown[]) => void }).gtag;
    gtag("event", name, {
      event_category: "Web Vitals",
      event_label: id,
      value: Math.round(name === "CLS" ? value * 1000 : value),
      non_interaction: true,
    });
  }

  // Or send to a custom analytics endpoint
  // if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
  //   fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
  //     method: "POST",
  //     body: JSON.stringify({ name, value, id, rating: getRating(name as MetricName, value) }),
  //     headers: { "Content-Type": "application/json" },
  //   }).catch(() => {});
  // }
}

/**
 * Performance observer for custom metrics
 */
export function observePerformance() {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
    return;
  }

  // Observe long tasks (tasks > 50ms that block the main thread)
  try {
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[Performance] Long task detected: ${entry.duration.toFixed(2)}ms`,
            entry
          );
        }
      }
    });
    longTaskObserver.observe({ entryTypes: ["longtask"] });
  } catch {
    // longtask not supported in all browsers
  }

  // Observe resource timing for slow resources
  try {
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resourceEntry = entry as PerformanceResourceTiming;
        // Log resources that take > 1s to load
        if (resourceEntry.duration > 1000) {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `[Performance] Slow resource: ${resourceEntry.name} (${resourceEntry.duration.toFixed(2)}ms)`
            );
          }
        }
      }
    });
    resourceObserver.observe({ entryTypes: ["resource"] });
  } catch {
    // resource timing not supported in all browsers
  }
}
