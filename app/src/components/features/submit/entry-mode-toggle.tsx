"use client";

import { Sparkles, PenLine, Zap, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EntryMode } from "./types";

interface EntryModeToggleProps {
  mode: EntryMode;
  onModeChange: (mode: EntryMode) => void;
}

export function EntryModeToggle({ mode, onModeChange }: EntryModeToggleProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* OCR Option - Recommended */}
        <button
          onClick={() => onModeChange("ocr")}
          className={cn(
            "flex-1 relative p-4 rounded-xl border-2 transition-all text-left",
            mode === "ocr"
              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
              : "border-[var(--border)] hover:border-[var(--color-primary)]/50 bg-[var(--background-card)]"
          )}
        >
          {/* Recommended badge */}
          <span className="absolute -top-2.5 left-4 px-2 py-0.5 bg-[var(--color-primary)] text-[var(--background)] text-xs font-semibold rounded-full flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Recommended
          </span>

          <div className="flex items-start gap-3 mt-1">
            <div className={cn(
              "p-2 rounded-lg",
              mode === "ocr" ? "bg-[var(--color-primary)]/20" : "bg-[var(--background-elevated)]"
            )}>
              <Sparkles className={cn(
                "w-5 h-5",
                mode === "ocr" ? "text-[var(--color-primary)]" : "text-[var(--foreground-muted)]"
              )} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-semibold",
                  mode === "ocr" ? "text-[var(--foreground)]" : "text-[var(--foreground-secondary)]"
                )}>
                  Auto-Extract from Lab Report
                </span>
              </div>
              <p className="text-sm text-[var(--foreground-muted)] mt-1">
                Upload a photo or PDF of your lab results. We&apos;ll automatically extract the values.
              </p>
              <div className="flex items-center gap-1 mt-2 text-xs text-[var(--foreground-muted)]">
                <Clock className="w-3 h-3" />
                <span>~30 seconds</span>
              </div>
            </div>
          </div>
        </button>

        {/* Manual Option */}
        <button
          onClick={() => onModeChange("manual")}
          className={cn(
            "flex-1 p-4 rounded-xl border-2 transition-all text-left",
            mode === "manual"
              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
              : "border-[var(--border)] hover:border-[var(--color-primary)]/50 bg-[var(--background-card)]"
          )}
        >
          <div className="flex items-start gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              mode === "manual" ? "bg-[var(--color-primary)]/20" : "bg-[var(--background-elevated)]"
            )}>
              <PenLine className={cn(
                "w-5 h-5",
                mode === "manual" ? "text-[var(--color-primary)]" : "text-[var(--foreground-muted)]"
              )} />
            </div>
            <div className="flex-1">
              <span className={cn(
                "font-semibold",
                mode === "manual" ? "text-[var(--foreground)]" : "text-[var(--foreground-secondary)]"
              )}>
                Manual Entry
              </span>
              <p className="text-sm text-[var(--foreground-muted)] mt-1">
                Type in each biomarker value yourself from your lab report.
              </p>
              <div className="flex items-center gap-1 mt-2 text-xs text-[var(--foreground-muted)]">
                <Clock className="w-3 h-3" />
                <span>~2 minutes</span>
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
