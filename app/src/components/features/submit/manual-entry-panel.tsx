"use client";

import { FileText, Upload, Check, Sparkles, HelpCircle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { BIOMARKER_RANGES } from "@/lib/phenoage";
import { biomarkerFields, type BiomarkerFieldKey } from "./types";

interface ManualEntryPanelProps {
  chronologicalAge: number;
  onChronologicalAgeChange: (age: number) => void;
  biomarkers: Partial<Record<BiomarkerFieldKey, number>>;
  onBiomarkerChange: (key: BiomarkerFieldKey, value: string) => void;
  proofFile: File | null;
  onProofFileChange: (file: File | null) => void;
  isOcrAssisted: boolean;
}

export function ManualEntryPanel({
  chronologicalAge,
  onChronologicalAgeChange,
  biomarkers,
  onBiomarkerChange,
  proofFile,
  onProofFileChange,
  isOcrAssisted,
}: ManualEntryPanelProps) {
  const getBiomarkerStatus = (key: BiomarkerFieldKey, value: number | undefined) => {
    if (value === undefined) return "empty";
    const range = BIOMARKER_RANGES[key];
    if (value >= range.optimal.min && value <= range.optimal.max) return "optimal";
    if (value >= range.min && value <= range.max) return "acceptable";
    return "out-of-range";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[var(--color-primary)]" />
          Biomarker Values
          {isOcrAssisted ? <Badge variant="outline" className="ml-2">
              <Sparkles className="w-3 h-3 mr-1" />
              Auto-filled
            </Badge> : null}
        </CardTitle>
        <CardDescription>
          {isOcrAssisted
            ? "Review and confirm the extracted values below"
            : "Enter values from your recent blood panel (within last 30 days)"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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

        {/* Biomarker Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {biomarkerFields.map((field) => {
            const value = biomarkers[field.key];
            const status = getBiomarkerStatus(field.key, value);
            const range = BIOMARKER_RANGES[field.key];

            // Calculate position relative to optimal range for visual indicator
            const getValueIndicator = () => {
              if (value === undefined) return null;
              if (status === "optimal") {
                return { icon: Minus, color: "text-[var(--color-success)]", label: "Optimal" };
              }
              if (status === "acceptable") {
                if (value < range.optimal.min) {
                  return { icon: TrendingDown, color: "text-[var(--color-warning)]", label: "Below optimal" };
                }
                return { icon: TrendingUp, color: "text-[var(--color-warning)]", label: "Above optimal" };
              }
              if (value < range.min) {
                return { icon: TrendingDown, color: "text-[var(--color-error)]", label: "Too low" };
              }
              return { icon: TrendingUp, color: "text-[var(--color-error)]", label: "Too high" };
            };

            const indicator = getValueIndicator();

            return (
              <div
                key={field.key}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  status === "optimal" && "border-[var(--color-success)]/50 bg-[var(--color-success)]/5",
                  status === "acceptable" && "border-[var(--color-warning)]/50 bg-[var(--color-warning)]/5",
                  status === "out-of-range" && "border-[var(--color-error)]/50 bg-[var(--color-error)]/5",
                  status === "empty" && "border-[var(--border)]"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-[var(--foreground)]">
                    {field.label}
                  </label>
                  <div className="flex items-center gap-2">
                    {indicator && (
                      <span className={cn("flex items-center gap-1 text-xs", indicator.color)}>
                        <indicator.icon className="w-3 h-3" />
                        <span className="hidden sm:inline">{indicator.label}</span>
                      </span>
                    )}
                    <span className="text-xs text-[var(--foreground-muted)]">{field.unit}</span>
                  </div>
                </div>
                <input
                  type="number"
                  step="0.01"
                  placeholder={`${range.optimal.min} - ${range.optimal.max}`}
                  value={value ?? ""}
                  onChange={(e) => onBiomarkerChange(field.key, e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-[var(--background-card)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] focus:border-[var(--color-primary)] focus:outline-none"
                />
                {/* Reference range hint */}
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-xs text-[var(--foreground-muted)]">{field.hint}</p>
                  <span className="text-xs text-[var(--foreground-muted)] flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    <span className="hidden xs:inline">Normal:</span> {range.optimal.min}-{range.optimal.max}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Proof Upload */}
        {!proofFile && (
          <div className="p-4 rounded-xl border border-[var(--border)] border-dashed">
            <div className="flex items-center gap-3 mb-3">
              <Upload className="w-5 h-5 text-[var(--foreground-muted)]" />
              <div>
                <p className="font-medium text-[var(--foreground)]">Upload Lab Report (Optional)</p>
                <p className="text-xs text-[var(--foreground-muted)]">
                  PDF or image of your lab results for verification
                </p>
              </div>
            </div>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => onProofFileChange(e.target.files?.[0] || null)}
              className="w-full text-sm text-[var(--foreground-secondary)]"
            />
          </div>
        )}

        {proofFile ? <div className="p-4 rounded-xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/5">
            <div className="flex items-center gap-3">
              <Check className="w-5 h-5 text-[var(--color-success)]" />
              <div className="flex-1">
                <p className="font-medium text-[var(--foreground)]">Lab Report Attached</p>
                <p className="text-xs text-[var(--foreground-muted)]">{proofFile.name}</p>
              </div>
              <button
                onClick={() => onProofFileChange(null)}
                className="text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              >
                Remove
              </button>
            </div>
          </div> : null}
      </CardContent>
    </Card>
  );
}
