import { Metadata } from 'next';
import SearchInterface from './SearchInterface';

export const metadata: Metadata = {
  title: 'Search - Context Frontend',
  description: 'Search through your documents using AI-powered semantic search',
};

/**
 * Search page - Server component shell
 * Provides the search interface layout and metadata
 */
export default function SearchPage() {
  return <SearchInterface />;
}