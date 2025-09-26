'use client';

import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import ErrorMessage from '../ui/ErrorMessage';

interface SearchErrorFallbackProps {
  error?: Error;
  resetError: () => void;
}

function SearchErrorFallback({ error, resetError }: SearchErrorFallbackProps) {
  return (
    <div className="py-8">
      <ErrorMessage
        title="Search Error"
        message={
          error?.message || 
          'An error occurred while searching. Please try again or check your connection.'
        }
        variant="error"
        size="lg"
        onRetry={resetError}
        className="max-w-2xl mx-auto"
      />
    </div>
  );
}

interface SearchErrorBoundaryProps {
  children: React.ReactNode;
}

export default function SearchErrorBoundary({ children }: SearchErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={SearchErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}