/**
 * File Format Utilities (Client-Safe)
 * Detection and validation only - no conversion (that requires Sharp on server)
 */

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

  // WebP
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

  // TIFF
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

  // BMP
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

  // GIF
  'image/gif': {
    mimeType: 'image/gif',
    extension: 'gif',
    category: 'image',
    displayName: 'GIF Image',
    needsConversion: true,
    conversionTarget: 'png',
  },

  // AVIF
  'image/avif': {
    mimeType: 'image/avif',
    extension: 'avif',
    category: 'image',
    displayName: 'AVIF Image',
    needsConversion: true,
    conversionTarget: 'png',
  },

  // SVG
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
 * Detect file format from MIME type and/or filename (client-safe, no buffer)
 */
export function detectFileFormat(
  mimeType: string,
  filename: string
): FileFormatInfo | null {
  const normalizedMime = mimeType.toLowerCase().trim();

  if (FILE_FORMAT_MAP[normalizedMime]) {
    return FILE_FORMAT_MAP[normalizedMime];
  }

  const extension = getFileExtension(filename);
  if (extension && EXTENSION_TO_MIME[extension]) {
    const fallbackMime = EXTENSION_TO_MIME[extension];
    if (FILE_FORMAT_MAP[fallbackMime]) {
      return FILE_FORMAT_MAP[fallbackMime];
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
 * File validation result
 */
export interface FileValidationResult {
  valid: boolean;
  formatInfo: FileFormatInfo | null;
  errors: string[];
  warnings: string[];
}

/**
 * Validate file before processing (client-safe)
 */
export function validateFile(
  file: { type: string; name: string; size: number },
  maxSizeMb: number = 10
): FileValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const maxSizeBytes = maxSizeMb * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    errors.push(`File too large. Maximum size is ${maxSizeMb}MB, got ${(file.size / 1024 / 1024).toFixed(1)}MB`);
  }

  if (file.size === 0) {
    errors.push('File is empty');
  }

  const formatInfo = detectFileFormat(file.type, file.name);

  if (!formatInfo) {
    const extension = getFileExtension(file.name);
    errors.push(
      `Unsupported file format: ${file.type || extension || 'unknown'}. ` +
      `Supported formats: ${getSupportedFormatsDisplay()}`
    );
  } else {
    if (formatInfo.needsConversion) {
      warnings.push(
        `${formatInfo.displayName} will be converted to ${formatInfo.conversionTarget?.toUpperCase()} for processing`
      );
    }

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
