"use client";

/**
 * OCR Review Panel Component
 * Shows extracted biomarker values with confidence indicators
 * Allows editing before final submission
 */

import { useState, useCallback, useMemo, memo } from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Edit2,
  RotateCcw,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BIOMARKER_RANGES } from "@/lib/phenoage";
import type { BiomarkerKey, BiomarkerExtraction, ExtractionSource } from "@/lib/ocr/types";
import { generateDetailedConfidenceBreakdown } from "@/lib/ocr/confidence-scorer";
import { ConfidenceIndicator } from "./confidence-breakdown-tooltip";
import { ExtractionSourceInline } from "./extraction-source-badge";
import { RawTextPreviewButton } from "./raw-text-preview";
import { LowConfidenceSuggestions } from "./low-confidence-suggestions";

interface ReviewPanelProps {
  extractions: Record<BiomarkerKey, BiomarkerExtraction>;
  onValueChange: (biomarker: BiomarkerKey, value: number | null) => void;
  onAcceptAll: () => void;
  onRetry: () => void;
  className?: string;
  /** Optional: Track which values have been manually edited */
  modifiedFields?: Set<BiomarkerKey>;
}

const BIOMARKER_LABELS: Record<BiomarkerKey, string> = {
  albumin: "Albumin",
  creatinine: "Creatinine",
  glucose: "Glucose (Fasting)",
  crp: "C-Reactive Protein",
  lymphocytePercent: "Lymphocyte %",
  mcv: "MCV",
  rdw: "RDW",
  alp: "Alkaline Phosphatase",
  wbc: "White Blood Cells",
};

const BIOMARKER_ORDER: BiomarkerKey[] = [
  "albumin",
  "creatinine",
  "glucose",
  "crp",
  "lymphocytePercent",
  "mcv",
  "rdw",
  "alp",
  "wbc",
];

export const ReviewPanel = memo(function ReviewPanel({
  extractions,
  onValueChange,
  onAcceptAll,
  onRetry,
  className,
  modifiedFields = new Set(),
}: ReviewPanelProps) {
  const [editingField, setEditingField] = useState<BiomarkerKey | null>(null);
  const [localModified, setLocalModified] = useState<Set<BiomarkerKey>>(new Set(modifiedFields));

  // Count extractions by confidence level - memoized to prevent recalculation
  const stats = useMemo(() => {
    const result = {
      high: 0,
      medium: 0,
      low: 0,
      missing: 0,
    };

    BIOMARKER_ORDER.forEach((key) => {
      const ext = extractions[key];
      if (ext.value === null) {
        result.missing++;
      } else if (ext.confidence >= 0.8) {
        result.high++;
      } else if (ext.confidence >= 0.5) {
        result.medium++;
      } else {
        result.low++;
      }
    });

    return result;
  }, [extractions]);

  const allValid = stats.missing === 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Summary header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-gray-800/50 rounded-xl border border-gray-700">
        <div>
          <h3 className="text-white font-semibold text-sm sm:text-base mb-1">Extraction Results</h3>
          <p className="text-gray-400 text-xs sm:text-sm">
            {stats.high > 0 && (
              <span className="text-green-400">{stats.high} high confidence</span>
            )}
            {stats.medium > 0 && (
              <>
                {stats.high > 0 && ", "}
                <span className="text-yellow-400">{stats.medium} medium</span>
              </>
            )}
            {stats.low > 0 && (
              <>
                {(stats.high > 0 || stats.medium > 0) && ", "}
                <span className="text-orange-400">{stats.low} low</span>
              </>
            )}
            {stats.missing > 0 && (
              <>
                {(stats.high > 0 || stats.medium > 0 || stats.low > 0) && ", "}
                <span className="text-red-400">{stats.missing} not found</span>
              </>
            )}
          </p>
        </div>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Re-scan
        </button>
      </div>

      {/* Biomarker values grid */}
      <div className="grid gap-3">
        {BIOMARKER_ORDER.map((biomarker) => {
          const wasModified = localModified.has(biomarker);
          const extraction = extractions[biomarker];
          const source: ExtractionSource = extraction.value === null
            ? 'manual'
            : wasModified
              ? 'ocr_edited'
              : 'ocr';

          return (
            <BiomarkerRow
              key={biomarker}
              biomarker={biomarker}
              extraction={extraction}
              source={source}
              isEditing={editingField === biomarker}
              onEdit={() => setEditingField(biomarker)}
              onSave={(value) => {
                onValueChange(biomarker, value);
                setLocalModified((prev) => new Set(prev).add(biomarker));
                setEditingField(null);
              }}
              onCancel={() => setEditingField(null)}
            />
          );
        })}
      </div>

      {/* Missing values warning with helpful guidance */}
      {stats.missing > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-amber-500/20 flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-amber-400 mb-1">
                {stats.missing} biomarker{stats.missing > 1 ? "s" : ""} not found
              </h4>
              <p className="text-sm text-gray-400 mb-3">
                Our OCR couldn&apos;t find {stats.missing === 1 ? "this value" : "these values"} in your lab report.
                Please enter {stats.missing === 1 ? "it" : "them"} manually by tapping the edit button.
              </p>
              <div className="flex flex-wrap gap-2">
                {BIOMARKER_ORDER.filter((key) => extractions[key].value === null).map((key) => (
                  <span
                    key={key}
                    className="px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-md"
                  >
                    {BIOMARKER_LABELS[key]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accept button */}
      <div className="pt-4 border-t border-gray-700">
        <button
          onClick={onAcceptAll}
          disabled={!allValid}
          className={cn(
            "w-full py-3 rounded-xl font-semibold transition-all",
            allValid
              ? "bg-cyan-500 hover:bg-cyan-400 text-gray-900"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          )}
        >
          {allValid ? (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Accept & Continue
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Fill in {stats.missing} missing value{stats.missing > 1 ? "s" : ""} above to continue
            </span>
          )}
        </button>
        {allValid && (
          <p className="text-center text-xs text-gray-500 mt-2">
            You can still edit values on the next screen
          </p>
        )}
      </div>
    </div>
  );
});

interface BiomarkerRowProps {
  biomarker: BiomarkerKey;
  extraction: BiomarkerExtraction;
  source: ExtractionSource;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (value: number | null) => void;
  onCancel: () => void;
}

const BiomarkerRow = memo(function BiomarkerRow({
  biomarker,
  extraction,
  source,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}: BiomarkerRowProps) {
  const [inputValue, setInputValue] = useState(
    extraction.value?.toString() || ""
  );

  const range = BIOMARKER_RANGES[biomarker];
  const label = BIOMARKER_LABELS[biomarker];
  const hasValue = extraction.value !== null;
  const confidence = extraction.confidence;

  // Generate detailed confidence breakdown for tooltip
  const confidenceBreakdown = generateDetailedConfidenceBreakdown(extraction);

  const handleSave = useCallback(() => {
    const parsed = parseFloat(inputValue);
    onSave(isNaN(parsed) ? null : parsed);
  }, [inputValue, onSave]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSave();
      } else if (e.key === "Escape") {
        onCancel();
      }
    },
    [handleSave, onCancel]
  );

  // Determine confidence indicator
  let _ConfidenceIcon = XCircle;
  let confidenceColor = "text-red-400";
  let bgColor = "bg-red-400/10";
  let borderColor = "border-red-400/30";

  if (hasValue) {
    if (confidence >= 0.8) {
      _ConfidenceIcon = CheckCircle;
      confidenceColor = "text-green-400";
      bgColor = "bg-green-400/10";
      borderColor = "border-green-400/30";
    } else if (confidence >= 0.5) {
      _ConfidenceIcon = AlertTriangle;
      confidenceColor = "text-yellow-400";
      bgColor = "bg-yellow-400/10";
      borderColor = "border-yellow-400/30";
    } else {
      _ConfidenceIcon = AlertTriangle;
      confidenceColor = "text-orange-400";
      bgColor = "bg-orange-400/10";
      borderColor = "border-orange-400/30";
    }
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-colors",
          bgColor,
          borderColor
        )}
      >
        {/* Confidence indicator with breakdown tooltip */}
        <div className="flex-shrink-0">
          {hasValue ? (
            <ConfidenceIndicator breakdown={confidenceBreakdown} size="sm" />
          ) : (
            <div className={cn("flex-shrink-0", confidenceColor)}>
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          )}
        </div>

        {/* Label and value */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <span className="text-white font-medium text-sm sm:text-base">{label}</span>
            <span className="text-gray-500 text-xs sm:text-sm">{range.unit}</span>
            {/* Source indicator */}
            {hasValue && source !== 'manual' ? <ExtractionSourceInline source={source} /> : null}
          </div>

          {isEditing ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                step="0.01"
                min={range.min}
                max={range.max}
                placeholder={`${range.optimal.min} - ${range.optimal.max}`}
                className="flex-1 px-3 py-2 sm:py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-cyan-400 focus:outline-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 bg-cyan-500 hover:bg-cyan-400 text-gray-900 rounded-lg text-sm font-medium transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={onCancel}
                  className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {hasValue ? (
                <span className="text-gray-300 text-base sm:text-lg font-mono">
                  {extraction.value?.toFixed(2)}
                </span>
              ) : (
                <span className="text-red-400 text-xs sm:text-sm italic">Not found - tap to enter</span>
              )}
              {/* Raw text preview link */}
              {extraction.rawText ? <RawTextPreviewButton extraction={extraction} /> : null}
            </div>
          )}
        </div>

        {/* Edit button */}
        {!isEditing && (
          <button
            onClick={onEdit}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors active:bg-gray-600"
            title="Edit value"
            aria-label={`Edit ${label} value`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}

        {/* Help tooltip - hidden on mobile to save space, info shown inline */}
        <div className="flex-shrink-0 group relative hidden sm:block">
          <HelpCircle className="w-4 h-4 text-gray-500" />
          <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
            <p>
              <span className="text-gray-400">Normal range:</span>{" "}
              {range.optimal.min} - {range.optimal.max} {range.unit}
            </p>
            <p className="mt-1">
              <span className="text-gray-400">Valid:</span> {range.min} -{" "}
              {range.max} {range.unit}
            </p>
          </div>
        </div>
      </div>

      {/* Low confidence suggestions (shown below the row when confidence is low) */}
      {!isEditing && hasValue && confidence < 0.5 ? <LowConfidenceSuggestions
          breakdown={confidenceBreakdown}
          compact
          className="ml-10 sm:ml-12"
        /> : null}
    </div>
  );
});
