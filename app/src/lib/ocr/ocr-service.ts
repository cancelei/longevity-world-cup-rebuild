/**
 * OCR Service - Domain Service for Lab Report Processing
 *
 * Extracts text from lab report images/PDFs using Tesseract.js.
 * This service handles the OCR portion; biomarker extraction is in biomarker-extractor.ts.
 *
 * ## Processing Pipeline
 * 1. Image preprocessing (grayscale, threshold, denoise)
 * 2. OCR text extraction via Tesseract.js
 * 3. Biomarker value extraction (in biomarker-extractor.ts)
 * 4. Confidence scoring (in confidence-scorer.ts)
 *
 * ## Extension Points
 * - **Alternative OCR Engines**: Replace getWorker() to use:
 *   - Google Cloud Vision API (higher accuracy for complex layouts)
 *   - AWS Textract (structured document extraction)
 *   - Azure Computer Vision
 *   - Custom ML models for specific lab formats
 *
 * - **Preprocessing Strategies**: Add to recognizeWithFallback()
 * - **Language Support**: Modify getWorker() language parameter
 *
 * @module lib/ocr/ocr-service
 */

import { createWorker, Worker, RecognizeResult } from 'tesseract.js';
import { preprocessImage, autoRotate } from './image-processor';
import { PreprocessingOptions, DEFAULT_PREPROCESSING } from './types';

// Singleton worker instance for reuse
let workerInstance: Worker | null = null;
let workerInitializing = false;
const workerQueue: Array<{
  resolve: (worker: Worker) => void;
  reject: (error: Error) => void;
}> = [];

/**
 * Get Tesseract worker paths for Node.js/Next.js environment
 */
function getWorkerPaths() {
  // Use CDN paths for reliable loading in both dev and production
  return {
    workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@7/dist/worker.min.js',
    corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@6/tesseract-core-simd-lstm.wasm.js',
  };
}

/**
 * Get or create a Tesseract worker instance
 * Uses singleton pattern for efficiency
 */
async function getWorker(): Promise<Worker> {
  if (workerInstance) {
    return workerInstance;
  }

  // If already initializing, queue this request
  if (workerInitializing) {
    return new Promise((resolve, reject) => {
      workerQueue.push({ resolve, reject });
    });
  }

  workerInitializing = true;

  try {
    const paths = getWorkerPaths();

    const worker = await createWorker('eng', 1, {
      ...paths,
      logger: (m) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Tesseract]', m.status, Math.round(m.progress * 100) + '%');
        }
      },
      cacheMethod: 'none', // Avoid caching issues in serverless
    });

    workerInstance = worker;

    // Resolve any queued requests
    while (workerQueue.length > 0) {
      const queued = workerQueue.shift();
      queued?.resolve(worker);
    }

    return worker;
  } catch (error) {
    // Reject any queued requests
    while (workerQueue.length > 0) {
      const queued = workerQueue.shift();
      queued?.reject(error as Error);
    }
    throw error;
  } finally {
    workerInitializing = false;
  }
}

/**
 * Terminate the worker instance (cleanup)
 */
export async function terminateWorker(): Promise<void> {
  if (workerInstance) {
    await workerInstance.terminate();
    workerInstance = null;
  }
}

/**
 * OCR result with confidence information
 */
export interface OcrResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: { x0: number; y0: number; x1: number; y1: number };
  }>;
  lines: Array<{
    text: string;
    confidence: number;
    words: string[];
  }>;
}

/**
 * Perform OCR on an image buffer
 */
export async function recognizeImage(
  imageBuffer: Buffer,
  options: {
    preprocess?: boolean;
    preprocessingOptions?: PreprocessingOptions;
    language?: string;
  } = {}
): Promise<OcrResult> {
  const { preprocess = true, preprocessingOptions = DEFAULT_PREPROCESSING } = options;

  // Auto-rotate based on EXIF
  let processedBuffer = await autoRotate(imageBuffer);

  // Apply preprocessing if enabled
  if (preprocess) {
    processedBuffer = await preprocessImage(processedBuffer, preprocessingOptions);
  }

  const worker = await getWorker();

  const result: RecognizeResult = await worker.recognize(processedBuffer);

  // Extract structured data from result
  // Tesseract.js structure: data contains blocks > paragraphs > lines > words
  // We need to flatten the structure to get words and lines
  const extractedWords: { text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } }[] = [];
  const extractedLines: { text: string; confidence: number; words: string[] }[] = [];

  // Extract from blocks structure if available
  const blocks = (result.data as unknown as { blocks?: Array<{ paragraphs?: Array<{ lines?: Array<{ text: string; confidence: number; words?: Array<{ text: string; confidence: number; bbox: { x0: number; y0: number; x1: number; y1: number } }> }> }> }> }).blocks || [];

  for (const block of blocks) {
    for (const paragraph of block.paragraphs || []) {
      for (const line of paragraph.lines || []) {
        const lineWords: string[] = [];
        for (const word of line.words || []) {
          extractedWords.push({
            text: word.text,
            confidence: word.confidence / 100,
            bbox: word.bbox,
          });
          lineWords.push(word.text);
        }
        extractedLines.push({
          text: line.text,
          confidence: line.confidence / 100,
          words: lineWords,
        });
      }
    }
  }

  return {
    text: result.data.text,
    confidence: result.data.confidence / 100,
    words: extractedWords,
    lines: extractedLines,
  };
}

/**
 * Perform OCR with multiple preprocessing strategies and pick best result
 * Useful for difficult documents
 */
export async function recognizeWithFallback(imageBuffer: Buffer): Promise<OcrResult> {
  const strategies: PreprocessingOptions[] = [
    // Strategy 1: Default preprocessing
    DEFAULT_PREPROCESSING,
    // Strategy 2: No threshold (for colored documents)
    { ...DEFAULT_PREPROCESSING, threshold: undefined },
    // Strategy 3: Higher threshold (for faded documents)
    { ...DEFAULT_PREPROCESSING, threshold: 180 },
    // Strategy 4: Minimal preprocessing
    { grayscale: true, normalize: true },
  ];

  let bestResult: OcrResult | null = null;
  let bestConfidence = 0;

  for (const strategy of strategies) {
    try {
      const result = await recognizeImage(imageBuffer, {
        preprocess: true,
        preprocessingOptions: strategy,
      });

      if (result.confidence > bestConfidence) {
        bestConfidence = result.confidence;
        bestResult = result;
      }

      // If we get high confidence, no need to try more strategies
      if (result.confidence > 0.85) {
        break;
      }
    } catch {
      // Continue to next strategy on error
      continue;
    }
  }

  if (!bestResult) {
    throw new Error('All OCR strategies failed');
  }

  return bestResult;
}

/**
 * Extract text from multiple image buffers (for multi-page documents)
 */
export async function recognizeMultipleImages(
  imageBuffers: Buffer[],
  options: {
    preprocess?: boolean;
    preprocessingOptions?: PreprocessingOptions;
  } = {}
): Promise<{
  pages: OcrResult[];
  combinedText: string;
  averageConfidence: number;
}> {
  const pages: OcrResult[] = [];

  for (const buffer of imageBuffers) {
    const result = await recognizeImage(buffer, options);
    pages.push(result);
  }

  const combinedText = pages.map((p) => p.text).join('\n\n--- PAGE BREAK ---\n\n');
  const averageConfidence =
    pages.length > 0
      ? pages.reduce((sum, p) => sum + p.confidence, 0) / pages.length
      : 0;

  return {
    pages,
    combinedText,
    averageConfidence,
  };
}

/**
 * Quick text detection - faster but less accurate
 * Useful for detecting if an image contains text
 */
export async function detectText(imageBuffer: Buffer): Promise<{
  hasText: boolean;
  estimatedTextDensity: number;
}> {
  const result = await recognizeImage(imageBuffer, {
    preprocess: true,
    preprocessingOptions: {
      grayscale: true,
      normalize: true,
    },
  });

  const wordCount = result.words.length;
  const hasText = wordCount > 5;

  // Estimate text density based on word count and confidence
  const estimatedTextDensity = Math.min(1, (wordCount / 100) * result.confidence);

  return {
    hasText,
    estimatedTextDensity,
  };
}
