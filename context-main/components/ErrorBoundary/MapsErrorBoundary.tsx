'use client';

import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import ErrorMessage from '../ui/ErrorMessage';

interface MapsErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

function MapsErrorFallback({ error, resetError }: MapsErrorFallbackProps) {
  return (
    <div className="py-8">
      <ErrorMessage
        title="Mind Maps Error"
        message={
          error?.message || 
          'An error occurred while loading mind maps. This could be due to a data loading issue or visualization problem.'
        }
        variant="error"
        size="lg"
        onRetry={resetError}
        className="max-w-2xl mx-auto"
      />
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Try refreshing the page or creating a new map if the problem persists.
        </p>
      </div>
    </div>
  );
}

interface MapsErrorBoundaryProps {
  children: React.ReactNode;
}

export default function MapsErrorBoundary({ children }: MapsErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={MapsErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}