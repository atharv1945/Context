'use client';

import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import ErrorMessage from '../ui/ErrorMessage';

interface FileManagerErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

function FileManagerErrorFallback({ error, resetError }: FileManagerErrorFallbackProps) {
  return (
    <div className="py-8">
      <ErrorMessage
        title="File Management Error"
        message={
          error?.message || 
          'An error occurred while managing files. This could be due to upload issues, file processing problems, or network connectivity.'
        }
        variant="error"
        size="lg"
        onRetry={resetError}
        className="max-w-2xl mx-auto"
      />
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Check your file permissions and network connection, then try again.
        </p>
      </div>
    </div>
  );
}

interface FileManagerErrorBoundaryProps {
  children: React.ReactNode;
}

export default function FileManagerErrorBoundary({ children }: FileManagerErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={FileManagerErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}