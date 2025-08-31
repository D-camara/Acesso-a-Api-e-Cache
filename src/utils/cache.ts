// Utilitário de cache (AsyncStorage) com versionamento e fallback offline.
// Estrutura: { timestamp, version, data }. Version permite invalidar entradas antigas.
// Utilitário de cache com versionamento e fallback offline.

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CachePayload<T> { timestamp: number; version?: string; data: T }
export type Maybe<T> = T | null;

const PREFIX = 'cache:';
const CACHE_VERSION = 'v1';

function buildStorageKey(key: string) {
  return PREFIX + key;
}

export function getCacheAge(timestamp: number): number {
  return Date.now() - timestamp;
}

export function isCacheValid(timestamp: number, ttlMs: number): boolean {
  return getCacheAge(timestamp) <= ttlMs;
}

export async function saveToCache<T>(key: string, data: T): Promise<void> {
  const payload: CachePayload<T> = { timestamp: Date.now(), version: CACHE_VERSION, data };
  try {
    await AsyncStorage.setItem(buildStorageKey(key), JSON.stringify(payload));
  } catch (e) {
    console.warn('[cache] erro ao salvar', key, e);
  }
}

export async function loadFromCache<T>(key: string): Promise<CachePayload<T> | null> {
  const storageKey = buildStorageKey(key);
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    if (!raw) return null;
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      console.warn('[cache] JSON inválido, limpando', key, parseErr);
      await clearCache(key);
      return null;
    }
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      typeof parsed.timestamp !== 'number' ||
      !('data' in parsed)
    ) {
      await clearCache(key);
      return null;
    }
    if (parsed.version && parsed.version !== CACHE_VERSION) {
      // Versão mudou: invalida para evitar erro de estrutura
      await clearCache(key);
      return null;
    }
    return parsed as CachePayload<T>;
  } catch (e) {
    console.warn('[cache] erro ao ler', key, e);
    return null;
  }
}

export async function clearCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(buildStorageKey(key));
  } catch (e) {
    console.warn('[cache] erro ao limpar', key, e);
  }
}

// Tenta retornar dado válido do cache; se expirado busca e salva; se fetch falhar usa fallback stale.
export async function loadCacheOrFetch<T>(
  key: string,
  ttlMs: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const cached = await loadFromCache<T>(key);
  if (cached && isCacheValid(cached.timestamp, ttlMs)) {
    return cached.data;
  }
  try {
    const fresh = await fetcher();
    await saveToCache(key, fresh);
    return fresh;
  } catch (e) {
    if (cached) {
      console.warn('[cache] fetch falhou, usando fallback stale', key, e);
      return cached.data; // fallback offline/erro
    }
    throw e; // nenhum dado disponível
  }
}

// Funções exportadas: saveToCache, loadFromCache, clearCache, isCacheValid, getCacheAge, loadCacheOrFetch.
// Ao mudar estrutura de dados, basta alterar CACHE_VERSION para invalidar.

// Exemplo de uso (comentado):
// const resultado = await loadCacheOrFetch<AlgumTipo>("minha-chave", 3600_000, async () => {
//   const r = await api.get<AlgumTipo>('/rota');
//   return r.data;
// });
