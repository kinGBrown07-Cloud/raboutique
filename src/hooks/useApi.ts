import { useState, useCallback } from 'react';
import { useApiCache } from '../store/apiCache';
import { useNotification } from '../contexts/NotificationContext';
import axios, { AxiosError } from 'axios';

interface UseApiOptions {
  cacheTTL?: number;
  useCache?: boolean;
}

export function useApi<T>(baseUrl: string, options: UseApiOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notify } = useNotification();
  const { setCache, getCache, clearCache } = useApiCache();

  const { cacheTTL = 5 * 60 * 1000, useCache = true } = options;

  const handleError = (error: unknown) => {
    const message = error instanceof AxiosError 
      ? error.response?.data?.message || error.message
      : 'Une erreur est survenue';
    
    setError(message);
    notify(message, 'error');
    return null;
  };

  const get = useCallback(async (endpoint: string, params?: Record<string, any>): Promise<T | null> => {
    const cacheKey = `${baseUrl}${endpoint}${params ? JSON.stringify(params) : ''}`;
    
    if (useCache) {
      const cachedData = getCache<T>(cacheKey);
      if (cachedData) return cachedData;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.get<T>(`${baseUrl}${endpoint}`, { params });
      if (useCache) {
        setCache(cacheKey, data, cacheTTL);
      }
      return data;
    } catch (error) {
      return handleError(error);
    } finally {
      setLoading(false);
    }
  }, [baseUrl, cacheTTL, useCache]);

  const post = useCallback(async (endpoint: string, body: any): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post<T>(`${baseUrl}${endpoint}`, body);
      notify('Opération réussie', 'success');
      return data;
    } catch (error) {
      return handleError(error);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  const put = useCallback(async (endpoint: string, body: any): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.put<T>(`${baseUrl}${endpoint}`, body);
      notify('Modification réussie', 'success');
      return data;
    } catch (error) {
      return handleError(error);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  const del = useCallback(async (endpoint: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await axios.delete(`${baseUrl}${endpoint}`);
      notify('Suppression réussie', 'success');
      return true;
    } catch (error) {
      handleError(error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  const invalidateCache = useCallback((endpoint?: string) => {
    if (endpoint) {
      clearCache(`${baseUrl}${endpoint}`);
    } else {
      clearCache();
    }
  }, [baseUrl]);

  return {
    get,
    post,
    put,
    del,
    loading,
    error,
    invalidateCache,
  };
}
