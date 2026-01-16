/**
 * OCR Types for Biomarker Extraction
 */

// Biomarker keys matching the phenoage.ts definitions
export type BiomarkerKey =
  | 'albumin'
  | 'creatinine'
  | 'glucose'
  | 'crp'
  | 'lymphocytePercent'
  | 'mcv'
  | 'rdw'
  | 'alp'
  | 'wbc';

// Standard units for each biomarker
export type BiomarkerUnit = 'g/dL' | 'mg/dL' | 'mg/L' | '%' | 'fL' | 'U/L' | 'K/uL';

// Extraction result for a single biomarker
export interface BiomarkerExtraction {
  biomarker: BiomarkerKey;
  value: number | null;
  unit: BiomarkerUnit | string | null;
  confidence: number; // 0-1
  rawText: string;
  lineNumber: number;
  pageNumber: number;
}

// Confidence factors used to calculate overall confidence
export interface ConfidenceFactors {
  nameMatchQuality: number;  // 0-1: exact match = 1, fuzzy = lower
  valueInRange: number;      // 0-1: within expected range
  unitRecognized: number;    // 0-1: known unit found
  contextClarity: number;    // 0-1: clear separation from other values
  ocrConfidence: number;     // 0-1: Tesseract's word confidence
}

// Full extraction result from a document
export interface OcrExtractionResult {
  success: boolean;
  extractions: Record<BiomarkerKey, BiomarkerExtraction>;
  rawText: string;
  pageCount: number;
  processingTimeMs: number;
  errors: string[];
}

// OCR Job status
export type OcrJobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

// OCR Job for tracking async processing
export interface OcrJob {
  id: string;
  userId: string;
  status: OcrJobStatus;
  originalFileName: string;
  fileType: 'pdf' | 'png' | 'jpg' | 'jpeg';
  fileSize: number;
  pageCount: number;
  extractedValues: OcrExtractionResult | null;
  rawOcrText: string | null;
  processingTimeMs: number | null;
  errorMessage: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

// Image preprocessing options
export interface PreprocessingOptions {
  grayscale?: boolean;
  normalize?: boolean;
  threshold?: number;
  sharpen?: boolean;
  denoise?: boolean;
  targetDpi?: number;
}

// Default preprocessing for lab reports
export const DEFAULT_PREPROCESSING: PreprocessingOptions = {
  grayscale: true,
  normalize: true,
  threshold: 128,
  sharpen: true,
  denoise: true,
  targetDpi: 300,
};

// Confidence thresholds for UI display
export const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8,    // Auto-fill with green checkmark
  MEDIUM: 0.5,  // Auto-fill with yellow warning
  LOW: 0.3,     // Show suggestion, don't auto-fill
} as const;

// Extraction source tracking
export type ExtractionSource = 'ocr' | 'manual' | 'ocr_edited';

// Detailed confidence factor with explanation
export interface ConfidenceFactorDetail {
  score: number;           // 0-1 score
  explanation: string;     // Human-readable explanation
  suggestion?: string;     // Actionable suggestion if score is low
}

// Detailed confidence breakdown for UI display
export interface ConfidenceBreakdownDetailed {
  overall: number;
  level: 'high' | 'medium' | 'low' | 'none';
  factors: {
    nameMatchQuality: ConfidenceFactorDetail;
    valueInRange: ConfidenceFactorDetail;
    unitRecognized: ConfidenceFactorDetail;
    contextClarity: ConfidenceFactorDetail;
    ocrConfidence: ConfidenceFactorDetail;
  };
  actionableSuggestions: string[];
}

// Enhanced extraction with source tracking and detailed confidence
export interface EnhancedBiomarkerExtraction extends BiomarkerExtraction {
  source: ExtractionSource;
  confidenceBreakdown: ConfidenceBreakdownDetailed;
  previousValue?: number;
  previousSubmissionDate?: string;
  populationPercentile?: number;
  isPersonalBest?: boolean;
}

// For what-if scenario calculations
export interface WhatIfScenario {
  biomarker: BiomarkerKey;
  currentValue: number;
  hypotheticalValue: number;
  currentPhenoAge: number;
  hypotheticalPhenoAge: number;
  phenoAgeDelta: number;
}

// Value comparison with previous submission
export interface ValueComparison {
  biomarker: BiomarkerKey;
  currentValue: number;
  previousValue: number | null;
  delta: number | null;
  deltaPercent: number | null;
  trend: 'improving' | 'declining' | 'stable' | 'new';
  personalBest: number | null;
  isPersonalBest: boolean;
}

// Population statistics for percentile display
export interface PopulationStats {
  biomarker: BiomarkerKey;
  percentile: number;
  mean: number;
  median: number;
  standardDeviation: number;
  ageGroup: string;
  sampleSize: number;
}

// Progress metrics for tracking
export interface ProgressMetrics {
  totalSubmissions: number;
  bestAgeReduction: number;
  bestAgeReductionDate: string;
  averageAgeReduction: number;
  currentStreak: number;
  improvementRate: number;
  biomarkerTrends: Record<BiomarkerKey, {
    trend: 'improving' | 'declining' | 'stable';
    delta: number;
    history: number[];
  }>;
}

// API response types
export interface OcrUploadResponse {
  success: boolean;
  jobId: string;
  message: string;
}

export interface OcrStatusResponse {
  jobId: string;
  status: OcrJobStatus;
  progress?: number;
  message?: string;
}

export interface OcrResultsResponse {
  jobId: string;
  status: OcrJobStatus;
  result: OcrExtractionResult | null;
  errorMessage: string | null;
}
