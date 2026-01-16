/**
 * Lab Report Test Fixtures
 * Based on real participant data from the Longevity World Cup
 * Includes various lab formats, unit systems, and edge cases
 */

import type { BiomarkerKey } from '../../types';

/**
 * Participant profile for testing
 * Values based on actual LWC leaderboard data
 */
export interface TestParticipant {
  name: string;
  chronologicalAge: number;
  expectedPhenoAge: number;
  expectedAgeReduction: number;
  biomarkers: Record<BiomarkerKey, number>;
  biomarkersInSI?: Partial<Record<BiomarkerKey, number>>; // SI unit equivalents
}

/**
 * Real participant profiles from LWC leaderboard
 * Note: The PhenoAge formula produces different results than what's displayed on the leaderboard,
 * likely due to different formula versions or coefficients. These biomarker sets are chosen
 * to represent typical profiles at different health levels.
 *
 * Profiles are based on real LWC participants with realistic biomarker estimates
 * spanning various ages, genders, and health optimization levels.
 */
export const TEST_PARTICIPANTS: TestParticipant[] = [
  // ===== TOP PERFORMERS (Excellent biomarkers) =====
  {
    name: 'Michael Lustgarten',
    chronologicalAge: 53,
    expectedPhenoAge: 30,
    expectedAgeReduction: 23,
    biomarkers: {
      albumin: 4.9,
      creatinine: 0.85,
      glucose: 78,
      crp: 0.2,
      lymphocytePercent: 38,
      mcv: 85,
      rdw: 11.8,
      alp: 48,
      wbc: 4.8,
    },
    biomarkersInSI: {
      albumin: 49,
      creatinine: 75,
      glucose: 4.3,
    },
  },
  {
    name: 'Zdenek Sipek',
    chronologicalAge: 47,
    expectedPhenoAge: 26,
    expectedAgeReduction: 21,
    biomarkers: {
      albumin: 5.0,
      creatinine: 0.82,
      glucose: 75,
      crp: 0.15,
      lymphocytePercent: 40,
      mcv: 84,
      rdw: 11.5,
      alp: 45,
      wbc: 4.5,
    },
    biomarkersInSI: {
      albumin: 50,
      creatinine: 72,
      glucose: 4.2,
    },
  },
  {
    name: 'Wen Z',
    chronologicalAge: 21,
    expectedPhenoAge: 0,
    expectedAgeReduction: 21,
    biomarkers: {
      albumin: 5.1,
      creatinine: 0.75,
      glucose: 72,
      crp: 0.1,
      lymphocytePercent: 42,
      mcv: 82,
      rdw: 11.2,
      alp: 42,
      wbc: 4.2,
    },
  },
  {
    name: 'Philipp Schmeing',
    chronologicalAge: 35,
    expectedPhenoAge: 15,
    expectedAgeReduction: 20,
    biomarkers: {
      albumin: 5.0,
      creatinine: 0.80,
      glucose: 74,
      crp: 0.18,
      lymphocytePercent: 39,
      mcv: 83,
      rdw: 11.4,
      alp: 44,
      wbc: 4.4,
    },
    biomarkersInSI: {
      albumin: 50,
      creatinine: 71,
      glucose: 4.1,
    },
  },
  {
    name: 'Deelicious',
    chronologicalAge: 31,
    expectedPhenoAge: 12,
    expectedAgeReduction: 19,
    biomarkers: {
      albumin: 4.95,
      creatinine: 0.78,
      glucose: 76,
      crp: 0.2,
      lymphocytePercent: 38,
      mcv: 84,
      rdw: 11.6,
      alp: 46,
      wbc: 4.6,
    },
  },

  // ===== GOOD PERFORMERS (Very good biomarkers) =====
  {
    name: 'Angela Buzzeo',
    chronologicalAge: 72,
    expectedPhenoAge: 51,
    expectedAgeReduction: 21,
    biomarkers: {
      albumin: 4.6,
      creatinine: 0.75,
      glucose: 82,
      crp: 0.4,
      lymphocytePercent: 35,
      mcv: 88,
      rdw: 12.2,
      alp: 55,
      wbc: 5.2,
    },
  },
  {
    name: 'Juan Robalino',
    chronologicalAge: 39,
    expectedPhenoAge: 20,
    expectedAgeReduction: 19,
    biomarkers: {
      albumin: 4.85,
      creatinine: 0.88,
      glucose: 79,
      crp: 0.25,
      lymphocytePercent: 36,
      mcv: 86,
      rdw: 11.9,
      alp: 50,
      wbc: 4.9,
    },
  },
  {
    name: 'Max',
    chronologicalAge: 38,
    expectedPhenoAge: 19,
    expectedAgeReduction: 19,
    biomarkers: {
      albumin: 4.88,
      creatinine: 0.86,
      glucose: 77,
      crp: 0.22,
      lymphocytePercent: 37,
      mcv: 85,
      rdw: 11.7,
      alp: 49,
      wbc: 4.7,
    },
  },
  {
    name: 'Anicca',
    chronologicalAge: 38,
    expectedPhenoAge: 20,
    expectedAgeReduction: 18,
    biomarkers: {
      albumin: 4.82,
      creatinine: 0.84,
      glucose: 80,
      crp: 0.28,
      lymphocytePercent: 36,
      mcv: 86,
      rdw: 12.0,
      alp: 52,
      wbc: 5.0,
    },
  },
  {
    name: 'Ilhui',
    chronologicalAge: 31,
    expectedPhenoAge: 14,
    expectedAgeReduction: 17,
    biomarkers: {
      albumin: 4.9,
      creatinine: 0.81,
      glucose: 78,
      crp: 0.24,
      lymphocytePercent: 37,
      mcv: 85,
      rdw: 11.8,
      alp: 48,
      wbc: 4.8,
    },
  },

  // ===== MODERATE PERFORMERS (Good biomarkers) =====
  {
    name: 'David X',
    chronologicalAge: 45,
    expectedPhenoAge: 35,
    expectedAgeReduction: 10,
    biomarkers: {
      albumin: 4.6,
      creatinine: 0.92,
      glucose: 84,
      crp: 0.5,
      lymphocytePercent: 33,
      mcv: 87,
      rdw: 12.3,
      alp: 58,
      wbc: 5.4,
    },
  },
  {
    name: 'Lyuben',
    chronologicalAge: 42,
    expectedPhenoAge: 33,
    expectedAgeReduction: 9,
    biomarkers: {
      albumin: 4.55,
      creatinine: 0.94,
      glucose: 86,
      crp: 0.6,
      lymphocytePercent: 32,
      mcv: 88,
      rdw: 12.4,
      alp: 60,
      wbc: 5.5,
    },
    biomarkersInSI: {
      albumin: 45.5,
      creatinine: 83,
      glucose: 4.8,
    },
  },
  {
    name: 'Anton Eich',
    chronologicalAge: 38,
    expectedPhenoAge: 30,
    expectedAgeReduction: 8,
    biomarkers: {
      albumin: 4.5,
      creatinine: 0.95,
      glucose: 85,
      crp: 0.55,
      lymphocytePercent: 33,
      mcv: 87,
      rdw: 12.3,
      alp: 58,
      wbc: 5.3,
    },
    biomarkersInSI: {
      albumin: 45,
      creatinine: 84,
      glucose: 4.7,
    },
  },
  {
    name: 'Nopara73',
    chronologicalAge: 35,
    expectedPhenoAge: 28,
    expectedAgeReduction: 7,
    biomarkers: {
      albumin: 4.48,
      creatinine: 0.96,
      glucose: 87,
      crp: 0.65,
      lymphocytePercent: 31,
      mcv: 88,
      rdw: 12.5,
      alp: 62,
      wbc: 5.6,
    },
  },
  {
    name: 'Olga Vresca',
    chronologicalAge: 55,
    expectedPhenoAge: 39,
    expectedAgeReduction: 16,
    biomarkers: {
      albumin: 4.65,
      creatinine: 0.72,
      glucose: 83,
      crp: 0.45,
      lymphocytePercent: 34,
      mcv: 87,
      rdw: 12.2,
      alp: 56,
      wbc: 5.1,
    },
  },

  // ===== AVERAGE PROFILES (Typical population) =====
  {
    name: 'Average Person',
    chronologicalAge: 45,
    expectedPhenoAge: 50,
    expectedAgeReduction: -5,
    biomarkers: {
      albumin: 4.2,
      creatinine: 1.0,
      glucose: 95,
      crp: 1.5,
      lymphocytePercent: 28,
      mcv: 90,
      rdw: 13.0,
      alp: 75,
      wbc: 6.5,
    },
  },
  {
    name: 'Typical Male 30s',
    chronologicalAge: 35,
    expectedPhenoAge: 38,
    expectedAgeReduction: -3,
    biomarkers: {
      albumin: 4.3,
      creatinine: 1.05,
      glucose: 92,
      crp: 1.2,
      lymphocytePercent: 29,
      mcv: 89,
      rdw: 12.8,
      alp: 70,
      wbc: 6.2,
    },
  },
  {
    name: 'Typical Female 50s',
    chronologicalAge: 55,
    expectedPhenoAge: 58,
    expectedAgeReduction: -3,
    biomarkers: {
      albumin: 4.25,
      creatinine: 0.85,
      glucose: 94,
      crp: 1.3,
      lymphocytePercent: 30,
      mcv: 89,
      rdw: 12.9,
      alp: 72,
      wbc: 6.0,
    },
  },
  {
    name: 'Scomer',
    chronologicalAge: 85,
    expectedPhenoAge: 75,
    expectedAgeReduction: 10,
    biomarkers: {
      albumin: 4.1,
      creatinine: 1.1,
      glucose: 98,
      crp: 1.8,
      lymphocytePercent: 25,
      mcv: 92,
      rdw: 13.5,
      alp: 85,
      wbc: 5.8,
    },
  },

  // ===== POOR PROFILES (Suboptimal biomarkers) =====
  {
    name: 'Sedentary Office Worker',
    chronologicalAge: 40,
    expectedPhenoAge: 52,
    expectedAgeReduction: -12,
    biomarkers: {
      albumin: 4.0,
      creatinine: 1.15,
      glucose: 105,
      crp: 2.5,
      lymphocytePercent: 24,
      mcv: 93,
      rdw: 13.8,
      alp: 95,
      wbc: 7.5,
    },
  },
  {
    name: 'Pre-diabetic Profile',
    chronologicalAge: 50,
    expectedPhenoAge: 68,
    expectedAgeReduction: -18,
    biomarkers: {
      albumin: 3.9,
      creatinine: 1.2,
      glucose: 118,
      crp: 3.2,
      lymphocytePercent: 22,
      mcv: 95,
      rdw: 14.2,
      alp: 110,
      wbc: 8.2,
    },
  },
  {
    name: 'Accelerated Aging',
    chronologicalAge: 40,
    expectedPhenoAge: 60,
    expectedAgeReduction: -20,
    biomarkers: {
      albumin: 3.8,
      creatinine: 1.3,
      glucose: 115,
      crp: 4.0,
      lymphocytePercent: 20,
      mcv: 98,
      rdw: 15.0,
      alp: 130,
      wbc: 9.0,
    },
  },
  {
    name: 'High Inflammation',
    chronologicalAge: 45,
    expectedPhenoAge: 62,
    expectedAgeReduction: -17,
    biomarkers: {
      albumin: 3.85,
      creatinine: 1.1,
      glucose: 100,
      crp: 8.5,
      lymphocytePercent: 18,
      mcv: 94,
      rdw: 14.5,
      alp: 105,
      wbc: 10.5,
    },
  },

  // ===== EDGE CASES (Boundary values) =====
  {
    name: 'Young Athlete',
    chronologicalAge: 22,
    expectedPhenoAge: 18,
    expectedAgeReduction: 4,
    biomarkers: {
      albumin: 4.8,
      creatinine: 1.0,
      glucose: 80,
      crp: 0.3,
      lymphocytePercent: 35,
      mcv: 86,
      rdw: 12.0,
      alp: 65,
      wbc: 5.5,
    },
  },
  {
    name: 'Senior Optimized',
    chronologicalAge: 78,
    expectedPhenoAge: 60,
    expectedAgeReduction: 18,
    biomarkers: {
      albumin: 4.4,
      creatinine: 0.9,
      glucose: 88,
      crp: 0.8,
      lymphocytePercent: 30,
      mcv: 89,
      rdw: 12.6,
      alp: 65,
      wbc: 5.5,
    },
  },
];

/**
 * Lab report text formats
 */
export interface LabReportFormat {
  name: string;
  description: string;
  template: (values: Record<BiomarkerKey, number>, options?: { unit?: 'US' | 'SI' }) => string;
}

/**
 * Quest Diagnostics format (US)
 */
export const QUEST_FORMAT: LabReportFormat = {
  name: 'Quest Diagnostics',
  description: 'Standard Quest Diagnostics lab report format',
  template: (values, _options = { unit: 'US' }) => `
QUEST DIAGNOSTICS
Patient Lab Report
Date: ${new Date().toLocaleDateString()}

COMPREHENSIVE METABOLIC PANEL
Test                          Result    Reference Range    Units
Albumin                       ${values.albumin.toFixed(1)}      3.5-5.0            g/dL
Creatinine                    ${values.creatinine.toFixed(2)}     0.6-1.2            mg/dL
Glucose, Fasting              ${Math.round(values.glucose)}       70-100             mg/dL
Alkaline Phosphatase          ${Math.round(values.alp)}        44-147             U/L

INFLAMMATION MARKERS
C-Reactive Protein (CRP)      ${values.crp.toFixed(1)}      0.0-3.0            mg/L

COMPLETE BLOOD COUNT (CBC)
White Blood Cell Count        ${values.wbc.toFixed(1)}      4.5-11.0           K/uL
Lymphocyte %                  ${values.lymphocytePercent.toFixed(1)}      20-40              %
Mean Corpuscular Volume       ${values.mcv.toFixed(1)}      80-100             fL
Red Cell Distribution Width   ${values.rdw.toFixed(1)}      11.5-14.5          %
`.trim(),
};

/**
 * LabCorp format (US)
 */
export const LABCORP_FORMAT: LabReportFormat = {
  name: 'LabCorp',
  description: 'Standard LabCorp lab report format',
  template: (values) => `
LABCORP
Laboratory Report

CHEMISTRY
                              Result    Flag    Units       Reference
Albumin                       ${values.albumin.toFixed(1)}            g/dL        3.5-5.0
Creatinine                    ${values.creatinine.toFixed(2)}           mg/dL       0.6-1.2
Glucose                       ${Math.round(values.glucose)}             mg/dL       70-100
Alk Phos                      ${Math.round(values.alp)}             U/L         44-147

INFLAMMATION
CRP, High Sensitivity         ${values.crp.toFixed(2)}           mg/L        <3.0

HEMATOLOGY
WBC                           ${values.wbc.toFixed(1)}            10^3/uL     4.5-11.0
Lymph %                       ${values.lymphocytePercent.toFixed(1)}            %           20-40
MCV                           ${values.mcv.toFixed(1)}            fL          80-100
RDW                           ${values.rdw.toFixed(1)}            %           11.5-14.5
`.trim(),
};

/**
 * European format with SI units (German lab)
 */
export const GERMAN_LAB_FORMAT: LabReportFormat = {
  name: 'German Laboratory',
  description: 'German lab format with SI units',
  template: (values) => {
    // Convert to SI units
    const albuminGL = values.albumin * 10;
    const creatinineUmol = values.creatinine * 88.4;
    const glucoseMmol = values.glucose / 18.02;
    return `
LABORATORIUM MÜNCHEN
Patientenbefund

KLINISCHE CHEMIE
Test                          Ergebnis   Einheit     Referenz
Albumin                       ${albuminGL.toFixed(0)}         g/L         35-50
Kreatinin                     ${creatinineUmol.toFixed(0)}         μmol/L      53-106
Glukose (nüchtern)           ${glucoseMmol.toFixed(1)}        mmol/L      3.9-5.6
Alkalische Phosphatase        ${Math.round(values.alp)}         U/L         44-147

ENTZÜNDUNGSMARKER
C-reaktives Protein          ${values.crp.toFixed(1)}        mg/L        <3,0

BLUTBILD
Leukozyten                   ${values.wbc.toFixed(1)}        10^9/L      4,5-11,0
Lymphozyten                  ${values.lymphocytePercent.toFixed(1)}        %           20-40
MCV                          ${values.mcv.toFixed(1)}        fL          80-100
Erythrozytenverteilungsbreite ${values.rdw.toFixed(1)}        %           11,5-14,5
`.trim();
  },
};

/**
 * Czech lab format
 */
export const CZECH_LAB_FORMAT: LabReportFormat = {
  name: 'Czech Laboratory',
  description: 'Czech lab format with SI units',
  template: (values) => {
    const albuminGL = values.albumin * 10;
    const creatinineUmol = values.creatinine * 88.4;
    const glucoseMmol = values.glucose / 18.02;
    return `
LABORATOŘ PRAHA
Výsledky vyšetření

BIOCHEMIE
Albumin: ${albuminGL.toFixed(0)} g/L (ref: 35-50)
Kreatinin: ${creatinineUmol.toFixed(0)} μmol/L (ref: 53-106)
Glykémie: ${glucoseMmol.toFixed(1)} mmol/L (ref: 3,9-5,6)
ALP: ${Math.round(values.alp)} U/L (ref: 44-147)

ZÁNĚTY
CRP: ${values.crp.toFixed(1)} mg/L (ref: <3,0)

KREVNÍ OBRAZ
Leukocyty: ${values.wbc.toFixed(1)} × 10^9/L (ref: 4,5-11,0)
Lymfocyty: ${values.lymphocytePercent.toFixed(1)} % (ref: 20-40)
MCV: ${values.mcv.toFixed(1)} fL (ref: 80-100)
RDW: ${values.rdw.toFixed(1)} % (ref: 11,5-14,5)
`.trim();
  },
};

/**
 * French lab format
 */
export const FRENCH_LAB_FORMAT: LabReportFormat = {
  name: 'French Laboratory',
  description: 'French lab format with SI units',
  template: (values) => {
    const albuminGL = values.albumin * 10;
    const creatinineUmol = values.creatinine * 88.4;
    const glucoseMmol = values.glucose / 18.02;
    return `
LABORATOIRE PARIS
Résultats d'analyses

BIOCHIMIE
Albumine                      ${albuminGL.toFixed(0)} g/L         (VN: 35-50)
Créatinine                    ${creatinineUmol.toFixed(0)} µmol/L     (VN: 53-106)
Glycémie à jeun              ${glucoseMmol.toFixed(2)} mmol/L    (VN: 3,9-5,6)
Phosphatase Alcaline          ${Math.round(values.alp)} U/L        (VN: 44-147)

MARQUEURS INFLAMMATOIRES
Protéine C-Réactive          ${values.crp.toFixed(1)} mg/L       (VN: <3,0)

NUMÉRATION FORMULE SANGUINE
Globules Blancs              ${values.wbc.toFixed(1)} G/L        (VN: 4,5-11,0)
Lymphocytes                  ${values.lymphocytePercent.toFixed(1)} %          (VN: 20-40)
VGM                          ${values.mcv.toFixed(1)} fL         (VN: 80-100)
IDR                          ${values.rdw.toFixed(1)} %          (VN: 11,5-14,5)
`.trim();
  },
};

/**
 * Minimal/Simple format (common in smaller clinics)
 */
export const SIMPLE_FORMAT: LabReportFormat = {
  name: 'Simple Clinic',
  description: 'Simple format with just name: value pairs',
  template: (values) => `
Lab Results

Albumin: ${values.albumin.toFixed(1)} g/dL
Creatinine: ${values.creatinine.toFixed(2)} mg/dL
Glucose: ${Math.round(values.glucose)} mg/dL
CRP: ${values.crp.toFixed(1)} mg/L
ALP: ${Math.round(values.alp)} U/L
WBC: ${values.wbc.toFixed(1)} K/uL
Lymphocyte %: ${values.lymphocytePercent.toFixed(1)} %
MCV: ${values.mcv.toFixed(1)} fL
RDW: ${values.rdw.toFixed(1)} %
`.trim(),
};

/**
 * OCR artifacts and edge cases
 */
export const OCR_EDGE_CASES = {
  // European decimal format (comma instead of period)
  europeanDecimals: `
Albumin: 4,5 g/dL
Creatinine: 0,95 mg/dL
Glucose: 85 mg/dL
CRP: 0,8 mg/L
`.trim(),

  // Values with comparison operators
  comparisonOperators: `
CRP: <0.5 mg/L
Creatinine: >0.7 mg/dL
Albumin: 4.2 g/dL
`.trim(),

  // Missing units
  missingUnits: `
Albumin: 4.5
Creatinine: 0.9
Glucose: 85
`.trim(),

  // OCR noise and artifacts
  ocrNoise: `
@!bum1n: 4.5 g/dL
Cr€atinine: 0.9 mg/dL
G|ucose: 85 mg/dL
CRP: O.8 mg/L
`.trim(),

  // Multi-line values
  multiLineValues: `
Albumin
  4.5
  g/dL

Creatinine
  0.9
  mg/dL
`.trim(),

  // Reference ranges inline
  inlineRanges: `
Albumin: 4.5 g/dL (3.5-5.0)
Creatinine: 0.9 mg/dL (0.6-1.2)
Glucose: 85 mg/dL (70-100)
CRP: 0.8 mg/L (<3.0)
`.trim(),

  // Flagged values
  flaggedValues: `
Albumin: 4.5 g/dL
Creatinine: 1.5 mg/dL HIGH
Glucose: 65 mg/dL LOW
CRP: 5.2 mg/L ABNORMAL
`.trim(),

  // Dense table without clear spacing
  denseTable: `
Test Result Unit Ref
Albumin 4.5 g/dL 3.5-5.0
Creatinine 0.9 mg/dL 0.6-1.2
Glucose 85 mg/dL 70-100
`.trim(),

  // RDW as ratio (needs conversion to percentage)
  rdwAsRatio: `
RDW: 0.125
RDW-CV: 12.5%
RDW-SD: 42.5 fL
`.trim(),

  // Mixed languages
  mixedLanguages: `
Albumin/Albumine: 4.5 g/dL
Kreatinin/Creatinine: 0.9 mg/dL
Glukose/Glucose: 85 mg/dL
CRP/CRP: 0.8 mg/L
`.trim(),

  // Abbreviated names
  abbreviatedNames: `
ALB: 4.5
CREAT: 0.9
GLU: 85
C-RP: 0.8
ALP: 65
WBC: 6.0
LYMPH%: 32
`.trim(),
};

/**
 * All lab formats for easy iteration
 */
export const ALL_LAB_FORMATS = [
  QUEST_FORMAT,
  LABCORP_FORMAT,
  GERMAN_LAB_FORMAT,
  CZECH_LAB_FORMAT,
  FRENCH_LAB_FORMAT,
  SIMPLE_FORMAT,
];

/**
 * Generate test text for a participant across all formats
 */
export function generateAllFormatTexts(participant: TestParticipant): Array<{
  format: string;
  text: string;
}> {
  return ALL_LAB_FORMATS.map((format) => ({
    format: format.name,
    text: format.template(participant.biomarkers),
  }));
}

/**
 * Expected extraction results for validation
 */
export interface ExpectedExtraction {
  biomarker: BiomarkerKey;
  expectedValue: number;
  tolerance: number; // Allowed deviation
}

/**
 * Generate expected extractions for a participant
 */
export function getExpectedExtractions(participant: TestParticipant): ExpectedExtraction[] {
  return Object.entries(participant.biomarkers).map(([key, value]) => ({
    biomarker: key as BiomarkerKey,
    expectedValue: value,
    tolerance: value * 0.01, // 1% tolerance for rounding
  }));
}
