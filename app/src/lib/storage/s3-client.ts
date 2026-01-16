/**
 * S3 Storage Client
 * Compatible with iDrive S3 and AWS S3
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 Configuration
const S3_CONFIG = {
  bucket: process.env.S3_BUCKET || 'longevity-world-cup',
  region: process.env.S3_REGION || 'us-east-1',
  endpoint: process.env.S3_ENDPOINT, // iDrive S3 endpoint
  accessKeyId: process.env.S3_ACCESS_KEY || '',
  secretAccessKey: process.env.S3_SECRET_KEY || '',
};

// Storage paths
export const STORAGE_PATHS = {
  PROOF_IMAGES: 'proof-images',
  PROFILE_PICTURES: 'profile-pictures',
  OCR_UPLOADS: 'ocr-uploads',
  TEMP: 'temp',
} as const;

export type StoragePath = (typeof STORAGE_PATHS)[keyof typeof STORAGE_PATHS];

// Singleton S3 client
let s3Client: S3Client | null = null;

/**
 * Get or create S3 client instance
 */
export function getS3Client(): S3Client {
  if (s3Client) {
    return s3Client;
  }

  if (!S3_CONFIG.accessKeyId || !S3_CONFIG.secretAccessKey) {
    throw new Error('S3 credentials not configured. Set S3_ACCESS_KEY and S3_SECRET_KEY environment variables.');
  }

  s3Client = new S3Client({
    region: S3_CONFIG.region,
    endpoint: S3_CONFIG.endpoint,
    credentials: {
      accessKeyId: S3_CONFIG.accessKeyId,
      secretAccessKey: S3_CONFIG.secretAccessKey,
    },
    forcePathStyle: true, // Required for iDrive S3
  });

  return s3Client;
}

/**
 * Upload result type
 */
export interface UploadResult {
  success: boolean;
  key: string;
  url: string;
  size: number;
  contentType: string;
}

/**
 * Upload a file to S3
 */
export async function uploadFile(
  buffer: Buffer,
  options: {
    key: string;
    contentType: string;
    path?: StoragePath;
    metadata?: Record<string, string>;
  }
): Promise<UploadResult> {
  const client = getS3Client();
  const fullKey = options.path ? `${options.path}/${options.key}` : options.key;

  const command = new PutObjectCommand({
    Bucket: S3_CONFIG.bucket,
    Key: fullKey,
    Body: buffer,
    ContentType: options.contentType,
    Metadata: options.metadata,
  });

  await client.send(command);

  return {
    success: true,
    key: fullKey,
    url: getPublicUrl(fullKey),
    size: buffer.length,
    contentType: options.contentType,
  };
}

/**
 * Upload a proof image for a submission
 */
export async function uploadProofImage(
  buffer: Buffer,
  options: {
    athleteId: string;
    submissionId: string;
    filename: string;
    contentType: string;
  }
): Promise<UploadResult> {
  const timestamp = Date.now();
  const key = `${options.athleteId}/${options.submissionId}/${timestamp}-${options.filename}`;

  return uploadFile(buffer, {
    key,
    contentType: options.contentType,
    path: STORAGE_PATHS.PROOF_IMAGES,
    metadata: {
      athleteId: options.athleteId,
      submissionId: options.submissionId,
      originalFilename: options.filename,
    },
  });
}

/**
 * Upload a profile picture
 */
export async function uploadProfilePicture(
  buffer: Buffer,
  options: {
    userId: string;
    filename: string;
    contentType: string;
  }
): Promise<UploadResult> {
  const extension = options.filename.split('.').pop() || 'jpg';
  const key = `${options.userId}/profile.${extension}`;

  return uploadFile(buffer, {
    key,
    contentType: options.contentType,
    path: STORAGE_PATHS.PROFILE_PICTURES,
    metadata: {
      userId: options.userId,
      originalFilename: options.filename,
    },
  });
}

/**
 * Upload OCR file temporarily
 */
export async function uploadOcrFile(
  buffer: Buffer,
  options: {
    userId: string;
    jobId: string;
    filename: string;
    contentType: string;
  }
): Promise<UploadResult> {
  const key = `${options.userId}/${options.jobId}/${options.filename}`;

  return uploadFile(buffer, {
    key,
    contentType: options.contentType,
    path: STORAGE_PATHS.OCR_UPLOADS,
    metadata: {
      userId: options.userId,
      jobId: options.jobId,
      originalFilename: options.filename,
    },
  });
}

/**
 * Get a file from S3
 */
export async function getFile(key: string): Promise<Buffer> {
  const client = getS3Client();

  const command = new GetObjectCommand({
    Bucket: S3_CONFIG.bucket,
    Key: key,
  });

  const response = await client.send(command);

  if (!response.Body) {
    throw new Error(`File not found: ${key}`);
  }

  // Convert stream to buffer
  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

/**
 * Delete a file from S3
 */
export async function deleteFile(key: string): Promise<boolean> {
  const client = getS3Client();

  const command = new DeleteObjectCommand({
    Bucket: S3_CONFIG.bucket,
    Key: key,
  });

  await client.send(command);
  return true;
}

/**
 * Delete multiple files with a prefix
 */
export async function deleteFiles(prefix: string): Promise<number> {
  const client = getS3Client();

  // List all files with the prefix
  const listCommand = new ListObjectsV2Command({
    Bucket: S3_CONFIG.bucket,
    Prefix: prefix,
  });

  const listResponse = await client.send(listCommand);
  const objects = listResponse.Contents || [];

  if (objects.length === 0) {
    return 0;
  }

  // Delete each file
  let deletedCount = 0;
  for (const obj of objects) {
    if (obj.Key) {
      await deleteFile(obj.Key);
      deletedCount++;
    }
  }

  return deletedCount;
}

/**
 * Check if a file exists
 */
export async function fileExists(key: string): Promise<boolean> {
  const client = getS3Client();

  try {
    const command = new HeadObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: key,
    });

    await client.send(command);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(key: string): Promise<{
  size: number;
  contentType: string;
  lastModified: Date;
  metadata: Record<string, string>;
} | null> {
  const client = getS3Client();

  try {
    const command = new HeadObjectCommand({
      Bucket: S3_CONFIG.bucket,
      Key: key,
    });

    const response = await client.send(command);

    return {
      size: response.ContentLength || 0,
      contentType: response.ContentType || 'application/octet-stream',
      lastModified: response.LastModified || new Date(),
      metadata: response.Metadata || {},
    };
  } catch {
    return null;
  }
}

/**
 * Generate a pre-signed URL for direct upload
 */
export async function getUploadUrl(
  key: string,
  options: {
    contentType: string;
    expiresIn?: number; // seconds, default 3600 (1 hour)
  }
): Promise<string> {
  const client = getS3Client();

  const command = new PutObjectCommand({
    Bucket: S3_CONFIG.bucket,
    Key: key,
    ContentType: options.contentType,
  });

  return getSignedUrl(client, command, {
    expiresIn: options.expiresIn || 3600,
  });
}

/**
 * Generate a pre-signed URL for download
 */
export async function getDownloadUrl(
  key: string,
  options?: {
    expiresIn?: number; // seconds, default 3600 (1 hour)
    filename?: string; // Override download filename
  }
): Promise<string> {
  const client = getS3Client();

  const command = new GetObjectCommand({
    Bucket: S3_CONFIG.bucket,
    Key: key,
    ResponseContentDisposition: options?.filename
      ? `attachment; filename="${options.filename}"`
      : undefined,
  });

  return getSignedUrl(client, command, {
    expiresIn: options?.expiresIn || 3600,
  });
}

/**
 * Get public URL for a file (if bucket is public)
 */
export function getPublicUrl(key: string): string {
  if (S3_CONFIG.endpoint) {
    // iDrive S3 or custom endpoint
    return `${S3_CONFIG.endpoint}/${S3_CONFIG.bucket}/${key}`;
  }
  // AWS S3
  return `https://${S3_CONFIG.bucket}.s3.${S3_CONFIG.region}.amazonaws.com/${key}`;
}

/**
 * Copy a file within the bucket
 */
export async function copyFile(
  sourceKey: string,
  destinationKey: string
): Promise<boolean> {
  const client = getS3Client();

  const command = new CopyObjectCommand({
    Bucket: S3_CONFIG.bucket,
    CopySource: `${S3_CONFIG.bucket}/${sourceKey}`,
    Key: destinationKey,
  });

  await client.send(command);
  return true;
}

/**
 * List files with a prefix
 */
export async function listFiles(
  prefix: string,
  options?: {
    maxKeys?: number;
    continuationToken?: string;
  }
): Promise<{
  files: Array<{
    key: string;
    size: number;
    lastModified: Date;
  }>;
  nextToken?: string;
}> {
  const client = getS3Client();

  const command = new ListObjectsV2Command({
    Bucket: S3_CONFIG.bucket,
    Prefix: prefix,
    MaxKeys: options?.maxKeys || 1000,
    ContinuationToken: options?.continuationToken,
  });

  const response = await client.send(command);

  return {
    files: (response.Contents || []).map((obj) => ({
      key: obj.Key || '',
      size: obj.Size || 0,
      lastModified: obj.LastModified || new Date(),
    })),
    nextToken: response.NextContinuationToken,
  };
}

/**
 * Get storage statistics
 */
export async function getStorageStats(prefix?: string): Promise<{
  totalFiles: number;
  totalSize: number;
  byPath: Record<string, { count: number; size: number }>;
}> {
  const stats = {
    totalFiles: 0,
    totalSize: 0,
    byPath: {} as Record<string, { count: number; size: number }>,
  };

  let continuationToken: string | undefined;

  do {
    const result = await listFiles(prefix || '', {
      continuationToken,
    });

    for (const file of result.files) {
      stats.totalFiles++;
      stats.totalSize += file.size;

      // Group by first path segment
      const pathSegment = file.key.split('/')[0];
      if (!stats.byPath[pathSegment]) {
        stats.byPath[pathSegment] = { count: 0, size: 0 };
      }
      stats.byPath[pathSegment].count++;
      stats.byPath[pathSegment].size += file.size;
    }

    continuationToken = result.nextToken;
  } while (continuationToken);

  return stats;
}
