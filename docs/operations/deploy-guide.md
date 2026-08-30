# 🚀 Guia de Deploy em Produção — Alaska Local Monorepo

Este documento descreve o fluxo de deploy automatizado para o Frontend (**Vercel**) e Backend (**Docker / VPS / Railway / Coolify**).

---

## 1. 🌐 Deploy do Frontend Nuxt 3 (Vercel)

O frontend (`apps/web`) está hospedado na Vercel aproveitando suporte nativo a Turborepo e pnpm.

### A. Configuração do Projeto na Vercel
* **Root Directory**: `apps/web`
* **Framework Preset**: `Nuxt.js`
* **Build Command**: `pnpm build` *(a Vercel compila automaticamente o `@alaska/contracts` antes do Nuxt 3)*
* **Output Directory**: `.output`

### B. Domínios e Multi-Tenancy Wildcard
1. **Domínio Principal**: `alaska.app` ou `alaska-local.vercel.app`.
2. **Subdomínios Wildcard**: Adicione `*.alaska.app` nas configurações de domínios da Vercel.
3. **Domínios Customizados de Clientes**: Configure um registro `CNAME` apontando `www.cliente.com.br` para `cname.vercel-dns.com`. O middleware `apps/web/server/middleware/tenant.ts` resolve o lojista automaticamente pelo cabeçalho `host`.

---

## 2. ⚙️ Deploy do Backend NestJS 11 (Docker / VPS / Coolify)

O backend (`apps/api`) é empacotado através de um `Dockerfile` multi-stage otimizado com `turbo prune`.

### A. Build da Imagem Docker com `turbo prune`
O comando `turbo prune` extrai apenas `@alaska/api` e `@alaska/contracts`, ignorando o frontend para gerar imagens leves e com cache de camadas:

```bash
docker build -t alaska-api -f apps/api/Dockerfile .
```

### B. Variáveis de Ambiente de Produção
No servidor de produção (Coolify, Railway, Render ou Docker Compose), defina:

```env
NODE_ENV=production
PORT=3333
DATABASE_URL=postgres://usuario:senha@host-postgres:5432/alaska_local_db
CORS_ORIGINS=https://alaska.app,https://*.alaska.app,https://*.com.br
```

---

## 3. 🛡️ Pipeline de CI/CD (GitHub Actions)

A cada commit na branch `main` ou Pull Request, o pipeline `.github/workflows/ci.yml` executa automaticamente:
1. `pnpm install --frozen-lockfile`
2. `pnpm turbo test` (validação dos 199 testes unitários e de integração)
3. `pnpm turbo build` (compilação de todos os workspaces)

Se o pipeline passar 100% verde, a Vercel atualiza o frontend em produção automaticamente.
