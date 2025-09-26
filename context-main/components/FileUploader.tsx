'use client';

import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { SUPPORTED_FILE_TYPES, MAX_FILE_SIZE } from '@/services/constants';

export interface FileUploaderProps {
  onUpload: (file: File, note?: string) => Promise<void>;
  acceptedTypes?: string[];
  maxFileSize?: number;
  className?: string;
}

interface FileValidationError {
  type: 'size' | 'type' | 'general';
  message: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onUpload,
  acceptedTypes = [...SUPPORTED_FILE_TYPES],
  maxFileSize = MAX_FILE_SIZE,
  className
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [validationError, setValidationError] = useState<FileValidationError | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation
  const validateFile = useCallback((file: File): FileValidationError | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return {
        type: 'size',
        message: `File size must be less than ${Math.round(maxFileSize / (1024 * 1024))}MB`
      };
    }

    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return {
        type: 'type',
        message: `File type ${file.type} is not supported`
      };
    }

    return null;
  }, [acceptedTypes, maxFileSize]);

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);
    setSelectedFile(file);
    setNote('');
    setIsModalOpen(true);
  }, [validateFile]);

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Handle upload button click
  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle upload submission
  const handleUploadSubmit = useCallback(async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await onUpload(selectedFile, note.trim() || undefined);
      setIsModalOpen(false);
      setSelectedFile(null);
      setNote('');
      setValidationError(null);
    } catch (error) {
      console.error('Upload failed:', error);
      // Error handling is managed by the parent component
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, note, onUpload]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    if (isUploading) return; // Prevent closing during upload
    setIsModalOpen(false);
    setSelectedFile(null);
    setNote('');
    setValidationError(null);
  }, [isUploading]);

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      {/* File Upload Area */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200',
          isDragOver
            ? 'border-primary-500 bg-primary-50'
            : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50',
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="File upload input"
        />

        <div className="space-y-4">
          {/* Upload Icon */}
          <div className="mx-auto w-12 h-12 text-neutral-400">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          {/* Upload Text */}
          <div>
            <p className="text-lg font-medium text-neutral-900 mb-2">
              {isDragOver ? 'Drop file here' : 'Upload a file to index'}
            </p>
            <p className="text-sm text-neutral-600 mb-4">
              Drag and drop a file here, or click to browse
            </p>
            <Button
              onClick={handleUploadClick}
              variant="primary"
              size="md"
              className="mx-auto"
            >
              Choose File
            </Button>
          </div>

          {/* File Type Info */}
          <div className="text-xs text-neutral-500">
            <p>Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG, GIF, WEBP</p>
            <p>Maximum file size: {Math.round(maxFileSize / (1024 * 1024))}MB</p>
          </div>
        </div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-500 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-red-700">{validationError.message}</p>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title="Upload File"
        size="md"
        closeOnOverlayClick={!isUploading}
        closeOnEscape={!isUploading}
      >
        {selectedFile && (
          <div className="space-y-6">
            {/* File Info */}
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type}
                  </p>
                </div>
              </div>
            </div>

            {/* Note Input */}
            <div>
              <label
                htmlFor="file-note"
                className="block text-sm font-medium text-neutral-700 mb-2"
              >
                Add Note (Optional)
              </label>
              <textarea
                id="file-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add any additional context or notes about this file..."
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                disabled={isUploading}
              />
              <p className="text-xs text-neutral-500 mt-1">
                This note will be included when indexing the file for search.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleModalClose}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUploadSubmit}
                loading={isUploading}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload & Index'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default FileUploader;