"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ExtractionSource } from "@/lib/ocr/types";

/**
 * Props for the ExtractionSourceBadge component
 */
interface ExtractionSourceBadgeProps {
  source: ExtractionSource;
  className?: string;
  showLabel?: boolean;
}

/**
 * Configuration for each extraction source type
 */
const SOURCE_CONFIG: Record<ExtractionSource, {
  label: string;
  shortLabel: string;
  variant: 'default' | 'secondary' | 'muted';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = {
  ocr: {
    label: 'Auto-extracted',
    shortLabel: 'OCR',
    variant: 'default',
    icon: ScannerIcon,
    description: 'Automatically extracted from your uploaded document',
  },
  manual: {
    label: 'Manual entry',
    shortLabel: 'Manual',
    variant: 'muted',
    icon: PencilIcon,
    description: 'Manually entered by you',
  },
  ocr_edited: {
    label: 'Edited',
    shortLabel: 'Edited',
    variant: 'secondary',
    icon: PencilScannerIcon,
    description: 'Auto-extracted then manually edited',
  },
};

/**
 * Extraction Source Badge
 * Shows the source of a biomarker value (OCR, manual, or edited)
 */
export function ExtractionSourceBadge({
  source,
  className,
  showLabel = true,
}: ExtractionSourceBadgeProps) {
  const config = SOURCE_CONFIG[source];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn("gap-1", className)}
      title={config.description}
    >
      <Icon className="w-3 h-3" />
      {showLabel ? <span>{config.shortLabel}</span> : null}
    </Badge>
  );
}

/**
 * Extraction source badge with full label
 */
export function ExtractionSourceBadgeFull({
  source,
  className,
}: {
  source: ExtractionSource;
  className?: string;
}) {
  const config = SOURCE_CONFIG[source];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn("gap-1.5", className)}
      title={config.description}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </Badge>
  );
}

/**
 * Inline extraction source indicator (smaller, inline with text)
 */
export function ExtractionSourceInline({
  source,
  className,
}: {
  source: ExtractionSource;
  className?: string;
}) {
  const config = SOURCE_CONFIG[source];
  const Icon = config.icon;

  const colorClasses = {
    default: 'text-[var(--color-primary)]',
    secondary: 'text-[var(--color-secondary)]',
    muted: 'text-[var(--foreground-muted)]',
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs",
        colorClasses[config.variant],
        className
      )}
      title={config.description}
    >
      <Icon className="w-3 h-3" />
    </span>
  );
}

// Icons
function ScannerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 3h2a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round"/>
    </svg>
  );
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PencilScannerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 3h2a2 2 0 0 1 2 2v2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 6l4 4L10 18l-4 1 1-4L14 6z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default ExtractionSourceBadge;
