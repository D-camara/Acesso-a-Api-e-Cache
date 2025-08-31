/**
 * COPILOT:
 * Gere um hook TypeScript `useFetchWithCache<T>` com a assinatura descrita abaixo.
 * Comportamento:
 * - Usa `api` (src/services/api) para buscar o endpoint.
 * - Usa funções de cache (src/utils/cache) para salvar/carregar.
 * - TTL padrão: 1 hora (3600000 ms).
 * - Se fetch falhar, tenta retornar cache existente.
 * - Expor função `refresh` para forçar fetch da API e atualizar cache.
 * - Tratar estados: loading, error.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { clearCache, isCacheValid, loadFromCache, saveToCache } from '../utils/cache';
import { CACHE_TTL_MS } from '../config';

interface UseFetchParams {
  endpoint: string;
  cacheKey: string;
  ttlMs?: number;
  skip?: boolean;
}

export function useFetchWithCache<T>({
  endpoint,
  cacheKey,
  ttlMs = CACHE_TTL_MS,
  skip = false,
}: UseFetchParams) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const hasFetchedRef = useRef(false);

  const load = useCallback(async () => {
    if (skip) return;
    setLoading(true);
    setError(null);

    const cached = await loadFromCache<T>(cacheKey);
    if (cached && isCacheValid(cached.timestamp, ttlMs)) {
      setData(cached.data);
      setLoading(false);
      // continue in background to refresh silently
      fetchAndCache(false);
      return;
    }
    await fetchAndCache(true, cached);
  }, [cacheKey, endpoint, ttlMs, skip]);

  const fetchAndCache = useCallback(
    async (updateState: boolean, stale?: { timestamp: number; data: T } | null) => {
      try {
        const response = await api.get<T>(endpoint);
        const fresh = response.data;
        await saveToCache(cacheKey, fresh);
        if (updateState) setData(fresh);
      } catch (e: any) {
        if (stale) {
          // fallback to stale
          if (updateState) setData(stale.data);
        } else if (updateState) {
          setError(e instanceof Error ? e : new Error('Erro ao carregar dados'));
        }
      } finally {
        if (updateState) setLoading(false);
      }
    },
    [endpoint, cacheKey]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    await fetchAndCache(true);
  }, [fetchAndCache]);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      load();
    }
  }, [load]);

  return { data, loading, error, refresh } as const;
}

export default useFetchWithCache;
