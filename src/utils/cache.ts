/**
 * COPILOT:
 * Gere um módulo TypeScript que usa @react-native-async-storage/async-storage.
 * Exportar funções genéricas:
 * - saveToCache<T>(key: string, data: T): Promise<void>
 * - loadFromCache<T>(key: string): Promise<{ timestamp: number; data: T } | null>
 * - clearCache(key: string): Promise<void>
 * - isCacheValid(timestamp: number, ttlMs: number): boolean
 * Requisitos:
 * - Usar JSON.stringify/parse com try/catch
 * - Tratar erros silenciosamente (log) e retornar null quando inválido
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

type CacheEnvelope<T> = { timestamp: number; data: T };

const buildValue = <T,>(data: T): string =>
  JSON.stringify({ timestamp: Date.now(), data } satisfies CacheEnvelope<T>);

export async function saveToCache<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, buildValue(data));
  } catch (e) {
    console.warn('[cache] save error', key, e);
  }
}

export async function loadFromCache<T>(key: string): Promise<CacheEnvelope<T> | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof parsed.timestamp !== 'number' ||
      !('data' in parsed)
    ) {
      return null;
    }
    return parsed;
  } catch (e) {
    console.warn('[cache] load error', key, e);
    return null;
  }
}

export async function clearCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.warn('[cache] clear error', key, e);
  }
}

export function isCacheValid(timestamp: number, ttlMs: number): boolean {
  return Date.now() - timestamp < ttlMs;
}
