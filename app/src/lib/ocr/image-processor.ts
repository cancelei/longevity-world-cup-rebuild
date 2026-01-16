/**
 * Image Processor for OCR Preprocessing
 * Uses Sharp for image manipulation to improve OCR accuracy
 * Optimized for performance with caching and parallel processing
 *
 * NOTE: Server-only module due to Sharp dependency
 */

import 'server-only';
import sharp from 'sharp';
import { PreprocessingOptions, DEFAULT_PREPROCESSING } from './types';

// Configure sharp for better performance
sharp.cache({ files: 50, memory: 200, items: 100 });
sharp.concurrency(2); // Limit concurrent operations for stability

/**
 * Preprocess an image buffer for optimal OCR results
 * Applies grayscale conversion, contrast normalization, thresholding, and sharpening
 */
export async function preprocessImage(
  imageBuffer: Buffer,
  options: PreprocessingOptions = DEFAULT_PREPROCESSING
): Promise<Buffer> {
  const opts = { ...DEFAULT_PREPROCESSING, ...options };

  let pipeline = sharp(imageBuffer);

  // Get image metadata for DPI calculations
  const metadata = await pipeline.metadata();

  // 1. Resize to target DPI equivalent (assuming A4/Letter size)
  // 300 DPI at letter size = ~2550x3300 pixels
  if (opts.targetDpi && metadata.width && metadata.height) {
    const maxDimension = Math.max(metadata.width, metadata.height);
    const targetMaxDimension = opts.targetDpi * 11; // 11 inches (letter height)

    if (maxDimension < targetMaxDimension * 0.8) {
      // Upscale small images
      pipeline = pipeline.resize({
        width: Math.round(metadata.width * (targetMaxDimension / maxDimension)),
        height: Math.round(metadata.height * (targetMaxDimension / maxDimension)),
        fit: 'inside',
        kernel: 'lanczos3',
      });
    }
  }

  // 2. Convert to grayscale
  if (opts.grayscale) {
    pipeline = pipeline.grayscale();
  }

  // 3. Normalize contrast (auto-levels)
  if (opts.normalize) {
    pipeline = pipeline.normalize();
  }

  // 4. Apply sharpening to enhance edges
  if (opts.sharpen) {
    pipeline = pipeline.sharpen({
      sigma: 1.5,
      m1: 1.0,
      m2: 0.5,
    });
  }

  // 5. Apply median filter for noise reduction
  if (opts.denoise) {
    pipeline = pipeline.median(3);
  }

  // 6. Apply threshold (binarization) for cleaner text
  if (opts.threshold) {
    pipeline = pipeline.threshold(opts.threshold);
  }

  // Output as PNG for lossless quality
  return pipeline.png().toBuffer();
}

/**
 * Convert image to PNG format (required by some OCR operations)
 */
export async function convertToPng(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer).png().toBuffer();
}

/**
 * Get image metadata
 */
export async function getImageMetadata(imageBuffer: Buffer): Promise<{
  width: number;
  height: number;
  format: string;
  size: number;
}> {
  const metadata = await sharp(imageBuffer).metadata();

  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
    format: metadata.format || 'unknown',
    size: imageBuffer.length,
  };
}

/**
 * Rotate image to correct orientation based on EXIF data
 */
export async function autoRotate(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer).rotate().toBuffer();
}

/**
 * Split a large image into regions for parallel OCR processing
 * Useful for multi-column layouts
 */
export async function splitIntoRegions(
  imageBuffer: Buffer,
  rows: number = 1,
  cols: number = 1
): Promise<Buffer[]> {
  const metadata = await sharp(imageBuffer).metadata();

  if (!metadata.width || !metadata.height) {
    return [imageBuffer];
  }

  const regionWidth = Math.floor(metadata.width / cols);
  const regionHeight = Math.floor(metadata.height / rows);
  const regions: Buffer[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const region = await sharp(imageBuffer)
        .extract({
          left: col * regionWidth,
          top: row * regionHeight,
          width: regionWidth,
          height: regionHeight,
        })
        .toBuffer();

      regions.push(region);
    }
  }

  return regions;
}

/**
 * Enhance contrast specifically for faded lab reports
 */
export async function enhanceFadedDocument(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .grayscale()
    .linear(1.5, -30) // Increase contrast
    .normalize()
    .sharpen({ sigma: 2 })
    .toBuffer();
}

/**
 * Remove color background (common in lab reports)
 * Converts colored backgrounds to white
 */
export async function removeColoredBackground(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .grayscale()
    .normalize()
    .threshold(200) // High threshold to remove light backgrounds
    .negate() // Invert
    .threshold(50) // Keep only dark text
    .negate() // Invert back
    .toBuffer();
}

/**
 * Fast preprocessing for quick checks
 * Minimal processing for speed when full quality isn't needed
 */
export async function preprocessFast(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .grayscale()
    .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 6 })
    .toBuffer();
}

/**
 * Resize image if needed to fit within constraints
 * Returns original if already within bounds
 */
export async function resizeIfNeeded(
  imageBuffer: Buffer,
  maxDimension: number = 4000
): Promise<{ buffer: Buffer; wasResized: boolean }> {
  const metadata = await sharp(imageBuffer).metadata();

  if (!metadata.width || !metadata.height) {
    return { buffer: imageBuffer, wasResized: false };
  }

  const maxDim = Math.max(metadata.width, metadata.height);

  if (maxDim <= maxDimension) {
    return { buffer: imageBuffer, wasResized: false };
  }

  const scale = maxDimension / maxDim;
  const resized = await sharp(imageBuffer)
    .resize({
      width: Math.round(metadata.width * scale),
      height: Math.round(metadata.height * scale),
      fit: 'inside',
    })
    .toBuffer();

  return { buffer: resized, wasResized: true };
}

/**
 * Process multiple images in parallel with controlled concurrency
 */
export async function processImagesParallel<T>(
  buffers: Buffer[],
  processor: (buffer: Buffer, index: number) => Promise<T>,
  concurrency: number = 2
): Promise<T[]> {
  const results: T[] = [];

  for (let i = 0; i < buffers.length; i += concurrency) {
    const batch = buffers.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((buffer, j) => processor(buffer, i + j))
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Check if image is suitable for OCR (has sufficient contrast and resolution)
 */
export async function checkImageQuality(imageBuffer: Buffer): Promise<{
  isAcceptable: boolean;
  issues: string[];
  metadata: { width: number; height: number; format: string };
}> {
  const metadata = await sharp(imageBuffer).metadata();
  const issues: string[] = [];

  const width = metadata.width || 0;
  const height = metadata.height || 0;

  // Check resolution
  if (width < 200 || height < 200) {
    issues.push('Image resolution too low (minimum 200x200)');
  }

  // Check if image is too large (could cause memory issues)
  if (width > 10000 || height > 10000) {
    issues.push('Image dimensions too large (maximum 10000x10000)');
  }

  // Check file size proxy for complexity
  if (imageBuffer.length < 1000) {
    issues.push('Image appears to be empty or very simple');
  }

  return {
    isAcceptable: issues.length === 0,
    issues,
    metadata: {
      width,
      height,
      format: metadata.format || 'unknown',
    },
  };
}
