# ADR 016: Pipeline de CI/CD na Vercel com Turborepo e PNPM v10

## Status
Aceito (Accepted)

## Data
2026-09-01

## Contexto e Problema
Com a unificação do ecossistema Alaska Local em Monorepo (ADR 014), o repositório passou a abrigar:
1. `apps/web`: Aplicação Frontend em Nuxt 3 (SSR/Serverless).
2. `apps/api`: Backend em NestJS 11 (Clean Architecture e PostgreSQL).
3. `packages/contracts`: Pacote compartilhado `@alaska/contracts` como *Single Source of Truth*.

Ao realizar o deploy da vitrine Nuxt 3 na Vercel a partir de um monorepo PNPM gerenciado por Turborepo, surgiram desafios clássicos de infraestrutura:
- **Resolução de Workspaces:** O runner da Vercel utiliza o `npm` por padrão, falhando com `EUNSUPPORTEDPROTOCOL` ao encontrar dependências internas `workspace:*`.
- **Ordem de Compilação Topológica:** O Nuxt 3 requer que `@alaska/contracts` esteja previamente compilado (`dist/index.mjs`) no momento do build.
- **Estrutura de Saída (Build Output API v3):** O motor Nitro do Nuxt 3 gera os artefatos de deploy dentro de `apps/web/.vercel/output`, enquanto o deployment da Vercel na raiz do monorepo busca `.vercel/output` na raiz.
- **Rastreamento de Variáveis no Turborepo:** Avisos de variáveis de ambiente não mapeadas no modo estrito de cache do Turborepo.

## Decisão de Arquitetura

1. **Ativação Nativa do Corepack e PNPM v10:**
   - Configuração de `installCommand` como `corepack enable && pnpm install`.
   - Adição da variável de ambiente `ENABLE_EXPERIMENTAL_COREPACK=1` no dashboard da Vercel.

2. **Framework Preset Neutro e Build Orquestrado:**
   - Framework preset configurado como `Other` (desativando heurísticas automáticas que tentam tratar a raiz como um projeto Nuxt isolado).
   - Execução do build via Turborepo com filtro estrito: `npx turbo run build --filter=@alaska/web`.

3. **Cópia da Saída do Nitro para a Raiz:**
   - Adição da etapa de cópia de artefatos no comando de build: `cp -r apps/web/.vercel/output .vercel/output`.
   - Manutenção do campo **Output Directory** desativado/em branco no dashboard da Vercel para consumo direto da Build Output API v3.

4. **Declaração Explícita de `globalEnv` e Topologia de Tarefas no `turbo.json`:**
   - Mapeamento das variáveis públicas do Nuxt e variáveis de runtime no array `globalEnv`.
   - Configuração de `"dependsOn": ["^build"]` e inclusão de `".vercel/**"` no array `outputs` da tarefa `build`.

## Consequências e Regras Estritas

- **Builds Determinísticos e Previsíveis:** O processo de CI/CD na Vercel torna-se 100% autônomo e resiliente a novas dependências no monorepo.
- **Compatibilidade Integral com SSR Serverless:** A Build Output API v3 preserva as funções serverless geradas pelo Nitro para rotas dinâmicas e resolução de múltiplos domínios.
- **Remote Caching Ativado:** Builds incrementais com reaproveitamento de cache para pacotes inalterados.
- **Documentação Obrigatória:** Toda alteração nos comandos de build ou variáveis deve ser refletida no `docs/operations/deploy-vercel-turborepo-monorepo.md`.

## Arquivos de Configuração de Referência

### `vercel.json`
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "corepack enable && pnpm install",
  "buildCommand": "npx turbo run build --filter=@alaska/web && cp -r apps/web/.vercel/output .vercel/output"
}
```

### `turbo.json`
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalEnv": [
    "NODE_ENV",
    "PORT",
    "CORS_ORIGINS",
    "DATABASE_URL",
    "SUPABASE_URL",
    "SUPABASE_KEY",
    "ASAAS_API_KEY",
    "REDIS_URL",
    "ENABLE_EXPERIMENTAL_COREPACK",
    "NUXT_PUBLIC_API_BASE_URL",
    "NUXT_PUBLIC_APP_DOMAIN",
    "NUXT_PUBLIC_DEFAULT_TENANT"
  ],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".nuxt/**", ".output/**", "dist/**", ".vercel/**"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```
