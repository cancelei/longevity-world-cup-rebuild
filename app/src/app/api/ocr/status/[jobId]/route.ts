/**
 * OCR Job Status API Endpoint
 * GET /api/ocr/status/[jobId]
 *
 * Returns the current status of an OCR processing job
 * Used for polling during async processing
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

    // Calculate progress based on status
    let progress = 0;
    switch (job.status) {
      case 'PENDING':
        progress = 0;
        break;
      case 'PROCESSING':
        progress = 50;
        break;
      case 'COMPLETED':
        progress = 100;
        break;
      case 'FAILED':
        progress = 100;
        break;
    }

    return NextResponse.json({
      success: true,
      jobId: job.id,
      status: job.status,
      progress,
      pageCount: job.pageCount,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      errorMessage: job.errorMessage,
    });
  } catch (error) {
    console.error('Error fetching job status:', error);

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
        error: error instanceof Error ? error.message : 'Failed to fetch job status',
      },
      { status: 500 }
    );
  }
}
