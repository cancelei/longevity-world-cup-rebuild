"use client";

import * as React from "react";
import { Modal, ModalContent, ModalHeader, ModalTitle } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { BiomarkerExtraction } from "@/lib/ocr/types";

/**
 * Props for the RawTextPreview component
 */
interface RawTextPreviewProps {
  extraction: BiomarkerExtraction;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Highlight patterns in raw text
 */
function highlightText(
  rawText: string,
  value: number | null,
  unit: string | null
): React.ReactNode[] {
  if (!rawText) {
    return [<span key="empty" className="text-[var(--foreground-muted)] italic">No text extracted</span>];
  }

  // Split text into segments for highlighting
  let text = rawText;
  const segments: React.ReactNode[] = [];
  let key = 0;

  // Find and highlight the numeric value
  if (value !== null) {
    const valueStr = String(value);
    const valueIndex = text.indexOf(valueStr);

    if (valueIndex !== -1) {
      // Text before value
      if (valueIndex > 0) {
        segments.push(
          <span key={key++}>{text.substring(0, valueIndex)}</span>
        );
      }

      // Highlighted value
      segments.push(
        <span
          key={key++}
          className="bg-cyan-500/30 text-cyan-300 px-0.5 rounded font-semibold"
          title="Extracted value"
        >
          {valueStr}
        </span>
      );

      text = text.substring(valueIndex + valueStr.length);
    }
  }

  // Find and highlight the unit
  if (unit) {
    const unitLower = unit.toLowerCase();
    const textLower = text.toLowerCase();
    const unitIndex = textLower.indexOf(unitLower);

    if (unitIndex !== -1) {
      // Text before unit
      if (unitIndex > 0) {
        segments.push(
          <span key={key++}>{text.substring(0, unitIndex)}</span>
        );
      }

      // Highlighted unit
      segments.push(
        <span
          key={key++}
          className="bg-green-500/30 text-green-300 px-0.5 rounded"
          title="Detected unit"
        >
          {text.substring(unitIndex, unitIndex + unit.length)}
        </span>
      );

      text = text.substring(unitIndex + unit.length);
    }
  }

  // Remaining text
  if (text) {
    segments.push(<span key={key++}>{text}</span>);
  }

  return segments.length > 0 ? segments : [<span key="raw">{rawText}</span>];
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Raw Text Preview Modal
 * Shows the raw OCR text with highlighted extracted values
 */
export function RawTextPreview({
  extraction,
  isOpen,
  onClose,
}: RawTextPreviewProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(extraction.rawText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent size="lg">
        <ModalHeader>
          <div className="flex items-center justify-between w-full pr-8">
            <ModalTitle>Raw OCR Text</ModalTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="text-xs"
            >
              {copied ? (
                <>
                  <CopyCheckIcon className="w-3 h-3 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <CopyIcon className="w-3 h-3 mr-1" />
                  Copy text
                </>
              )}
            </Button>
          </div>
        </ModalHeader>

        <div className="p-6 pt-0 space-y-4">
          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
            <span>Page {extraction.pageNumber}</span>
            <span>Line {extraction.lineNumber >= 0 ? extraction.lineNumber : 'N/A'}</span>
            <span>Biomarker: {extraction.biomarker}</span>
          </div>

          {/* Raw text display */}
          <div className="relative">
            <pre className={cn(
              "p-4 rounded-lg bg-[var(--background-elevated)] border border-[var(--border)]",
              "font-mono text-sm leading-relaxed whitespace-pre-wrap break-words",
              "text-[var(--foreground-secondary)]",
              "max-h-64 overflow-y-auto"
            )}>
              {highlightText(extraction.rawText, extraction.value, extraction.unit)}
            </pre>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-cyan-500/30" />
              <span>Extracted value</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-500/30" />
              <span>Detected unit</span>
            </div>
          </div>

          {/* Extraction summary */}
          <div className="p-3 rounded-lg bg-[var(--background-card)] border border-[var(--border)]">
            <h4 className="text-sm font-medium text-[var(--foreground)] mb-2">
              Extraction Result
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-[var(--foreground-muted)]">Value:</span>
                <span className="ml-2 font-mono text-[var(--foreground)]">
                  {extraction.value !== null ? extraction.value : 'Not found'}
                </span>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)]">Unit:</span>
                <span className="ml-2 font-mono text-[var(--foreground)]">
                  {extraction.unit || 'Not found'}
                </span>
              </div>
              <div>
                <span className="text-[var(--foreground-muted)]">Confidence:</span>
                <span className="ml-2 font-mono text-[var(--foreground)]">
                  {Math.round(extraction.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}

/**
 * Button to open raw text preview
 */
export function RawTextPreviewButton({
  extraction,
  className,
}: {
  extraction: BiomarkerExtraction;
  className?: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!extraction.rawText) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "text-xs text-[var(--color-primary)] hover:underline cursor-pointer",
          className
        )}
        title="View raw OCR text"
      >
        View source
      </button>
      <RawTextPreview
        extraction={extraction}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

// Icons
function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CopyCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default RawTextPreview;
