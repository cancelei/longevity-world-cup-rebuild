/**
 * OCR Upload API Endpoint
 * POST /api/ocr/upload
 *
 * Accepts lab report images/PDFs and performs OCR biomarker extraction
 * Supports: PDF, PNG, JPEG, WebP, HEIC, TIFF, BMP, GIF, AVIF
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { rateLimiters, getClientIdentifier, createRateLimitResponse } from '@/lib/rate-limit';
import {
  recognizeImage,
  convertPdfToImages,
  isPdf,
  extractPdfText,
  needsOcr,
  extractAllBiomarkers,
  extractFromMultiplePages,
  smartConvert,
  aggregateConfidence,
  getExtractionSummary,
  type BiomarkerKey,
  type OcrExtractionResult,
  type BiomarkerExtraction,
} from '@/lib/ocr';
import {
  validateFile,
  convertToStandardFormat,
  getSupportedFormatsDisplay,
} from '@/lib/ocr/file-formats';

// Maximum file size (10MB)
const MAX_FILE_SIZE_MB = 10;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - strict for OCR (very resource intensive)
    const clientId = getClientIdentifier(request);
    const rateLimit = rateLimiters.ocr(clientId);
    if (!rateLimit.success) {
      const { headers } = createRateLimitResponse(rateLimit);
      return NextResponse.json(
        { success: false, error: 'Too many OCR requests. Please try again later.' },
        { status: 429, headers }
      );
    }

    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer for validation
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate file format and size
    const validation = validateFile(
      { type: file.type, name: file.name, size: file.size },
      buffer,
      MAX_FILE_SIZE_MB
    );

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: validation.errors.join('. '),
          supportedFormats: getSupportedFormatsDisplay(),
        },
        { status: 400 }
      );
    }

    const formatInfo = validation.formatInfo!;
    const startTime = Date.now();

    let result: OcrExtractionResult;
    const processingNotes: string[] = [...validation.warnings];

    // Process based on file category
    if (formatInfo.category === 'pdf' || isPdf(buffer)) {
      result = await processPdf(buffer);
    } else {
      // Convert image to standard format if needed
      const { buffer: processableBuffer, converted, originalFormat } =
        await convertToStandardFormat(buffer, formatInfo);

      if (converted) {
        processingNotes.push(`Converted from ${originalFormat.toUpperCase()} to PNG`);
      }

      result = await processImage(processableBuffer);
    }

    const processingTime = Date.now() - startTime;

    // Return results
    return NextResponse.json({
      success: true,
      result: {
        ...result,
        processingTimeMs: processingTime,
      },
      summary: getExtractionSummary(result.extractions),
      stats: aggregateConfidence(result.extractions),
      fileInfo: {
        originalFormat: formatInfo.displayName,
        originalMimeType: file.type,
        fileName: file.name,
        fileSize: file.size,
      },
      processingNotes: processingNotes.length > 0 ? processingNotes : undefined,
    });
  } catch (error) {
    console.error('OCR processing error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'OCR processing failed',
        supportedFormats: getSupportedFormatsDisplay(),
      },
      { status: 500 }
    );
  }
}

/**
 * Process a PDF file
 */
async function processPdf(buffer: Buffer): Promise<OcrExtractionResult> {
  const errors: string[] = [];

  // First, try to extract embedded text
  const hasEmbeddedText = !(await needsOcr(buffer));

  if (hasEmbeddedText) {
    // PDF has embedded text, extract directly
    const { pages, fullText } = await extractPdfText(buffer);

    const extractions = extractFromMultiplePages(
      pages.map((p) => ({ text: p.text, pageNumber: p.pageNumber }))
    );

    // Apply unit conversions
    const convertedExtractions = applyUnitConversions(extractions);

    return {
      success: true,
      extractions: convertedExtractions,
      rawText: fullText,
      pageCount: pages.length,
      processingTimeMs: 0,
      errors,
    };
  }

  // PDF needs OCR - convert to images first
  const { pages: pageImages, totalPages } = await convertPdfToImages(buffer, {
    maxPages: 10, // Limit to first 10 pages
  });

  if (pageImages.length === 0) {
    errors.push('Could not extract any pages from PDF');
    return createEmptyResult(errors, totalPages);
  }

  // Run OCR on each page
  const pageTexts: Array<{ text: string; pageNumber: number }> = [];

  for (const pageImage of pageImages) {
    try {
      const ocrResult = await recognizeImage(pageImage.imageBuffer);
      pageTexts.push({
        text: ocrResult.text,
        pageNumber: pageImage.pageNumber,
      });
    } catch (err) {
      errors.push(`Failed to OCR page ${pageImage.pageNumber}: ${err}`);
    }
  }

  if (pageTexts.length === 0) {
    errors.push('OCR failed on all pages');
    return createEmptyResult(errors, totalPages);
  }

  // Extract biomarkers from all pages
  const extractions = extractFromMultiplePages(pageTexts);
  const convertedExtractions = applyUnitConversions(extractions);
  const rawText = pageTexts.map((p) => `--- Page ${p.pageNumber} ---\n${p.text}`).join('\n\n');

  return {
    success: true,
    extractions: convertedExtractions,
    rawText,
    pageCount: totalPages,
    processingTimeMs: 0,
    errors,
  };
}

/**
 * Process an image file
 */
async function processImage(buffer: Buffer): Promise<OcrExtractionResult> {
  const errors: string[] = [];

  try {
    const ocrResult = await recognizeImage(buffer);
    const extractions = extractAllBiomarkers(ocrResult.text, 1);
    const convertedExtractions = applyUnitConversions(extractions);

    return {
      success: true,
      extractions: convertedExtractions,
      rawText: ocrResult.text,
      pageCount: 1,
      processingTimeMs: 0,
      errors,
    };
  } catch (err) {
    errors.push(`OCR failed: ${err}`);
    return createEmptyResult(errors, 1);
  }
}

/**
 * Apply unit conversions to all extractions
 */
function applyUnitConversions(
  extractions: Record<BiomarkerKey, BiomarkerExtraction>
): Record<BiomarkerKey, BiomarkerExtraction> {
  const result: Record<string, BiomarkerExtraction> = {};

  for (const [key, extraction] of Object.entries(extractions)) {
    const biomarker = key as BiomarkerKey;

    if (extraction.value !== null) {
      const converted = smartConvert(biomarker, extraction.value, extraction.unit);

      result[biomarker] = {
        ...extraction,
        value: converted.value,
        unit: converted.unit,
        // Adjust confidence if unit was detected/converted
        confidence: extraction.confidence * converted.confidence,
      };
    } else {
      result[biomarker] = extraction;
    }
  }

  return result as Record<BiomarkerKey, BiomarkerExtraction>;
}

/**
 * Create an empty result with errors
 */
function createEmptyResult(errors: string[], pageCount: number): OcrExtractionResult {
  const biomarkers: BiomarkerKey[] = [
    'albumin', 'creatinine', 'glucose', 'crp',
    'lymphocytePercent', 'mcv', 'rdw', 'alp', 'wbc',
  ];

  const emptyExtractions: Record<string, BiomarkerExtraction> = {};

  for (const biomarker of biomarkers) {
    emptyExtractions[biomarker] = {
      biomarker,
      value: null,
      unit: null,
      confidence: 0,
      rawText: '',
      lineNumber: -1,
      pageNumber: 0,
    };
  }

  return {
    success: false,
    extractions: emptyExtractions as Record<BiomarkerKey, BiomarkerExtraction>,
    rawText: '',
    pageCount,
    processingTimeMs: 0,
    errors,
  };
}
