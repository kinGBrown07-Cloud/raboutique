import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateDemoListings, generateDemoStats, DemoListing } from '../services/demoData';

interface DemoStore {
  isEnabled: boolean;
  listings: DemoListing[];
  setEnabled: (enabled: boolean) => void;
  generateData: (count?: number) => void;
  clearData: () => void;
  addToFavorites: (listingId: string) => void;
  removeFromFavorites: (listingId: string) => void;
  addToCart: (listingId: string) => void;
  removeFromCart: (listingId: string) => void;
  favorites: Set<string>;
  cart: Set<string>;
}

export const useDemoStore = create<DemoStore>()(
  persist(
    (set, get) => ({
      isEnabled: false,
      listings: [],
      favorites: new Set<string>(),
      cart: new Set<string>(),
      
      setEnabled: (enabled) => set({ isEnabled: enabled }),
      
      generateData: (count = 50) => {
        const listings = generateDemoListings(count);
        set({ listings, isEnabled: true });
      },
      
      clearData: () => {
        set({
          listings: [],
          isEnabled: false,
          favorites: new Set<string>(),
          cart: new Set<string>(),
        });
      },
      
      addToFavorites: (listingId) => {
        const newFavorites = new Set(get().favorites);
        newFavorites.add(listingId);
        set({ favorites: newFavorites });
      },
      
      removeFromFavorites: (listingId) => {
        const newFavorites = new Set(get().favorites);
        newFavorites.delete(listingId);
        set({ favorites: newFavorites });
      },
      
      addToCart: (listingId) => {
        const newCart = new Set(get().cart);
        newCart.add(listingId);
        set({ cart: newCart });
      },
      
      removeFromCart: (listingId) => {
        const newCart = new Set(get().cart);
        newCart.delete(listingId);
        set({ cart: newCart });
      },
    }),
    {
      name: 'demo-storage',
      partialize: (state) => ({
        isEnabled: state.isEnabled,
        listings: state.listings,
        favorites: Array.from(state.favorites),
        cart: Array.from(state.cart),
      }),
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        favorites: new Set(persistedState.favorites || []),
        cart: new Set(persistedState.cart || []),
      }),
    }
  )
);
