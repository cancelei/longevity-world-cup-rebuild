/**
 * OCR Error Types
 * Provides specific error types for better error handling and user feedback
 */

export enum OcrErrorCode {
  // File errors
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  CORRUPTED_FILE = 'CORRUPTED_FILE',
  EMPTY_FILE = 'EMPTY_FILE',

  // Processing errors
  IMAGE_PROCESSING_FAILED = 'IMAGE_PROCESSING_FAILED',
  OCR_ENGINE_FAILED = 'OCR_ENGINE_FAILED',
  PDF_CONVERSION_FAILED = 'PDF_CONVERSION_FAILED',
  LOW_QUALITY_IMAGE = 'LOW_QUALITY_IMAGE',

  // Extraction errors
  NO_TEXT_DETECTED = 'NO_TEXT_DETECTED',
  NO_BIOMARKERS_FOUND = 'NO_BIOMARKERS_FOUND',
  EXTRACTION_TIMEOUT = 'EXTRACTION_TIMEOUT',

  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // Unknown
  UNKNOWN = 'UNKNOWN',
}

export interface OcrErrorDetails {
  code: OcrErrorCode;
  message: string;
  userMessage: string;
  suggestion?: string;
  retryable: boolean;
}

export const OCR_ERROR_DETAILS: Record<OcrErrorCode, Omit<OcrErrorDetails, 'code'>> = {
  [OcrErrorCode.FILE_TOO_LARGE]: {
    message: 'File exceeds maximum size limit',
    userMessage: 'This file is too large to process.',
    suggestion: 'Please upload a file smaller than 10MB.',
    retryable: false,
  },
  [OcrErrorCode.INVALID_FILE_TYPE]: {
    message: 'Invalid file type',
    userMessage: 'This file type is not supported.',
    suggestion: 'Please upload a PDF, PNG, or JPG file.',
    retryable: false,
  },
  [OcrErrorCode.CORRUPTED_FILE]: {
    message: 'File appears to be corrupted',
    userMessage: 'We couldn\'t read this file.',
    suggestion: 'Try re-downloading or re-scanning your lab report.',
    retryable: false,
  },
  [OcrErrorCode.EMPTY_FILE]: {
    message: 'File is empty',
    userMessage: 'This file appears to be empty.',
    suggestion: 'Please upload a valid lab report.',
    retryable: false,
  },
  [OcrErrorCode.IMAGE_PROCESSING_FAILED]: {
    message: 'Failed to process image',
    userMessage: 'We had trouble processing your image.',
    suggestion: 'Try uploading a clearer photo or scan.',
    retryable: true,
  },
  [OcrErrorCode.OCR_ENGINE_FAILED]: {
    message: 'OCR engine error',
    userMessage: 'Text extraction failed.',
    suggestion: 'Please try again in a moment.',
    retryable: true,
  },
  [OcrErrorCode.PDF_CONVERSION_FAILED]: {
    message: 'PDF conversion failed',
    userMessage: 'We couldn\'t process this PDF.',
    suggestion: 'Try exporting the PDF again or take a screenshot of the page.',
    retryable: true,
  },
  [OcrErrorCode.LOW_QUALITY_IMAGE]: {
    message: 'Image quality too low',
    userMessage: 'The image quality is too low for accurate reading.',
    suggestion: 'Please upload a clearer, higher resolution image.',
    retryable: false,
  },
  [OcrErrorCode.NO_TEXT_DETECTED]: {
    message: 'No text detected in image',
    userMessage: 'We couldn\'t find any text in this file.',
    suggestion: 'Make sure the image contains your lab report values.',
    retryable: false,
  },
  [OcrErrorCode.NO_BIOMARKERS_FOUND]: {
    message: 'No biomarkers found',
    userMessage: 'We couldn\'t find any biomarker values.',
    suggestion: 'Make sure your lab report includes the required blood tests (Albumin, Creatinine, Glucose, CRP, WBC, etc.).',
    retryable: false,
  },
  [OcrErrorCode.EXTRACTION_TIMEOUT]: {
    message: 'Extraction timed out',
    userMessage: 'Processing took too long.',
    suggestion: 'Try uploading a smaller file or fewer pages.',
    retryable: true,
  },
  [OcrErrorCode.NETWORK_ERROR]: {
    message: 'Network error',
    userMessage: 'Connection problem occurred.',
    suggestion: 'Check your internet connection and try again.',
    retryable: true,
  },
  [OcrErrorCode.SERVICE_UNAVAILABLE]: {
    message: 'Service temporarily unavailable',
    userMessage: 'Our service is temporarily busy.',
    suggestion: 'Please wait a moment and try again.',
    retryable: true,
  },
  [OcrErrorCode.UNKNOWN]: {
    message: 'Unknown error',
    userMessage: 'Something went wrong.',
    suggestion: 'Please try again or contact support if the problem persists.',
    retryable: true,
  },
};

/**
 * Custom OCR Error class
 */
export class OcrError extends Error {
  readonly code: OcrErrorCode;
  readonly userMessage: string;
  readonly suggestion?: string;
  readonly retryable: boolean;
  readonly originalError?: Error;

  constructor(code: OcrErrorCode, originalError?: Error) {
    const details = OCR_ERROR_DETAILS[code];
    super(details.message);
    this.name = 'OcrError';
    this.code = code;
    this.userMessage = details.userMessage;
    this.suggestion = details.suggestion;
    this.retryable = details.retryable;
    this.originalError = originalError;

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OcrError);
    }
  }

  toJSON(): OcrErrorDetails {
    return {
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      suggestion: this.suggestion,
      retryable: this.retryable,
    };
  }
}

/**
 * Create an OCR error from an unknown error
 */
export function createOcrError(error: unknown): OcrError {
  if (error instanceof OcrError) {
    return error;
  }

  if (error instanceof Error) {
    // Try to categorize the error
    const message = error.message.toLowerCase();

    if (message.includes('timeout') || message.includes('timed out')) {
      return new OcrError(OcrErrorCode.EXTRACTION_TIMEOUT, error);
    }
    if (message.includes('network') || message.includes('fetch')) {
      return new OcrError(OcrErrorCode.NETWORK_ERROR, error);
    }
    if (message.includes('corrupt') || message.includes('invalid')) {
      return new OcrError(OcrErrorCode.CORRUPTED_FILE, error);
    }
    if (message.includes('sharp') || message.includes('image')) {
      return new OcrError(OcrErrorCode.IMAGE_PROCESSING_FAILED, error);
    }
    if (message.includes('tesseract') || message.includes('ocr')) {
      return new OcrError(OcrErrorCode.OCR_ENGINE_FAILED, error);
    }
    if (message.includes('pdf')) {
      return new OcrError(OcrErrorCode.PDF_CONVERSION_FAILED, error);
    }

    return new OcrError(OcrErrorCode.UNKNOWN, error);
  }

  return new OcrError(OcrErrorCode.UNKNOWN);
}

/**
 * Format error for API response
 */
export function formatOcrErrorResponse(error: unknown): {
  error: string;
  userMessage: string;
  suggestion?: string;
  retryable: boolean;
  code: OcrErrorCode;
} {
  const ocrError = createOcrError(error);
  return {
    error: ocrError.message,
    userMessage: ocrError.userMessage,
    suggestion: ocrError.suggestion,
    retryable: ocrError.retryable,
    code: ocrError.code,
  };
}
