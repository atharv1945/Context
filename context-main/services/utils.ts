import { SUPPORTED_FILE_TYPES, MAX_FILE_SIZE } from './constants';
import { ApiError } from './types';

/**
 * Validate file before upload
 */
export function validateFile(file: File): void {
  // Check file type
  if (!SUPPORTED_FILE_TYPES.includes(file.type as any)) {
    throw new ApiError(`Unsupported file type: ${file.type}`);
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    throw new ApiError(`File size exceeds ${maxSizeMB}MB limit`);
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * Check if error is a specific API error type
 */
export function isApiError(error: unknown, errorType?: string): error is ApiError {
  return error instanceof ApiError && (!errorType || error.name === errorType);
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate a unique ID for client-side operations
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}