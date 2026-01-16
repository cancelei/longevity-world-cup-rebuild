/**
 * OCR Module for Biomarker Extraction
 */

// Types
export * from './types';

// Image processing
export {
  preprocessImage,
  convertToPng,
  getImageMetadata,
  autoRotate,
  splitIntoRegions,
  enhanceFadedDocument,
  removeColoredBackground,
  preprocessFast,
  resizeIfNeeded,
  processImagesParallel,
  checkImageQuality,
} from './image-processor';

// OCR service
export {
  recognizeImage,
  recognizeWithFallback,
  recognizeMultipleImages,
  detectText,
  terminateWorker,
  type OcrResult,
} from './ocr-service';

// PDF processing
export {
  getPdfInfo,
  renderPdfPage,
  convertPdfToImages,
  convertPdfToImagesParallel,
  isPdf,
  extractPdfText,
  needsOcr,
  type PdfPageImage,
  type PdfInfo,
} from './pdf-processor';

// Biomarker extraction
export {
  BIOMARKER_ALIASES,
  BIOMARKER_UNITS,
  fuzzyMatchBiomarker,
  extractNumericValue,
  extractUnit,
  calculateConfidence,
  extractBiomarkerFromText,
  extractAllBiomarkers,
  extractFromMultiplePages,
  getConfidenceLevel,
  shouldAutoFill,
} from './biomarker-extractor';

// Unit conversion
export {
  UNIT_CONVERSIONS,
  STANDARD_UNITS,
  convertToStandardUnit,
  detectUnitFromValue,
  smartConvert,
  formatWithUnit,
} from './unit-converter';

// Confidence scoring
export {
  calculateComprehensiveConfidence,
  getConfidenceExplanation,
  aggregateConfidence,
  getExtractionSummary,
  scoreNameMatch,
  scoreValueRange,
  scoreUnitRecognition,
  scoreContextClarity,
  type ConfidenceBreakdown,
} from './confidence-scorer';

// Error handling
export {
  OcrError,
  OcrErrorCode,
  createOcrError,
  formatOcrErrorResponse,
  OCR_ERROR_DETAILS,
  type OcrErrorDetails,
} from './errors';

// File format support
export {
  FILE_FORMAT_MAP,
  EXTENSION_TO_MIME,
  detectFileFormat,
  detectFromMagicBytes,
  isFormatSupported,
  getSupportedMimeTypes,
  getSupportedExtensions,
  getSupportedFormatsDisplay,
  convertToStandardFormat,
  validateFile,
  getAcceptString,
  getFileExtension,
  type FileCategory,
  type FileFormatInfo,
  type FileValidationResult,
} from './file-formats';
