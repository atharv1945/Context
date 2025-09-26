'use client';

import React from 'react';
import FileUploader from './FileUploader';
import { FileContextMenu, useContextMenu } from './ContextMenu';
import { useFileManager } from '../hooks/useFileManager';

const FileManagerDemo: React.FC = () => {
  const fileManager = useFileManager();
  const contextMenu = useContextMenu();

  // Mock file data for demonstration
  const mockFile = {
    id: 'demo-file-1',
    name: 'example-document.pdf',
    path: '/uploads/example-document.pdf'
  };

  const handleUpload = async (file: File, note?: string) => {
    try {
      const result = await fileManager.uploadFile(file, note);
      console.log('Upload successful:', result);
      // You might want to show a success toast here
    } catch (error) {
      console.error('Upload failed:', error);
      // Error is already handled by the hook
    }
  };

  const handleOpenFile = () => {
    fileManager.openFile(mockFile.path);
  };

  const handleShowInFolder = () => {
    fileManager.showInFolder(mockFile.path);
  };

  const handleAddToContextMap = async () => {
    try {
      await fileManager.addToContextMap(mockFile.id);
    } catch (error) {
      console.error('Failed to add to context map:', error);
    }
  };

  const handleRemoveFromContext = async () => {
    try {
      await fileManager.deleteFile(mockFile.id);
      console.log('File removed successfully');
    } catch (error) {
      console.error('Failed to remove file:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">
          File Management System Demo
        </h2>
        <p className="text-neutral-600 mb-6">
          This demo shows the file upload component and context menu functionality.
        </p>
      </div>

      {/* File Upload Section */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          File Upload with Note
        </h3>
        <FileUploader onUpload={handleUpload} />
        
        {fileManager.uploadError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              Upload Error: {fileManager.uploadError}
            </p>
            <button
              onClick={fileManager.clearErrors}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Clear Error
            </button>
          </div>
        )}
      </div>

      {/* Context Menu Demo */}
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Context Menu Demo
        </h3>
        <div
          className="p-6 bg-neutral-50 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-100 transition-colors"
          onContextMenu={contextMenu.openContextMenu}
        >
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
            <div>
              <p className="font-medium text-neutral-900">{mockFile.name}</p>
              <p className="text-sm text-neutral-500">Right-click to see context menu</p>
            </div>
          </div>
        </div>

        <FileContextMenu
          isOpen={contextMenu.isOpen}
          position={contextMenu.position}
          onClose={contextMenu.closeContextMenu}
          onOpenFile={handleOpenFile}
          onShowInFolder={handleShowInFolder}
          onAddToContextMap={handleAddToContextMap}
          onRemoveFromContext={handleRemoveFromContext}
          fileName={mockFile.name}
        />

        {fileManager.deleteError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              Delete Error: {fileManager.deleteError}
            </p>
            <button
              onClick={fileManager.clearErrors}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Clear Error
            </button>
          </div>
        )}
      </div>

      {/* Status Display */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
        <h4 className="font-medium text-neutral-900 mb-2">Current Status:</h4>
        <div className="space-y-1 text-sm text-neutral-600">
          <p>Upload Status: {fileManager.isUploading ? 'Uploading...' : 'Ready'}</p>
          <p>Delete Status: {fileManager.isDeleting ? 'Deleting...' : 'Ready'}</p>
        </div>
      </div>
    </div>
  );
};

export default FileManagerDemo;