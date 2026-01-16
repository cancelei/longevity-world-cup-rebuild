"use client";

import { Calculator, Info, AlertCircle, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { biomarkerFields, type BiomarkerFieldKey, type CalculationResult, type CalculationError } from "./types";

interface CalculationPreviewProps {
  biomarkers: Partial<Record<BiomarkerFieldKey, number>>;
  result: CalculationResult;
  allFieldsFilled: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export function CalculationPreview({
  biomarkers,
  result,
  allFieldsFilled,
  isSubmitting,
  onSubmit,
}: CalculationPreviewProps) {
  const filledCount = Object.keys(biomarkers).filter(
    (k) => biomarkers[k as BiomarkerFieldKey] !== undefined
  ).length;

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-[var(--color-secondary)]" />
          Calculation Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!allFieldsFilled ? (
          <div className="text-center py-8">
            <Info className="w-12 h-12 mx-auto text-[var(--foreground-muted)] mb-3" />
            <p className="text-[var(--foreground-secondary)]">
              Fill in all biomarker values to see your calculated biological age
            </p>
            <Progress
              value={(filledCount / biomarkerFields.length) * 100}
              className="mt-4"
            />
            <p className="text-xs text-[var(--foreground-muted)] mt-2">
              {filledCount} of {biomarkerFields.length} fields completed
            </p>
          </div>
        ) : result && "error" in result ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto text-[var(--color-error)] mb-3" />
            <p className="text-[var(--foreground-secondary)] mb-2">Validation Errors</p>
            <ul className="text-sm text-[var(--color-error)] text-left">
              {(result as CalculationError).error.map((err, i) => (
                <li key={i}>• {err}</li>
              ))}
            </ul>
          </div>
        ) : result ? (
          <div className="space-y-4">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-[var(--color-primary)]/20 to-[var(--color-secondary)]/20">
              <p className="text-sm text-[var(--foreground-secondary)]">Your Biological Age</p>
              <p className="text-5xl font-bold text-gradient">{result.phenoAge.toFixed(1)}</p>
              <p className="text-sm text-[var(--foreground-muted)]">years</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-[var(--background-card)]">
                <p className="text-xs text-[var(--foreground-muted)]">Age Reduction</p>
                <p
                  className={cn(
                    "text-xl font-bold",
                    result.ageReduction > 0
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-error)]"
                  )}
                >
                  {result.ageReduction > 0 ? "-" : "+"}
                  {Math.abs(result.ageReduction).toFixed(1)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[var(--background-card)]">
                <p className="text-xs text-[var(--foreground-muted)]">Pace of Aging</p>
                <p
                  className={cn(
                    "text-xl font-bold",
                    result.paceOfAging < 1
                      ? "text-[var(--color-success)]"
                      : "text-[var(--color-warning)]"
                  )}
                >
                  {(result.paceOfAging * 100).toFixed(0)}%
                </p>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={onSubmit}
              isLoading={isSubmitting}
            >
              Submit to Competition
              <Check className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
