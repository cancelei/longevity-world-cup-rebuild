"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { calculatePhenoAge, validateBiomarkers, type BiomarkerInput } from "@/lib/phenoage";
import type { BiomarkerKey, BiomarkerExtraction, OcrExtractionResult } from "@/lib/ocr/types";
import { useToast } from "@/components/ui/toast";
import {
  LeagueSelector,
  EntryModeToggle,
  ManualEntryPanel,
  OcrEntryPanel,
  CalculationPreview,
  biomarkerFields,
  type LeagueMembership,
  type BiomarkerFieldKey,
  type CalculationResult,
  type EntryMode,
  type OcrStage,
} from "@/components/features/submit";

export default function SubmitBiomarkersPage() {
  const router = useRouter();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chronologicalAge, setChronologicalAge] = useState(35);
  const [biomarkers, setBiomarkers] = useState<Partial<Record<BiomarkerFieldKey, number>>>({});
  const [proofFile, setProofFile] = useState<File | null>(null);

  // League state
  const [leagueMemberships, setLeagueMemberships] = useState<LeagueMembership[]>([]);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [loadingLeagues, setLoadingLeagues] = useState(true);

  // OCR state - default to OCR as it's the recommended method
  const [entryMode, setEntryMode] = useState<EntryMode>("ocr");
  const [ocrStage, setOcrStage] = useState<OcrStage>("idle");
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrExtractions, setOcrExtractions] = useState<Record<BiomarkerKey, BiomarkerExtraction> | null>(null);
  const [entryMethod, setEntryMethod] = useState<"MANUAL" | "OCR_ASSISTED">("MANUAL");

  // Fetch user's league memberships on mount
  useEffect(() => {
    async function fetchLeagueMemberships() {
      try {
        const response = await fetch("/api/athletes/me");
        if (response.ok) {
          const athlete = await response.json();
          if (athlete.leagueMemberships) {
            setLeagueMemberships(athlete.leagueMemberships);
            if (athlete.leagueMemberships.length === 1) {
              setSelectedLeagueId(athlete.leagueMemberships[0].league.id);
            }
          }
          if (athlete.chronologicalAge) {
            setChronologicalAge(athlete.chronologicalAge);
          }
        }
      } catch (error) {
        console.error("Failed to fetch athlete data:", error);
      } finally {
        setLoadingLeagues(false);
      }
    }
    fetchLeagueMemberships();
  }, []);

  // Check if all required fields are filled
  const allFieldsFilled = biomarkerFields.every(
    (field) => biomarkers[field.key] !== undefined && biomarkers[field.key] !== null
  ) && selectedLeagueId !== null;

  // Calculate PhenoAge
  const calculateResult = (): CalculationResult => {
    if (!allFieldsFilled) return null;

    const input: BiomarkerInput = {
      albumin: biomarkers.albumin!,
      creatinine: biomarkers.creatinine!,
      glucose: biomarkers.glucose!,
      crp: biomarkers.crp!,
      lymphocytePercent: biomarkers.lymphocytePercent!,
      mcv: biomarkers.mcv!,
      rdw: biomarkers.rdw!,
      alp: biomarkers.alp!,
      wbc: biomarkers.wbc!,
      chronologicalAge,
    };

    const validation = validateBiomarkers(input);
    if (!validation.valid) {
      return { error: validation.errors };
    }

    const phenoAge = calculatePhenoAge(input);
    const ageReduction = chronologicalAge - phenoAge;
    const paceOfAging = phenoAge / chronologicalAge;

    return { phenoAge, ageReduction, paceOfAging };
  };

  const result = calculateResult();

  // Handle OCR file upload
  const handleOcrUpload = useCallback(async (file: File) => {
    setOcrStage("uploading");
    setOcrError(null);
    setProofFile(file);

    try {
      setOcrStage("extracting");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ocr/upload", {
        method: "POST",
        body: formData,
      });

      setOcrStage("analyzing");

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "OCR processing failed");
      }

      const extractionResult = data.result as OcrExtractionResult;
      setOcrExtractions(extractionResult.extractions);
      setOcrStage("complete");
      setEntryMethod("OCR_ASSISTED");

      // Auto-fill biomarkers with high/medium confidence values
      const newBiomarkers: Partial<Record<BiomarkerFieldKey, number>> = {};
      for (const [key, extraction] of Object.entries(extractionResult.extractions)) {
        if (extraction.value !== null && extraction.confidence >= 0.5) {
          newBiomarkers[key as BiomarkerFieldKey] = extraction.value;
        }
      }
      setBiomarkers(newBiomarkers);
    } catch (error) {
      setOcrStage("error");
      setOcrError(error instanceof Error ? error.message : "OCR processing failed");
    }
  }, []);

  // Handle OCR value change
  const handleOcrValueChange = useCallback((biomarker: BiomarkerKey, value: number | null) => {
    setBiomarkers((prev) => ({
      ...prev,
      [biomarker]: value ?? undefined,
    }));

    if (ocrExtractions) {
      setOcrExtractions((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [biomarker]: {
            ...prev[biomarker],
            value,
            confidence: value !== null ? 1.0 : 0,
          },
        };
      });
    }
  }, [ocrExtractions]);

  // Accept OCR results
  const handleAcceptOcr = useCallback(() => {
    setEntryMode("manual");
  }, []);

  // Retry OCR
  const handleRetryOcr = useCallback(() => {
    setOcrStage("idle");
    setOcrError(null);
    setOcrExtractions(null);
    setProofFile(null);
  }, []);

  // Handle submission
  const handleSubmit = async () => {
    if (!allFieldsFilled || !result || "error" in result || !selectedLeagueId) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("chronologicalAge", chronologicalAge.toString());
      formData.append("biomarkers", JSON.stringify(biomarkers));
      formData.append("phenoAge", result.phenoAge.toString());
      formData.append("ageReduction", result.ageReduction.toString());
      formData.append("paceOfAging", result.paceOfAging.toString());
      formData.append("entryMethod", entryMethod);
      formData.append("leagueId", selectedLeagueId);

      if (proofFile) {
        formData.append("proof", proofFile);
      }

      const response = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        toast.success("Submission received!", "Your biomarkers are being reviewed");
        router.push("/dashboard?submitted=true");
      } else {
        const error = await response.json();
        toast.error("Failed to submit", error.message || "Please check your data and try again");
      }
    } catch {
      toast.error("Something went wrong", "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update biomarker value
  const updateBiomarker = (key: BiomarkerFieldKey, value: string) => {
    const numValue = parseFloat(value);
    setBiomarkers((prev) => ({
      ...prev,
      [key]: isNaN(numValue) ? undefined : numValue,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-radial py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-display font-bold text-[var(--foreground)]">
            Submit Biomarkers
          </h1>
          <p className="text-[var(--foreground-secondary)] mt-1">
            Enter your lab results to calculate your biological age
          </p>
        </motion.div>

        {/* League Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <LeagueSelector
            leagueMemberships={leagueMemberships}
            selectedLeagueId={selectedLeagueId}
            onSelectLeague={setSelectedLeagueId}
            isLoading={loadingLeagues}
          />
        </motion.div>

        {/* Entry Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <EntryModeToggle mode={entryMode} onModeChange={setEntryMode} />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {entryMode === "ocr" ? (
              <OcrEntryPanel
                stage={ocrStage}
                error={ocrError}
                extractions={ocrExtractions}
                chronologicalAge={chronologicalAge}
                onChronologicalAgeChange={setChronologicalAge}
                onFileSelect={handleOcrUpload}
                onError={setOcrError}
                onValueChange={handleOcrValueChange}
                onAcceptAll={handleAcceptOcr}
                onRetry={handleRetryOcr}
              />
            ) : (
              <ManualEntryPanel
                chronologicalAge={chronologicalAge}
                onChronologicalAgeChange={setChronologicalAge}
                biomarkers={biomarkers}
                onBiomarkerChange={updateBiomarker}
                proofFile={proofFile}
                onProofFileChange={setProofFile}
                isOcrAssisted={entryMethod === "OCR_ASSISTED"}
              />
            )}
          </div>

          {/* Results Preview */}
          <div className="lg:col-span-1">
            <CalculationPreview
              biomarkers={biomarkers}
              result={result}
              allFieldsFilled={allFieldsFilled}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
