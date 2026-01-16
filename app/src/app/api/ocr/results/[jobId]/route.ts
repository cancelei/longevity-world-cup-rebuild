/**
 * OCR Job Results API Endpoint
 * GET /api/ocr/results/[jobId]
 *
 * Returns the extraction results of a completed OCR job
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID required' },
        { status: 400 }
      );
    }

    // Look up job in database
    const job = await prisma.ocrJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    // Verify user owns this job
    if (job.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if job is complete
    if (job.status === 'PENDING' || job.status === 'PROCESSING') {
      return NextResponse.json(
        {
          success: false,
          error: 'Job still processing',
          status: job.status,
        },
        { status: 202 }
      );
    }

    // Check if job failed
    if (job.status === 'FAILED') {
      return NextResponse.json(
        {
          success: false,
          error: job.errorMessage || 'OCR processing failed',
          status: 'FAILED',
        },
        { status: 422 }
      );
    }

    // Get extracted values (already parsed from Json type)
    const extractedValues = job.extractedValues || null;

    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: job.status,
      result: {
        extractions: extractedValues,
        rawText: job.rawOcrText,
        pageCount: job.pageCount,
        processingTimeMs: job.processingTime,
      },
      originalFileName: job.originalFileName,
      fileType: job.fileType,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    });
  } catch (error) {
    console.error('Error fetching job results:', error);

    // If OcrJob model doesn't exist yet, return a helpful message
    if (error instanceof Error && error.message.includes('OcrJob')) {
      return NextResponse.json(
        {
          success: false,
          error: 'OCR job tracking not yet configured. Run database migration.',
        },
        { status: 501 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch job results',
      },
      { status: 500 }
    );
  }
}
