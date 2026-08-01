import { useState, useEffect, useCallback, useRef } from 'react';
import { api, ApiError } from '@/services/api';

interface UseFetchOptions<T> {
  endpoint: string;
  params?: Record<string, string | number | boolean | undefined>;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFetch<T = any>({ endpoint, params, enabled = true, onSuccess, onError }: UseFetchOptions<T>): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ── Wait for auth token to be loaded from AsyncStorage ──────────────
      // This prevents unauthenticated requests on cold-start (especially on
      // mobile where AsyncStorage is async and the first screen fires before
      // AuthContext has finished loading the stored token).
      await api.authReady;

      const queryParts: string[] = [];
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParts.push(`${key}=${encodeURIComponent(String(value))}`);
          }
        });
      }
      const query = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
      const result = await api.get<T>(`${endpoint}${query}`);
      if (mountedRef.current) {
        setData(result);
        onSuccess?.(result);
      }
    } catch (e: any) {
      if (mountedRef.current) {
        const msg = e instanceof ApiError ? e.message : 'Network error';
        setError(msg);
        onError?.(msg);
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [endpoint, JSON.stringify(params || {}), enabled]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    return () => { mountedRef.current = false; };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

interface UseMutationResult<T, P> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (params: P) => Promise<T>;
  reset: () => void;
}

export function useMutation<T = any, P = any>(
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string | ((params: P) => string)
): UseMutationResult<T, P> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const execute = useCallback(async (params: P): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      // Wait for auth to be ready before any mutation too
      await api.authReady;

      const url = typeof endpoint === 'function' ? endpoint(params) : endpoint;
      let result: T;
      switch (method) {
        case 'POST':
          result = await api.post<T>(url, params);
          break;
        case 'PUT':
          result = await api.put<T>(url, params);
          break;
        case 'PATCH':
          result = await api.patch<T>(url, params);
          break;
        case 'DELETE':
          result = await api.delete<T>(url);
          break;
      }
      if (mountedRef.current) setData(result!);
      return result!;
    } catch (e: any) {
      const msg = e instanceof ApiError ? e.message : 'Network error';
      if (mountedRef.current) setError(msg);
      throw e;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [method, endpoint]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  return { data, loading, error, execute, reset };
}
