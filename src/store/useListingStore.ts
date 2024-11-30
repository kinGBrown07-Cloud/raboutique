import { create } from 'zustand';
import type { Listing, CreateListingData, UpdateListingData } from '../types/listing';
import { listingService } from '../services/listingService';

interface ListingState {
  listings: Listing[];
  currentListing: Listing | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    type?: string;
    status?: string;
  };
  
  fetchListings: () => Promise<void>;
  fetchListing: (id: number) => Promise<void>;
  createListing: (data: CreateListingData) => Promise<void>;
  updateListing: (id: number, data: UpdateListingData) => Promise<void>;
  deleteListing: (id: number) => Promise<void>;
  setFilters: (filters: { type?: string; status?: string }) => void;
  clearError: () => void;
}

export const useListingStore = create<ListingState>((set, get) => ({
  listings: [],
  currentListing: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchListings: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await listingService.getListings(get().filters);
      set({ listings: response.data.listings, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch listings',
        isLoading: false,
      });
    }
  },

  fetchListing: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await listingService.getListing(id);
      set({ currentListing: response.data.listing, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch listing',
        isLoading: false,
      });
    }
  },

  createListing: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await listingService.createListing(data);
      set((state) => ({
        listings: [...state.listings, response.data.listing],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create listing',
        isLoading: false,
      });
    }
  },

  updateListing: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await listingService.updateListing(id, data);
      set((state) => ({
        listings: state.listings.map((listing) =>
          listing.id === id ? response.data.listing : listing
        ),
        currentListing:
          state.currentListing?.id === id
            ? response.data.listing
            : state.currentListing,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update listing',
        isLoading: false,
      });
    }
  },

  deleteListing: async (id) => {
    try {
      set({ isLoading: true, error: null });
      await listingService.deleteListing(id);
      set((state) => ({
        listings: state.listings.filter((listing) => listing.id !== id),
        currentListing:
          state.currentListing?.id === id ? null : state.currentListing,
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete listing',
        isLoading: false,
      });
    }
  },

  setFilters: (filters) => {
    set({ filters });
    get().fetchListings();
  },

  clearError: () => set({ error: null }),
}));
