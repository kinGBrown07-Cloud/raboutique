import { useState, useEffect } from 'react';
import { useApi } from './useApi';
import { useDemoStore } from '../store/useDemoStore';
import { DemoListing } from '../services/demoData';

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'date_desc';
}

interface UseListingsSearchResult {
  listings: DemoListing[];
  totalItems: number;
  loading: boolean;
  error: Error | null;
  search: (query: string, filters: SearchFilters, page: number) => Promise<void>;
}

export const useListingsSearch = (itemsPerPage: number = 12): UseListingsSearchResult => {
  const { get } = useApi('https://api.remag.com/v1');
  const { isEnabled, listings: demoListings } = useDemoStore();
  
  const [listings, setListings] = useState<DemoListing[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const filterDemoListings = (
    items: DemoListing[],
    query: string,
    filters: SearchFilters,
    page: number
  ): { filtered: DemoListing[]; total: number } => {
    let filtered = [...items];

    // Recherche textuelle
    if (query) {
      const searchTerms = query.toLowerCase().split(' ');
      filtered = filtered.filter(item => 
        searchTerms.every(term =>
          item.title.toLowerCase().includes(term) ||
          item.description.toLowerCase().includes(term)
        )
      );
    }

    // Filtres
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }
    if (filters.location) {
      filtered = filtered.filter(item => item.location === filters.location);
    }
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(item => item.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(item => item.price <= filters.maxPrice!);
    }

    // Tri
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price_asc':
            return a.price - b.price;
          case 'price_desc':
            return b.price - a.price;
          case 'date_desc':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return 0;
        }
      });
    }

    const total = filtered.length;
    
    // Pagination
    const start = (page - 1) * itemsPerPage;
    filtered = filtered.slice(start, start + itemsPerPage);

    return { filtered, total };
  };

  const search = async (query: string, filters: SearchFilters, page: number) => {
    setLoading(true);
    setError(null);

    try {
      if (isEnabled) {
        // Utiliser les données de démo
        const { filtered, total } = filterDemoListings(demoListings, query, filters, page);
        setListings(filtered);
        setTotalItems(total);
      } else {
        // Appel API réel
        const response = await get('/listings/search', {
          params: {
            q: query,
            page,
            limit: itemsPerPage,
            ...filters,
          },
        });
        setListings(response.items);
        setTotalItems(response.total);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return {
    listings,
    totalItems,
    loading,
    error,
    search,
  };
};
