"use client";

import { useState } from "react";
import { Sparkles, Lightbulb, CheckCircle2, X, FileImage, Camera, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileUpload, ProcessingStatus, ReviewPanel } from "@/components/features/ocr";
import type { BiomarkerKey, BiomarkerExtraction } from "@/lib/ocr/types";
import type { OcrStage } from "./types";

interface OcrEntryPanelProps {
  stage: OcrStage;
  error: string | null;
  extractions: Record<BiomarkerKey, BiomarkerExtraction> | null;
  chronologicalAge: number;
  onChronologicalAgeChange: (age: number) => void;
  onFileSelect: (file: File) => void;
  onError: (error: string) => void;
  onValueChange: (biomarker: BiomarkerKey, value: number | null) => void;
  onAcceptAll: () => void;
  onRetry: () => void;
}

// Tips component for first-time users
function OcrTips({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-cyan-500/20 flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h4 className="font-semibold text-[var(--foreground)] mb-2">Tips for best results</h4>
            <ul className="space-y-2 text-sm text-[var(--foreground-muted)]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Make sure all 9 biomarkers are visible in the image</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>Use good lighting and avoid shadows on the document</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span>PDF files from labs usually work better than photos</span>
              </li>
            </ul>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-md">
                <FileText className="w-3 h-3" /> PDF
              </span>
              <span className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-md">
                <FileImage className="w-3 h-3" /> Image
              </span>
              <span className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-md">
                <Camera className="w-3 h-3" /> Photo
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
          aria-label="Dismiss tips"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function OcrEntryPanel({
  stage,
  error,
  extractions,
  chronologicalAge,
  onChronologicalAgeChange,
  onFileSelect,
  onError,
  onValueChange,
  onAcceptAll,
  onRetry,
}: OcrEntryPanelProps) {
  const [showTips, setShowTips] = useState(true);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--color-primary)]" />
          Auto-Extract Biomarkers
        </CardTitle>
        <CardDescription>
          Upload your lab report and we&apos;ll automatically extract the biomarker values
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tips for first-time users */}
        {stage === "idle" && showTips && (
          <OcrTips onDismiss={() => setShowTips(false)} />
        )}

        {stage === "idle" && (
          <FileUpload
            onFileSelect={onFileSelect}
            onError={onError}
            isProcessing={false}
          />
        )}

        {stage !== "idle" && stage !== "complete" && stage !== "error" && (
          <ProcessingStatus
            isProcessing
            stage={stage as "uploading" | "converting" | "extracting" | "analyzing"}
          />
        )}

        {stage === "error" && (
          <ProcessingStatus
            isProcessing={false}
            stage="error"
            error={error}
            onRetry={onRetry}
          />
        )}

        {stage === "complete" && extractions ? <ReviewPanel
            extractions={extractions}
            onValueChange={onValueChange}
            onAcceptAll={onAcceptAll}
            onRetry={onRetry}
          /> : null}

        {/* Chronological Age */}
        <div className="p-4 rounded-xl bg-[var(--background-elevated)] border border-[var(--border)]">
          <Input
            label="Your Chronological Age"
            type="number"
            min={18}
            max={120}
            value={chronologicalAge}
            onChange={(e) => onChronologicalAgeChange(parseInt(e.target.value) || 0)}
            hint="Your actual age in years"
          />
        </div>
      </CardContent>
    </Card>
  );
}
