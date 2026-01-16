import { describe, it, expect } from 'vitest';
import {
  fuzzyMatchBiomarker,
  extractNumericValue,
  extractUnit,
  calculateConfidence,
  extractBiomarkerFromText,
  extractAllBiomarkers,
  getConfidenceLevel,
  shouldAutoFill,
  BIOMARKER_ALIASES,
  BIOMARKER_UNITS,
} from './biomarker-extractor';

describe('Biomarker Extractor', () => {
  describe('fuzzyMatchBiomarker', () => {
    it('should match exact biomarker names', () => {
      const result = fuzzyMatchBiomarker('albumin');
      expect(result?.biomarker).toBe('albumin');
      expect(result?.quality).toBe(1.0);
    });

    it('should match biomarker aliases', () => {
      const result = fuzzyMatchBiomarker('c-reactive protein');
      expect(result?.biomarker).toBe('crp');
      expect(result?.quality).toBe(1.0);
    });

    it('should match international aliases', () => {
      // Czech
      const czechResult = fuzzyMatchBiomarker('leukocyty');
      expect(czechResult?.biomarker).toBe('wbc');

      // German
      const germanResult = fuzzyMatchBiomarker('leukozyten');
      expect(germanResult?.biomarker).toBe('wbc');
    });

    it('should match fuzzy variations within distance threshold', () => {
      // One character typo
      const result = fuzzyMatchBiomarker('albumen');
      expect(result?.biomarker).toBe('albumin');
      expect(result?.quality).toBeGreaterThan(0.5);
    });

    it('should return null for unmatched text', () => {
      const result = fuzzyMatchBiomarker('xyzabc123');
      expect(result).toBeNull();
    });

    it('should match case-insensitively', () => {
      const result = fuzzyMatchBiomarker('ALBUMIN');
      expect(result?.biomarker).toBe('albumin');
      expect(result?.quality).toBe(1.0);
    });

    it('should match text containing alias', () => {
      const result = fuzzyMatchBiomarker('serum albumin level');
      expect(result?.biomarker).toBe('albumin');
    });
  });

  describe('extractNumericValue', () => {
    it('should extract decimal values', () => {
      expect(extractNumericValue('4.2')).toBe(4.2);
      expect(extractNumericValue('4.25 g/dL')).toBe(4.25);
    });

    it('should extract integer values', () => {
      expect(extractNumericValue('85')).toBe(85);
      expect(extractNumericValue('85 mg/dL')).toBe(85);
    });

    it('should handle European decimal format (comma)', () => {
      expect(extractNumericValue('4,2')).toBe(4.2);
      expect(extractNumericValue('12,5 %')).toBe(12.5);
    });

    it('should extract first number from range', () => {
      expect(extractNumericValue('4.2 (3.5-5.0)')).toBe(4.2);
    });

    it('should extract from comparison format', () => {
      expect(extractNumericValue('< 0.5')).toBe(0.5);
      expect(extractNumericValue('> 100')).toBe(100);
    });

    it('should return null for non-numeric text', () => {
      expect(extractNumericValue('no numbers here')).toBeNull();
    });
  });

  describe('extractUnit', () => {
    it('should extract g/dL for albumin', () => {
      expect(extractUnit('4.2 g/dL', 'albumin')).toBe('g/dl');
    });

    it('should extract mg/dL for glucose', () => {
      expect(extractUnit('85 mg/dL', 'glucose')).toBe('mg/dl');
    });

    it('should extract % for lymphocyte percent', () => {
      expect(extractUnit('30%', 'lymphocytePercent')).toBe('%');
    });

    it('should return null for unrecognized unit', () => {
      expect(extractUnit('85 xyz', 'glucose')).toBeNull();
    });

    it('should match units case-insensitively', () => {
      expect(extractUnit('85 MG/DL', 'glucose')).toBe('mg/dl');
    });
  });

  describe('calculateConfidence', () => {
    it('should return high confidence for perfect match with valid value', () => {
      const result = calculateConfidence('albumin', 4.5, 1.0, 'g/dl', 0.9);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should return lower confidence for value out of range', () => {
      const inRange = calculateConfidence('albumin', 4.5, 1.0, 'g/dl', 0.9);
      const outRange = calculateConfidence('albumin', 10.0, 1.0, 'g/dl', 0.9);
      expect(outRange.confidence).toBeLessThan(inRange.confidence);
    });

    it('should return lower confidence without unit', () => {
      const withUnit = calculateConfidence('albumin', 4.5, 1.0, 'g/dl', 0.9);
      const withoutUnit = calculateConfidence('albumin', 4.5, 1.0, null, 0.9);
      expect(withoutUnit.confidence).toBeLessThan(withUnit.confidence);
    });

    it('should return lower confidence for poor match quality', () => {
      const goodMatch = calculateConfidence('albumin', 4.5, 1.0, 'g/dl', 0.9);
      const poorMatch = calculateConfidence('albumin', 4.5, 0.5, 'g/dl', 0.9);
      expect(poorMatch.confidence).toBeLessThan(goodMatch.confidence);
    });

    it('should include all confidence factors', () => {
      const result = calculateConfidence('albumin', 4.5, 1.0, 'g/dl', 0.9);
      expect(result.factors).toHaveProperty('nameMatchQuality');
      expect(result.factors).toHaveProperty('valueInRange');
      expect(result.factors).toHaveProperty('unitRecognized');
      expect(result.factors).toHaveProperty('contextClarity');
      expect(result.factors).toHaveProperty('ocrConfidence');
    });
  });

  describe('extractBiomarkerFromText', () => {
    it('should extract albumin from lab report text', () => {
      const text = `Lab Results
Albumin    4.5    g/dL    (3.5-5.0)
Creatinine 0.9    mg/dL`;

      const result = extractBiomarkerFromText(text, 'albumin');
      expect(result.value).toBe(4.5);
      expect(result.confidence).toBeGreaterThan(0);
    });

    it('should extract CRP from international format', () => {
      const text = `C-Reactive Protein (hs-CRP): 0.8 mg/L`;
      const result = extractBiomarkerFromText(text, 'crp');
      expect(result.value).toBe(0.8);
    });

    it('should extract from Czech lab format', () => {
      const text = `Leukocyty: 6.5 10^9/L`;
      const result = extractBiomarkerFromText(text, 'wbc');
      expect(result.value).toBe(6.5);
    });

    it('should convert RDW from ratio to percentage', () => {
      const text = `RDW: 0.125`;
      const result = extractBiomarkerFromText(text, 'rdw');
      expect(result.value).toBe(12.5);
    });

    it('should return null value when biomarker not found', () => {
      const text = 'No relevant biomarkers here';
      const result = extractBiomarkerFromText(text, 'albumin');
      expect(result.value).toBeNull();
      expect(result.confidence).toBe(0);
    });

    it('should include line number and page number', () => {
      const text = `Line1
Albumin 4.5 g/dL`;
      const result = extractBiomarkerFromText(text, 'albumin', 2);
      expect(result.lineNumber).toBe(1);
      expect(result.pageNumber).toBe(2);
    });
  });

  describe('extractAllBiomarkers', () => {
    it('should extract all 9 biomarkers from comprehensive report', () => {
      // Note: Use decimal values to match the extraction algorithm's preference for decimals
      const text = `Complete Lab Results
Albumin: 4.5 g/dL
Creatinine: 0.9 mg/dL
Glucose: 85.0 mg/dL
CRP: 0.5 mg/L
Lymphocyte %: 30.0%
MCV: 90.0 fL
RDW: 12.5%
ALP: 70.0 U/L
WBC: 6.0 K/uL`;

      const results = extractAllBiomarkers(text);

      expect(results.albumin.value).toBe(4.5);
      expect(results.creatinine.value).toBe(0.9);
      expect(results.glucose.value).toBe(85.0);
      expect(results.crp.value).toBe(0.5);
      expect(results.lymphocytePercent.value).toBe(30.0);
      expect(results.mcv.value).toBe(90.0);
      expect(results.rdw.value).toBe(12.5);
      expect(results.alp.value).toBe(70.0);
      expect(results.wbc.value).toBe(6.0);
    });

    it('should return null for missing biomarkers', () => {
      const text = `Partial Lab Results
Albumin: 4.5 g/dL`;

      const results = extractAllBiomarkers(text);
      expect(results.albumin.value).toBe(4.5);
      expect(results.glucose.value).toBeNull();
    });
  });

  describe('getConfidenceLevel', () => {
    it('should return high for confidence >= 0.8', () => {
      expect(getConfidenceLevel(0.9)).toBe('high');
      expect(getConfidenceLevel(0.8)).toBe('high');
    });

    it('should return medium for confidence 0.5-0.8', () => {
      expect(getConfidenceLevel(0.6)).toBe('medium');
      expect(getConfidenceLevel(0.5)).toBe('medium');
    });

    it('should return low for confidence 0.3-0.5', () => {
      expect(getConfidenceLevel(0.4)).toBe('low');
      expect(getConfidenceLevel(0.3)).toBe('low');
    });

    it('should return none for confidence < 0.3', () => {
      expect(getConfidenceLevel(0.1)).toBe('none');
      expect(getConfidenceLevel(0)).toBe('none');
    });
  });

  describe('shouldAutoFill', () => {
    it('should return true for medium and high confidence', () => {
      expect(shouldAutoFill(0.9)).toBe(true);
      expect(shouldAutoFill(0.5)).toBe(true);
    });

    it('should return false for low confidence', () => {
      expect(shouldAutoFill(0.4)).toBe(false);
      expect(shouldAutoFill(0.1)).toBe(false);
    });
  });

  describe('BIOMARKER_ALIASES', () => {
    it('should have aliases for all 9 biomarkers', () => {
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
        expect(BIOMARKER_ALIASES[biomarker as keyof typeof BIOMARKER_ALIASES]).toBeDefined();
        expect(BIOMARKER_ALIASES[biomarker as keyof typeof BIOMARKER_ALIASES].length).toBeGreaterThan(0);
      });
    });

    it('should include Czech aliases for WBC', () => {
      expect(BIOMARKER_ALIASES.wbc).toContain('leukocyty');
    });

    it('should include German aliases for RDW', () => {
      expect(BIOMARKER_ALIASES.rdw).toContain('evb');
    });
  });

  describe('BIOMARKER_UNITS', () => {
    it('should have units for all 9 biomarkers', () => {
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
        expect(BIOMARKER_UNITS[biomarker as keyof typeof BIOMARKER_UNITS]).toBeDefined();
        expect(BIOMARKER_UNITS[biomarker as keyof typeof BIOMARKER_UNITS].length).toBeGreaterThan(0);
      });
    });
  });
});
