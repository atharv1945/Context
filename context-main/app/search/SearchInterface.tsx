'use client';

import SearchBar from '../../components/SearchBar';
import SearchResults from '../../components/SearchResults';
import { SearchResult } from '../../services/types';
import { useSearch } from '../../hooks/useSearch';
import ErrorBoundary from '../../components/ErrorBoundary';
import ErrorMessage from '../../components/ui/ErrorMessage';
import { useScreenReaderAnnouncer } from '../../components/ui/ScreenReaderAnnouncer';
import { useEffect } from 'react';

/**
 * SearchInterface - Client component that manages search state and results
 * Now uses useSearch hook for state management and API integration
 */
export default function SearchInterface() {
  const {
    results,
    isLoading,
    error,
    query,
    setQuery,
    isFetching,
    refetch,
    canRetry,
    failureCount,
  } = useSearch();

  const { announce } = useScreenReaderAnnouncer();

  // Announce search results to screen readers
  useEffect(() => {
    if (!isLoading && !error && results.length > 0) {
      announce(`Found ${results.length} search results for "${query}"`);
    } else if (!isLoading && !error && query && results.length === 0) {
      announce(`No results found for "${query}"`);
    } else if (error) {
      announce(`Search failed: ${error}`, 'assertive');
    }
  }, [results, isLoading, error, query, announce]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const handleContextMenu = (result: SearchResult, position: { x: number; y: number }) => {
    // TODO: This will be implemented when context menu is added
    console.log('Context menu for result:', result, 'at position:', position);
  };

  const handleRetry = () => {
    refetch();
  };

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-high-contrast mb-2">Semantic Search</h1>
            <p className="text-medium-contrast text-lg">
              Search through your documents using natural language queries
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <SearchBar 
              onSearch={handleSearch}
              isLoading={isLoading || isFetching}
              placeholder="Search your documents..."
            />
          </div>
          
          {error && canRetry && (
            <div className="max-w-4xl mx-auto">
              <ErrorMessage
                title="Search Error"
                message={`${error} ${failureCount > 0 ? `(Attempt ${failureCount + 1}/4)` : ''}`}
                variant="error"
                onRetry={handleRetry}
                className="mb-4"
              />
            </div>
          )}
          
          <SearchResults
            results={results}
            isLoading={isLoading || isFetching}
            error={error && !canRetry ? error : null}
            query={query}
            onContextMenu={handleContextMenu}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}