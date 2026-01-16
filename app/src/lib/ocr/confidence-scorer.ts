/**
 * Confidence Scorer for OCR Biomarker Extraction
 * Provides comprehensive confidence scoring with explanations
 */

import {
  BiomarkerKey,
  BiomarkerExtraction,
  ConfidenceFactors,
  CONFIDENCE_THRESHOLDS,
  ConfidenceBreakdownDetailed,
} from './types';
import { BIOMARKER_RANGES } from '../phenoage';

/**
 * Detailed confidence breakdown with explanations
 */
export interface ConfidenceBreakdown {
  overall: number;
  factors: ConfidenceFactors;
  level: 'high' | 'medium' | 'low' | 'none';
  autoFill: boolean;
  warnings: string[];
  suggestions: string[];
}

/**
 * Weights for confidence factors
 */
const CONFIDENCE_WEIGHTS = {
  nameMatchQuality: 0.30,
  valueInRange: 0.25,
  unitRecognized: 0.20,
  contextClarity: 0.15,
  ocrConfidence: 0.10,
} as const;

/**
 * Score the name match quality
 */
export function scoreNameMatch(
  matchedText: string,
  biomarker: BiomarkerKey,
  isExactMatch: boolean
): { score: number; warning?: string } {
  if (isExactMatch) {
    return { score: 1.0 };
  }

  if (!matchedText) {
    return { score: 0, warning: `Could not find "${biomarker}" in the document` };
  }

  // Partial match based on text similarity
  const score = 0.7;
  return {
    score,
    warning: `Partial match found for "${biomarker}": "${matchedText}"`,
  };
}

/**
 * Score whether value is in expected range
 */
export function scoreValueRange(
  biomarker: BiomarkerKey,
  value: number | null
): { score: number; warning?: string; suggestion?: string } {
  if (value === null) {
    return {
      score: 0,
      warning: 'No numeric value found',
      suggestion: 'Please enter the value manually',
    };
  }

  const range = BIOMARKER_RANGES[biomarker];
  if (!range) {
    return { score: 0.5 };
  }

  // Check optimal range
  if (value >= range.optimal.min && value <= range.optimal.max) {
    return { score: 1.0 };
  }

  // Check acceptable range
  if (value >= range.min && value <= range.max) {
    return { score: 0.9 };
  }

  // Slightly outside range (might be unit issue)
  if (value >= range.min * 0.5 && value <= range.max * 2) {
    return {
      score: 0.5,
      warning: `Value ${value} is outside typical range (${range.min}-${range.max})`,
      suggestion: 'Please verify the value and unit are correct',
    };
  }

  // Way outside range (likely wrong value or unit)
  return {
    score: 0.1,
    warning: `Value ${value} is far outside expected range (${range.min}-${range.max})`,
    suggestion: 'This may indicate a unit conversion issue or misread value',
  };
}

/**
 * Score unit recognition
 */
export function scoreUnitRecognition(
  biomarker: BiomarkerKey,
  unit: string | null,
  wasConverted: boolean
): { score: number; warning?: string } {
  if (!unit) {
    return {
      score: 0.3,
      warning: 'Unit not recognized - assumed standard unit',
    };
  }

  if (wasConverted) {
    return {
      score: 0.8,
      warning: `Value was converted from ${unit} to standard unit`,
    };
  }

  return { score: 1.0 };
}

/**
 * Score context clarity (how isolated/clear the value is)
 */
export function scoreContextClarity(
  rawText: string,
  value: number | null
): { score: number; warning?: string } {
  if (!rawText || value === null) {
    return { score: 0.3 };
  }

  // Check if there are multiple numbers nearby (ambiguous context)
  const numbers = rawText.match(/\d+\.?\d*/g) || [];

  if (numbers.length === 1) {
    return { score: 1.0 };
  }

  if (numbers.length === 2) {
    // Might be value + reference range, which is fine
    return { score: 0.85 };
  }

  if (numbers.length > 3) {
    return {
      score: 0.5,
      warning: 'Multiple values found nearby - please verify correct value was extracted',
    };
  }

  return { score: 0.7 };
}

/**
 * Calculate comprehensive confidence score
 */
export function calculateComprehensiveConfidence(
  extraction: BiomarkerExtraction,
  options: {
    ocrConfidence?: number;
    isExactNameMatch?: boolean;
    wasUnitConverted?: boolean;
  } = {}
): ConfidenceBreakdown {
  const {
    ocrConfidence = 0.8,
    isExactNameMatch = extraction.confidence > 0.9,
    wasUnitConverted = false,
  } = options;

  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Score each factor
  const nameResult = scoreNameMatch(
    extraction.rawText,
    extraction.biomarker,
    isExactNameMatch
  );
  if (nameResult.warning) warnings.push(nameResult.warning);

  const rangeResult = scoreValueRange(extraction.biomarker, extraction.value);
  if (rangeResult.warning) warnings.push(rangeResult.warning);
  if (rangeResult.suggestion) suggestions.push(rangeResult.suggestion);

  const unitResult = scoreUnitRecognition(
    extraction.biomarker,
    extraction.unit,
    wasUnitConverted
  );
  if (unitResult.warning) warnings.push(unitResult.warning);

  const contextResult = scoreContextClarity(extraction.rawText, extraction.value);
  if (contextResult.warning) warnings.push(contextResult.warning);

  // Build factors object
  const factors: ConfidenceFactors = {
    nameMatchQuality: nameResult.score,
    valueInRange: rangeResult.score,
    unitRecognized: unitResult.score,
    contextClarity: contextResult.score,
    ocrConfidence,
  };

  // Calculate weighted overall score
  const overall = Object.entries(factors).reduce(
    (sum, [key, value]) => sum + value * CONFIDENCE_WEIGHTS[key as keyof typeof CONFIDENCE_WEIGHTS],
    0
  );

  // Determine confidence level
  let level: 'high' | 'medium' | 'low' | 'none';
  if (overall >= CONFIDENCE_THRESHOLDS.HIGH) {
    level = 'high';
  } else if (overall >= CONFIDENCE_THRESHOLDS.MEDIUM) {
    level = 'medium';
  } else if (overall >= CONFIDENCE_THRESHOLDS.LOW) {
    level = 'low';
  } else {
    level = 'none';
  }

  // Determine if should auto-fill
  const autoFill = overall >= CONFIDENCE_THRESHOLDS.MEDIUM && extraction.value !== null;

  return {
    overall,
    factors,
    level,
    autoFill,
    warnings,
    suggestions,
  };
}

/**
 * Get human-readable confidence explanation
 */
export function getConfidenceExplanation(breakdown: ConfidenceBreakdown): string {
  const { overall, level, factors } = breakdown;
  const percentage = Math.round(overall * 100);

  const parts: string[] = [`${percentage}% confidence (${level})`];

  // Add factor explanations for non-perfect scores
  if (factors.nameMatchQuality < 1) {
    parts.push(`name match: ${Math.round(factors.nameMatchQuality * 100)}%`);
  }
  if (factors.valueInRange < 0.9) {
    parts.push(`value range: ${Math.round(factors.valueInRange * 100)}%`);
  }
  if (factors.unitRecognized < 1) {
    parts.push(`unit: ${Math.round(factors.unitRecognized * 100)}%`);
  }

  return parts.join(' | ');
}

/**
 * Aggregate confidence across all biomarkers
 */
export function aggregateConfidence(
  extractions: Record<BiomarkerKey, BiomarkerExtraction>
): {
  averageConfidence: number;
  highConfidenceCount: number;
  mediumConfidenceCount: number;
  lowConfidenceCount: number;
  missingCount: number;
  overallQuality: 'excellent' | 'good' | 'fair' | 'poor';
} {
  const biomarkers = Object.keys(extractions) as BiomarkerKey[];

  let totalConfidence = 0;
  let highConfidenceCount = 0;
  let mediumConfidenceCount = 0;
  let lowConfidenceCount = 0;
  let missingCount = 0;

  for (const biomarker of biomarkers) {
    const extraction = extractions[biomarker];
    totalConfidence += extraction.confidence;

    if (extraction.value === null) {
      missingCount++;
    } else if (extraction.confidence >= CONFIDENCE_THRESHOLDS.HIGH) {
      highConfidenceCount++;
    } else if (extraction.confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) {
      mediumConfidenceCount++;
    } else {
      lowConfidenceCount++;
    }
  }

  const averageConfidence = totalConfidence / biomarkers.length;

  // Determine overall quality
  let overallQuality: 'excellent' | 'good' | 'fair' | 'poor';
  if (highConfidenceCount >= 7 && missingCount <= 1) {
    overallQuality = 'excellent';
  } else if (highConfidenceCount + mediumConfidenceCount >= 6 && missingCount <= 2) {
    overallQuality = 'good';
  } else if (highConfidenceCount + mediumConfidenceCount >= 4) {
    overallQuality = 'fair';
  } else {
    overallQuality = 'poor';
  }

  return {
    averageConfidence,
    highConfidenceCount,
    mediumConfidenceCount,
    lowConfidenceCount,
    missingCount,
    overallQuality,
  };
}

/**
 * Get extraction summary for UI display
 */
export function getExtractionSummary(
  extractions: Record<BiomarkerKey, BiomarkerExtraction>
): string {
  const stats = aggregateConfidence(extractions);

  const parts: string[] = [];

  if (stats.highConfidenceCount > 0) {
    parts.push(`${stats.highConfidenceCount} high confidence`);
  }
  if (stats.mediumConfidenceCount > 0) {
    parts.push(`${stats.mediumConfidenceCount} medium confidence`);
  }
  if (stats.lowConfidenceCount > 0) {
    parts.push(`${stats.lowConfidenceCount} low confidence`);
  }
  if (stats.missingCount > 0) {
    parts.push(`${stats.missingCount} not found`);
  }

  return `${stats.overallQuality.charAt(0).toUpperCase() + stats.overallQuality.slice(1)} extraction: ${parts.join(', ')}`;
}

/**
 * Human-readable descriptions for each confidence factor
 * Reserved for future use in detailed confidence UI
 */
const _FACTOR_DESCRIPTIONS: Record<keyof ConfidenceFactors, string> = {
  nameMatchQuality: 'How closely the detected text matched known biomarker names',
  valueInRange: 'Whether the extracted value falls within expected medical ranges',
  unitRecognized: 'Whether a measurement unit was found and recognized',
  contextClarity: 'How clearly the value was isolated from surrounding text',
  ocrConfidence: 'The text recognition engine\'s confidence in reading the characters',
};

/**
 * Generate explanation text for a confidence factor score
 */
function getFactorExplanation(
  factor: keyof ConfidenceFactors,
  score: number,
  biomarker: BiomarkerKey,
  extraction: BiomarkerExtraction
): string {
  const percentage = Math.round(score * 100);

  switch (factor) {
    case 'nameMatchQuality':
      if (score >= 0.95) return `Exact match found for "${biomarker}"`;
      if (score >= 0.7) return `Partial match: "${extraction.rawText.substring(0, 30)}..."`;
      if (score > 0) return `Weak match detected - text may not refer to ${biomarker}`;
      return `Could not find "${biomarker}" in the document`;

    case 'valueInRange': {
      const range = BIOMARKER_RANGES[biomarker];
      if (!range) return `No reference range available for ${biomarker}`;
      if (score >= 0.9) return `Value ${extraction.value} is within normal range (${range.min}-${range.max})`;
      if (score >= 0.5) return `Value ${extraction.value} is slightly outside typical range`;
      if (extraction.value === null) return 'No numeric value could be extracted';
      return `Value ${extraction.value} is far outside expected range - may indicate wrong value or unit`;
    }

    case 'unitRecognized':
      if (score >= 0.9) return `Standard unit "${extraction.unit}" recognized`;
      if (score >= 0.7) return `Unit converted from "${extraction.unit}" to standard`;
      return 'Unit not found - using assumed standard unit';

    case 'contextClarity': {
      const numbers = (extraction.rawText.match(/\d+\.?\d*/g) || []).length;
      if (score >= 0.9) return 'Value clearly isolated in text';
      if (score >= 0.7) return `${numbers} numbers found nearby - likely includes reference range`;
      return `${numbers} numbers found nearby - verify correct value was extracted`;
    }

    case 'ocrConfidence':
      if (score >= 0.9) return 'Text recognition highly confident';
      if (score >= 0.7) return 'Text recognition moderately confident';
      return 'Text recognition uncertain - image quality may be poor';

    default:
      return `${percentage}% confidence`;
  }
}

/**
 * Generate actionable suggestion for a low-scoring factor
 */
function getFactorSuggestion(
  factor: keyof ConfidenceFactors,
  score: number,
  _biomarker: BiomarkerKey
): string | undefined {
  // Only provide suggestions for scores below threshold
  if (score >= 0.7) return undefined;

  switch (factor) {
    case 'nameMatchQuality':
      return `Try searching for alternative names: albumin, ALB, serum albumin, etc.`;

    case 'valueInRange':
      if (score < 0.3) {
        return 'Check if the unit needs conversion (e.g., mmol/L to mg/dL)';
      }
      return 'Verify the value matches what\'s on your lab report';

    case 'unitRecognized':
      return 'Enter the unit shown on your lab report for accurate conversion';

    case 'contextClarity':
      return 'If multiple values are shown, select the result value (not the reference range)';

    case 'ocrConfidence':
      return 'Try uploading a higher quality image or PDF of your lab report';

    default:
      return undefined;
  }
}

/**
 * Generate detailed confidence breakdown with explanations for UI display
 */
export function generateDetailedConfidenceBreakdown(
  extraction: BiomarkerExtraction,
  options: {
    ocrConfidence?: number;
    isExactNameMatch?: boolean;
    wasUnitConverted?: boolean;
  } = {}
): ConfidenceBreakdownDetailed {
  const {
    ocrConfidence = 0.8,
    isExactNameMatch = extraction.confidence > 0.9,
    wasUnitConverted = false,
  } = options;

  // Get individual factor scores
  const nameResult = scoreNameMatch(extraction.rawText, extraction.biomarker, isExactNameMatch);
  const rangeResult = scoreValueRange(extraction.biomarker, extraction.value);
  const unitResult = scoreUnitRecognition(extraction.biomarker, extraction.unit, wasUnitConverted);
  const contextResult = scoreContextClarity(extraction.rawText, extraction.value);

  // Build detailed factors with explanations
  const factors: ConfidenceBreakdownDetailed['factors'] = {
    nameMatchQuality: {
      score: nameResult.score,
      explanation: getFactorExplanation('nameMatchQuality', nameResult.score, extraction.biomarker, extraction),
      suggestion: getFactorSuggestion('nameMatchQuality', nameResult.score, extraction.biomarker),
    },
    valueInRange: {
      score: rangeResult.score,
      explanation: getFactorExplanation('valueInRange', rangeResult.score, extraction.biomarker, extraction),
      suggestion: getFactorSuggestion('valueInRange', rangeResult.score, extraction.biomarker),
    },
    unitRecognized: {
      score: unitResult.score,
      explanation: getFactorExplanation('unitRecognized', unitResult.score, extraction.biomarker, extraction),
      suggestion: getFactorSuggestion('unitRecognized', unitResult.score, extraction.biomarker),
    },
    contextClarity: {
      score: contextResult.score,
      explanation: getFactorExplanation('contextClarity', contextResult.score, extraction.biomarker, extraction),
      suggestion: getFactorSuggestion('contextClarity', contextResult.score, extraction.biomarker),
    },
    ocrConfidence: {
      score: ocrConfidence,
      explanation: getFactorExplanation('ocrConfidence', ocrConfidence, extraction.biomarker, extraction),
      suggestion: getFactorSuggestion('ocrConfidence', ocrConfidence, extraction.biomarker),
    },
  };

  // Calculate weighted overall score
  const overall =
    factors.nameMatchQuality.score * CONFIDENCE_WEIGHTS.nameMatchQuality +
    factors.valueInRange.score * CONFIDENCE_WEIGHTS.valueInRange +
    factors.unitRecognized.score * CONFIDENCE_WEIGHTS.unitRecognized +
    factors.contextClarity.score * CONFIDENCE_WEIGHTS.contextClarity +
    factors.ocrConfidence.score * CONFIDENCE_WEIGHTS.ocrConfidence;

  // Determine confidence level
  let level: 'high' | 'medium' | 'low' | 'none';
  if (overall >= CONFIDENCE_THRESHOLDS.HIGH) {
    level = 'high';
  } else if (overall >= CONFIDENCE_THRESHOLDS.MEDIUM) {
    level = 'medium';
  } else if (overall >= CONFIDENCE_THRESHOLDS.LOW) {
    level = 'low';
  } else {
    level = 'none';
  }

  // Collect actionable suggestions from low-scoring factors
  const actionableSuggestions: string[] = [];
  for (const [, detail] of Object.entries(factors)) {
    if (detail.suggestion) {
      actionableSuggestions.push(detail.suggestion);
    }
  }

  return {
    overall,
    level,
    factors,
    actionableSuggestions,
  };
}

/**
 * Get color for confidence score (for UI display)
 */
export function getConfidenceColor(score: number): 'green' | 'yellow' | 'orange' | 'red' {
  if (score >= 0.8) return 'green';
  if (score >= 0.5) return 'yellow';
  if (score >= 0.3) return 'orange';
  return 'red';
}

/**
 * Get confidence level label with percentage
 */
export function getConfidenceLevelLabel(overall: number): string {
  const percentage = Math.round(overall * 100);
  if (overall >= CONFIDENCE_THRESHOLDS.HIGH) {
    return `High (${percentage}%)`;
  }
  if (overall >= CONFIDENCE_THRESHOLDS.MEDIUM) {
    return `Medium (${percentage}%)`;
  }
  if (overall >= CONFIDENCE_THRESHOLDS.LOW) {
    return `Low (${percentage}%)`;
  }
  return `Very Low (${percentage}%)`;
}
