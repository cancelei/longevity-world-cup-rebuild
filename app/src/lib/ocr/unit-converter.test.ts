import { describe, it, expect } from 'vitest';
import {
  convertToStandardUnit,
  detectUnitFromValue,
  smartConvert,
  formatWithUnit,
  UNIT_CONVERSIONS,
  STANDARD_UNITS,
} from './unit-converter';

describe('Unit Converter', () => {
  describe('convertToStandardUnit', () => {
    describe('albumin conversions', () => {
      it('should not change g/dL values', () => {
        const result = convertToStandardUnit('albumin', 4.5, 'g/dL');
        expect(result.value).toBe(4.5);
        expect(result.unit).toBe('g/dL');
        expect(result.converted).toBe(false);
      });

      it('should convert g/L to g/dL', () => {
        const result = convertToStandardUnit('albumin', 45, 'g/L');
        expect(result.value).toBeCloseTo(4.5, 1);
        expect(result.unit).toBe('g/dL');
        expect(result.converted).toBe(true);
      });
    });

    describe('creatinine conversions', () => {
      it('should not change mg/dL values', () => {
        const result = convertToStandardUnit('creatinine', 0.9, 'mg/dL');
        expect(result.value).toBe(0.9);
        expect(result.unit).toBe('mg/dL');
        expect(result.converted).toBe(false);
      });

      it('should convert μmol/L to mg/dL', () => {
        const result = convertToStandardUnit('creatinine', 79.6, 'μmol/L');
        expect(result.value).toBeCloseTo(0.9, 1);
        expect(result.unit).toBe('mg/dL');
        expect(result.converted).toBe(true);
      });

      it('should handle µmol/L (micro sign variant)', () => {
        const result = convertToStandardUnit('creatinine', 79.6, 'µmol/l');
        expect(result.value).toBeCloseTo(0.9, 1);
        expect(result.converted).toBe(true);
      });
    });

    describe('glucose conversions', () => {
      it('should not change mg/dL values', () => {
        const result = convertToStandardUnit('glucose', 85, 'mg/dL');
        expect(result.value).toBe(85);
        expect(result.unit).toBe('mg/dL');
        expect(result.converted).toBe(false);
      });

      it('should convert mmol/L to mg/dL', () => {
        const result = convertToStandardUnit('glucose', 4.7, 'mmol/L');
        expect(result.value).toBeCloseTo(85, 0);
        expect(result.unit).toBe('mg/dL');
        expect(result.converted).toBe(true);
      });
    });

    describe('crp conversions', () => {
      it('should not change mg/L values', () => {
        const result = convertToStandardUnit('crp', 0.5, 'mg/L');
        expect(result.value).toBe(0.5);
        expect(result.unit).toBe('mg/L');
        expect(result.converted).toBe(false);
      });

      it('should convert mg/dL to mg/L', () => {
        const result = convertToStandardUnit('crp', 0.05, 'mg/dL');
        expect(result.value).toBeCloseTo(0.5, 1);
        expect(result.unit).toBe('mg/L');
        expect(result.converted).toBe(true);
      });
    });

    describe('wbc conversions', () => {
      it('should not change K/uL values', () => {
        const result = convertToStandardUnit('wbc', 6.5, 'K/uL');
        expect(result.value).toBe(6.5);
        expect(result.unit).toBe('K/uL');
        expect(result.converted).toBe(false);
      });

      it('should handle 10^9/L (same as K/uL)', () => {
        const result = convertToStandardUnit('wbc', 6.5, '10^9/L');
        expect(result.value).toBe(6.5);
        expect(result.unit).toBe('K/uL');
        expect(result.converted).toBe(false);
      });

      it('should convert cells/uL to K/uL', () => {
        const result = convertToStandardUnit('wbc', 6500, 'cells/ul');
        expect(result.value).toBeCloseTo(6.5, 1);
        expect(result.unit).toBe('K/uL');
        expect(result.converted).toBe(true);
      });
    });

    describe('alp conversions', () => {
      it('should not change U/L values', () => {
        const result = convertToStandardUnit('alp', 70, 'U/L');
        expect(result.value).toBe(70);
        expect(result.unit).toBe('U/L');
        expect(result.converted).toBe(false);
      });

      it('should handle IU/L alias', () => {
        const result = convertToStandardUnit('alp', 70, 'IU/L');
        expect(result.value).toBe(70);
        expect(result.unit).toBe('U/L');
        expect(result.converted).toBe(false);
      });
    });

    it('should return original value when unit not recognized', () => {
      const result = convertToStandardUnit('albumin', 4.5, 'xyz');
      expect(result.value).toBe(4.5);
      expect(result.unit).toBe('xyz');
      expect(result.converted).toBe(false);
    });
  });

  describe('detectUnitFromValue', () => {
    describe('albumin detection', () => {
      it('should detect g/dL for typical values', () => {
        const result = detectUnitFromValue('albumin', 4.5);
        expect(result.likelyUnit).toBe('g/dL');
        expect(result.confidence).toBeGreaterThan(0.5);
      });

      it('should detect g/L for higher values', () => {
        const result = detectUnitFromValue('albumin', 45);
        expect(result.likelyUnit).toBe('g/L');
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });

    describe('glucose detection', () => {
      it('should detect mg/dL for typical US values', () => {
        const result = detectUnitFromValue('glucose', 85);
        expect(result.likelyUnit).toBe('mg/dL');
        expect(result.confidence).toBeGreaterThan(0.5);
      });

      it('should detect mmol/L for typical SI values', () => {
        const result = detectUnitFromValue('glucose', 4.7);
        expect(result.likelyUnit).toBe('mmol/L');
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });

    describe('creatinine detection', () => {
      it('should detect mg/dL for typical US values', () => {
        const result = detectUnitFromValue('creatinine', 0.9);
        expect(result.likelyUnit).toBe('mg/dL');
        expect(result.confidence).toBeGreaterThan(0.5);
      });

      it('should detect μmol/L for typical SI values', () => {
        const result = detectUnitFromValue('creatinine', 80);
        expect(result.likelyUnit).toBe('μmol/L');
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });

    describe('wbc detection', () => {
      it('should detect K/uL for typical values', () => {
        const result = detectUnitFromValue('wbc', 6.5);
        expect(result.likelyUnit).toBe('K/uL');
        expect(result.confidence).toBeGreaterThan(0.5);
      });

      it('should detect cells/uL for high values', () => {
        const result = detectUnitFromValue('wbc', 6500);
        expect(result.likelyUnit).toBe('cells/uL');
        expect(result.confidence).toBeGreaterThan(0.5);
      });
    });

    it('should return low confidence for out-of-range values', () => {
      const result = detectUnitFromValue('albumin', 1000);
      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe('smartConvert', () => {
    it('should use provided unit when available', () => {
      const result = smartConvert('glucose', 4.7, 'mmol/L');
      expect(result.value).toBeCloseTo(85, 0);
      expect(result.unit).toBe('mg/dL');
      expect(result.unitDetected).toBe(false);
      expect(result.converted).toBe(true);
    });

    it('should detect unit when not provided', () => {
      const result = smartConvert('albumin', 45, null);
      expect(result.value).toBeCloseTo(4.5, 1);
      expect(result.unit).toBe('g/dL');
      expect(result.unitDetected).toBe(true);
    });

    it('should not convert when value is already in standard unit range', () => {
      const result = smartConvert('albumin', 4.5, null);
      expect(result.value).toBe(4.5);
      expect(result.unitDetected).toBe(true);
    });
  });

  describe('formatWithUnit', () => {
    it('should format value with unit and default decimals', () => {
      expect(formatWithUnit(4.5, 'g/dL')).toBe('4.50 g/dL');
    });

    it('should format value with custom decimals', () => {
      expect(formatWithUnit(4.567, 'g/dL', 1)).toBe('4.6 g/dL');
    });

    it('should format integer values', () => {
      expect(formatWithUnit(85, 'mg/dL', 0)).toBe('85 mg/dL');
    });
  });

  describe('UNIT_CONVERSIONS', () => {
    it('should have conversions for all 9 biomarkers', () => {
      const biomarkers = [
        'albumin', 'creatinine', 'glucose', 'crp',
        'lymphocytePercent', 'mcv', 'rdw', 'alp', 'wbc'
      ];

      biomarkers.forEach((biomarker) => {
        expect(UNIT_CONVERSIONS[biomarker as keyof typeof UNIT_CONVERSIONS]).toBeDefined();
        expect(UNIT_CONVERSIONS[biomarker as keyof typeof UNIT_CONVERSIONS].length).toBeGreaterThan(0);
      });
    });
  });

  describe('STANDARD_UNITS', () => {
    it('should define standard units for all biomarkers', () => {
      expect(STANDARD_UNITS.albumin).toBe('g/dL');
      expect(STANDARD_UNITS.creatinine).toBe('mg/dL');
      expect(STANDARD_UNITS.glucose).toBe('mg/dL');
      expect(STANDARD_UNITS.crp).toBe('mg/L');
      expect(STANDARD_UNITS.lymphocytePercent).toBe('%');
      expect(STANDARD_UNITS.mcv).toBe('fL');
      expect(STANDARD_UNITS.rdw).toBe('%');
      expect(STANDARD_UNITS.alp).toBe('U/L');
      expect(STANDARD_UNITS.wbc).toBe('K/uL');
    });
  });
});
