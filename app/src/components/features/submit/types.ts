import type { BiomarkerInput } from "@/lib/phenoage";
import type { BiomarkerExtraction } from "@/lib/ocr/types";

export interface LeagueMembership {
  id: string;
  role: string;
  league: {
    id: string;
    name: string;
    slug: string;
    type: string;
  };
}

export type BiomarkerFieldKey = keyof Omit<BiomarkerInput, "chronologicalAge">;

export type CalculationError = { error: string[] };
export type CalculationSuccess = { phenoAge: number; ageReduction: number; paceOfAging: number };
export type CalculationResult = CalculationError | CalculationSuccess | null;

export type EntryMode = "manual" | "ocr";
export type OcrStage = "idle" | "uploading" | "converting" | "extracting" | "analyzing" | "complete" | "error";

export interface BiomarkerField {
  key: BiomarkerFieldKey;
  label: string;
  unit: string;
  hint: string;
}

export const biomarkerFields: BiomarkerField[] = [
  { key: "albumin", label: "Albumin", unit: "g/dL", hint: "Normal: 3.5-5.0" },
  { key: "creatinine", label: "Creatinine", unit: "mg/dL", hint: "Normal: 0.6-1.2" },
  { key: "glucose", label: "Glucose (Fasting)", unit: "mg/dL", hint: "Normal: 70-100" },
  { key: "crp", label: "C-Reactive Protein", unit: "mg/L", hint: "Normal: 0-3.0" },
  { key: "lymphocytePercent", label: "Lymphocyte %", unit: "%", hint: "Normal: 20-40" },
  { key: "mcv", label: "Mean Corpuscular Volume", unit: "fL", hint: "Normal: 80-100" },
  { key: "rdw", label: "Red Cell Distribution Width", unit: "%", hint: "Normal: 11.5-14.5" },
  { key: "alp", label: "Alkaline Phosphatase", unit: "U/L", hint: "Normal: 44-147" },
  { key: "wbc", label: "White Blood Cell Count", unit: "K/uL", hint: "Normal: 4.5-11.0" },
];

export interface OcrExtractions {
  [key: string]: BiomarkerExtraction;
}
