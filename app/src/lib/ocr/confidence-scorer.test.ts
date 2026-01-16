import { describe, it, expect } from 'vitest';
import {
  calculateComprehensiveConfidence,
  getConfidenceExplanation,
  aggregateConfidence,
  getExtractionSummary,
  scoreNameMatch,
  scoreValueRange,
  scoreUnitRecognition,
  scoreContextClarity,
} from './confidence-scorer';
import { BiomarkerExtraction, BiomarkerKey } from './types';

describe('Confidence Scorer', () => {
  // Helper to create mock extraction
  const createExtraction = (
    biomarker: BiomarkerKey,
    value: number | null,
    unit: string | null = null,
    confidence: number = 0.8,
    rawText: string = ''
  ): BiomarkerExtraction => ({
    biomarker,
    value,
    unit,
    confidence,
    rawText,
    lineNumber: 0,
    pageNumber: 1,
  });

  describe('scoreNameMatch', () => {
    it('should return 1.0 for exact match', () => {
      const result = scoreNameMatch('albumin', 'albumin', true);
      expect(result.score).toBe(1.0);
      expect(result.warning).toBeUndefined();
    });

    it('should return lower score for partial match', () => {
      const result = scoreNameMatch('serum albumin level', 'albumin', false);
      expect(result.score).toBe(0.7);
      expect(result.warning).toContain('Partial match');
    });

    it('should return 0 with warning when text is empty', () => {
      const result = scoreNameMatch('', 'albumin', false);
      expect(result.score).toBe(0);
      expect(result.warning).toContain('Could not find');
    });
  });

  describe('scoreValueRange', () => {
    it('should return 1.0 for value in optimal range', () => {
      // Albumin optimal range is typically around 3.5-5.0 g/dL
      const result = scoreValueRange('albumin', 4.5);
      expect(result.score).toBeGreaterThanOrEqual(0.9);
      expect(result.warning).toBeUndefined();
    });

    it('should return lower score for value outside typical range', () => {
      const result = scoreValueRange('albumin', 10.0);
      expect(result.score).toBeLessThan(0.9);
      expect(result.warning).toContain('outside');
    });

    it('should return 0 with warning for null value', () => {
      const result = scoreValueRange('albumin', null);
      expect(result.score).toBe(0);
      expect(result.warning).toBe('No numeric value found');
      expect(result.suggestion).toBe('Please enter the value manually');
    });

    it('should return very low score for extremely out-of-range values', () => {
      const result = scoreValueRange('albumin', 1000);
      expect(result.score).toBeLessThanOrEqual(0.1);
      expect(result.suggestion).toContain('unit conversion');
    });
  });

  describe('scoreUnitRecognition', () => {
    it('should return 1.0 for recognized unit without conversion', () => {
      const result = scoreUnitRecognition('albumin', 'g/dL', false);
      expect(result.score).toBe(1.0);
      expect(result.warning).toBeUndefined();
    });

    it('should return 0.8 when unit was converted', () => {
      const result = scoreUnitRecognition('albumin', 'g/L', true);
      expect(result.score).toBe(0.8);
      expect(result.warning).toContain('converted');
    });

    it('should return 0.3 with warning when unit is null', () => {
      const result = scoreUnitRecognition('albumin', null, false);
      expect(result.score).toBe(0.3);
      expect(result.warning).toContain('not recognized');
    });
  });

  describe('scoreContextClarity', () => {
    it('should return 1.0 for single number in context', () => {
      const result = scoreContextClarity('Albumin: 4.5', 4.5);
      expect(result.score).toBe(1.0);
    });

    it('should return appropriate score for value with reference range', () => {
      // The text '4.5 (3.5-5.0)' contains 3 numbers: 4.5, 3.5, 5.0
      const result = scoreContextClarity('Albumin: 4.5 (3.5-5.0)', 4.5);
      expect(result.score).toBe(0.7); // 3 numbers = 0.7 score
    });

    it('should return lower score for many numbers', () => {
      const result = scoreContextClarity('4.5 3.2 5.0 4.1 4.8', 4.5);
      expect(result.score).toBeLessThan(0.7);
      expect(result.warning).toContain('Multiple values');
    });

    it('should return 0.3 for empty text', () => {
      const result = scoreContextClarity('', null);
      expect(result.score).toBe(0.3);
    });
  });

  describe('calculateComprehensiveConfidence', () => {
    it('should calculate high confidence for perfect extraction', () => {
      const extraction = createExtraction('albumin', 4.5, 'g/dL', 0.95, 'Albumin: 4.5 g/dL');

      const result = calculateComprehensiveConfidence(extraction, {
        ocrConfidence: 0.95,
        isExactNameMatch: true,
        wasUnitConverted: false,
      });

      expect(result.level).toBe('high');
      expect(result.autoFill).toBe(true);
      expect(result.warnings.length).toBe(0);
    });

    it('should calculate lower confidence for missing unit', () => {
      const extraction = createExtraction('albumin', 4.5, null, 0.8, 'Albumin: 4.5');

      const result = calculateComprehensiveConfidence(extraction);

      expect(result.factors.unitRecognized).toBe(0.3);
      expect(result.warnings.some(w => w.includes('not recognized'))).toBe(true);
    });

    it('should not auto-fill when value is null', () => {
      const extraction = createExtraction('albumin', null, null, 0, '');

      const result = calculateComprehensiveConfidence(extraction);

      expect(result.autoFill).toBe(false);
      expect(result.level).toBe('none');
    });

    it('should include suggestions for out-of-range values', () => {
      const extraction = createExtraction('albumin', 100, 'g/dL', 0.8, 'Albumin: 100 g/dL');

      const result = calculateComprehensiveConfidence(extraction);

      expect(result.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('getConfidenceExplanation', () => {
    it('should return formatted explanation string', () => {
      const extraction = createExtraction('albumin', 4.5, 'g/dL', 0.9, 'Albumin: 4.5');
      const breakdown = calculateComprehensiveConfidence(extraction, {
        isExactNameMatch: true,
      });

      const explanation = getConfidenceExplanation(breakdown);

      expect(explanation).toContain('%');
      expect(explanation).toContain('confidence');
    });

    it('should include factor details for non-perfect scores', () => {
      const extraction = createExtraction('albumin', 4.5, null, 0.7, 'Albumin: 4.5');
      const breakdown = calculateComprehensiveConfidence(extraction);

      const explanation = getConfidenceExplanation(breakdown);

      expect(explanation).toContain('unit');
    });
  });

  describe('aggregateConfidence', () => {
    it('should calculate average and counts correctly', () => {
      const extractions: Record<BiomarkerKey, BiomarkerExtraction> = {
        albumin: createExtraction('albumin', 4.5, 'g/dL', 0.9),
        creatinine: createExtraction('creatinine', 0.9, 'mg/dL', 0.85),
        glucose: createExtraction('glucose', 85, 'mg/dL', 0.88),
        crp: createExtraction('crp', 0.5, 'mg/L', 0.82),
        lymphocytePercent: createExtraction('lymphocytePercent', 30, '%', 0.75),
        mcv: createExtraction('mcv', 90, 'fL', 0.91),
        rdw: createExtraction('rdw', 12.5, '%', 0.87),
        alp: createExtraction('alp', 70, 'U/L', 0.83),
        wbc: createExtraction('wbc', 6.0, 'K/uL', 0.89),
      };

      const result = aggregateConfidence(extractions);

      expect(result.averageConfidence).toBeGreaterThan(0.5);
      expect(result.highConfidenceCount + result.mediumConfidenceCount + result.lowConfidenceCount + result.missingCount).toBe(9);
    });

    it('should rate quality as excellent for mostly high confidence', () => {
      const highConfExtraction = (biomarker: BiomarkerKey) =>
        createExtraction(biomarker, 1, 'unit', 0.9);

      const extractions: Record<BiomarkerKey, BiomarkerExtraction> = {
        albumin: highConfExtraction('albumin'),
        creatinine: highConfExtraction('creatinine'),
        glucose: highConfExtraction('glucose'),
        crp: highConfExtraction('crp'),
        lymphocytePercent: highConfExtraction('lymphocytePercent'),
        mcv: highConfExtraction('mcv'),
        rdw: highConfExtraction('rdw'),
        alp: highConfExtraction('alp'),
        wbc: highConfExtraction('wbc'),
      };

      const result = aggregateConfidence(extractions);

      expect(result.overallQuality).toBe('excellent');
    });

    it('should rate quality as poor for mostly missing values', () => {
      const missingExtraction = (biomarker: BiomarkerKey) =>
        createExtraction(biomarker, null, null, 0);

      const extractions: Record<BiomarkerKey, BiomarkerExtraction> = {
        albumin: missingExtraction('albumin'),
        creatinine: missingExtraction('creatinine'),
        glucose: missingExtraction('glucose'),
        crp: missingExtraction('crp'),
        lymphocytePercent: missingExtraction('lymphocytePercent'),
        mcv: missingExtraction('mcv'),
        rdw: missingExtraction('rdw'),
        alp: missingExtraction('alp'),
        wbc: missingExtraction('wbc'),
      };

      const result = aggregateConfidence(extractions);

      expect(result.overallQuality).toBe('poor');
      expect(result.missingCount).toBe(9);
    });
  });

  describe('getExtractionSummary', () => {
    it('should return formatted summary string', () => {
      const extractions: Record<BiomarkerKey, BiomarkerExtraction> = {
        albumin: createExtraction('albumin', 4.5, 'g/dL', 0.9),
        creatinine: createExtraction('creatinine', 0.9, 'mg/dL', 0.6),
        glucose: createExtraction('glucose', null, null, 0),
        crp: createExtraction('crp', 0.5, 'mg/L', 0.85),
        lymphocytePercent: createExtraction('lymphocytePercent', 30, '%', 0.4),
        mcv: createExtraction('mcv', 90, 'fL', 0.88),
        rdw: createExtraction('rdw', 12.5, '%', 0.82),
        alp: createExtraction('alp', 70, 'U/L', 0.83),
        wbc: createExtraction('wbc', 6.0, 'K/uL', 0.9),
      };

      const summary = getExtractionSummary(extractions);

      expect(summary).toMatch(/extraction/i);
      expect(summary).toMatch(/confidence/);
    });

    it('should mention not found items', () => {
      const extractions: Record<BiomarkerKey, BiomarkerExtraction> = {
        albumin: createExtraction('albumin', null, null, 0),
        creatinine: createExtraction('creatinine', null, null, 0),
        glucose: createExtraction('glucose', 85, 'mg/dL', 0.9),
        crp: createExtraction('crp', null, null, 0),
        lymphocytePercent: createExtraction('lymphocytePercent', null, null, 0),
        mcv: createExtraction('mcv', null, null, 0),
        rdw: createExtraction('rdw', null, null, 0),
        alp: createExtraction('alp', null, null, 0),
        wbc: createExtraction('wbc', null, null, 0),
      };

      const summary = getExtractionSummary(extractions);

      expect(summary).toContain('not found');
    });
  });
});
