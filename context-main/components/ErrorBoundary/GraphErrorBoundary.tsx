'use client';

import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import ErrorMessage from '../ui/ErrorMessage';

interface GraphErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

function GraphErrorFallback({ error, resetError }: GraphErrorFallbackProps) {
  return (
    <div className="py-8">
      <ErrorMessage
        title="Graph Visualization Error"
        message={
          error?.message || 
          'An error occurred while loading the knowledge graph. This might be due to a visualization issue or data loading problem.'
        }
        variant="error"
        size="lg"
        onRetry={resetError}
        className="max-w-2xl mx-auto"
      />
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Try refreshing the page or contact support if the problem persists.
        </p>
      </div>
    </div>
  );
}

interface GraphErrorBoundaryProps {
  children: React.ReactNode;
}

export default function GraphErrorBoundary({ children }: GraphErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={GraphErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}