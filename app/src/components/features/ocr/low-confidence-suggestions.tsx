"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { ConfidenceBreakdownDetailed, ConfidenceFactorDetail } from "@/lib/ocr/types";

/**
 * Props for the LowConfidenceSuggestions component
 */
interface LowConfidenceSuggestionsProps {
  breakdown: ConfidenceBreakdownDetailed;
  className?: string;
  compact?: boolean;
}

/**
 * Factor labels for display
 */
const FACTOR_LABELS: Record<keyof ConfidenceBreakdownDetailed['factors'], string> = {
  nameMatchQuality: 'Name Match',
  valueInRange: 'Value Range',
  unitRecognized: 'Unit Recognition',
  contextClarity: 'Context Clarity',
  ocrConfidence: 'OCR Quality',
};

/**
 * Get the worst performing factors (below 0.7 threshold)
 */
function getLowScoringFactors(
  factors: ConfidenceBreakdownDetailed['factors']
): Array<{
  key: keyof ConfidenceBreakdownDetailed['factors'];
  label: string;
  detail: ConfidenceFactorDetail;
}> {
  return (Object.entries(factors) as Array<[keyof typeof factors, ConfidenceFactorDetail]>)
    .filter(([, detail]) => detail.score < 0.7 && detail.suggestion)
    .sort(([, a], [, b]) => a.score - b.score)
    .map(([key, detail]) => ({
      key,
      label: FACTOR_LABELS[key],
      detail,
    }));
}

/**
 * Low Confidence Suggestions
 * Shows inline suggestions when confidence is below threshold
 */
export function LowConfidenceSuggestions({
  breakdown,
  className,
  compact = false,
}: LowConfidenceSuggestionsProps) {
  const lowFactors = getLowScoringFactors(breakdown.factors);

  // Don't show anything if confidence is good
  if (breakdown.level === 'high' || lowFactors.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <CompactSuggestions
        lowFactors={lowFactors}
        className={className}
      />
    );
  }

  return (
    <DetailedSuggestions
      lowFactors={lowFactors}
      actionableSuggestions={breakdown.actionableSuggestions}
      className={className}
    />
  );
}

/**
 * Compact view - just shows icons and brief hints
 */
function CompactSuggestions({
  lowFactors,
  className,
}: {
  lowFactors: Array<{
    key: keyof ConfidenceBreakdownDetailed['factors'];
    label: string;
    detail: ConfidenceFactorDetail;
  }>;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      <WarningIcon className="w-3.5 h-3.5 text-[var(--color-warning)] flex-shrink-0" />
      <span className="text-[var(--foreground-muted)]">
        {lowFactors.length === 1
          ? `Low ${lowFactors[0].label.toLowerCase()}`
          : `${lowFactors.length} issues detected`}
      </span>
    </div>
  );
}

/**
 * Detailed view - shows all suggestions with explanations
 */
function DetailedSuggestions({
  lowFactors,
  actionableSuggestions,
  className,
}: {
  lowFactors: Array<{
    key: keyof ConfidenceBreakdownDetailed['factors'];
    label: string;
    detail: ConfidenceFactorDetail;
  }>;
  actionableSuggestions: string[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "p-3 rounded-lg border",
        "bg-[var(--color-warning)]/5 border-[var(--color-warning)]/20",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <WarningIcon className="w-4 h-4 text-[var(--color-warning)]" />
        <span className="text-sm font-medium text-[var(--color-warning)]">
          Low Confidence Detection
        </span>
      </div>

      {/* Factor-specific issues */}
      <div className="space-y-2 mb-3">
        {lowFactors.map(({ key, label, detail }) => (
          <FactorIssue key={key} label={label} detail={detail} />
        ))}
      </div>

      {/* Actionable suggestions */}
      {actionableSuggestions.length > 0 && (
        <div className="border-t border-[var(--color-warning)]/20 pt-2 mt-2">
          <p className="text-xs font-medium text-[var(--foreground-secondary)] mb-1">
            Suggestions to improve:
          </p>
          <ul className="space-y-1">
            {actionableSuggestions.map((suggestion, i) => (
              <li
                key={i}
                className="text-xs text-[var(--foreground-muted)] flex items-start gap-2"
              >
                <LightbulbIcon className="w-3 h-3 text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Individual factor issue row
 */
function FactorIssue({
  label,
  detail,
}: {
  label: string;
  detail: ConfidenceFactorDetail;
}) {
  const percentage = Math.round(detail.score * 100);

  return (
    <div className="text-xs">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-[var(--foreground-secondary)] font-medium">
          {label}
        </span>
        <span className={cn(
          "font-mono",
          detail.score < 0.3 ? "text-[var(--color-error)]" : "text-orange-500"
        )}>
          {percentage}%
        </span>
      </div>
      <p className="text-[var(--foreground-muted)] leading-relaxed">
        {detail.explanation}
      </p>
    </div>
  );
}

/**
 * Inline suggestion for a single field
 */
export function InlineSuggestion({
  suggestion,
  className,
}: {
  suggestion: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-1.5 text-xs text-[var(--color-warning)]",
        className
      )}
    >
      <LightbulbIcon className="w-3 h-3 flex-shrink-0 mt-0.5" />
      <span>{suggestion}</span>
    </div>
  );
}

/**
 * Warning banner for very low confidence
 */
export function VeryLowConfidenceWarning({
  breakdown,
  biomarkerName,
  className,
}: {
  breakdown: ConfidenceBreakdownDetailed;
  biomarkerName: string;
  className?: string;
}) {
  if (breakdown.level !== 'none' && breakdown.level !== 'low') {
    return null;
  }

  return (
    <div
      className={cn(
        "p-2 rounded-md border",
        "bg-[var(--color-error)]/5 border-[var(--color-error)]/20",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <AlertIcon className="w-4 h-4 text-[var(--color-error)]" />
        <span className="text-xs text-[var(--color-error)]">
          Could not reliably extract {biomarkerName}. Please enter manually.
        </span>
      </div>
    </div>
  );
}

// Icons
function WarningIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round"/>
      <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round"/>
    </svg>
  );
}

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 18h6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10 22h4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 2a7 7 0 0 0-4 12.9V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.1A7 7 0 0 0 12 2z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round"/>
      <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round"/>
    </svg>
  );
}

export default LowConfidenceSuggestions;
