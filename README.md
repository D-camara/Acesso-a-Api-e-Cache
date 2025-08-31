# Acesso-a-Api-e-Cache

> Projeto demonstrando acesso a API com cache (AsyncStorage + TTL) em Expo/React Native.

# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Setup

```bash
npm install
```

## Rodando localmente

```bash
npm start
```
Abra no dispositivo usando o app Expo Go ou emulador.

## API & Configuração

A API padrão usada é `https://jsonplaceholder.typicode.com` (placeholder). Pode ser substituída definindo variável de ambiente `API_BASE_URL` ou editando `src/config.ts` (não colocar segredos no repositório).

## Política de Cache

- Utilitário em `src/utils/cache.ts` baseado em AsyncStorage.
- Cada entrada salva `{ timestamp, data }`.
- TTL padrão definido em `CACHE_TTL_MS = 3600000` (1h) em `src/config.ts`.
- Hook `useFetchWithCache` (arquivo `src/hooks/useFetchWithCache.ts`) segue fluxo:
  1. Lê cache pela `cacheKey`.
  2. Se válido (timestamp < TTL) retorna imediatamente e atualiza em background.
  3. Se expirado, tenta buscar da API; sucesso -> atualiza cache; falha -> fallback para cache (stale) se existir.
  4. `refresh()` força nova chamada e atualiza cache.

## Tela Home

`src/screens/HomeScreen.tsx` lista posts (`/posts`) com pull-to-refresh, indicador de offline (quando usando dados em cache após erro) e botão de retry se não houver dados.

## Testes Manuais Offline

```text
1. Rodar app: npm start
2. Com rede ativa: abrir Home -> deve listar posts e gravar cache.
3. Desligar rede (modo avião) e reiniciar app -> deve mostrar dados em cache e aviso.
4. Testar pull-to-refresh: puxar lista; com rede volta a buscar e atualizar cache.
5. (Opcional) Reduzir TTL para poucos segundos em config e repetir para ver expiração.
```

## Como enviar / zipar para Teams

1. Executar `git log --oneline` e copiar commits de feature.
2. Garantir que não há segredos (somente URL pública placeholder).
3. Compactar pasta (excluindo `node_modules/` se necessário) e enviar.

## Commits de Referência

Exemplos sugeridos:
- `feat(api): add axios instance (src/services/api.ts)`
- `feat(cache): add async storage utils (src/utils/cache.ts)`
- `feat(hook): add useFetchWithCache hook`
- `feat(ui): add HomeScreen using hook`

## Referências Expo

Para documentação adicional consulte https://docs.expo.dev/
