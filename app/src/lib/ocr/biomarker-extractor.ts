/**
 * Biomarker Extractor - Pattern matching for extracting biomarkers from OCR text
 */

import { distance } from 'fastest-levenshtein';
import { BiomarkerKey, BiomarkerExtraction, ConfidenceFactors, CONFIDENCE_THRESHOLDS } from './types';
import { BIOMARKER_RANGES } from '../phenoage';

/**
 * Comprehensive aliases for each biomarker
 * Includes international variations, abbreviations, and common OCR errors
 */
export const BIOMARKER_ALIASES: Record<BiomarkerKey, string[]> = {
  albumin: [
    'albumin', 'alb', 'serum albumin', 'albumina', 'albumine',
    'alb.', 's-albumin', 'plasma albumin', 'albúmina', 'albumen',
    'ser albumin', 'total albumin', 'albumin serum',
    'albumine serique'  // French
  ],
  creatinine: [
    'creatinine', 'creat', 'crea', 'creatinin', 'kreatinin',
    'serum creatinine', 's-creatinine', 'creat.', 'créatinine',
    'kreatinine', 'creatinina', 'plasma creatinine', 'creatinine serum'
  ],
  glucose: [
    'glucose', 'gluc', 'glu', 'fasting glucose', 'blood glucose',
    'glucosa', 'glukose', 'fbs', 'fbg', 'blood sugar', 'fasting blood sugar',
    'glycemia', 'glycémie', 'blutzucker', 'plasma glucose', 'serum glucose',
    'glucose fasting', 'fasting plasma glucose', 'fpg', 'random glucose'
  ],
  crp: [
    'crp', 'c-reactive protein', 'c reactive protein', 'hs-crp',
    'hscrp', 'high sensitivity crp', 'proteina c reactiva', 'pcr',
    'c-reaktives protein', 'protéine c réactive', 'high-sensitivity crp',
    'hs crp', 'c-reactive', 'creactive protein', 'sensitive crp',
    'cardiac crp', 'crp-hs', 'ultra-sensitive crp'
  ],
  lymphocytePercent: [
    'lymphocyte', 'lymph', 'lymphocytes', 'lymph %', 'lymph%',
    'lym', 'lym%', 'lymphocyte %', 'linfocitos', 'lymphozyten',
    'lymphocytes %', 'lymph percent', 'ly%', 'ly %', 'lymph pct',
    'lymphocyte percent', '% lymphocytes', 'lymphocyte percentage',
    'lymfocyty', 'b_lymfocyty', 'lymfocyt',  // Czech
    'lymphozyten, relativ', 'lymphozyten relativ'  // German
  ],
  mcv: [
    'mcv', 'mean corpuscular volume', 'mean cell volume',
    'vcm', 'mch volume', 'mean corp vol', 'mean corp. volume',
    'corpuscular volume', 'm.c.v', 'm.c.v.', 'erythrocyte mcv'
  ],
  rdw: [
    'rdw', 'red cell distribution width', 'rdw-cv', 'rdw-sd',
    'red blood cell distribution width', 'anisocytosis', 'rdw cv',
    'rdw sd', 'rbc distribution width', 'r.d.w', 'r.d.w.',
    'red cell dist width', 'erythrocyte distribution width',
    'rdw-distr', 'distr. šířka rbc', 'šířka rbc',  // Czech
    'evb', 'evb (rdw)', 'erythrozytenverteilungsbreite'  // German
  ],
  alp: [
    'alp', 'alkaline phosphatase', 'alk phos', 'alkp',
    'fosfatasa alcalina', 'ap', 'alk. phos.', 'alk phosphatase',
    'alkalische phosphatase', 'phosphatase alcaline', 'alk.phos',
    'alkaline phos', 'total alp', 'serum alp', 'palc'
  ],
  wbc: [
    'wbc', 'white blood cell', 'white blood cells', 'leucocytes',
    'leukocytes', 'wcc', 'leucocitos', 'total wbc', 'white cell count',
    'white blood count', 'w.b.c', 'w.b.c.', 'leukozyten', 'leucocyte count',
    'leukocyte count', 'total white count', 'twbc',
    'leukocyty', 'b_leukocyty',  // Czech
    'globules blancs', 'gb'  // French
  ]
};

/**
 * Expected units for each biomarker with variations
 */
export const BIOMARKER_UNITS: Record<BiomarkerKey, string[]> = {
  albumin: ['g/dl', 'g/l', 'gm/dl', 'g%'],
  creatinine: ['mg/dl', 'mg/l', 'umol/l', 'μmol/l', 'µmol/l'],
  glucose: ['mg/dl', 'mmol/l', 'mg/l', 'mg%'],
  crp: ['mg/l', 'mg/dl', 'nmol/l', 'ug/ml', 'μg/ml'],
  lymphocytePercent: ['%', 'percent', 'pct'],
  mcv: ['fl', 'femtoliters', 'um3', 'μm3'],
  rdw: ['%', 'percent', 'pct', 'cv', 'ratio'],  // ratio needs conversion to %
  alp: ['u/l', 'iu/l', 'u/i', 'units/l'],
  wbc: ['k/ul', 'k/μl', '10^3/ul', '10^9/l', 'x10^3/ul', 'x10^9/l', 'thou/ul', 'k/mcl', 'giga/l', 'g/l']
};

/**
 * Regex patterns for extracting numeric values
 */
const VALUE_PATTERNS = [
  // Standard decimal: "4.2" or "4,2" (European)
  /(\d+[.,]\d+)/,
  // Integer: "85"
  /(\d+)/,
  // Range with value: "4.2 (3.5-5.0)" - extract first number
  /(\d+[.,]?\d*)\s*\([^)]+\)/,
  // Value with comparison: "< 0.5" or "> 100"
  /[<>]\s*(\d+[.,]?\d*)/,
  // Value with unit attached: "4.2g/dL"
  /(\d+[.,]?\d*)\s*[a-zA-Z]/,
];

/**
 * Fuzzy match a text against biomarker aliases
 * Returns the biomarker key and match quality
 */
export function fuzzyMatchBiomarker(
  text: string,
  maxDistance: number = 2
): { biomarker: BiomarkerKey; quality: number } | null {
  const normalizedText = text.toLowerCase().trim();

  let bestMatch: { biomarker: BiomarkerKey; quality: number } | null = null;
  let bestDistance = Infinity;

  for (const [biomarker, aliases] of Object.entries(BIOMARKER_ALIASES)) {
    for (const alias of aliases) {
      const normalizedAlias = alias.toLowerCase();

      // Exact match
      if (normalizedText === normalizedAlias || normalizedText.includes(normalizedAlias)) {
        return { biomarker: biomarker as BiomarkerKey, quality: 1.0 };
      }

      // Check if alias is contained in text
      if (normalizedText.includes(normalizedAlias)) {
        const quality = normalizedAlias.length / normalizedText.length;
        if (!bestMatch || quality > bestMatch.quality) {
          bestMatch = { biomarker: biomarker as BiomarkerKey, quality: Math.min(0.95, quality + 0.3) };
        }
        continue;
      }

      // Fuzzy match using Levenshtein distance
      const dist = distance(normalizedText, normalizedAlias);
      if (dist <= maxDistance && dist < bestDistance) {
        bestDistance = dist;
        const quality = 1 - (dist / Math.max(normalizedText.length, normalizedAlias.length));
        bestMatch = { biomarker: biomarker as BiomarkerKey, quality };
      }
    }
  }

  return bestMatch;
}

/**
 * Extract numeric value from text - finds the first number after a colon or biomarker name
 */
export function extractNumericValue(text: string): number | null {
  // Normalize European decimal separator
  const normalizedText = text.replace(/,/g, '.');

  // First, try to find a value immediately after a colon (most common format: "Name: Value Unit")
  const colonPattern = /:\s*([<>]?\s*\d+\.?\d*)/;
  const colonMatch = normalizedText.match(colonPattern);
  if (colonMatch && colonMatch[1]) {
    const value = parseFloat(colonMatch[1].replace(/[<>\s]/g, ''));
    if (!isNaN(value) && isFinite(value) && value > 0) {
      return value;
    }
  }

  // Fall back to general patterns for other formats
  for (const pattern of VALUE_PATTERNS) {
    const match = normalizedText.match(pattern);
    if (match && match[1]) {
      const value = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(value) && isFinite(value)) {
        return value;
      }
    }
  }

  return null;
}

/**
 * Extract unit from text
 */
export function extractUnit(text: string, biomarker: BiomarkerKey): string | null {
  const normalizedText = text.toLowerCase();
  const expectedUnits = BIOMARKER_UNITS[biomarker];

  for (const unit of expectedUnits) {
    if (normalizedText.includes(unit.toLowerCase())) {
      return unit;
    }
  }

  return null;
}

/**
 * Calculate confidence score for an extraction
 */
export function calculateConfidence(
  biomarker: BiomarkerKey,
  value: number | null,
  matchQuality: number,
  unit: string | null,
  ocrConfidence: number = 0.8
): { confidence: number; factors: ConfidenceFactors } {
  const range = BIOMARKER_RANGES[biomarker];

  const factors: ConfidenceFactors = {
    nameMatchQuality: matchQuality,
    valueInRange: 0,
    unitRecognized: unit ? 0.8 : 0.3,
    contextClarity: 0.7, // Default, could be improved with more context analysis
    ocrConfidence,
  };

  // Check if value is within acceptable range
  if (value !== null && range) {
    if (value >= range.min && value <= range.max) {
      factors.valueInRange = 1.0;
    } else if (value >= range.min * 0.5 && value <= range.max * 2) {
      // Slightly out of range but plausible
      factors.valueInRange = 0.5;
    } else {
      factors.valueInRange = 0.1;
    }
  }

  // Calculate weighted confidence
  const weights = {
    nameMatchQuality: 0.3,
    valueInRange: 0.25,
    unitRecognized: 0.2,
    contextClarity: 0.15,
    ocrConfidence: 0.1,
  };

  const confidence = Object.entries(factors).reduce(
    (sum, [key, value]) => sum + value * weights[key as keyof typeof weights],
    0
  );

  return { confidence, factors };
}

/**
 * Extract a single biomarker from OCR text
 */
export function extractBiomarkerFromText(
  ocrText: string,
  targetBiomarker: BiomarkerKey,
  pageNumber: number = 1
): BiomarkerExtraction {
  const lines = ocrText.split('\n');
  const aliases = BIOMARKER_ALIASES[targetBiomarker];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lowerLine = line.toLowerCase();

    // Check if line contains biomarker name
    const matchedAlias = aliases.find(alias =>
      lowerLine.includes(alias.toLowerCase())
    );

    if (matchedAlias) {
      // Look for value on same line and next 2 lines
      const searchText = lines.slice(i, Math.min(i + 3, lines.length)).join(' ');
      let value = extractNumericValue(searchText);
      const unit = extractUnit(searchText, targetBiomarker);

      // RDW ratio-to-percentage conversion: if RDW value is < 1, it's likely a ratio
      // (e.g., 0.120 should be 12.0%)
      if (targetBiomarker === 'rdw' && value !== null && value < 1) {
        value = value * 100;
      }

      const matchQuality = matchedAlias.toLowerCase() === lowerLine.trim().toLowerCase() ? 1.0 : 0.85;
      const { confidence } = calculateConfidence(targetBiomarker, value, matchQuality, unit);

      return {
        biomarker: targetBiomarker,
        value,
        unit: targetBiomarker === 'rdw' && unit === 'ratio' ? '%' : unit,  // Convert unit too
        confidence,
        rawText: searchText.substring(0, 200),
        lineNumber: i,
        pageNumber,
      };
    }
  }

  // No match found
  return {
    biomarker: targetBiomarker,
    value: null,
    unit: null,
    confidence: 0,
    rawText: '',
    lineNumber: -1,
    pageNumber,
  };
}

/**
 * Extract all biomarkers from OCR text
 */
export function extractAllBiomarkers(
  ocrText: string,
  pageNumber: number = 1
): Record<BiomarkerKey, BiomarkerExtraction> {
  const biomarkers: BiomarkerKey[] = [
    'albumin', 'creatinine', 'glucose', 'crp',
    'lymphocytePercent', 'mcv', 'rdw', 'alp', 'wbc'
  ];

  const results: Record<string, BiomarkerExtraction> = {};

  for (const biomarker of biomarkers) {
    results[biomarker] = extractBiomarkerFromText(ocrText, biomarker, pageNumber);
  }

  return results as Record<BiomarkerKey, BiomarkerExtraction>;
}

/**
 * Extract biomarkers from multi-page OCR results
 * Merges results, preferring higher confidence extractions
 */
export function extractFromMultiplePages(
  pageTexts: Array<{ text: string; pageNumber: number }>
): Record<BiomarkerKey, BiomarkerExtraction> {
  const biomarkers: BiomarkerKey[] = [
    'albumin', 'creatinine', 'glucose', 'crp',
    'lymphocytePercent', 'mcv', 'rdw', 'alp', 'wbc'
  ];

  const results: Record<string, BiomarkerExtraction> = {};

  // Initialize with empty extractions
  for (const biomarker of biomarkers) {
    results[biomarker] = {
      biomarker,
      value: null,
      unit: null,
      confidence: 0,
      rawText: '',
      lineNumber: -1,
      pageNumber: 0,
    };
  }

  // Process each page
  for (const page of pageTexts) {
    const pageResults = extractAllBiomarkers(page.text, page.pageNumber);

    // Merge results, keeping higher confidence
    for (const biomarker of biomarkers) {
      const pageResult = pageResults[biomarker];
      if (pageResult.confidence > results[biomarker].confidence) {
        results[biomarker] = pageResult;
      }
    }
  }

  return results as Record<BiomarkerKey, BiomarkerExtraction>;
}

/**
 * Get confidence level label
 */
export function getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' | 'none' {
  if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) return 'high';
  if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'medium';
  if (confidence >= CONFIDENCE_THRESHOLDS.LOW) return 'low';
  return 'none';
}

/**
 * Check if extraction should be auto-filled
 */
export function shouldAutoFill(confidence: number): boolean {
  return confidence >= CONFIDENCE_THRESHOLDS.MEDIUM;
}
