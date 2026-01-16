/**
 * File Format Support for Lab Report Uploads
 * Handles detection, validation, and conversion of various file formats
 *
 * NOTE: This file is server-only due to Sharp dependency.
 * For client components, use file-formats-client.ts instead.
 */

import 'server-only';
import sharp from 'sharp';

/**
 * Supported file categories
 */
export type FileCategory = 'pdf' | 'image' | 'document' | 'unknown';

/**
 * Detailed file format information
 */
export interface FileFormatInfo {
  mimeType: string;
  extension: string;
  category: FileCategory;
  displayName: string;
  needsConversion: boolean;
  conversionTarget?: 'png' | 'jpeg';
}

/**
 * Comprehensive MIME type mappings
 * Maps various MIME types and extensions to standardized format info
 */
export const FILE_FORMAT_MAP: Record<string, FileFormatInfo> = {
  // PDF
  'application/pdf': {
    mimeType: 'application/pdf',
    extension: 'pdf',
    category: 'pdf',
    displayName: 'PDF Document',
    needsConversion: false,
  },

  // Standard image formats (directly supported)
  'image/png': {
    mimeType: 'image/png',
    extension: 'png',
    category: 'image',
    displayName: 'PNG Image',
    needsConversion: false,
  },
  'image/jpeg': {
    mimeType: 'image/jpeg',
    extension: 'jpg',
    category: 'image',
    displayName: 'JPEG Image',
    needsConversion: false,
  },
  'image/jpg': {
    mimeType: 'image/jpeg',
    extension: 'jpg',
    category: 'image',
    displayName: 'JPEG Image',
    needsConversion: false,
  },

  // WebP (modern format, widely used)
  'image/webp': {
    mimeType: 'image/webp',
    extension: 'webp',
    category: 'image',
    displayName: 'WebP Image',
    needsConversion: true,
    conversionTarget: 'png',
  },

  // HEIC/HEIF (Apple devices)
  'image/heic': {
    mimeType: 'image/heic',
    extension: 'heic',
    category: 'image',
    displayName: 'HEIC Image (Apple)',
    needsConversion: true,
    conversionTarget: 'png',
  },
  'image/heif': {
    mimeType: 'image/heif',
    extension: 'heif',
    category: 'image',
    displayName: 'HEIF Image',
    needsConversion: true,
    conversionTarget: 'png',
  },

  // TIFF (common for scanned documents)
  'image/tiff': {
    mimeType: 'image/tiff',
    extension: 'tiff',
    category: 'image',
    displayName: 'TIFF Image',
    needsConversion: true,
    conversionTarget: 'png',
  },
  'image/tif': {
    mimeType: 'image/tiff',
    extension: 'tif',
    category: 'image',
    displayName: 'TIFF Image',
    needsConversion: true,
    conversionTarget: 'png',
  },

  // BMP (legacy format)
  'image/bmp': {
    mimeType: 'image/bmp',
    extension: 'bmp',
    category: 'image',
    displayName: 'BMP Image',
    needsConversion: true,
    conversionTarget: 'png',
  },
  'image/x-bmp': {
    mimeType: 'image/bmp',
    extension: 'bmp',
    category: 'image',
    displayName: 'BMP Image',
    needsConversion: true,
    conversionTarget: 'png',
  },
  'image/x-ms-bmp': {
    mimeType: 'image/bmp',
    extension: 'bmp',
    category: 'image',
    displayName: 'BMP Image',
    needsConversion: true,
    conversionTarget: 'png',
  },

  // GIF (sometimes used for simple scans)
  'image/gif': {
    mimeType: 'image/gif',
    extension: 'gif',
    category: 'image',
    displayName: 'GIF Image',
    needsConversion: true,
    conversionTarget: 'png',
  },

  // AVIF (modern format)
  'image/avif': {
    mimeType: 'image/avif',
    extension: 'avif',
    category: 'image',
    displayName: 'AVIF Image',
    needsConversion: true,
    conversionTarget: 'png',
  },

  // SVG (unlikely but possible)
  'image/svg+xml': {
    mimeType: 'image/svg+xml',
    extension: 'svg',
    category: 'image',
    displayName: 'SVG Image',
    needsConversion: true,
    conversionTarget: 'png',
  },
};

/**
 * Extension to MIME type fallback mapping
 * Used when browser doesn't provide correct MIME type
 */
export const EXTENSION_TO_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
  tiff: 'image/tiff',
  tif: 'image/tiff',
  bmp: 'image/bmp',
  gif: 'image/gif',
  avif: 'image/avif',
  svg: 'image/svg+xml',
};

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

/**
 * Detect file format from MIME type and/or filename
 * Falls back to magic byte detection if needed
 */
export function detectFileFormat(
  mimeType: string,
  filename: string,
  buffer?: Buffer
): FileFormatInfo | null {
  // Normalize MIME type
  const normalizedMime = mimeType.toLowerCase().trim();

  // First, try direct MIME type lookup
  if (FILE_FORMAT_MAP[normalizedMime]) {
    return FILE_FORMAT_MAP[normalizedMime];
  }

  // Fall back to extension-based detection
  const extension = getFileExtension(filename);
  if (extension && EXTENSION_TO_MIME[extension]) {
    const fallbackMime = EXTENSION_TO_MIME[extension];
    if (FILE_FORMAT_MAP[fallbackMime]) {
      return FILE_FORMAT_MAP[fallbackMime];
    }
  }

  // Try magic byte detection if buffer is provided
  if (buffer) {
    const detectedFormat = detectFromMagicBytes(buffer);
    if (detectedFormat) {
      return detectedFormat;
    }
  }

  return null;
}

/**
 * Detect file format from magic bytes (file signature)
 */
export function detectFromMagicBytes(buffer: Buffer): FileFormatInfo | null {
  if (buffer.length < 12) return null;

  // PDF: starts with %PDF
  if (buffer.subarray(0, 4).toString() === '%PDF') {
    return FILE_FORMAT_MAP['application/pdf'];
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return FILE_FORMAT_MAP['image/png'];
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return FILE_FORMAT_MAP['image/jpeg'];
  }

  // WebP: RIFF....WEBP
  if (
    buffer.subarray(0, 4).toString() === 'RIFF' &&
    buffer.subarray(8, 12).toString() === 'WEBP'
  ) {
    return FILE_FORMAT_MAP['image/webp'];
  }

  // GIF: GIF87a or GIF89a
  if (buffer.subarray(0, 3).toString() === 'GIF') {
    return FILE_FORMAT_MAP['image/gif'];
  }

  // BMP: BM
  if (buffer[0] === 0x42 && buffer[1] === 0x4d) {
    return FILE_FORMAT_MAP['image/bmp'];
  }

  // TIFF: II (little endian) or MM (big endian)
  if (
    (buffer[0] === 0x49 && buffer[1] === 0x49) ||
    (buffer[0] === 0x4d && buffer[1] === 0x4d)
  ) {
    return FILE_FORMAT_MAP['image/tiff'];
  }

  // HEIC/HEIF: ftyp followed by heic, heix, hevc, hevx, mif1, msf1
  if (buffer.subarray(4, 8).toString() === 'ftyp') {
    const brand = buffer.subarray(8, 12).toString();
    if (['heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1'].includes(brand)) {
      return FILE_FORMAT_MAP['image/heic'];
    }
    // AVIF
    if (brand === 'avif' || brand === 'avis') {
      return FILE_FORMAT_MAP['image/avif'];
    }
  }

  return null;
}

/**
 * Check if a file format is supported
 */
export function isFormatSupported(mimeType: string, filename: string): boolean {
  return detectFileFormat(mimeType, filename) !== null;
}

/**
 * Get list of all supported MIME types
 */
export function getSupportedMimeTypes(): string[] {
  return Object.keys(FILE_FORMAT_MAP);
}

/**
 * Get list of all supported extensions
 */
export function getSupportedExtensions(): string[] {
  return Object.keys(EXTENSION_TO_MIME);
}

/**
 * Get human-readable list of supported formats
 */
export function getSupportedFormatsDisplay(): string {
  const formats = new Set<string>();
  for (const info of Object.values(FILE_FORMAT_MAP)) {
    formats.add(info.extension.toUpperCase());
  }
  return Array.from(formats).sort().join(', ');
}

/**
 * Convert image buffer to a standard format for OCR processing
 */
export async function convertToStandardFormat(
  buffer: Buffer,
  formatInfo: FileFormatInfo
): Promise<{ buffer: Buffer; originalFormat: string; converted: boolean }> {
  // If no conversion needed, return as-is
  if (!formatInfo.needsConversion) {
    return {
      buffer,
      originalFormat: formatInfo.extension,
      converted: false,
    };
  }

  try {
    let sharpInstance = sharp(buffer);

    // Handle animated formats (GIF, WebP) - take first frame
    if (formatInfo.extension === 'gif' || formatInfo.extension === 'webp') {
      sharpInstance = sharpInstance.toFormat('png', { progressive: false });
    }

    // Convert to target format
    const targetFormat = formatInfo.conversionTarget || 'png';

    if (targetFormat === 'png') {
      sharpInstance = sharpInstance.png({ compressionLevel: 6 });
    } else {
      sharpInstance = sharpInstance.jpeg({ quality: 95 });
    }

    const convertedBuffer = await sharpInstance.toBuffer();

    return {
      buffer: convertedBuffer,
      originalFormat: formatInfo.extension,
      converted: true,
    };
  } catch (error) {
    // If conversion fails, throw with helpful message
    throw new Error(
      `Failed to convert ${formatInfo.displayName} to ${formatInfo.conversionTarget}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Validate file before processing
 */
export interface FileValidationResult {
  valid: boolean;
  formatInfo: FileFormatInfo | null;
  errors: string[];
  warnings: string[];
}

export function validateFile(
  file: { type: string; name: string; size: number },
  buffer?: Buffer,
  maxSizeMb: number = 10
): FileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check file size
  const maxSizeBytes = maxSizeMb * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    errors.push(`File too large. Maximum size is ${maxSizeMb}MB, got ${(file.size / 1024 / 1024).toFixed(1)}MB`);
  }

  if (file.size === 0) {
    errors.push('File is empty');
  }

  // Detect format
  const formatInfo = detectFileFormat(file.type, file.name, buffer);

  if (!formatInfo) {
    const extension = getFileExtension(file.name);
    errors.push(
      `Unsupported file format: ${file.type || extension || 'unknown'}. ` +
      `Supported formats: ${getSupportedFormatsDisplay()}`
    );
  } else {
    // Add warnings for formats that need conversion
    if (formatInfo.needsConversion) {
      warnings.push(
        `${formatInfo.displayName} will be converted to ${formatInfo.conversionTarget?.toUpperCase()} for processing`
      );
    }

    // Warn about potentially problematic formats
    if (formatInfo.extension === 'gif') {
      warnings.push('GIF format may have reduced quality. Consider using PNG or JPEG for best results.');
    }

    if (formatInfo.extension === 'svg') {
      warnings.push('SVG images may not render correctly. Consider using a raster format (PNG, JPEG).');
    }
  }

  return {
    valid: errors.length === 0,
    formatInfo,
    errors,
    warnings,
  };
}

/**
 * Get accept string for file input elements
 */
export function getAcceptString(): string {
  const mimeTypes = getSupportedMimeTypes();
  const extensions = getSupportedExtensions().map((ext) => `.${ext}`);
  return [...mimeTypes, ...extensions].join(',');
}
