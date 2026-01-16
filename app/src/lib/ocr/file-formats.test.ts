/**
 * Comprehensive Tests for File Format Support
 * Tests detection, validation, and conversion for all supported formats
 */

import { describe, it, expect } from 'vitest';
import {
  detectFileFormat,
  detectFromMagicBytes,
  isFormatSupported,
  validateFile,
  getFileExtension,
  getSupportedMimeTypes,
  getSupportedExtensions,
  getSupportedFormatsDisplay,
  getAcceptString,
  FILE_FORMAT_MAP,
  convertToStandardFormat,
  type FileFormatInfo,
} from './file-formats';

// ============================================
// Magic Byte Signatures for Testing
// ============================================

// Magic bytes need at least 12 bytes for detection
const MAGIC_BYTES = {
  // PDF: %PDF-1.4 (padded to 12 bytes)
  pdf: Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x00, 0x00, 0x00, 0x00]),

  // PNG: 89 50 4E 47 0D 0A 1A 0A (padded to 12 bytes)
  png: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00]),

  // JPEG: FF D8 FF E0 (JFIF) (padded to 12 bytes)
  jpeg: Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x00]),

  // WebP: RIFF....WEBP
  webp: Buffer.from([
    0x52, 0x49, 0x46, 0x46, // RIFF
    0x00, 0x00, 0x00, 0x00, // file size (placeholder)
    0x57, 0x45, 0x42, 0x50, // WEBP
  ]),

  // GIF: GIF89a (padded to 12 bytes)
  gif: Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),

  // BMP: BM (padded to 12 bytes)
  bmp: Buffer.from([0x42, 0x4d, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),

  // TIFF Little Endian: II (padded to 12 bytes)
  tiffLE: Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),

  // TIFF Big Endian: MM (padded to 12 bytes)
  tiffBE: Buffer.from([0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),

  // HEIC: ftyp heic
  heic: Buffer.from([
    0x00, 0x00, 0x00, 0x18, // size
    0x66, 0x74, 0x79, 0x70, // ftyp
    0x68, 0x65, 0x69, 0x63, // heic
  ]),

  // AVIF: ftyp avif
  avif: Buffer.from([
    0x00, 0x00, 0x00, 0x18, // size
    0x66, 0x74, 0x79, 0x70, // ftyp
    0x61, 0x76, 0x69, 0x66, // avif
  ]),

  // Unknown/Invalid
  unknown: Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b]),
};

// ============================================
// MIME Type Detection Tests
// ============================================

describe('MIME Type Detection', () => {
  describe('PDF Detection', () => {
    it('detects application/pdf', () => {
      const result = detectFileFormat('application/pdf', 'report.pdf');
      expect(result).not.toBeNull();
      expect(result!.category).toBe('pdf');
      expect(result!.extension).toBe('pdf');
    });
  });

  describe('PNG Detection', () => {
    it('detects image/png', () => {
      const result = detectFileFormat('image/png', 'scan.png');
      expect(result).not.toBeNull();
      expect(result!.category).toBe('image');
      expect(result!.extension).toBe('png');
      expect(result!.needsConversion).toBe(false);
    });
  });

  describe('JPEG Detection', () => {
    it('detects image/jpeg', () => {
      const result = detectFileFormat('image/jpeg', 'photo.jpg');
      expect(result).not.toBeNull();
      expect(result!.category).toBe('image');
      expect(result!.extension).toBe('jpg');
    });

    it('detects image/jpg variant', () => {
      const result = detectFileFormat('image/jpg', 'photo.jpg');
      expect(result).not.toBeNull();
      expect(result!.extension).toBe('jpg');
    });
  });

  describe('WebP Detection', () => {
    it('detects image/webp', () => {
      const result = detectFileFormat('image/webp', 'image.webp');
      expect(result).not.toBeNull();
      expect(result!.category).toBe('image');
      expect(result!.extension).toBe('webp');
      expect(result!.needsConversion).toBe(true);
      expect(result!.conversionTarget).toBe('png');
    });
  });

  describe('HEIC/HEIF Detection', () => {
    it('detects image/heic', () => {
      const result = detectFileFormat('image/heic', 'IMG_1234.HEIC');
      expect(result).not.toBeNull();
      expect(result!.category).toBe('image');
      expect(result!.extension).toBe('heic');
      expect(result!.needsConversion).toBe(true);
      expect(result!.displayName).toContain('Apple');
    });

    it('detects image/heif', () => {
      const result = detectFileFormat('image/heif', 'photo.heif');
      expect(result).not.toBeNull();
      expect(result!.extension).toBe('heif');
    });
  });

  describe('TIFF Detection', () => {
    it('detects image/tiff', () => {
      const result = detectFileFormat('image/tiff', 'scan.tiff');
      expect(result).not.toBeNull();
      expect(result!.category).toBe('image');
      expect(result!.needsConversion).toBe(true);
    });

    it('detects image/tif variant', () => {
      const result = detectFileFormat('image/tif', 'scan.tif');
      expect(result).not.toBeNull();
      expect(result!.extension).toBe('tif');
    });
  });

  describe('BMP Detection', () => {
    it('detects image/bmp', () => {
      const result = detectFileFormat('image/bmp', 'image.bmp');
      expect(result).not.toBeNull();
      expect(result!.needsConversion).toBe(true);
    });

    it('detects image/x-bmp variant', () => {
      const result = detectFileFormat('image/x-bmp', 'image.bmp');
      expect(result).not.toBeNull();
    });

    it('detects image/x-ms-bmp variant', () => {
      const result = detectFileFormat('image/x-ms-bmp', 'image.bmp');
      expect(result).not.toBeNull();
    });
  });

  describe('GIF Detection', () => {
    it('detects image/gif', () => {
      const result = detectFileFormat('image/gif', 'image.gif');
      expect(result).not.toBeNull();
      expect(result!.needsConversion).toBe(true);
    });
  });

  describe('AVIF Detection', () => {
    it('detects image/avif', () => {
      const result = detectFileFormat('image/avif', 'image.avif');
      expect(result).not.toBeNull();
      expect(result!.needsConversion).toBe(true);
    });
  });

  describe('SVG Detection', () => {
    it('detects image/svg+xml', () => {
      const result = detectFileFormat('image/svg+xml', 'image.svg');
      expect(result).not.toBeNull();
      expect(result!.needsConversion).toBe(true);
    });
  });
});

// ============================================
// Extension Fallback Tests
// ============================================

describe('Extension-based Detection (Fallback)', () => {
  it('detects format from .pdf extension when MIME is generic', () => {
    const result = detectFileFormat('application/octet-stream', 'report.pdf');
    expect(result).not.toBeNull();
    expect(result!.category).toBe('pdf');
  });

  it('detects format from .heic extension when MIME is empty', () => {
    const result = detectFileFormat('', 'IMG_1234.HEIC');
    expect(result).not.toBeNull();
    expect(result!.extension).toBe('heic');
  });

  it('detects format from .tiff extension', () => {
    const result = detectFileFormat('', 'scan.TIFF');
    expect(result).not.toBeNull();
    expect(result!.category).toBe('image');
  });

  it('handles case-insensitive extensions', () => {
    const resultUpper = detectFileFormat('', 'photo.PNG');
    const resultLower = detectFileFormat('', 'photo.png');
    expect(resultUpper).not.toBeNull();
    expect(resultLower).not.toBeNull();
  });
});

// ============================================
// Magic Byte Detection Tests
// ============================================

describe('Magic Byte Detection', () => {
  it('detects PDF from magic bytes', () => {
    const result = detectFromMagicBytes(MAGIC_BYTES.pdf);
    expect(result).not.toBeNull();
    expect(result!.category).toBe('pdf');
  });

  it('detects PNG from magic bytes', () => {
    const result = detectFromMagicBytes(MAGIC_BYTES.png);
    expect(result).not.toBeNull();
    expect(result!.extension).toBe('png');
  });

  it('detects JPEG from magic bytes', () => {
    const result = detectFromMagicBytes(MAGIC_BYTES.jpeg);
    expect(result).not.toBeNull();
    expect(result!.extension).toBe('jpg');
  });

  it('detects WebP from magic bytes', () => {
    const result = detectFromMagicBytes(MAGIC_BYTES.webp);
    expect(result).not.toBeNull();
    expect(result!.extension).toBe('webp');
  });

  it('detects GIF from magic bytes', () => {
    const result = detectFromMagicBytes(MAGIC_BYTES.gif);
    expect(result).not.toBeNull();
    expect(result!.extension).toBe('gif');
  });

  it('detects BMP from magic bytes', () => {
    const result = detectFromMagicBytes(MAGIC_BYTES.bmp);
    expect(result).not.toBeNull();
    expect(result!.extension).toBe('bmp');
  });

  it('detects TIFF (little endian) from magic bytes', () => {
    const result = detectFromMagicBytes(MAGIC_BYTES.tiffLE);
    expect(result).not.toBeNull();
    expect(result!.category).toBe('image');
  });

  it('detects TIFF (big endian) from magic bytes', () => {
    const result = detectFromMagicBytes(MAGIC_BYTES.tiffBE);
    expect(result).not.toBeNull();
    expect(result!.category).toBe('image');
  });

  it('detects HEIC from magic bytes', () => {
    const result = detectFromMagicBytes(MAGIC_BYTES.heic);
    expect(result).not.toBeNull();
    expect(result!.extension).toBe('heic');
  });

  it('detects AVIF from magic bytes', () => {
    const result = detectFromMagicBytes(MAGIC_BYTES.avif);
    expect(result).not.toBeNull();
    expect(result!.extension).toBe('avif');
  });

  it('returns null for unknown format', () => {
    const result = detectFromMagicBytes(MAGIC_BYTES.unknown);
    expect(result).toBeNull();
  });

  it('returns null for buffer too small', () => {
    const result = detectFromMagicBytes(Buffer.from([0x00, 0x01]));
    expect(result).toBeNull();
  });
});

// ============================================
// Combined Detection Tests
// ============================================

describe('Combined Detection (MIME + Extension + Magic)', () => {
  it('uses magic bytes when MIME is wrong', () => {
    // File claims to be octet-stream but is actually PNG
    const result = detectFileFormat(
      'application/octet-stream',
      'file.unknown',
      MAGIC_BYTES.png
    );
    expect(result).not.toBeNull();
    expect(result!.extension).toBe('png');
  });

  it('prefers MIME type when available and valid', () => {
    const result = detectFileFormat('image/png', 'file.jpg');
    expect(result).not.toBeNull();
    expect(result!.extension).toBe('png');
  });

  it('falls back to extension when MIME unknown', () => {
    const result = detectFileFormat('application/octet-stream', 'file.webp');
    expect(result).not.toBeNull();
    expect(result!.extension).toBe('webp');
  });
});

// ============================================
// File Validation Tests
// ============================================

describe('File Validation', () => {
  describe('Size Validation', () => {
    it('accepts files within size limit', () => {
      const result = validateFile(
        { type: 'image/png', name: 'test.png', size: 5 * 1024 * 1024 },
        undefined,
        10
      );
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects files exceeding size limit', () => {
      const result = validateFile(
        { type: 'image/png', name: 'test.png', size: 15 * 1024 * 1024 },
        undefined,
        10
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('too large'))).toBe(true);
    });

    it('rejects empty files', () => {
      const result = validateFile({
        type: 'image/png',
        name: 'test.png',
        size: 0,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('empty'))).toBe(true);
    });
  });

  describe('Format Validation', () => {
    it('accepts supported formats', () => {
      const formats = [
        { type: 'application/pdf', name: 'file.pdf' },
        { type: 'image/png', name: 'file.png' },
        { type: 'image/jpeg', name: 'file.jpg' },
        { type: 'image/webp', name: 'file.webp' },
        { type: 'image/heic', name: 'file.heic' },
        { type: 'image/tiff', name: 'file.tiff' },
        { type: 'image/bmp', name: 'file.bmp' },
        { type: 'image/gif', name: 'file.gif' },
      ];

      for (const { type, name } of formats) {
        const result = validateFile({ type, name, size: 1000 });
        expect(result.valid).toBe(true);
        expect(result.formatInfo).not.toBeNull();
      }
    });

    it('rejects unsupported formats', () => {
      const result = validateFile({
        type: 'application/zip',
        name: 'file.zip',
        size: 1000,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Unsupported'))).toBe(true);
    });
  });

  describe('Warnings', () => {
    it('warns about formats needing conversion', () => {
      const result = validateFile({
        type: 'image/heic',
        name: 'photo.heic',
        size: 1000,
      });
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.includes('converted'))).toBe(true);
    });

    it('warns about GIF quality', () => {
      const result = validateFile({
        type: 'image/gif',
        name: 'image.gif',
        size: 1000,
      });
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.includes('reduced quality'))).toBe(true);
    });

    it('warns about SVG rendering', () => {
      const result = validateFile({
        type: 'image/svg+xml',
        name: 'image.svg',
        size: 1000,
      });
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.includes('may not render'))).toBe(true);
    });
  });
});

// ============================================
// Utility Function Tests
// ============================================

describe('Utility Functions', () => {
  describe('getFileExtension', () => {
    it('extracts extension from filename', () => {
      expect(getFileExtension('report.pdf')).toBe('pdf');
      expect(getFileExtension('image.PNG')).toBe('png');
      expect(getFileExtension('file.name.jpg')).toBe('jpg');
    });

    it('returns empty string for no extension', () => {
      expect(getFileExtension('noextension')).toBe('');
    });

    it('handles hidden files', () => {
      expect(getFileExtension('.gitignore')).toBe('gitignore');
    });
  });

  describe('isFormatSupported', () => {
    it('returns true for supported formats', () => {
      expect(isFormatSupported('image/png', 'test.png')).toBe(true);
      expect(isFormatSupported('application/pdf', 'test.pdf')).toBe(true);
      expect(isFormatSupported('image/heic', 'test.heic')).toBe(true);
    });

    it('returns false for unsupported formats', () => {
      expect(isFormatSupported('application/zip', 'test.zip')).toBe(false);
      expect(isFormatSupported('text/plain', 'test.txt')).toBe(false);
    });
  });

  describe('getSupportedMimeTypes', () => {
    it('returns array of MIME types', () => {
      const mimes = getSupportedMimeTypes();
      expect(Array.isArray(mimes)).toBe(true);
      expect(mimes).toContain('application/pdf');
      expect(mimes).toContain('image/png');
      expect(mimes).toContain('image/heic');
    });
  });

  describe('getSupportedExtensions', () => {
    it('returns array of extensions', () => {
      const exts = getSupportedExtensions();
      expect(Array.isArray(exts)).toBe(true);
      expect(exts).toContain('pdf');
      expect(exts).toContain('png');
      expect(exts).toContain('heic');
      expect(exts).toContain('tiff');
    });
  });

  describe('getSupportedFormatsDisplay', () => {
    it('returns comma-separated uppercase list', () => {
      const display = getSupportedFormatsDisplay();
      expect(display).toContain('PDF');
      expect(display).toContain('PNG');
      expect(display).toContain('HEIC');
      expect(display).toMatch(/[A-Z]+, [A-Z]+/);
    });
  });

  describe('getAcceptString', () => {
    it('returns valid accept attribute string', () => {
      const accept = getAcceptString();
      expect(accept).toContain('image/png');
      expect(accept).toContain('.pdf');
      expect(accept).toContain('.heic');
    });
  });
});

// ============================================
// Format Conversion Tests
// ============================================

describe('Format Conversion', () => {
  it('returns original buffer for formats not needing conversion', async () => {
    const pngBuffer = MAGIC_BYTES.png;
    const formatInfo: FileFormatInfo = FILE_FORMAT_MAP['image/png'];

    const result = await convertToStandardFormat(pngBuffer, formatInfo);
    expect(result.converted).toBe(false);
    expect(result.originalFormat).toBe('png');
    expect(result.buffer).toBe(pngBuffer);
  });

  // Note: Actual conversion tests would require real image files
  // These test the logic flow
  it('marks conversion flag for formats needing conversion', async () => {
    const formatInfo: FileFormatInfo = FILE_FORMAT_MAP['image/webp'];
    expect(formatInfo.needsConversion).toBe(true);
    expect(formatInfo.conversionTarget).toBe('png');
  });
});

// ============================================
// Edge Cases
// ============================================

describe('Edge Cases', () => {
  it('handles empty MIME type', () => {
    const result = detectFileFormat('', 'image.png');
    expect(result).not.toBeNull();
  });

  it('handles whitespace in MIME type', () => {
    const result = detectFileFormat('  image/png  ', 'image.png');
    expect(result).not.toBeNull();
  });

  it('handles uppercase MIME type', () => {
    const result = detectFileFormat('IMAGE/PNG', 'image.png');
    expect(result).not.toBeNull();
  });

  it('handles filename with no extension', () => {
    const result = detectFileFormat('image/png', 'imageWithNoExtension');
    expect(result).not.toBeNull();
  });

  it('handles very long filename', () => {
    const longName = 'a'.repeat(255) + '.png';
    const result = validateFile({
      type: 'image/png',
      name: longName,
      size: 1000,
    });
    expect(result.valid).toBe(true);
  });
});
