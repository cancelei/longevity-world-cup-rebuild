/**
 * PDF Processor - Convert PDF pages to images for OCR
 * Uses pdfjs-dist with node-canvas for server-side rendering
 */

// Use legacy build for Node.js environment (no DOMMatrix requirement)
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas, Canvas } from 'canvas';

// Type imports
type PDFDocumentProxy = Awaited<ReturnType<typeof pdfjs.getDocument>['promise']>;

// Disable worker in Node.js environment
pdfjs.GlobalWorkerOptions.workerSrc = '';

// PDF rendering scale factor (higher = better quality but slower)
const DEFAULT_SCALE = 2.0; // 2x scale gives good OCR results

/**
 * PDF page as image buffer
 */
export interface PdfPageImage {
  pageNumber: number;
  imageBuffer: Buffer;
  width: number;
  height: number;
}

/**
 * PDF document info
 */
export interface PdfInfo {
  pageCount: number;
  title?: string;
  author?: string;
}

/**
 * Load a PDF document from buffer
 */
async function loadPdf(pdfBuffer: Buffer): Promise<PDFDocumentProxy> {
  const data = new Uint8Array(pdfBuffer);
  const loadingTask = pdfjs.getDocument({ data });
  return loadingTask.promise;
}

/**
 * Get PDF document information
 */
export async function getPdfInfo(pdfBuffer: Buffer): Promise<PdfInfo> {
  const pdf = await loadPdf(pdfBuffer);
  const metadata = await pdf.getMetadata().catch(() => null);
  const info = metadata?.info as { Title?: string; Author?: string } | undefined;

  return {
    pageCount: pdf.numPages,
    title: info?.Title,
    author: info?.Author,
  };
}

/**
 * Render a single PDF page to an image buffer
 */
export async function renderPdfPage(
  pdfBuffer: Buffer,
  pageNumber: number,
  scale: number = DEFAULT_SCALE
): Promise<PdfPageImage> {
  const pdf = await loadPdf(pdfBuffer);

  if (pageNumber < 1 || pageNumber > pdf.numPages) {
    throw new Error(`Invalid page number: ${pageNumber}. PDF has ${pdf.numPages} pages.`);
  }

  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  // Create canvas for rendering
  const canvas = createCanvas(viewport.width, viewport.height) as unknown as Canvas;
  const context = canvas.getContext('2d');

  // Render PDF page to canvas
   
  await page.render({
    canvasContext: context as any,
    viewport,
    canvas: canvas as any,
  } as any).promise;

  // Convert canvas to PNG buffer
  const imageBuffer = canvas.toBuffer('image/png');

  return {
    pageNumber,
    imageBuffer,
    width: Math.round(viewport.width),
    height: Math.round(viewport.height),
  };
}

/**
 * Convert all pages of a PDF to images
 */
export async function convertPdfToImages(
  pdfBuffer: Buffer,
  options: {
    scale?: number;
    maxPages?: number;
    startPage?: number;
    endPage?: number;
  } = {}
): Promise<{
  pages: PdfPageImage[];
  totalPages: number;
}> {
  const { scale = DEFAULT_SCALE, maxPages, startPage = 1, endPage } = options;

  const pdf = await loadPdf(pdfBuffer);
  const totalPages = pdf.numPages;

  // Calculate page range
  const firstPage = Math.max(1, startPage);
  const lastPage = Math.min(totalPages, endPage || totalPages);
  const pagesToProcess = maxPages
    ? Math.min(lastPage - firstPage + 1, maxPages)
    : lastPage - firstPage + 1;

  const pages: PdfPageImage[] = [];

  for (let i = 0; i < pagesToProcess; i++) {
    const pageNum = firstPage + i;
    const pageImage = await renderPdfPage(pdfBuffer, pageNum, scale);
    pages.push(pageImage);
  }

  return {
    pages,
    totalPages,
  };
}

/**
 * Convert PDF to images in parallel (faster but more memory intensive)
 */
export async function convertPdfToImagesParallel(
  pdfBuffer: Buffer,
  options: {
    scale?: number;
    maxPages?: number;
    concurrency?: number;
  } = {}
): Promise<{
  pages: PdfPageImage[];
  totalPages: number;
}> {
  const { scale = DEFAULT_SCALE, maxPages, concurrency = 3 } = options;

  const pdf = await loadPdf(pdfBuffer);
  const totalPages = pdf.numPages;
  const pagesToProcess = maxPages ? Math.min(totalPages, maxPages) : totalPages;

  const pages: PdfPageImage[] = new Array(pagesToProcess);

  // Process pages in batches
  for (let i = 0; i < pagesToProcess; i += concurrency) {
    const batch = [];
    for (let j = 0; j < concurrency && i + j < pagesToProcess; j++) {
      const pageNum = i + j + 1;
      batch.push(
        renderPdfPage(pdfBuffer, pageNum, scale).then((result) => {
          pages[pageNum - 1] = result;
        })
      );
    }
    await Promise.all(batch);
  }

  return {
    pages,
    totalPages,
  };
}

/**
 * Check if a buffer is a valid PDF
 */
export function isPdf(buffer: Buffer): boolean {
  // PDF files start with "%PDF-"
  const header = buffer.slice(0, 5).toString('ascii');
  return header === '%PDF-';
}

/**
 * Extract text content directly from PDF (without OCR)
 * Useful for PDFs with embedded text
 */
export async function extractPdfText(
  pdfBuffer: Buffer
): Promise<{
  pages: Array<{ pageNumber: number; text: string }>;
  fullText: string;
}> {
  const pdf = await loadPdf(pdfBuffer);
  const pages: Array<{ pageNumber: number; text: string }> = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => item.str)
      .join(' ');

    pages.push({ pageNumber: i, text });
  }

  const fullText = pages.map((p) => p.text).join('\n\n');

  return { pages, fullText };
}

/**
 * Determine if PDF has embedded text or needs OCR
 */
export async function needsOcr(pdfBuffer: Buffer): Promise<boolean> {
  const { fullText } = await extractPdfText(pdfBuffer);

  // If extracted text is very short, probably needs OCR
  const wordCount = fullText.trim().split(/\s+/).length;
  return wordCount < 20;
}
