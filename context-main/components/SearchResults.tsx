'use client';

import { SearchResult } from '../services/types';
import ResultCard from './ResultCard';
import LoadingSpinner, { LoadingSkeleton } from './ui/LoadingSpinner';
import { SearchResultSkeleton } from './ui/Skeleton';
import ErrorMessage from './ui/ErrorMessage';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  query: string;
  onContextMenu?: (result: SearchResult, position: { x: number; y: number }) => void;
}

/**
 * SearchResults component with grid layout matching Figma design
 * Implements requirements 1.3 and 1.4
 */
export default function SearchResults({ 
  results, 
  isLoading, 
  error, 
  query,
  onContextMenu 
}: SearchResultsProps) {
  // Loading state with skeleton cards
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <LoadingSpinner size="md" />
            <span className="text-medium-contrast text-base">Searching for &ldquo;{query}&rdquo;...</span>
          </div>
        </div>
        
        {/* Loading skeleton grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="card-dark overflow-hidden">
              <div className="h-32 bg-gradient-to-br from-gray-600 to-gray-800 shimmer" />
              <div className="p-4">
                <LoadingSkeleton lines={3} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="py-8">
        <ErrorMessage 
          title="Search Error"
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // No results state
  if (!isLoading && results.length === 0 && query) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 text-white/30">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-high-contrast mb-2">
            No results found
          </h3>
          <p className="text-medium-contrast text-base">
            We couldn&apos;t find any documents matching &ldquo;{query}&rdquo;. Try adjusting your search terms or using different keywords.
          </p>
        </div>
      </div>
    );
  }

  // Results grid
  if (results.length > 0) {
    return (
      <div className="space-y-6">
        {/* Results header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-high-contrast">
            Search Results
          </h2>
          <span className="text-base text-medium-contrast">
            {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          </span>
        </div>
        
        {/* Results grid with responsive design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {results.map((result, index) => (
            <ResultCard 
              key={(result as any).id ?? (result as any).file_path ?? index}
              result={result}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
        
        {/* Load more indicator (for future pagination) */}
        {results.length >= 20 && (
          <div className="text-center py-4">
            <p className="text-base text-medium-contrast">
              Showing {results.length} results
            </p>
          </div>
        )}
      </div>
    );
  }

  // Empty state (no query)
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto mb-4 text-white/30">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-high-contrast mb-2">
          Start searching
        </h3>
        <p className="text-medium-contrast text-base">
          Enter a search query above to find relevant documents using AI-powered semantic search.
        </p>
      </div>
    </div>
  );
}