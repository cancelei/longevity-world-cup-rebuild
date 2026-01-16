import { describe, it, expect } from 'vitest';
import {
  extractAllBiomarkers,
  extractBiomarkerFromText,
  extractFromMultiplePages,
} from '../biomarker-extractor';
import { smartConvert } from '../unit-converter';
import { aggregateConfidence, getExtractionSummary } from '../confidence-scorer';
import { calculatePhenoAge, calculateAgeReduction } from '../../phenoage';
import {
  TEST_PARTICIPANTS,
  OCR_EDGE_CASES,
  QUEST_FORMAT,
  LABCORP_FORMAT,
  GERMAN_LAB_FORMAT,
  CZECH_LAB_FORMAT,
  FRENCH_LAB_FORMAT,
  SIMPLE_FORMAT,
} from './fixtures/lab-report-fixtures';
import type { BiomarkerKey } from '../types';

/**
 * Real-world extraction tests based on actual LWC participant data
 */
describe('Real-World Lab Report Extraction', () => {
  describe('Participant Profile Extraction', () => {
    TEST_PARTICIPANTS.forEach((participant) => {
      describe(`${participant.name} (${participant.chronologicalAge}yo, ${participant.expectedAgeReduction}yr reduction)`, () => {
        it('should extract biomarkers from simple format', () => {
          const text = SIMPLE_FORMAT.template(participant.biomarkers);
          const results = extractAllBiomarkers(text);

          // Check key biomarkers are extracted
          expect(results.albumin.value).toBeCloseTo(participant.biomarkers.albumin, 1);
          expect(results.creatinine.value).toBeCloseTo(participant.biomarkers.creatinine, 1);
          expect(results.glucose.value).toBeCloseTo(participant.biomarkers.glucose, 0);
          expect(results.crp.value).toBeCloseTo(participant.biomarkers.crp, 1);
          expect(results.wbc.value).toBeCloseTo(participant.biomarkers.wbc, 1);
        });

        it('should calculate PhenoAge consistently', () => {
          // Extract and calculate
          const extractedBiomarkers = {
            ...participant.biomarkers,
            chronologicalAge: participant.chronologicalAge,
          };

          const phenoAge = calculatePhenoAge(extractedBiomarkers);
          const ageReduction = calculateAgeReduction(participant.chronologicalAge, phenoAge);

          // Verify calculation produces valid numbers
          expect(typeof phenoAge).toBe('number');
          expect(isFinite(phenoAge)).toBe(true);
          expect(phenoAge).toBeGreaterThan(0);
          expect(phenoAge).toBeLessThan(150);

          // Verify age reduction is consistent with phenoAge
          expect(ageReduction).toBeCloseTo(participant.chronologicalAge - phenoAge, 1);
        });

        it('should extract from Quest format', () => {
          const text = QUEST_FORMAT.template(participant.biomarkers);

          // Test individual extractions (more reliable)
          expect(extractBiomarkerFromText(text, 'albumin').value).toBeCloseTo(
            participant.biomarkers.albumin,
            1
          );
          expect(extractBiomarkerFromText(text, 'glucose').value).toBeCloseTo(
            participant.biomarkers.glucose,
            0
          );
          expect(extractBiomarkerFromText(text, 'crp').value).toBeCloseTo(
            participant.biomarkers.crp,
            1
          );
        });

        it('should extract from LabCorp format', () => {
          const text = LABCORP_FORMAT.template(participant.biomarkers);

          expect(extractBiomarkerFromText(text, 'albumin').value).toBeCloseTo(
            participant.biomarkers.albumin,
            1
          );
          expect(extractBiomarkerFromText(text, 'creatinine').value).toBeCloseTo(
            participant.biomarkers.creatinine,
            1
          );
        });
      });
    });
  });

  describe('International Lab Formats', () => {
    const participant = TEST_PARTICIPANTS[0]; // Michael Lustgarten

    describe('German Lab Format (SI Units)', () => {
      it('should recognize German aliases', () => {
        const text = GERMAN_LAB_FORMAT.template(participant.biomarkers);

        // German uses "Leukozyten" for WBC
        const wbcResult = extractBiomarkerFromText(text, 'wbc');
        expect(wbcResult.value).toBeCloseTo(participant.biomarkers.wbc, 1);

        // German uses "Kreatinin" for creatinine
        const creatResult = extractBiomarkerFromText(text, 'creatinine');
        expect(creatResult.value).not.toBeNull();
      });

      it('should convert SI units to standard', () => {
        // Albumin: 49 g/L should convert to 4.9 g/dL
        const result = smartConvert('albumin', 49, 'g/L');
        expect(result.value).toBeCloseTo(4.9, 1);
        expect(result.converted).toBe(true);

        // Creatinine: 75 μmol/L should convert to ~0.85 mg/dL
        const creatResult = smartConvert('creatinine', 75, 'μmol/L');
        expect(creatResult.value).toBeCloseTo(0.85, 1);

        // Glucose: 4.3 mmol/L should convert to ~77 mg/dL
        const glucResult = smartConvert('glucose', 4.3, 'mmol/L');
        expect(glucResult.value).toBeCloseTo(77, 0);
      });
    });

    describe('Czech Lab Format', () => {
      it('should recognize Czech aliases', () => {
        const text = CZECH_LAB_FORMAT.template(participant.biomarkers);

        // Czech uses "Leukocyty"
        const wbcResult = extractBiomarkerFromText(text, 'wbc');
        expect(wbcResult.value).toBeCloseTo(participant.biomarkers.wbc, 1);

        // Czech uses "Lymfocyty"
        const lymphResult = extractBiomarkerFromText(text, 'lymphocytePercent');
        expect(lymphResult.value).toBeCloseTo(participant.biomarkers.lymphocytePercent, 1);
      });
    });

    describe('French Lab Format', () => {
      it('should recognize French aliases', () => {
        const text = FRENCH_LAB_FORMAT.template(participant.biomarkers);

        // French uses "Albumine"
        const albResult = extractBiomarkerFromText(text, 'albumin');
        expect(albResult.value).not.toBeNull();

        // French uses "Créatinine"
        const creatResult = extractBiomarkerFromText(text, 'creatinine');
        expect(creatResult.value).not.toBeNull();

        // French uses "Glycémie" for glucose
        const glucResult = extractBiomarkerFromText(text, 'glucose');
        expect(glucResult.value).not.toBeNull();
      });
    });
  });

  describe('OCR Edge Cases', () => {
    describe('European Decimal Format', () => {
      it('should handle comma as decimal separator', () => {
        const text = OCR_EDGE_CASES.europeanDecimals;

        expect(extractBiomarkerFromText(text, 'albumin').value).toBe(4.5);
        expect(extractBiomarkerFromText(text, 'creatinine').value).toBe(0.95);
        expect(extractBiomarkerFromText(text, 'crp').value).toBe(0.8);
      });
    });

    describe('Comparison Operators', () => {
      it('should extract values with < or > operators', () => {
        const text = OCR_EDGE_CASES.comparisonOperators;

        expect(extractBiomarkerFromText(text, 'crp').value).toBe(0.5);
        expect(extractBiomarkerFromText(text, 'creatinine').value).toBe(0.7);
        expect(extractBiomarkerFromText(text, 'albumin').value).toBe(4.2);
      });
    });

    describe('Inline Reference Ranges', () => {
      it('should extract values ignoring reference ranges in parentheses', () => {
        const text = OCR_EDGE_CASES.inlineRanges;

        expect(extractBiomarkerFromText(text, 'albumin').value).toBe(4.5);
        expect(extractBiomarkerFromText(text, 'creatinine').value).toBe(0.9);
        expect(extractBiomarkerFromText(text, 'glucose').value).toBe(85);
        expect(extractBiomarkerFromText(text, 'crp').value).toBe(0.8);
      });
    });

    describe('Flagged Values', () => {
      it('should extract values ignoring HIGH/LOW/ABNORMAL flags', () => {
        const text = OCR_EDGE_CASES.flaggedValues;

        expect(extractBiomarkerFromText(text, 'albumin').value).toBe(4.5);
        expect(extractBiomarkerFromText(text, 'creatinine').value).toBe(1.5);
        expect(extractBiomarkerFromText(text, 'glucose').value).toBe(65);
        expect(extractBiomarkerFromText(text, 'crp').value).toBe(5.2);
      });
    });

    describe('RDW Ratio Conversion', () => {
      it('should convert RDW ratio to percentage', () => {
        const text = 'RDW: 0.125';
        const result = extractBiomarkerFromText(text, 'rdw');
        expect(result.value).toBe(12.5);
      });

      it('should not convert RDW when already percentage', () => {
        const text = 'RDW: 12.5 %';
        const result = extractBiomarkerFromText(text, 'rdw');
        expect(result.value).toBe(12.5);
      });
    });

    describe('Abbreviated Names', () => {
      it('should recognize common abbreviations', () => {
        const text = OCR_EDGE_CASES.abbreviatedNames;

        expect(extractBiomarkerFromText(text, 'albumin').value).toBe(4.5);
        expect(extractBiomarkerFromText(text, 'creatinine').value).toBe(0.9);
        expect(extractBiomarkerFromText(text, 'glucose').value).toBe(85);
        expect(extractBiomarkerFromText(text, 'alp').value).toBe(65);
        expect(extractBiomarkerFromText(text, 'wbc').value).toBe(6.0);
      });
    });
  });

  describe('Unit Detection and Conversion', () => {
    describe('Albumin Unit Detection', () => {
      it('should detect g/L and convert to g/dL', () => {
        const result = smartConvert('albumin', 45, null);
        expect(result.unitDetected).toBe(true);
        expect(result.value).toBeCloseTo(4.5, 1);
      });

      it('should recognize g/dL without conversion', () => {
        const result = smartConvert('albumin', 4.5, 'g/dL');
        expect(result.converted).toBe(false);
        expect(result.value).toBe(4.5);
      });
    });

    describe('Creatinine Unit Detection', () => {
      it('should detect μmol/L and convert to mg/dL', () => {
        const result = smartConvert('creatinine', 80, null);
        expect(result.unitDetected).toBe(true);
        expect(result.value).toBeCloseTo(0.9, 1);
      });

      it('should recognize mg/dL without conversion', () => {
        const result = smartConvert('creatinine', 0.9, 'mg/dL');
        expect(result.converted).toBe(false);
      });
    });

    describe('Glucose Unit Detection', () => {
      it('should detect mmol/L and convert to mg/dL', () => {
        const result = smartConvert('glucose', 5.0, null);
        expect(result.unitDetected).toBe(true);
        expect(result.value).toBeCloseTo(90, 0);
      });

      it('should recognize mg/dL without conversion', () => {
        const result = smartConvert('glucose', 90, 'mg/dL');
        expect(result.converted).toBe(false);
      });
    });

    describe('WBC Unit Detection', () => {
      it('should detect cells/uL and convert to K/uL', () => {
        const result = smartConvert('wbc', 6500, 'cells/uL');
        expect(result.value).toBeCloseTo(6.5, 1);
        expect(result.converted).toBe(true);
      });

      it('should handle 10^9/L as equivalent to K/uL', () => {
        const result = smartConvert('wbc', 6.5, '10^9/L');
        expect(result.value).toBe(6.5);
      });
    });
  });

  describe('Confidence Scoring', () => {
    const participant = TEST_PARTICIPANTS[0];

    it('should rate complete extraction as excellent', () => {
      const text = SIMPLE_FORMAT.template(participant.biomarkers);
      const results = extractAllBiomarkers(text);
      const quality = aggregateConfidence(results);

      expect(quality.missingCount).toBe(0);
      expect(['excellent', 'good']).toContain(quality.overallQuality);
    });

    it('should identify missing biomarkers', () => {
      const partialText = `
Albumin: 4.5 g/dL
Glucose: 85 mg/dL
`.trim();

      const results = extractAllBiomarkers(partialText);
      const quality = aggregateConfidence(results);

      expect(quality.missingCount).toBeGreaterThan(0);
    });

    it('should generate meaningful summary', () => {
      const text = SIMPLE_FORMAT.template(participant.biomarkers);
      const results = extractAllBiomarkers(text);
      const summary = getExtractionSummary(results);

      expect(summary).toContain('extraction');
    });
  });

  describe('Multi-Page Document Handling', () => {
    const participant = TEST_PARTICIPANTS[0];

    it('should merge results from multiple pages', () => {
      const page1 = {
        text: `
METABOLIC PANEL
Albumin: ${participant.biomarkers.albumin} g/dL
Creatinine: ${participant.biomarkers.creatinine} mg/dL
Glucose: ${participant.biomarkers.glucose} mg/dL
CRP: ${participant.biomarkers.crp} mg/L
ALP: ${participant.biomarkers.alp} U/L
`.trim(),
        pageNumber: 1,
      };

      const page2 = {
        text: `
BLOOD COUNT
WBC: ${participant.biomarkers.wbc} K/uL
RDW: ${participant.biomarkers.rdw} %
MCV: ${participant.biomarkers.mcv} fL
Lymphocyte %: ${participant.biomarkers.lymphocytePercent} %
`.trim(),
        pageNumber: 2,
      };

      const results = extractFromMultiplePages([page1, page2]);

      // Check all biomarkers were found
      expect(results.albumin.value).toBeCloseTo(participant.biomarkers.albumin, 1);
      expect(results.wbc.value).toBeCloseTo(participant.biomarkers.wbc, 1);

      // Check page numbers are correct
      expect(results.albumin.pageNumber).toBe(1);
      expect(results.wbc.pageNumber).toBe(2);

      // All should be found
      const quality = aggregateConfidence(results);
      expect(quality.missingCount).toBe(0);
    });

    it('should prefer higher confidence when value appears on multiple pages', () => {
      const page1 = {
        text: 'Albumin: 4.2 g/dL',
        pageNumber: 1,
      };

      const page2 = {
        text: 'Maybe albumin is 4.0 or 4.5 or something',
        pageNumber: 2,
      };

      const results = extractFromMultiplePages([page1, page2]);

      // Should prefer page 1 (clearer extraction)
      expect(results.albumin.value).toBe(4.2);
      expect(results.albumin.pageNumber).toBe(1);
    });
  });

  describe('PhenoAge Formula Validation', () => {
    it('should produce valid PhenoAge for all profiles', () => {
      // Test that formula produces valid numbers for all participants
      for (const participant of TEST_PARTICIPANTS) {
        const phenoAge = calculatePhenoAge({
          ...participant.biomarkers,
          chronologicalAge: participant.chronologicalAge,
        });

        expect(typeof phenoAge).toBe('number');
        expect(isFinite(phenoAge)).toBe(true);
        expect(phenoAge).toBeGreaterThan(0);
        expect(phenoAge).toBeLessThan(150);
      }
    });

    it('should calculate higher PhenoAge for worse biomarkers', () => {
      // Accelerated aging profile should have higher PhenoAge than healthy profiles
      const healthy = TEST_PARTICIPANTS.find((p) => p.name === 'Michael Lustgarten')!;
      const accelerated = TEST_PARTICIPANTS.find((p) => p.name === 'Accelerated Aging')!;

      const healthyPhenoAge = calculatePhenoAge({
        ...healthy.biomarkers,
        chronologicalAge: 45, // Use same age for comparison
      });

      const acceleratedPhenoAge = calculatePhenoAge({
        ...accelerated.biomarkers,
        chronologicalAge: 45,
      });

      // Worse biomarkers should produce higher PhenoAge
      expect(acceleratedPhenoAge).toBeGreaterThan(healthyPhenoAge);
    });

    it('should calculate accelerated aging for poor biomarkers', () => {
      const accelerated = TEST_PARTICIPANTS.find((p) => p.name === 'Accelerated Aging')!;
      const phenoAge = calculatePhenoAge({
        ...accelerated.biomarkers,
        chronologicalAge: accelerated.chronologicalAge,
      });

      // Should be older than chronological age
      expect(phenoAge).toBeGreaterThan(accelerated.chronologicalAge);
    });
  });
});

describe('Comprehensive Extraction Coverage', () => {
  describe('All Biomarkers Individual Tests', () => {
    const biomarkerTests: Array<{
      key: BiomarkerKey;
      texts: string[];
      expectedValue: number;
    }> = [
      {
        key: 'albumin',
        texts: [
          'Albumin: 4.5 g/dL',
          'ALB: 4.5',
          'Albumine: 4.5 g/dL',
          'Serum Albumin: 4.5 g/dL',
        ],
        expectedValue: 4.5,
      },
      {
        key: 'creatinine',
        texts: [
          'Creatinine: 0.9 mg/dL',
          'CREAT: 0.9',
          'Kreatinin: 0.9 mg/dL',
          'Créatinine: 0.9 mg/dL',
          'Serum Creatinine: 0.9 mg/dL',
        ],
        expectedValue: 0.9,
      },
      {
        key: 'glucose',
        texts: [
          'Glucose: 85 mg/dL',
          'GLU: 85',
          'Fasting Glucose: 85 mg/dL',
          'Glucose, Fasting: 85 mg/dL',
          'Glukose: 85 mg/dL',
          'Glycémie: 85 mg/dL',
        ],
        expectedValue: 85,
      },
      {
        key: 'crp',
        texts: [
          'CRP: 0.8 mg/L',
          'C-Reactive Protein: 0.8 mg/L',
          'hs-CRP: 0.8 mg/L',
          'hsCRP: 0.8 mg/L',
          'High-Sensitivity CRP: 0.8 mg/L',
        ],
        expectedValue: 0.8,
      },
      {
        key: 'lymphocytePercent',
        texts: [
          'Lymphocyte %: 32 %',
          'Lymph %: 32 %',
          'Lymphocytes: 32 %',
          'Lymfocyty: 32 %',
          'Lymphocyte Percent: 32 %',
        ],
        expectedValue: 32,
      },
      {
        key: 'mcv',
        texts: [
          'MCV: 90 fL',
          'Mean Corpuscular Volume: 90 fL',
          'Mean Cell Volume: 90 fL',
        ],
        expectedValue: 90,
      },
      {
        key: 'rdw',
        texts: [
          'RDW: 12.5 %',
          'Red Cell Distribution Width: 12.5 %',
          'RDW-CV: 12.5 %',
        ],
        expectedValue: 12.5,
      },
      {
        key: 'alp',
        texts: [
          'ALP: 65 U/L',
          'Alkaline Phosphatase: 65 U/L',
          'Alk Phos: 65 U/L',
          'Alkalische Phosphatase: 65 U/L',
        ],
        expectedValue: 65,
      },
      {
        key: 'wbc',
        texts: [
          'WBC: 6.0 K/uL',
          'White Blood Cell: 6.0 K/uL',
          'White Blood Cell Count: 6.0 K/uL',
          'Leukocytes: 6.0 10^9/L',
          'Leukozyten: 6.0 10^9/L',
          'Globules Blancs: 6.0 G/L',
        ],
        expectedValue: 6.0,
      },
    ];

    biomarkerTests.forEach(({ key, texts, expectedValue }) => {
      describe(`${key}`, () => {
        texts.forEach((text) => {
          it(`should extract from "${text.substring(0, 30)}..."`, () => {
            const result = extractBiomarkerFromText(text, key);
            expect(result.value).toBeCloseTo(expectedValue, 1);
          });
        });
      });
    });
  });
});
