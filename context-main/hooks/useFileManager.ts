'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { IndexedFile } from '../services/types';
import { QUERY_KEYS } from '../services/constants';

interface UseFileManagerReturn {
  // Upload functionality
  uploadFile: (file: File, note?: string) => Promise<IndexedFile>;
  isUploading: boolean;
  uploadError: string | null;
  uploadProgress: number | null;
  
  // Delete functionality
  deleteFile: (fileId: string) => Promise<void>;
  isDeleting: boolean;
  deleteError: string | null;
  
  // General state
  clearErrors: () => void;
  hasErrors: boolean;
  
  // File operations
  openFile: (filePath: string) => void;
  showInFolder: (filePath: string) => void;
  addToContextMap: (fileId: string) => Promise<void>;
  
  // Retry functionality
  retryUpload: (file: File, note?: string) => Promise<IndexedFile>;
  retryDelete: (fileId: string) => Promise<void>;
}

/**
 * useFileManager hook for managing file operations
 * Implements requirements 2.4, 2.7, 2.8, and 2.9
 */
export function useFileManager(): UseFileManagerReturn {
  const queryClient = useQueryClient();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [lastUploadAttempt, setLastUploadAttempt] = useState<{ file: File; note?: string } | null>(null);
  const [lastDeleteAttempt, setLastDeleteAttempt] = useState<string | null>(null);

  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, note }: { file: File; note?: string }) => {
      setUploadProgress(0);
      setLastUploadAttempt({ file, note });
      
      // Simulate progress for better UX (in real implementation, you'd track actual progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null) return 10;
          if (prev >= 90) return prev;
          return prev + Math.random() * 20;
        });
      }, 200);

      try {
        const result = await apiService.indexFile(file, note);
        clearInterval(progressInterval);
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(null), 1000);
        return result;
      } catch (error) {
        clearInterval(progressInterval);
        setUploadProgress(null);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Clear any previous errors
      setUploadError(null);
      setLastUploadAttempt(null);
      
      // Invalidate search queries to refresh results
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SEARCH] });
      
      console.log('File uploaded successfully:', data);
    },
    onError: (error: any) => {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to upload file. Please check your connection and try again.';
      setUploadError(errorMessage);
      console.error('Upload failed:', error);
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  // Delete file mutation
  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      setLastDeleteAttempt(fileId);
      return apiService.deleteIndexedFile(fileId);
    },
    onSuccess: () => {
      // Clear any previous errors
      setDeleteError(null);
      setLastDeleteAttempt(null);
      
      // Invalidate search queries to refresh results
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.SEARCH] });
      
      console.log('File deleted successfully');
    },
    onError: (error: any) => {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to delete file. Please check your connection and try again.';
      setDeleteError(errorMessage);
      console.error('Delete failed:', error);
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  // File upload function
  const uploadFile = async (file: File, note?: string): Promise<IndexedFile> => {
    setUploadError(null);
    return uploadMutation.mutateAsync({ file, note });
  };

  // File delete function
  const deleteFile = async (fileId: string): Promise<void> => {
    setDeleteError(null);
    return deleteMutation.mutateAsync(fileId);
  };

  // Clear all errors
  const clearErrors = () => {
    setUploadError(null);
    setDeleteError(null);
    setUploadProgress(null);
    setLastUploadAttempt(null);
    setLastDeleteAttempt(null);
  };

  // Retry functions
  const retryUpload = async (file: File, note?: string): Promise<IndexedFile> => {
    setUploadError(null);
    return uploadMutation.mutateAsync({ file, note });
  };

  const retryDelete = async (fileId: string): Promise<void> => {
    setDeleteError(null);
    return deleteMutation.mutateAsync(fileId);
  };

  // Open file in default application
  const openFile = (filePath: string) => {
    try {
      // For web applications, we'll try to open the file in a new tab
      // This assumes the backend provides accessible file URLs
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
      const fileUrl = `${baseUrl}/files/${encodeURIComponent(filePath)}`;
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Failed to open file:', error);
      // You might want to show a toast notification here
    }
  };

  // Show file in folder (platform-specific)
  const showInFolder = (filePath: string) => {
    try {
      // For web applications, this is limited. We can try to navigate to a file browser
      // or show a notification with the file path
      
      // Check if we're in an Electron app or have access to native APIs
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        // Electron app - use native API
        (window as any).electronAPI.showInFolder(filePath);
      } else {
        // Web browser - copy path to clipboard and show notification
        navigator.clipboard.writeText(filePath).then(() => {
          console.log('File path copied to clipboard:', filePath);
          // You might want to show a toast notification here
          alert(`File path copied to clipboard: ${filePath}`);
        }).catch(() => {
          // Fallback - just show the path
          alert(`File location: ${filePath}`);
        });
      }
    } catch (error) {
      console.error('Failed to show file in folder:', error);
      // Fallback - just show the path
      alert(`File location: ${filePath}`);
    }
  };

  // Add file to context map (placeholder implementation)
  const addToContextMap = async (fileId: string): Promise<void> => {
    try {
      // This would typically involve:
      // 1. Opening a modal to select which context map to add to
      // 2. Making an API call to add the file to the selected map
      // For now, we'll just log the action
      console.log('Adding file to context map:', fileId);
      
      // Placeholder implementation - you might want to:
      // - Show a modal with available context maps
      // - Call an API endpoint to add the file to a map
      // - Update the UI to reflect the change
      
      // Example API call (uncomment when backend supports it):
      // await apiService.addFileToContextMap(fileId, contextMapId);
      
      // For now, just show a notification
      alert('Feature coming soon: Add to Context Map');
    } catch (error) {
      console.error('Failed to add file to context map:', error);
      throw error;
    }
  };

  return {
    // Upload functionality
    uploadFile,
    isUploading: uploadMutation.isPending,
    uploadError,
    uploadProgress,
    
    // Delete functionality
    deleteFile,
    isDeleting: deleteMutation.isPending,
    deleteError,
    
    // General state
    clearErrors,
    hasErrors: !!(uploadError || deleteError),
    
    // File operations
    openFile,
    showInFolder,
    addToContextMap,
    
    // Retry functionality
    retryUpload,
    retryDelete,
  };
}

// Export for convenience
export default useFileManager;