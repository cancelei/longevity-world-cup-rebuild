/**
 * Unit Converter for International Lab Values
 * Converts between SI units and US conventional units
 *
 * Target units (US conventional, as used in phenoage.ts):
 * - Albumin: g/dL
 * - Creatinine: mg/dL
 * - Glucose: mg/dL
 * - CRP: mg/L
 * - Lymphocyte %: %
 * - MCV: fL
 * - RDW: %
 * - ALP: U/L
 * - WBC: K/uL
 */

import { BiomarkerKey } from './types';

/**
 * Unit conversion definition
 */
interface UnitConversion {
  fromUnit: string;
  toUnit: string;
  factor: number;
  aliases: string[];
}

/**
 * Conversion factors for each biomarker
 * All conversions are TO the standard unit used in phenoage.ts
 */
export const UNIT_CONVERSIONS: Record<BiomarkerKey, UnitConversion[]> = {
  albumin: [
    // g/L to g/dL (divide by 10)
    { fromUnit: 'g/l', toUnit: 'g/dL', factor: 0.1, aliases: ['g/l', 'grams/l', 'grams/liter'] },
    // Already in g/dL
    { fromUnit: 'g/dl', toUnit: 'g/dL', factor: 1, aliases: ['g/dl', 'gm/dl', 'g%'] },
  ],

  creatinine: [
    // μmol/L to mg/dL (divide by 88.4)
    { fromUnit: 'umol/l', toUnit: 'mg/dL', factor: 0.0113, aliases: ['umol/l', 'μmol/l', 'µmol/l', 'micromol/l'] },
    // mg/L to mg/dL (divide by 10)
    { fromUnit: 'mg/l', toUnit: 'mg/dL', factor: 0.1, aliases: ['mg/l'] },
    // Already in mg/dL
    { fromUnit: 'mg/dl', toUnit: 'mg/dL', factor: 1, aliases: ['mg/dl', 'mg%'] },
  ],

  glucose: [
    // mmol/L to mg/dL (multiply by 18.0182)
    { fromUnit: 'mmol/l', toUnit: 'mg/dL', factor: 18.0182, aliases: ['mmol/l', 'millimol/l'] },
    // mg/L to mg/dL (divide by 10)
    { fromUnit: 'mg/l', toUnit: 'mg/dL', factor: 0.1, aliases: ['mg/l'] },
    // Already in mg/dL
    { fromUnit: 'mg/dl', toUnit: 'mg/dL', factor: 1, aliases: ['mg/dl', 'mg%'] },
  ],

  crp: [
    // nmol/L to mg/L (multiply by 0.0001047)
    { fromUnit: 'nmol/l', toUnit: 'mg/L', factor: 0.0001047, aliases: ['nmol/l', 'nanomol/l'] },
    // mg/dL to mg/L (multiply by 10)
    { fromUnit: 'mg/dl', toUnit: 'mg/L', factor: 10, aliases: ['mg/dl'] },
    // μg/mL to mg/L (same as mg/L)
    { fromUnit: 'ug/ml', toUnit: 'mg/L', factor: 1, aliases: ['ug/ml', 'μg/ml', 'µg/ml', 'mcg/ml'] },
    // Already in mg/L
    { fromUnit: 'mg/l', toUnit: 'mg/L', factor: 1, aliases: ['mg/l'] },
  ],

  lymphocytePercent: [
    // Already in %
    { fromUnit: '%', toUnit: '%', factor: 1, aliases: ['%', 'percent', 'pct'] },
    // Decimal to % (if given as 0.35 instead of 35%)
    { fromUnit: 'decimal', toUnit: '%', factor: 100, aliases: [] },
  ],

  mcv: [
    // Already in fL (femtoliters)
    { fromUnit: 'fl', toUnit: 'fL', factor: 1, aliases: ['fl', 'femtoliters', 'femtoliter'] },
    // μm³ to fL (same)
    { fromUnit: 'um3', toUnit: 'fL', factor: 1, aliases: ['um3', 'μm3', 'µm3', 'cubic microns'] },
  ],

  rdw: [
    // Already in %
    { fromUnit: '%', toUnit: '%', factor: 1, aliases: ['%', 'percent', 'pct', 'cv'] },
  ],

  alp: [
    // Already in U/L
    { fromUnit: 'u/l', toUnit: 'U/L', factor: 1, aliases: ['u/l', 'iu/l', 'units/l', 'unit/l'] },
    // μkat/L to U/L (multiply by 60)
    { fromUnit: 'ukat/l', toUnit: 'U/L', factor: 60, aliases: ['ukat/l', 'μkat/l', 'µkat/l', 'microkat/l'] },
    // nkat/L to U/L (multiply by 0.06)
    { fromUnit: 'nkat/l', toUnit: 'U/L', factor: 0.06, aliases: ['nkat/l', 'nanokat/l'] },
  ],

  wbc: [
    // 10^9/L to K/uL (same numeric value)
    { fromUnit: '10^9/l', toUnit: 'K/uL', factor: 1, aliases: ['10^9/l', 'x10^9/l', 'giga/l', 'g/l'] },
    // 10^3/μL to K/uL (same)
    { fromUnit: '10^3/ul', toUnit: 'K/uL', factor: 1, aliases: ['10^3/ul', 'x10^3/ul', 'thou/ul', 'k/mcl'] },
    // Already in K/uL
    { fromUnit: 'k/ul', toUnit: 'K/uL', factor: 1, aliases: ['k/ul', 'k/μl', 'k/µl'] },
    // cells/μL to K/uL (divide by 1000)
    { fromUnit: 'cells/ul', toUnit: 'K/uL', factor: 0.001, aliases: ['cells/ul', '/ul', '/μl'] },
  ],
};

/**
 * Standard units for each biomarker (target units)
 */
export const STANDARD_UNITS: Record<BiomarkerKey, string> = {
  albumin: 'g/dL',
  creatinine: 'mg/dL',
  glucose: 'mg/dL',
  crp: 'mg/L',
  lymphocytePercent: '%',
  mcv: 'fL',
  rdw: '%',
  alp: 'U/L',
  wbc: 'K/uL',
};

/**
 * Normalize a unit string for comparison
 */
function normalizeUnit(unit: string): string {
  return unit.toLowerCase().replace(/\s+/g, '').replace(/[μµ]/g, 'u');
}

/**
 * Find the conversion for a given unit
 */
function findConversion(
  biomarker: BiomarkerKey,
  unit: string
): UnitConversion | null {
  const conversions = UNIT_CONVERSIONS[biomarker];
  const normalizedUnit = normalizeUnit(unit);

  for (const conversion of conversions) {
    const allUnits = [conversion.fromUnit, ...conversion.aliases].map(normalizeUnit);
    if (allUnits.includes(normalizedUnit)) {
      return conversion;
    }
  }

  return null;
}

/**
 * Convert a value to the standard unit for a biomarker
 */
export function convertToStandardUnit(
  biomarker: BiomarkerKey,
  value: number,
  fromUnit: string
): { value: number; unit: string; converted: boolean } {
  const conversion = findConversion(biomarker, fromUnit);

  if (conversion) {
    return {
      value: value * conversion.factor,
      unit: STANDARD_UNITS[biomarker],
      converted: conversion.factor !== 1,
    };
  }

  // No conversion found, return as-is with warning
  return {
    value,
    unit: fromUnit,
    converted: false,
  };
}

/**
 * Detect likely unit from value range
 * Useful when unit is not recognized but value is present
 */
export function detectUnitFromValue(
  biomarker: BiomarkerKey,
  value: number
): { likelyUnit: string; confidence: number } {
  // Use expected ranges to guess the unit
  const expectedRanges: Record<BiomarkerKey, Array<{ unit: string; min: number; max: number }>> = {
    albumin: [
      { unit: 'g/dL', min: 2, max: 6 },
      { unit: 'g/L', min: 20, max: 60 },
    ],
    creatinine: [
      { unit: 'mg/dL', min: 0.3, max: 3 },
      { unit: 'μmol/L', min: 26, max: 265 },
    ],
    glucose: [
      { unit: 'mg/dL', min: 40, max: 300 },
      { unit: 'mmol/L', min: 2.2, max: 16.7 },
    ],
    crp: [
      { unit: 'mg/L', min: 0, max: 50 },
      { unit: 'mg/dL', min: 0, max: 5 },
    ],
    lymphocytePercent: [
      { unit: '%', min: 5, max: 60 },
    ],
    mcv: [
      { unit: 'fL', min: 60, max: 120 },
    ],
    rdw: [
      { unit: '%', min: 10, max: 25 },
    ],
    alp: [
      { unit: 'U/L', min: 20, max: 300 },
    ],
    wbc: [
      { unit: 'K/uL', min: 2, max: 20 },
      { unit: 'cells/uL', min: 2000, max: 20000 },
    ],
  };

  const ranges = expectedRanges[biomarker];

  for (const range of ranges) {
    if (value >= range.min && value <= range.max) {
      return { likelyUnit: range.unit, confidence: 0.8 };
    }
    // Check if value is close to range (within 50% margin)
    if (value >= range.min * 0.5 && value <= range.max * 1.5) {
      return { likelyUnit: range.unit, confidence: 0.5 };
    }
  }

  // Default to standard unit with low confidence
  return { likelyUnit: STANDARD_UNITS[biomarker], confidence: 0.2 };
}

/**
 * Smart conversion: try to detect unit if not provided and convert
 */
export function smartConvert(
  biomarker: BiomarkerKey,
  value: number,
  providedUnit?: string | null
): {
  value: number;
  unit: string;
  converted: boolean;
  unitDetected: boolean;
  confidence: number;
} {
  if (providedUnit) {
    const result = convertToStandardUnit(biomarker, value, providedUnit);
    return {
      ...result,
      unitDetected: false,
      confidence: result.converted ? 0.9 : 1.0,
    };
  }

  // Try to detect unit from value
  const detection = detectUnitFromValue(biomarker, value);
  const result = convertToStandardUnit(biomarker, value, detection.likelyUnit);

  return {
    ...result,
    unitDetected: true,
    confidence: detection.confidence * (result.converted ? 0.8 : 1.0),
  };
}

/**
 * Get display string for a value with unit
 */
export function formatWithUnit(value: number, unit: string, decimals: number = 2): string {
  return `${value.toFixed(decimals)} ${unit}`;
}
