/**
 * COPILOT:
 * Implemente um utilitário TypeScript usando @react-native-async-storage/async-storage.
 *
 * Requisitos e especificações:
 * 1) Estrutura do payload salvo:
 *    interface CachePayload<T> { timestamp: number; version?: string; data: T }
 *    - Sempre incluir timestamp = Date.now()
 *    - version é opcional (útil para invalidar caches quando a estrutura mudar)
 *
 * 2) Funções a exportar:
 *    - saveToCache<T>(key: string, data: T): Promise<void>
 *    - loadFromCache<T>(key: string): Promise<CachePayload<T> | null>
 *    - clearCache(key: string): Promise<void>
 *    - isCacheValid(timestamp: number, ttlMs: number): boolean
 *    - (opcional) loadCacheOrFetch<T>(
 *         key: string,
 *         ttlMs: number,
 *         fetcher: () => Promise<T>
 *       ): Promise<T>
 *      Comportamento: se cache válido retorna cache.data, se expirado chama fetcher(), salva novo cache e retorna o resultado. Se fetcher falhar e existir cache (mesmo expirado), retornar cache.data como fallback.
 *
 * 3) Requisitos de implementação:
 *    - Usar JSON.stringify / JSON.parse com try/catch.
 *    - Em parse inválido, fazer clearCache(key) e retornar null.
 *    - Tratar erros do AsyncStorage com try/catch e log (não lançar erro para UI).
 *    - Prefixar keys com um namespace, ex: `cache:${key}`.
 *    - TTL padrão (se necessário) sugerido: 3600000 ms (1 hora) — mas deixar função aceitar ttl como parâmetro.
 *    - Documentar em comentários os casos de fallback (offline).
 *
 * 4) Tipos TypeScript:
 *    - export interface CachePayload<T> { timestamp: number; version?: string; data: T }
 *    - export type Maybe<T> = T | null;
 *
 * 5) Exportar as funções com nomes exatos (para fácil import).
 * 6) Incluir uma pequena função utilitária getCacheAge(timestamp) que retorna idade em ms.
 */
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

// Blocos de prompt funcionais individuais (podem ser usados separadamente para guiar Copilot)
/**
 * COPILOT:
 * Implemente a função saveToCache<T>(key: string, data: T): Promise<void>
 * - Deve usar AsyncStorage.setItem
 * - Deve criar CachePayload com timestamp e version (const CACHE_VERSION = 'v1')
 * - Catch de erro deve usar console.warn('saveToCache error', e)
 */
/**
 * COPILOT:
 * Implemente loadFromCache<T>(key: string): Promise<CachePayload<T> | null>
 * - Deve usar AsyncStorage.getItem e JSON.parse
 * - Se parse falhar, limpar a chave e retornar null
 * - Se payload.version !== CACHE_VERSION, limpar e retornar null
 */
/**
 * COPILOT:
 * Implemente loadCacheOrFetch<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T>
 * - Verificar cache; se válido retornar; se expirado buscar, salvar e retornar; fallback para cache expirado se fetch falhar
 */
