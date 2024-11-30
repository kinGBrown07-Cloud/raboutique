import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface ApiCacheStore {
  cache: Record<string, CacheItem<any>>;
  setCache: <T>(key: string, data: T, ttl?: number) => void;
  getCache: <T>(key: string) => T | null;
  clearCache: (key?: string) => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes par défaut

export const useApiCache = create<ApiCacheStore>()(
  persist(
    (set, get) => ({
      cache: {},
      
      setCache: (key, data, ttl = CACHE_TTL) => {
        set((state) => ({
          cache: {
            ...state.cache,
            [key]: {
              data,
              timestamp: Date.now() + ttl,
            },
          },
        }));
      },

      getCache: (key) => {
        const item = get().cache[key];
        if (!item) return null;

        if (Date.now() > item.timestamp) {
          get().clearCache(key);
          return null;
        }

        return item.data;
      },

      clearCache: (key) => {
        if (key) {
          set((state) => {
            const newCache = { ...state.cache };
            delete newCache[key];
            return { cache: newCache };
          });
        } else {
          set({ cache: {} });
        }
      },
    }),
    {
      name: 'api-cache',
      partialize: (state) => ({ cache: state.cache }),
    }
  )
);
