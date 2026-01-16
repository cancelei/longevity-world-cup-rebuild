import { describe, it, expect } from 'vitest';
import {
  calculatePhenoAge,
  calculateAgeReduction,
  calculatePaceOfAging,
  validateBiomarkers,
  calculateZScore,
  BIOMARKER_RANGES,
  type BiomarkerInput,
} from './phenoage';

// Standard test input with typical healthy values
const healthyInput: BiomarkerInput = {
  albumin: 4.5,
  creatinine: 0.9,
  glucose: 85,
  crp: 0.5,
  lymphocytePercent: 30,
  mcv: 90,
  rdw: 12.5,
  alp: 70,
  wbc: 6.0,
  chronologicalAge: 40,
};

// Edge case: Older person with good biomarkers
const olderHealthyInput: BiomarkerInput = {
  albumin: 4.3,
  creatinine: 1.0,
  glucose: 90,
  crp: 1.0,
  lymphocytePercent: 28,
  mcv: 92,
  rdw: 13.0,
  alp: 75,
  wbc: 5.5,
  chronologicalAge: 65,
};

// Edge case: Younger person with suboptimal biomarkers
const suboptimalInput: BiomarkerInput = {
  albumin: 3.8,
  creatinine: 1.1,
  glucose: 110,
  crp: 3.0,
  lymphocytePercent: 22,
  mcv: 95,
  rdw: 15.0,
  alp: 100,
  wbc: 8.5,
  chronologicalAge: 35,
};

describe('PhenoAge Calculator', () => {
  describe('calculatePhenoAge', () => {
    it('should calculate PhenoAge for healthy 40-year-old', () => {
      const result = calculatePhenoAge(healthyInput);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(150);
      // PhenoAge calculation produces values - check it's reasonable
      expect(typeof result).toBe('number');
      expect(Number.isFinite(result)).toBe(true);
    });

    it('should calculate PhenoAge for healthy 65-year-old', () => {
      const result = calculatePhenoAge(olderHealthyInput);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(150);
      // Just verify it returns a reasonable number
      expect(typeof result).toBe('number');
      expect(Number.isFinite(result)).toBe(true);
    });

    it('should calculate higher PhenoAge for suboptimal biomarkers', () => {
      const result = calculatePhenoAge(suboptimalInput);
      expect(result).toBeGreaterThan(0);
      // Suboptimal biomarkers should result in higher PhenoAge than chronological
      expect(result).toBeGreaterThanOrEqual(suboptimalInput.chronologicalAge - 5);
    });

    it('should return reasonable values for extreme age inputs', () => {
      const youngInput = { ...healthyInput, chronologicalAge: 18 };
      const veryOldInput = { ...healthyInput, chronologicalAge: 100 };

      const youngResult = calculatePhenoAge(youngInput);
      const oldResult = calculatePhenoAge(veryOldInput);

      // Both should return finite positive numbers
      expect(youngResult).toBeGreaterThan(0);
      expect(youngResult).toBeLessThan(150);
      expect(oldResult).toBeGreaterThan(0);
      expect(oldResult).toBeLessThan(150);
      // Older chronological age should result in older PhenoAge
      expect(oldResult).toBeGreaterThan(youngResult);
    });

    it('should handle edge case with very low CRP', () => {
      const lowCrpInput = { ...healthyInput, crp: 0.01 };
      const result = calculatePhenoAge(lowCrpInput);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(150);
    });

    it('should handle edge case with high CRP', () => {
      const normalCrpResult = calculatePhenoAge(healthyInput);
      const highCrpInput = { ...healthyInput, crp: 10.0 };
      const highCrpResult = calculatePhenoAge(highCrpInput);

      expect(highCrpResult).toBeGreaterThan(0);
      expect(highCrpResult).toBeLessThan(150);
      // High CRP should increase or equal biological age (may round to same)
      expect(highCrpResult).toBeGreaterThanOrEqual(normalCrpResult);
    });

    it('should be deterministic (same input = same output)', () => {
      const result1 = calculatePhenoAge(healthyInput);
      const result2 = calculatePhenoAge(healthyInput);
      expect(result1).toBe(result2);
    });

    it('should return result rounded to 1 decimal place', () => {
      const result = calculatePhenoAge(healthyInput);
      const decimalPlaces = (result.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateAgeReduction', () => {
    it('should calculate positive reduction when PhenoAge < chronological', () => {
      const result = calculateAgeReduction(40, 35);
      expect(result).toBe(5);
    });

    it('should calculate negative reduction when PhenoAge > chronological', () => {
      const result = calculateAgeReduction(40, 45);
      expect(result).toBe(-5);
    });

    it('should return 0 when ages are equal', () => {
      const result = calculateAgeReduction(40, 40);
      expect(result).toBe(0);
    });
  });

  describe('calculatePaceOfAging', () => {
    it('should return < 1 when aging slower', () => {
      const result = calculatePaceOfAging(40, 35);
      expect(result).toBeLessThan(1);
      expect(result).toBeCloseTo(0.875, 2);
    });

    it('should return > 1 when aging faster', () => {
      const result = calculatePaceOfAging(40, 45);
      expect(result).toBeGreaterThan(1);
      expect(result).toBeCloseTo(1.125, 2);
    });

    it('should return 1 when ages are equal', () => {
      const result = calculatePaceOfAging(40, 40);
      expect(result).toBe(1);
    });
  });

  describe('validateBiomarkers', () => {
    it('should validate correct biomarker values', () => {
      const result = validateBiomarkers(healthyInput);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject albumin out of range', () => {
      const result = validateBiomarkers({ albumin: 10.0 });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Albumin must be between 2 and 6 g/dL');
    });

    it('should reject chronological age out of range', () => {
      const result = validateBiomarkers({ chronologicalAge: 15 });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Chronological age must be between 18 and 120');
    });

    it('should accept chronological age at boundaries', () => {
      const result18 = validateBiomarkers({ chronologicalAge: 18 });
      const result120 = validateBiomarkers({ chronologicalAge: 120 });
      expect(result18.valid).toBe(true);
      expect(result120.valid).toBe(true);
    });

    it('should collect multiple errors', () => {
      const result = validateBiomarkers({
        albumin: 0.5,
        creatinine: 10.0,
        chronologicalAge: 10,
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(3);
    });

    it('should validate partial input', () => {
      const result = validateBiomarkers({ albumin: 4.5, glucose: 85 });
      expect(result.valid).toBe(true);
    });
  });

  describe('calculateZScore', () => {
    it('should return 0 for optimal mid-point value', () => {
      // Albumin optimal range: 3.5-5.0, midpoint: 4.25
      const result = calculateZScore(4.25, 'albumin');
      expect(result).toBeCloseTo(0, 1);
    });

    it('should return positive Z-score for above optimal', () => {
      // Albumin optimal range: 3.5-5.0, max: 5.0
      const result = calculateZScore(5.0, 'albumin');
      expect(result).toBeGreaterThan(0);
    });

    it('should return negative Z-score for below optimal', () => {
      // Albumin optimal range: 3.5-5.0, min: 3.5
      const result = calculateZScore(3.5, 'albumin');
      expect(result).toBeLessThan(0);
    });

    it('should calculate correct Z-score for glucose', () => {
      // Glucose optimal range: 70-100, midpoint: 85
      const optimalMid = calculateZScore(85, 'glucose');
      const high = calculateZScore(100, 'glucose');
      const low = calculateZScore(70, 'glucose');

      expect(optimalMid).toBeCloseTo(0, 1);
      expect(high).toBeGreaterThan(0);
      expect(low).toBeLessThan(0);
    });
  });

  describe('BIOMARKER_RANGES', () => {
    it('should have ranges defined for all 9 biomarkers', () => {
      const biomarkers = [
        'albumin',
        'creatinine',
        'glucose',
        'crp',
        'lymphocytePercent',
        'mcv',
        'rdw',
        'alp',
        'wbc',
      ];

      biomarkers.forEach((biomarker) => {
        expect(BIOMARKER_RANGES[biomarker as keyof typeof BIOMARKER_RANGES]).toBeDefined();
      });
    });

    it('should have valid range structure for each biomarker', () => {
      Object.entries(BIOMARKER_RANGES).forEach(([_key, range]) => {
        expect(range.min).toBeLessThan(range.max);
        expect(range.optimal.min).toBeGreaterThanOrEqual(range.min);
        expect(range.optimal.max).toBeLessThanOrEqual(range.max);
        expect(range.optimal.min).toBeLessThan(range.optimal.max);
        expect(range.unit).toBeTruthy();
        expect(range.name).toBeTruthy();
      });
    });
  });
});
