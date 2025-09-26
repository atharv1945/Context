'use client';

import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from './ui/LoadingSpinner';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  placeholder?: string;
  debounceMs?: number;
}

/**
 * SearchBar component with auto-focus, debouncing, and loading states
 * Implements requirements 1.1 and 1.2
 */
export default function SearchBar({ 
  onSearch, 
  isLoading, 
  placeholder = "Search...",
  debounceMs = 300 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Auto-focus on mount (Requirement 1.1)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Debounced search (Requirement 1.2)
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onSearch(query);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, onSearch, debounceMs]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="search-glass p-4 flex items-center">
        <div className="flex items-center pointer-events-none mr-4">
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <MagnifyingGlassIcon className="h-6 w-6 text-white/90" />
          )}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={isLoading}
          aria-label="Search documents"
          aria-describedby="search-description"
          role="searchbox"
          autoComplete="off"
          spellCheck="false"
          className={`
            block w-full pl-10 pr-12 py-4 
            bg-transparent text-high-contrast placeholder-white/85
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            text-lg font-medium
          `}
        />
        
        {/* Screen reader description */}
        <div id="search-description" className="sr-only">
          Search through your documents using natural language queries. Results will appear below as you type.
        </div>
        
        {query && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="ml-4 p-2 text-white/85 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Hidden submit button for form submission */}
      <button type="submit" className="sr-only">
        Search
      </button>
    </form>
  );
}