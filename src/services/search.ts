import type { Listing } from '../types';

interface SearchFilters {
  query?: string;
  category?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'date' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export async function searchListings(filters: SearchFilters): Promise<Listing[]> {
  // TODO: Replace with actual API call
  const response = await fetch('/api/listings/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters),
  });

  return response.json();
}

export function highlightSearchTerms(text: string, query: string): string {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}