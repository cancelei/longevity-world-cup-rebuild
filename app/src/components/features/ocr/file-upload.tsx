"use client";

/**
 * OCR File Upload Component
 * Drag-and-drop file upload for lab reports
 * Supports: PDF, PNG, JPEG, WebP, HEIC, TIFF, BMP, GIF, AVIF
 */

import { useState, useCallback, useRef, useEffect, startTransition } from "react";
import { Upload, FileText, Image as ImageIcon, X, AlertCircle, Info, Camera, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getAcceptString,
  validateFile as validateFileFormat,
} from "@/lib/ocr/file-formats-client";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onError?: (error: string) => void;
  isProcessing?: boolean;
  maxSize?: number; // in bytes
  className?: string;
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUpload({
  onFileSelect,
  onError,
  isProcessing = false,
  maxSize = DEFAULT_MAX_SIZE,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Create preview URL for images
  // Using startTransition to defer state update and avoid cascading renders
  useEffect(() => {
    let url: string | null = null;

    if (selectedFile && selectedFile.type.startsWith("image/")) {
      url = URL.createObjectURL(selectedFile);
    }

    startTransition(() => {
      setPreviewUrl(url);
    });

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [selectedFile]);

  const validateFile = useCallback(
    (file: File): { error: string | null; warning: string | null } => {
      const validation = validateFileFormat(
        { type: file.type, name: file.name, size: file.size },
        maxSize / (1024 * 1024)
      );

      if (!validation.valid) {
        return { error: validation.errors.join(' '), warning: null };
      }

      return {
        error: null,
        warning: validation.warnings.length > 0 ? validation.warnings[0] : null,
      };
    },
    [maxSize]
  );

  const handleFile = useCallback(
    (file: File) => {
      const { error: validationError, warning: validationWarning } = validateFile(file);
      if (validationError) {
        setError(validationError);
        setWarning(null);
        onError?.(validationError);
        return;
      }

      setError(null);
      setWarning(validationWarning);
      setSelectedFile(file);
      onFileSelect(file);
    },
    [validateFile, onFileSelect, onError]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    if (!isProcessing) {
      fileInputRef.current?.click();
    }
  }, [isProcessing]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowPreview(false);
      setError(null);
      setWarning(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (cameraInputRef.current) {
        cameraInputRef.current.value = "";
      }
    },
    []
  );

  const handleCameraClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isProcessing) {
      cameraInputRef.current?.click();
    }
  }, [isProcessing]);

  const handlePreviewToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPreview((prev) => !prev);
  }, []);

  const getFileIcon = (type: string) => {
    if (type === "application/pdf") {
      return <FileText className="w-8 h-8 text-red-400" />;
    }
    return <ImageIcon className="w-8 h-8 text-blue-400" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Hidden file input for browse */}
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptString()}
        onChange={handleInputChange}
        className="hidden"
        disabled={isProcessing}
      />

      {/* Hidden camera input for mobile */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
        disabled={isProcessing}
      />

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-4 sm:p-8 transition-all duration-200 cursor-pointer",
          "flex flex-col items-center justify-center min-h-[160px] sm:min-h-[200px]",
          isDragging
            ? "border-cyan-400 bg-cyan-400/10"
            : "border-gray-600 hover:border-cyan-400/50 hover:bg-gray-800/50 active:bg-gray-800/70",
          isProcessing && "opacity-50 cursor-not-allowed",
          error && "border-red-400/50"
        )}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center gap-2 sm:gap-3 w-full px-2">
            {/* Preview thumbnail for images */}
            {previewUrl ? (
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              getFileIcon(selectedFile.type)
            )}
            <div className="text-center w-full">
              <p className="text-white font-medium truncate max-w-full sm:max-w-[250px] text-sm sm:text-base">
                {selectedFile.name}
              </p>
              <p className="text-gray-400 text-xs sm:text-sm">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-1">
              {previewUrl && (
                <button
                  onClick={handlePreviewToggle}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-400/10 hover:bg-cyan-400/20 rounded-lg transition-colors"
                  aria-label="Preview image"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              )}
            </div>

            {!isProcessing && (
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-1 rounded-full bg-gray-700 hover:bg-gray-600 active:bg-gray-500 transition-colors touch-manipulation"
                aria-label="Remove file"
              >
                <X className="w-4 h-4 text-gray-300" />
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              className={cn(
                "p-3 sm:p-4 rounded-full mb-3 sm:mb-4 transition-colors",
                isDragging ? "bg-cyan-400/20" : "bg-gray-800"
              )}
            >
              <Upload
                className={cn(
                  "w-6 h-6 sm:w-8 sm:h-8 transition-colors",
                  isDragging ? "text-cyan-400" : "text-gray-400"
                )}
              />
            </div>
            <p className="text-white font-medium mb-1 text-sm sm:text-base">
              {isDragging ? "Drop your file here" : "Upload Lab Report"}
            </p>
            <p className="text-gray-400 text-xs sm:text-sm text-center mb-3">
              <span className="hidden sm:inline">Drag and drop or click to browse</span>
              <span className="sm:hidden">Tap to browse files</span>
              <br />
              <span className="text-gray-500">
                PDF, PNG, JPG, HEIC, WebP, TIFF, BMP, GIF
              </span>
              <br />
              <span className="text-gray-600 text-xs">
                (max {Math.round(maxSize / 1024 / 1024)}MB)
              </span>
            </p>

            {/* Mobile camera button - prominent on mobile */}
            <button
              onClick={handleCameraClick}
              className="sm:hidden flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-gray-900 font-medium rounded-lg transition-colors touch-manipulation"
            >
              <Camera className="w-5 h-5" />
              <span>Take Photo</span>
            </button>

            {/* Desktop hint for camera on mobile */}
            <p className="hidden sm:block text-gray-500 text-xs mt-2">
              On mobile? Use your camera to scan lab reports
            </p>
          </>
        )}
      </div>

      {/* Full-size preview modal */}
      {showPreview && previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={handlePreviewToggle}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={handlePreviewToggle}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
              aria-label="Close preview"
            >
              <X className="w-6 h-6" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Full preview"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {error ? (
        <div className="flex items-center gap-2 mt-3 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {warning && !error ? (
        <div className="flex items-center gap-2 mt-3 text-amber-400 text-sm">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>{warning}</span>
        </div>
      ) : null}
    </div>
  );
}
