# Guia Definitivo de Deploy na Vercel (Nuxt 3 + Turborepo + PNPM Monorepo)

Este guia serve como a referência técnica oficial para configuração de CI/CD, build e deploy da vitrine digital **Alaska Local** (`@alaska/web`) hospedada na **Vercel** a partir da raiz do monorepo Turborepo com PNPM Workspaces.

---

## 1. Visão Geral da Arquitetura de Deploy

O monorepo adota a seguinte topologia:
- `apps/web`: Aplicação Nuxt 3 (SSR Serverless via Nitro Vercel Preset).
- `apps/api`: Backend NestJS 11 (Clean Architecture & PostgreSQL).
- `packages/contracts`: Pacote compartilhado `@alaska/contracts` (Single Source of Truth).
- `packages/tsconfig`: Configurações TypeScript base.

O deploy da vitrine frontend na Vercel é orquestrado a partir da **raiz do repositório**, permitindo que o Turborepo compile as dependências internas (`@alaska/contracts`) antes de iniciar o build do Nuxt 3.

---

## 2. Tabela Resumo de Configurações no Dashboard da Vercel

Ao configurar ou revisar o projeto no dashboard da Vercel (**Project Settings > General / Build & Development Settings**), utilize os seguintes parâmetros:

| Parâmetro | Valor Configurado | Descrição / Justificativa |
| :--- | :--- | :--- |
| **Root Directory** | `./` (Raiz do Monorepo) | Permite acesso a `pnpm-lock.yaml`, `packages/contracts` e `turbo.json`. |
| **Framework Preset** | `Other` (ou `null` via `vercel.json`) | Evita heurísticas automáticas conflitantes da Vercel para repositórios monorepo. |
| **Install Command** | `corepack enable && pnpm install` | Habilita o PNPM v10 nativo e instala todas as dependências dos workspaces. |
| **Build Command** | `npx turbo run build --filter=@alaska/web && cp -r apps/web/.vercel/output .vercel/output` | Executa o pipeline de build com Turborepo e move a saída do Nitro para a raiz. |
| **Output Directory** | *(Desativado / Em branco)* | A Vercel detecta automaticamente a pasta `.vercel/output` na raiz. |

### Variáveis de Ambiente Obrigatórias (Project Settings > Environment Variables)

| Variável | Valor Recomendado | Descrição |
| :--- | :--- | :--- |
| `ENABLE_EXPERIMENTAL_COREPACK` | `1` | Instrução para o ambiente de build da Vercel ativar o Corepack do Node.js. |
| `NODE_ENV` | `production` | Modo de execução de produção. |
| `NUXT_PUBLIC_API_BASE_URL` | `https://api.alaskalocal.com.br` | URL base da API NestJS de produção. |
| `NUXT_PUBLIC_APP_DOMAIN` | `alaskalocal.com.br` | Domínio principal para resolução wildcard. |
| `NUXT_PUBLIC_DEFAULT_TENANT` | `adega-prime` | Tenant padrão para fallback quando sem subdomínio. |

---

## 3. Arquivos de Configuração do Monorepo

### `vercel.json` (Raiz do Repositório)

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "corepack enable && pnpm install",
  "buildCommand": "npx turbo run build --filter=@alaska/web && cp -r apps/web/.vercel/output .vercel/output"
}
```

### `turbo.json` (Raiz do Repositório)

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

---

## 4. Guia de Troubleshooting (Os 5 Erros Clássicos e Suas Soluções)

### Erro 1: `EUNSUPPORTEDPROTOCOL (workspace:*)`
* **Sintoma:** O build falha no início com a mensagem `npm error Unsupported URL Type "workspace:*": workspace:*`.
* **Causa:** O runner da Vercel tentou utilizar o `npm` padrão para resolver dependências internas declaradas com o protocolo `workspace:*` do PNPM.
* **Solução:**
  1. Definir a variável de ambiente `ENABLE_EXPERIMENTAL_COREPACK=1` no dashboard da Vercel.
  2. Configurar o comando de instalação no `vercel.json` para `corepack enable && pnpm install`.

---

### Erro 2: `Failed to resolve entry for @alaska/contracts`
* **Sintoma:** Durante a compilação do Nuxt (`vite:resolve`), o build quebra informando que o módulo `@alaska/contracts` não foi encontrado ou não possui `dist/index.mjs`.
* **Causa:** O `@alaska/contracts` precisa ser transpilado via `tsup` antes do `@alaska/web`, mas a tarefa `build` rodou sem respeitar o grafo topológico.
* **Solução:**
  1. Garantir que no `turbo.json` a tarefa `build` contenha `"dependsOn": ["^build"]`. Isso faz com que o Turborepo compile primeiro todas as dependências upstream (`packages/contracts`) antes de compilar o aplicativo dependente (`apps/web`).

---

### Erro 3: `No Output Directory named "public" found`
* **Sintoma:** O build do Nuxt conclui com sucesso, mas a Vercel encerra com erro dizendo que o diretório de saída não foi localizado.
* **Causa:** O preset do Nitro (`nitro-preset: 'vercel'`) gera a estrutura **Build Output API v3** dentro de `apps/web/.vercel/output`. Como a Vercel monitora a raiz do monorepo, ela espera encontrar `.vercel/output` na raiz (`./`).
* **Solução:**
  1. Incluir o comando de cópia ao final do comando de build:
     ```bash
     npx turbo run build --filter=@alaska/web && cp -r apps/web/.vercel/output .vercel/output
     ```
  2. Deixar o campo **Output Directory** desativado no dashboard da Vercel para que o runtime consuma a Build Output API v3 nativa.

---

### Erro 4: `Missing from turbo.json warnings`
* **Sintoma:** O Turborepo emite avisos de que variáveis de ambiente como `NUXT_PUBLIC_API_BASE_URL` ou `DATABASE_URL` foram acessadas em tempo de build mas não constavam na lista de cache.
* **Causa:** O Turborepo opera em modo estrito de variáveis de ambiente (`envMode: strict`) para garantir que o hash de cache seja invalidado caso variáveis mudem.
* **Solução:**
  1. Adicionar todas as variáveis públicas e de ambiente relevantes no array `globalEnv` do `turbo.json`.

---

### Erro 5: `EPERM: operation not permitted` no Windows
* **Sintoma:** Durante execuções locais de `pnpm dev` ou `pnpm build`, o terminal trava com erro de permissão ao tentar deletar ou sobrescrever arquivos `.node` em `node_modules` (ex: `esbuild.exe`, `swc`).
* **Causa:** Processos em segundo plano do Node.js continuam retendo handles abertos em binários nativos no Windows.
* **Solução:**
  1. Encerrar todos os processos do Node via prompt de comando ou PowerShell:
     ```cmd
     taskkill /F /IM node.exe
     ```
  2. Limpar os caches temporários caso necessário:
     ```bash
     pnpm turbo clean && rm -rf node_modules/.cache
     ```

---

## 5. Checklist de Verificação de Deploy

- [ ] Variável `ENABLE_EXPERIMENTAL_COREPACK=1` configurada na Vercel.
- [ ] `vercel.json` presente na raiz com `corepack enable && pnpm install` e script de cópia de output.
- [ ] `turbo.json` configurado com `dependsOn: ["^build"]` e `outputs: [".nuxt/**", ".output/**", "dist/**", ".vercel/**"]`.
- [ ] `@alaska/contracts` compilando limpo via `pnpm --filter @alaska/contracts build`.
- [ ] Testes unitários 100% verdes antes do push (`pnpm test`).
