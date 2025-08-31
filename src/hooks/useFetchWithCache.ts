// Hook para buscar dados com cache (AsyncStorage + TTL) e fallback offline.
// Estratégia:
// - Lê cache; se válido retorna imediatamente e atualiza silenciosamente em background.
// - Se expirado ou inexistente, busca API e salva.
// - Se falha e há cache (stale), usa cache para não quebrar a UI.
// - refresh(): força nova busca ignorando estado anterior.

import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { isCacheValid, loadFromCache, saveToCache } from '../utils/cache';
// TTL padrão: 1 hora (3600000 ms)
const CACHE_TTL_MS = 3600000;

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
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const hasFetchedRef = useRef(false);

  const load = useCallback(async () => {
    if (skip) return;
    setLoading(true);
    setError(null);

    const cached = await loadFromCache<T>(cacheKey);
    if (cached) {
      if (isCacheValid(cached.timestamp, ttlMs)) {
        setData(cached.data);
        setLastUpdated(cached.timestamp);
        setLoading(false);
        fetchAndCache(false); // refresh silencioso
        return;
      }
      // Cache expirado: tenta buscar; poderia exibir stale (opcional)
    }
    await fetchAndCache(true, cached);
  }, [cacheKey, endpoint, ttlMs, skip]);

  const fetchAndCache = useCallback(
    async (updateState: boolean, stale?: { timestamp: number; data: T } | null) => {
      try {
        console.log('[useFetchWithCache] GET', endpoint);
        const response = await api.get<T>(endpoint);
        const fresh = response.data;
        await saveToCache(cacheKey, fresh);
        if (updateState) {
          setData(fresh);
          setLastUpdated(Date.now());
        }
      } catch (e: any) {
        if (stale) {
          // fallback to stale
          if (updateState) {
            setData(stale.data);
            setLastUpdated(stale.timestamp);
          }
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

  return { data, loading, error, refresh, lastUpdated } as const;
}

export default useFetchWithCache;
