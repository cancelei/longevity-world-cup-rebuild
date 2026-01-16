/**
 * useOcr Hook
 * React hook for managing OCR processing state with proper error handling
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { BiomarkerKey, OcrExtractionResult } from '@/lib/ocr/types';
import { OcrError, OcrErrorCode, createOcrError } from '@/lib/ocr/errors';

export type ProcessingStage =
  | 'idle'
  | 'uploading'
  | 'converting'
  | 'extracting'
  | 'analyzing'
  | 'complete'
  | 'error';

export interface OcrState {
  stage: ProcessingStage;
  progress: number;
  error: OcrError | null;
  result: OcrExtractionResult | null;
  editedValues: Record<BiomarkerKey, number | null>;
}

export interface UseOcrOptions {
  onComplete?: (result: OcrExtractionResult) => void;
  onError?: (error: OcrError) => void;
  autoRetry?: boolean;
  maxRetries?: number;
}

export interface UseOcrReturn {
  state: OcrState;
  isProcessing: boolean;
  canRetry: boolean;
  processFile: (file: File) => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
  updateValue: (biomarker: BiomarkerKey, value: number | null) => void;
  acceptValues: () => Record<BiomarkerKey, number | null>;
}

const INITIAL_STATE: OcrState = {
  stage: 'idle',
  progress: 0,
  error: null,
  result: null,
  editedValues: {
    albumin: null,
    creatinine: null,
    glucose: null,
    crp: null,
    lymphocytePercent: null,
    mcv: null,
    rdw: null,
    alp: null,
    wbc: null,
  },
};

export function useOcr(options: UseOcrOptions = {}): UseOcrReturn {
  const { onComplete, onError, autoRetry = false, maxRetries = 2 } = options;

  const [state, setState] = useState<OcrState>(INITIAL_STATE);
  const retryCount = useRef(0);
  const lastFile = useRef<File | null>(null);
  const abortController = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortController.current?.abort();
    };
  }, []);

  const setStage = useCallback((stage: ProcessingStage, progress?: number) => {
    setState((prev) => ({
      ...prev,
      stage,
      progress: progress ?? prev.progress,
      error: stage === 'error' ? prev.error : null,
    }));
  }, []);

  const setError = useCallback((error: OcrError) => {
    setState((prev) => ({
      ...prev,
      stage: 'error',
      error,
    }));
    onError?.(error);
  }, [onError]);

  const processFile = useCallback(async (file: File) => {
    // Cancel any in-progress request
    abortController.current?.abort();
    abortController.current = new AbortController();

    lastFile.current = file;
    retryCount.current = 0;

    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      setError(new OcrError(OcrErrorCode.FILE_TOO_LARGE));
      return;
    }

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError(new OcrError(OcrErrorCode.INVALID_FILE_TYPE));
      return;
    }

    if (file.size === 0) {
      setError(new OcrError(OcrErrorCode.EMPTY_FILE));
      return;
    }

    try {
      setStage('uploading', 0);

      const formData = new FormData();
      formData.append('file', file);

      // Upload file
      setStage('uploading', 20);
      const uploadResponse = await fetch('/api/ocr/upload', {
        method: 'POST',
        body: formData,
        signal: abortController.current?.signal,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }

      const { jobId } = await uploadResponse.json();
      setStage('converting', 30);

      // Poll for results
      let attempts = 0;
      const maxAttempts = 60; // 60 seconds timeout
      let result: OcrExtractionResult | null = null;

      while (attempts < maxAttempts) {
        if (abortController.current?.signal.aborted) {
          return;
        }

        const statusResponse = await fetch(`/api/ocr/status/${jobId}`, {
          signal: abortController.current?.signal,
        });

        if (!statusResponse.ok) {
          throw new Error('Failed to check status');
        }

        const statusData = await statusResponse.json();

        // Update stage based on status
        if (statusData.status === 'PROCESSING') {
          const progress = statusData.progress || 0;
          if (progress < 40) {
            setStage('converting', 30 + progress * 0.25);
          } else if (progress < 70) {
            setStage('extracting', 40 + (progress - 40) * 0.5);
          } else {
            setStage('analyzing', 70 + (progress - 70) * 0.3);
          }
        } else if (statusData.status === 'COMPLETED') {
          result = statusData.result;
          break;
        } else if (statusData.status === 'FAILED') {
          throw new Error(statusData.errorMessage || 'Processing failed');
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      }

      if (!result) {
        throw new OcrError(OcrErrorCode.EXTRACTION_TIMEOUT);
      }

      // Check if any biomarkers were found
      const foundCount = Object.values(result.extractions).filter(
        (ext) => ext.value !== null
      ).length;

      if (foundCount === 0) {
        throw new OcrError(OcrErrorCode.NO_BIOMARKERS_FOUND);
      }

      // Update state with results
      const editedValues = { ...INITIAL_STATE.editedValues };
      for (const [key, extraction] of Object.entries(result.extractions)) {
        editedValues[key as BiomarkerKey] = extraction.value;
      }

      setState({
        stage: 'complete',
        progress: 100,
        error: null,
        result,
        editedValues,
      });

      onComplete?.(result);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return; // Silently ignore abort errors
      }

      const ocrError = createOcrError(error);

      // Auto-retry if enabled and error is retryable
      if (autoRetry && ocrError.retryable && retryCount.current < maxRetries) {
        retryCount.current++;
        await processFile(file);
        return;
      }

      setError(ocrError);
    }
  }, [setStage, setError, onComplete, autoRetry, maxRetries]);

  const retry = useCallback(async () => {
    if (lastFile.current) {
      retryCount.current = 0;
      await processFile(lastFile.current);
    }
  }, [processFile]);

  const reset = useCallback(() => {
    abortController.current?.abort();
    lastFile.current = null;
    retryCount.current = 0;
    setState(INITIAL_STATE);
  }, []);

  const updateValue = useCallback((biomarker: BiomarkerKey, value: number | null) => {
    setState((prev) => ({
      ...prev,
      editedValues: {
        ...prev.editedValues,
        [biomarker]: value,
      },
    }));
  }, []);

  const acceptValues = useCallback(() => {
    return state.editedValues;
  }, [state.editedValues]);

  return {
    state,
    isProcessing: ['uploading', 'converting', 'extracting', 'analyzing'].includes(state.stage),
    canRetry: state.error?.retryable ?? false,
    processFile,
    retry,
    reset,
    updateValue,
    acceptValues,
  };
}
