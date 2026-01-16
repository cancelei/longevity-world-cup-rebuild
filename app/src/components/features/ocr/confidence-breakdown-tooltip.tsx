"use client";

import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ConfidenceBreakdownDetailed, ConfidenceFactorDetail } from "@/lib/ocr/types";

/**
 * Props for the ConfidenceBreakdownTooltip component
 */
interface ConfidenceBreakdownTooltipProps {
  breakdown: ConfidenceBreakdownDetailed;
  children: React.ReactNode;
  className?: string;
}

/**
 * Factor display names for UI
 */
const FACTOR_LABELS: Record<keyof ConfidenceBreakdownDetailed['factors'], string> = {
  nameMatchQuality: 'Name Match',
  valueInRange: 'Value Range',
  unitRecognized: 'Unit',
  contextClarity: 'Context',
  ocrConfidence: 'OCR Quality',
};

/**
 * Factor descriptions for tooltips
 */
const FACTOR_DESCRIPTIONS: Record<keyof ConfidenceBreakdownDetailed['factors'], string> = {
  nameMatchQuality: 'How closely text matched biomarker names',
  valueInRange: 'Whether value falls within medical ranges',
  unitRecognized: 'Whether a unit was found',
  contextClarity: 'How clearly value was isolated',
  ocrConfidence: 'Text recognition confidence',
};

/**
 * Get color variant based on score
 */
function getScoreColor(score: number): 'success' | 'warning' | 'error' | 'default' {
  if (score >= 0.8) return 'success';
  if (score >= 0.5) return 'warning';
  if (score >= 0.3) return 'default';
  return 'error';
}

/**
 * Get color class based on score
 */
function getScoreColorClass(score: number): string {
  if (score >= 0.8) return 'text-[var(--color-success)]';
  if (score >= 0.5) return 'text-[var(--color-warning)]';
  if (score >= 0.3) return 'text-orange-500';
  return 'text-[var(--color-error)]';
}

/**
 * Individual factor row with progress bar
 */
function FactorRow({
  label,
  detail,
  description
}: {
  label: string;
  detail: ConfidenceFactorDetail;
  description: string;
}) {
  const percentage = Math.round(detail.score * 100);
  const colorVariant = getScoreColor(detail.score);
  const colorClass = getScoreColorClass(detail.score);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--foreground-secondary)]" title={description}>
          {label}
        </span>
        <span className={cn("font-medium", colorClass)}>
          {percentage}%
        </span>
      </div>
      <Progress value={percentage} variant={colorVariant} className="h-1.5" />
      <p className="text-[10px] text-[var(--foreground-muted)] leading-tight">
        {detail.explanation}
      </p>
      {detail.suggestion ? <p className="text-[10px] text-[var(--color-warning)] leading-tight italic">
          {detail.suggestion}
        </p> : null}
    </div>
  );
}

/**
 * Confidence Breakdown Tooltip
 * Shows detailed breakdown of confidence factors when hovering over a confidence indicator
 */
export function ConfidenceBreakdownTooltip({
  breakdown,
  children,
  className,
}: ConfidenceBreakdownTooltipProps) {
  const overallPercentage = Math.round(breakdown.overall * 100);
  const levelColors = {
    high: 'text-[var(--color-success)]',
    medium: 'text-[var(--color-warning)]',
    low: 'text-orange-500',
    none: 'text-[var(--color-error)]',
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild className={className}>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          className="w-72 p-0"
        >
          <div className="p-3 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <span className="text-sm font-semibold text-[var(--foreground)]">
                Confidence Breakdown
              </span>
              <span className={cn(
                "text-sm font-bold",
                levelColors[breakdown.level]
              )}>
                {overallPercentage}% {breakdown.level}
              </span>
            </div>

            {/* Factor bars */}
            <div className="space-y-3">
              {(Object.keys(breakdown.factors) as Array<keyof typeof breakdown.factors>).map((key) => (
                <FactorRow
                  key={key}
                  label={FACTOR_LABELS[key]}
                  detail={breakdown.factors[key]}
                  description={FACTOR_DESCRIPTIONS[key]}
                />
              ))}
            </div>

            {/* Actionable suggestions */}
            {breakdown.actionableSuggestions.length > 0 && (
              <div className="border-t border-[var(--border)] pt-2 mt-2">
                <p className="text-[10px] font-medium text-[var(--foreground-secondary)] mb-1">
                  Suggestions:
                </p>
                <ul className="space-y-1">
                  {breakdown.actionableSuggestions.map((suggestion, i) => (
                    <li
                      key={i}
                      className="text-[10px] text-[var(--foreground-muted)] flex items-start gap-1"
                    >
                      <span className="text-[var(--color-primary)]">-</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Confidence indicator badge that shows the breakdown on click/hover
 */
export function ConfidenceIndicator({
  breakdown,
  size = 'default',
  className,
}: {
  breakdown: ConfidenceBreakdownDetailed;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) {
  const percentage = Math.round(breakdown.overall * 100);

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    default: 'text-sm px-2 py-1',
    lg: 'text-base px-2.5 py-1.5',
  };

  const levelColors = {
    high: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20',
    medium: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20',
    low: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    none: 'bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20',
  };

  return (
    <ConfidenceBreakdownTooltip breakdown={breakdown}>
      <button
        type="button"
        className={cn(
          "inline-flex items-center gap-1 rounded-full border font-medium cursor-help transition-colors hover:opacity-80",
          sizeClasses[size],
          levelColors[breakdown.level],
          className
        )}
      >
        <ConfidenceIcon level={breakdown.level} size={size} />
        <span>{percentage}%</span>
      </button>
    </ConfidenceBreakdownTooltip>
  );
}

/**
 * Icon for confidence level
 */
function ConfidenceIcon({
  level,
  size
}: {
  level: 'high' | 'medium' | 'low' | 'none';
  size: 'sm' | 'default' | 'lg';
}) {
  const iconSizes = {
    sm: 'w-3 h-3',
    default: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const iconClass = iconSizes[size];

  switch (level) {
    case 'high':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    case 'medium':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round"/>
          <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round"/>
        </svg>
      );
    case 'low':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round"/>
          <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round"/>
        </svg>
      );
    case 'none':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round"/>
          <line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round"/>
        </svg>
      );
  }
}

export default ConfidenceBreakdownTooltip;
