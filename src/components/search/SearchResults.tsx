import React from 'react';
import { ListingGrid } from '../listings/ListingGrid';
import type { Listing } from '../../types';

interface SearchResultsProps {
  results: Listing[];
  query: string;
  isLoading: boolean;
}

export function SearchResults({ results, query, isLoading }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">
          No results found for "{query}". Try adjusting your search criteria.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-gray-600 mb-6">
        Found {results.length} results for "{query}"
      </p>
      <ListingGrid listings={results} />
    </div>
  );
}