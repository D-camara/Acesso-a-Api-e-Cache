<div align="center">

# Acesso à API com Cache (Expo / React Native)

Aplicativo exemplo mostrando consumo de API + cache persistente em AsyncStorage com TTL, fallback offline e tema claro/escuro.

</div>


## 🚀 Visão Geral

Objetivo: reduzir latência e garantir experiência offline básica ao listar posts de uma API pública (`/posts`).

Principais pontos implementados:
1. Serviço HTTP centralizado (Axios) (`src/services/api.ts`).
2. Utilitário de cache genérico com versionamento e TTL (`src/utils/cache.ts`).
3. Hook reutilizável `useFetchWithCache` para orquestrar cache + rede.
4. Fallback para dados em cache quando a requisição falha (ex.: modo avião).
5. Pull‑to‑refresh para forçar atualização manual.
6. Gradiente de fundo + ajuste automático claro/escuro.
7. Indicação visual quando exibindo dados offline (stale).

---

## 📁 Estrutura (trecho relevante)

```
src/
  config.ts               # Constantes globais (API_BASE_URL, TTL)
  services/api.ts         # Instância Axios
  utils/cache.ts          # Cache (AsyncStorage + version + TTL + loadCacheOrFetch)
  hooks/useFetchWithCache.ts
  screens/HomeScreen.tsx  # Lista de posts
  types/api.ts            # Tipagem Post
```

---

## ⚙️ Instalação & Execução

```bash
npm install
npm start
```

Abrir no dispositivo com Expo Go (QR code) ou emulador (pressionar `a` ou `w` no terminal para Android / Web).

Opcional (limpar cache Metro):
```bash
npx expo start --clear
```

---

## 🌐 Configuração da API

Valor padrão: `https://jsonplaceholder.typicode.com`.

Sobrescrever via variável de ambiente `API_BASE_URL` (em build) ou editando `src/config.ts`.

Nunca commitar segredos (usar placeholder ou .env privado se for o caso).

---

## 🗃️ Cache – Detalhes Técnicos

Arquivo: `src/utils/cache.ts`.

Formato salvo por chave: `{ timestamp, version, data }` com prefixo `cache:`.

Constantes:
- `CACHE_VERSION = 'v1'` (alterar para invalidar tudo ao mudar estrutura de dados).
- TTL padrão usado no hook: `3600000` ms (1h) – configurável ao chamar.

Funções principais:
- `saveToCache(key, data)` – serializa em JSON e armazena.
- `loadFromCache(key)` – retorna payload ou `null` se inválido / versão divergente.
- `isCacheValid(timestamp, ttl)` – compara idade.
- `getCacheAge(timestamp)` – utilitário (ms).
- `clearCache(key)` – remove.
- `loadCacheOrFetch(key, ttl, fetcher)` – alto nível (usa stale como fallback se `fetcher` falhar).

Fallback offline: se a rede falhar e existir payload (mesmo expirado), devolve o dado stale para não quebrar a UI.

---

## 🔄 Hook `useFetchWithCache`

Fluxo resumido:
1. Lê cache.
2. Se válido → exibe imediatamente e atualiza em background.
3. Se expirado → tenta rede; se sucesso, salva + exibe; se erro, tenta stale.
4. `refresh()` força revalidação manual.

Retorna: `{ data, loading, error, refresh, lastUpdated }`.

---

## 🖥️ Tela `HomeScreen`

Mostra lista de posts (`/posts`), banners de status (offline / hora da última atualização) e suporta pull‑to‑refresh.

---

## 🧪 Testes Manuais (Checklist)

1. Online inicial → lista deve carregar e gravar cache.
2. Ativar modo avião + reabrir → ver dados + aviso de offline.
3. Puxar para atualizar (ainda offline) → permanece stale.
4. Voltar rede e dar refresh → dados atualizados e marca horário novo.
5. Reduzir TTL em `config.ts` (ex.: 5000 ms), esperar expirar → próxima abertura refaz fetch.
6. Corromper valor no AsyncStorage (dev tools) → app limpa e refaz fetch.

---

## 📌 Commits (exemplos de organização adotada)

```
feat(api): instancia axios
feat(cache): util async storage + version
feat(hook): useFetchWithCache
feat(ui): HomeScreen
refactor(i18n): tradução e contraste
feat(ui): gradiente e tema
```

---

## 🚧 Possíveis Evoluções

- Invalidação seletiva por prefixo.
- Persistir estatísticas de hit/miss.
- Paginação com chave composta (ex.: `posts:page:1`).
- Estratégia stale‑while‑revalidate centralizada no util (já encaminhado no hook).
- Testes unitários (Jest) para `cache.ts`.

---

## 📄 Licença

Uso acadêmico/demonstrativo. Ajustar conforme necessidade antes de distribuição.

---

## 📬 Contato

Qualquer dúvida sobre a implementação ou arquitetura: abra uma issue ou adapte livremente.

---

> Projeto desenvolvido para demonstrar boas práticas de cache e resiliência de dados em aplicações móveis.
