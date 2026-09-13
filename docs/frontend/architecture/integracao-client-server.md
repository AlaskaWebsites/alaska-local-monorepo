# Integração Client-Server — Alaska Local (Nuxt 3 ↔ NestJS 11)

Este guia estabelece os padrões técnicos, protocolos de comunicação e fluxos de dados para a integração de ponta a ponta entre a aplicação front-end (**Nuxt 3** em `apps/web`) e a API back-end (**NestJS 11** em `apps/api`), mediados pelo pacote canônico **`@alaska/contracts`**.

---

## 1. Topologia de Ambientes e Resolução de URLs

O ecossistema opera em duas topologias complementares (desenvolvimento local e nuvem de produção):

```
┌────────────────────────────────────────────────────────────────────────┐
│                     DESENVOLVIMENTO LOCAL                              │
│                                                                        │
│   Frontend Nuxt 3      ───────────►      Backend NestJS 11             │
│   localhost:3000                        localhost:3333/api             │
│                                                  │                     │
│                                                  ▼                     │
│                                          PostgreSQL 16                 │
│                                          localhost:5432                │
├────────────────────────────────────────────────────────────────────────┤
│                     PRODUÇÃO (CI/CD MULTI-CLOUD)                       │
│                                                                        │
│   Vercel Serverless    ───────────►      Render Web Service (Docker)   │
│   *.alaska.app / CNAME                  alaska-local-api.onrender.com │
│                                                  │                     │
│                                                  ▼                     │
│                                          Render PostgreSQL             │
│                                          (Auto-SSL Gerenciado)         │
└────────────────────────────────────────────────────────────────────────┘
```

### A. Resolução Dinâmica de Base URL (`getApiBaseUrl()`)
Tanto em `useTenant.ts` quanto em `useMerchantAdmin.ts` e `useApiClient.ts`, a URL base da API é resolvida dinamicamente:
1. Se `config.public.apiBaseUrl` estiver definido com URL que não seja localhost, ela é utilizada.
2. No navegador (`typeof window !== 'undefined'`), se o hostname for diferente de `localhost` e `127.0.0.1` (ex: em produção na Vercel ou acessando pelo smartphone via IP local), a aplicação direciona automaticamente as requisições para a API de produção no Render: `https://alaska-local-api.onrender.com/api`.
3. Em ambiente local puro, aponta para `http://localhost:3333/api`.

### B. Configuração de CORS no Backend
O `main.ts` do NestJS lê `CORS_ORIGINS` do `env.schema.ts` (padrão `*` ou lista separada por vírgulas), permitindo que requisições vindas de subdomínios `*.alaska.app`, `*.vercel.app` e domínios próprios CNAME acessem os endpoints sem bloqueio de pre-flight OPTIONS.

---

## 2. Contratos Compartilhados & End-to-End Type Safety (ADR 014)

O pacote `@alaska/contracts` é a **Single Source of Truth** do monorepo:

```
                  ┌──────────────────────────────┐
                  │      @alaska/contracts       │
                  │   Schemas Zod 3.24 & Types   │
                  └──────────────┬───────────────┘
                                 │
                ┌────────────────┴────────────────┐
                ▼                                 ▼
   ┌──────────────────────────┐      ┌──────────────────────────┐
   │     apps/web (Nuxt)      │      │     apps/api (NestJS)    │
   │  • $fetch com tipagem    │      │  • ZodValidationPipe     │
   │  • useTenant (parse)     │      │  • Entidades & DTOs      │
   └──────────────────────────┘      └──────────────────────────┘
```

* **Zero Duplicação**: Interfaces TypeScript são inferidas diretamente com `z.infer<typeof Schema>`.
* **Zero Contract Drift**: Se um campo for renomeado ou adicionado em `packages/contracts/src/`, o build do monorepo (`pnpm build:contracts && pnpm test`) quebra imediatamente em ambos os workspaces caso haja descompasso.

---

## 3. Leitura Híbrida de Dados: API-First com Fallback Gracioso

O composable `useTenant.ts` implementa uma arquitetura híbrida de alto desempenho que prioriza a API remota, mas garante **zero tela branca**:

```
[ Acessa /[slug] ]
       │
       ▼
[ Tenta buscar da API NestJS ] ──(Sucesso)──► [ Valida com TenantSchema ] ──► [ Renderiza Vitrine ]
       │
    (Falha / Cold-Start)
       │
       ▼
[ Fallback Local em ~/data/<slug>.json ] ────► [ Valida com TenantSchema ] ──► [ Renderiza Vitrine ]
```

### Otimizações Implementadas no `useTenant.ts`:
1. **Cache Reativo com `useState`**: Os dados da loja permanecem cacheados no estado global do Nuxt durante a navegação interna.
2. **Deduplicação de Requisições em Voo (*Flight Deduplication*)**: Múltiplos componentes solicitando o mesmo slug compartilham a mesma Promise HTTP ativa.
3. **Debounce de 2 Segundos em Foco**: Evita disparar requisições em cascata quando o usuário alterna abas do navegador.
4. **Preservação de Dados Locais**: Avaliações detalhadas e comentários ricos do JSON local são preservados caso a API retorne apenas dados resumidos.

---

## 4. Mutações Otimistas em 3 Camadas (Painel do Lojista)

Quando o lojista altera um preço, pausa um item ou ajusta o horário no `/admin`, o sistema não aguarda a resposta do servidor para atualizar a interface:

```
┌────────────────────────────────────────────────────────┐
│ 1. CAMADA UI (Reatividade Imediata < 50ms)             │
│    • Switch desliga na tela                            │
│    • Dispara vibração háptica useHaptic(30)            │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 2. CAMADA STORAGE (Broadcast Local)                    │
│    • Salva em localStorage: alaska_overrides_<slug>    │
│    • Dispara window.dispatchEvent('storage')           │
│    • Vitrine pública atualiza sem F5 na outra aba      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ 3. CAMADA REMOTA (Persistência no PostgreSQL)          │
│    • useApiClient dispara requisição assíncrona HTTP   │
│    • Backend valida payload via ZodValidationPipe      │
│    • PostgresService persiste no banco relacional      │
└────────────────────────────────────────────────────────┘
```

### Flexibilidade de Payloads no Backend:
Para manter compatibilidade mútua entre versões, o `ProductController` aceita:
* `isAvailable` ou `available` (boolean).
* `priceCents` (inteiro) ou `price` (decimal convertido com `Math.round(price * 100)`).

---

## 5. Autenticação do Lojista & Segurança de Sessão (ADR 007)

O painel administrativo (`/[slug]/admin`) é protegido pelo ciclo de autenticação via PIN:

1. **Login (`POST /api/tenants/:slug/admin/login`)**:
   - Envia `{ pin: "1234" }` validado por `MerchantLoginSchema`.
   - Se o tenant não tiver `pin_hash`, valida contra o PIN padrão `"1234"`.
   - Se possuir `pin_hash`, compara via `SimplePasswordHasher` (SHA-256 com salt).
   - Retorna token Base64 contendo `{ tenantId, slug, role: 'merchant', iat }`.
2. **Sessão Local**:
   - O token é armazenado em `sessionStorage` sob a chave `alaska_admin_auth_<slug>`.
3. **Proteção de Rotas com `MerchantAuthGuard`**:
   - O guard valida o cabeçalho `Authorization: Bearer <token>` em rotas restritas.

---

## 6. Resolução Multi-Tenant em Tempo de Execução

A plataforma suporta resolução dinâmica de estabelecimentos através de duas frentes:

1. **Middleware do Nitro (`apps/web/server/middleware/tenant.ts`)**:
   - Analisa o header `host` na requisição SSR.
   - Detecta subdomínios (`slug.alaska.app`) e domínios próprios (`www.cliente.com.br`).
   - Injeta `event.context.tenantSlug` antes da renderização da página.
2. **Endpoint de Resolução da API (`GET /api/tenants/resolve/domain?host=...`)**:
   - Consulta o PostgreSQL buscando correspondência exata na coluna `custom_domain` ou `slug`.
