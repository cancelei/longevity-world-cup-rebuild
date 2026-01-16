/**
 * PhenoAge Calculator - Core Domain Service
 *
 * Implements the Levine et al. (2018) formula for calculating biological age
 * from 9 blood biomarkers. This is the CORE DOMAIN LOGIC of the platform.
 *
 * ## Domain Concepts
 * - **PhenoAge**: Biological age derived from biomarker values
 * - **Age Reduction**: Difference between chronological and biological age
 * - **Pace of Aging**: Ratio of biological to chronological age
 *
 * ## Scientific Reference
 * Levine, M.E. et al. "An epigenetic biomarker of aging for lifespan
 * and healthspan." Aging (2018). https://doi.org/10.18632/aging.101414
 *
 * ## Extension Points
 * - Add new biomarkers: Extend BiomarkerInput interface and BIOMARKER_RANGES
 * - Alternative algorithms: Create parallel functions (e.g., calculateDunedinPACE)
 * - Unit conversions: Add to unit-converter.ts for non-standard lab formats
 *
 * @module lib/phenoage
 */

export interface BiomarkerInput {
  albumin: number;        // g/dL (3.5-5.0)
  creatinine: number;     // mg/dL (0.6-1.2)
  glucose: number;        // mg/dL (70-100)
  crp: number;           // mg/L (0-3.0) - C-reactive protein
  lymphocytePercent: number; // % (20-40)
  mcv: number;           // fL (80-100) - Mean corpuscular volume
  rdw: number;           // % (11.5-14.5) - Red cell distribution width
  alp: number;           // U/L (44-147) - Alkaline phosphatase
  wbc: number;           // K/uL (4.5-11.0) - White blood cell count
  chronologicalAge: number;
}

export interface BiomarkerRanges {
  min: number;
  max: number;
  optimal: { min: number; max: number };
  unit: string;
  name: string;
}

export const BIOMARKER_RANGES: Record<keyof Omit<BiomarkerInput, 'chronologicalAge'>, BiomarkerRanges> = {
  albumin: { min: 2.0, max: 6.0, optimal: { min: 3.5, max: 5.0 }, unit: 'g/dL', name: 'Albumin' },
  creatinine: { min: 0.3, max: 3.0, optimal: { min: 0.6, max: 1.2 }, unit: 'mg/dL', name: 'Creatinine' },
  glucose: { min: 40, max: 300, optimal: { min: 70, max: 100 }, unit: 'mg/dL', name: 'Glucose' },
  crp: { min: 0, max: 50, optimal: { min: 0, max: 3.0 }, unit: 'mg/L', name: 'C-Reactive Protein' },
  lymphocytePercent: { min: 5, max: 60, optimal: { min: 20, max: 40 }, unit: '%', name: 'Lymphocyte %' },
  mcv: { min: 60, max: 120, optimal: { min: 80, max: 100 }, unit: 'fL', name: 'Mean Corpuscular Volume' },
  rdw: { min: 10, max: 25, optimal: { min: 11.5, max: 14.5 }, unit: '%', name: 'Red Cell Distribution Width' },
  alp: { min: 20, max: 300, optimal: { min: 44, max: 147 }, unit: 'U/L', name: 'Alkaline Phosphatase' },
  wbc: { min: 2, max: 20, optimal: { min: 4.5, max: 11.0 }, unit: 'K/uL', name: 'White Blood Cell Count' },
};

/**
 * Calculate PhenoAge from biomarkers using the Levine et al. formula
 */
export function calculatePhenoAge(input: BiomarkerInput): number {
  const {
    albumin,
    creatinine,
    glucose,
    crp,
    lymphocytePercent,
    mcv,
    rdw,
    alp,
    wbc,
    chronologicalAge,
  } = input;

  // Log-transform CRP (as per the original formula)
  const logCrp = Math.log(crp + 0.1); // Add small value to avoid log(0)

  // Linear predictor (xb) calculation
  // Coefficients from Levine et al. 2018
  const xb =
    -19.9067 +
    -0.0336 * albumin +
    0.0095 * creatinine +
    0.1953 * logCrp +
    0.0954 * glucose +
    -0.0120 * lymphocytePercent +
    0.0268 * mcv +
    0.3306 * rdw +
    0.00188 * alp +
    0.0554 * wbc +
    0.0804 * chronologicalAge;

  // Mortality score
  const mortalityScore = 1 - Math.exp(-Math.exp(xb) * (Math.exp(120 * 0.0076927) - 1) / 0.0076927);

  // Clamp mortality score to avoid log(0) or log(negative)
  const clampedMortalityScore = Math.min(Math.max(mortalityScore, 0.0001), 0.9999);

  // PhenoAge calculation
  const logArg = 1 - clampedMortalityScore;
  const innerLog = Math.log(logArg);
  const outerArg = -0.00553 * innerLog;

  // Ensure we don't take log of negative number
  if (outerArg <= 0) {
    // Return chronological age as fallback for edge cases
    return chronologicalAge;
  }

  const phenoAge = 141.50225 + Math.log(outerArg) / 0.090165;

  // Clamp result to reasonable bounds (0-150 years)
  const clampedPhenoAge = Math.min(Math.max(phenoAge, 0), 150);

  return Math.round(clampedPhenoAge * 10) / 10; // Round to 1 decimal
}

/**
 * Calculate age reduction (positive = younger, negative = older)
 */
export function calculateAgeReduction(chronologicalAge: number, phenoAge: number): number {
  return chronologicalAge - phenoAge;
}

/**
 * Calculate pace of aging (< 1 = aging slower, > 1 = aging faster)
 */
export function calculatePaceOfAging(chronologicalAge: number, phenoAge: number): number {
  return phenoAge / chronologicalAge;
}

/**
 * Validate biomarker values are within acceptable ranges
 */
export function validateBiomarkers(input: Partial<BiomarkerInput>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [key, value] of Object.entries(input)) {
    if (key === 'chronologicalAge') {
      if (value !== undefined && (value < 18 || value > 120)) {
        errors.push('Chronological age must be between 18 and 120');
      }
      continue;
    }

    const range = BIOMARKER_RANGES[key as keyof typeof BIOMARKER_RANGES];
    if (range && value !== undefined) {
      if (value < range.min || value > range.max) {
        errors.push(`${range.name} must be between ${range.min} and ${range.max} ${range.unit}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Calculate z-score for a biomarker relative to optimal range
 */
export function calculateZScore(
  value: number,
  biomarker: keyof Omit<BiomarkerInput, 'chronologicalAge'>
): number {
  const range = BIOMARKER_RANGES[biomarker];
  const optimalMid = (range.optimal.min + range.optimal.max) / 2;
  const optimalRange = range.optimal.max - range.optimal.min;

  return (value - optimalMid) / (optimalRange / 2);
}
