/**
 * Storage Module - Infrastructure Layer
 *
 * S3-compatible object storage for file uploads and retrieval.
 * Currently uses iDrive S3, but designed for provider flexibility.
 *
 * ## Storage Paths
 * - `proof-images/` - Lab report proof uploads
 * - `profile-pictures/` - Athlete profile photos
 * - `ocr-uploads/` - Temporary OCR processing files
 *
 * ## Extension Points
 * - **Alternative Providers**: Replace s3-client.ts internals for:
 *   - AWS S3
 *   - Google Cloud Storage
 *   - Azure Blob Storage
 *   - Cloudflare R2
 *   - MinIO (self-hosted)
 *
 * - **CDN Integration**: Add CDN URL generation in getPublicUrl
 * - **Image Processing**: Add Sharp transformations before upload
 *
 * @module lib/storage
 */

export {
  // Client
  getS3Client,

  // Upload functions
  uploadFile,
  uploadProofImage,
  uploadProfilePicture,
  uploadOcrFile,

  // Download functions
  getFile,
  getDownloadUrl,
  getPublicUrl,

  // Delete functions
  deleteFile,
  deleteFiles,

  // Utility functions
  fileExists,
  getFileMetadata,
  copyFile,
  listFiles,
  getStorageStats,
  getUploadUrl,

  // Constants
  STORAGE_PATHS,

  // Types
  type StoragePath,
  type UploadResult,
} from './s3-client';
