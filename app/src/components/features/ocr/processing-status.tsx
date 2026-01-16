"use client";

/**
 * OCR Processing Status Component
 * Shows progress during OCR extraction
 */

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle, FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";

type ProcessingStage =
  | "uploading"
  | "converting"
  | "extracting"
  | "analyzing"
  | "complete"
  | "error";

interface ProcessingStatusProps {
  isProcessing: boolean;
  stage?: ProcessingStage;
  progress?: number;
  error?: string | null;
  onRetry?: () => void;
  className?: string;
}

const STAGE_INFO: Record<
  ProcessingStage,
  { label: string; description: string }
> = {
  uploading: {
    label: "Uploading",
    description: "Uploading your lab report...",
  },
  converting: {
    label: "Converting",
    description: "Converting PDF pages to images...",
  },
  extracting: {
    label: "Extracting",
    description: "Running OCR text extraction...",
  },
  analyzing: {
    label: "Analyzing",
    description: "Identifying biomarker values...",
  },
  complete: {
    label: "Complete",
    description: "Extraction complete!",
  },
  error: {
    label: "Error",
    description: "An error occurred during processing",
  },
};

export function ProcessingStatus({
  isProcessing,
  stage = "uploading",
  progress,
  error,
  onRetry,
  className,
}: ProcessingStatusProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Animate progress bar
  useEffect(() => {
    if (progress !== undefined) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  // Auto-progress simulation when no explicit progress
  useEffect(() => {
    if (isProcessing && progress === undefined) {
      const stageProgress: Record<ProcessingStage, number> = {
        uploading: 15,
        converting: 35,
        extracting: 60,
        analyzing: 85,
        complete: 100,
        error: 0,
      };
      const timer = setTimeout(() => {
        setAnimatedProgress(stageProgress[stage] || 0);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isProcessing, stage, progress]);

  const stageInfo = STAGE_INFO[stage];
  const isError = stage === "error";
  const isComplete = stage === "complete";

  if (!isProcessing && !isError && !isComplete) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl border p-4 sm:p-6",
        isError
          ? "border-red-400/30 bg-red-400/5"
          : isComplete
            ? "border-green-400/30 bg-green-400/5"
            : "border-cyan-400/30 bg-cyan-400/5",
        className
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Icon */}
        <div
          className={cn(
            "p-2 sm:p-3 rounded-full flex-shrink-0",
            isError
              ? "bg-red-400/20"
              : isComplete
                ? "bg-green-400/20"
                : "bg-cyan-400/20"
          )}
        >
          {isError ? (
            <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
          ) : isComplete ? (
            <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
          ) : (
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 animate-spin" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "font-semibold mb-1 text-sm sm:text-base",
              isError
                ? "text-red-400"
                : isComplete
                  ? "text-green-400"
                  : "text-white"
            )}
          >
            {stageInfo.label}
          </h3>
          <p className="text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">
            {error || stageInfo.description}
          </p>

          {/* Progress bar */}
          {!isError && (
            <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out",
                  isComplete ? "bg-green-400" : "bg-cyan-400"
                )}
                style={{ width: `${animatedProgress}%` }}
              />
              {!isComplete && (
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"
                  style={{ width: `${animatedProgress}%` }}
                />
              )}
            </div>
          )}

          {/* Progress text */}
          {!isError && (
            <p className="text-gray-500 text-xs mt-2">
              {isComplete
                ? "Ready to review extracted values"
                : `${Math.round(animatedProgress)}% complete`}
            </p>
          )}

          {/* Retry button */}
          {isError && onRetry ? <button
              onClick={onRetry}
              className="mt-3 px-4 py-2 bg-red-400/20 hover:bg-red-400/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button> : null}
        </div>
      </div>

      {/* Processing steps indicator */}
      {isProcessing && !isError ? <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-700/50">
          <div className="flex items-center justify-between text-xs">
            <ProcessingStep
              label="Upload"
              shortLabel="1"
              isActive={stage === "uploading"}
              isComplete={
                ["converting", "extracting", "analyzing", "complete"].includes(
                  stage
                )
              }
            />
            <div className="flex-1 h-0.5 bg-gray-700 mx-1 sm:mx-2" />
            <ProcessingStep
              label="Convert"
              shortLabel="2"
              isActive={stage === "converting"}
              isComplete={["extracting", "analyzing", "complete"].includes(stage)}
            />
            <div className="flex-1 h-0.5 bg-gray-700 mx-1 sm:mx-2" />
            <ProcessingStep
              label="Extract"
              shortLabel="3"
              isActive={stage === "extracting"}
              isComplete={["analyzing", "complete"].includes(stage)}
            />
            <div className="flex-1 h-0.5 bg-gray-700 mx-1 sm:mx-2" />
            <ProcessingStep
              label="Analyze"
              shortLabel="4"
              isActive={stage === "analyzing"}
              isComplete={stage === "complete"}
            />
          </div>
        </div> : null}
    </div>
  );
}

function ProcessingStep({
  label,
  shortLabel,
  isActive,
  isComplete,
}: {
  label: string;
  shortLabel: string;
  isActive: boolean;
  isComplete: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-colors",
          isComplete
            ? "bg-cyan-400 text-gray-900"
            : isActive
              ? "bg-cyan-400/30 text-cyan-400"
              : "bg-gray-700 text-gray-500"
        )}
      >
        {isComplete ? (
          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
        ) : isActive ? (
          <FileSearch className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        ) : (
          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-current" />
        )}
      </div>
      {/* Show full label on sm+, short label on mobile */}
      <span
        className={cn(
          "transition-colors text-[10px] sm:text-xs",
          isComplete || isActive ? "text-gray-300" : "text-gray-500"
        )}
      >
        <span className="hidden sm:inline">{label}</span>
        <span className="sm:hidden">{shortLabel}</span>
      </span>
    </div>
  );
}
