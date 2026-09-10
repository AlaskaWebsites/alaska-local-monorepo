# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
RUN npm install -g pnpm@10.5.2
WORKDIR /app

# Stage 1: Dependências
FROM base AS dependencies
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages/contracts/package.json ./packages/contracts/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM dependencies AS builder
COPY packages/contracts/ ./packages/contracts/
COPY apps/api/ ./apps/api/

# Compila primeiro os contratos compartilhados do monorepo, depois o backend NestJS
RUN pnpm --filter @alaska/contracts build
RUN pnpm --filter @alaska/api build

# Stage 3: Runner de Produção
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=10000

COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/turbo.json ./
COPY --from=builder /app/packages/contracts ./packages/contracts
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 10000

# Executa o build compilado do NestJS localizando dinamicamente o entrypoint
WORKDIR /app/apps/api
CMD ["sh", "-c", "ENTRY=$(find dist -name 'main.js' 2>/dev/null | head -n 1); if [ -z \"$ENTRY\" ]; then ENTRY=$(find /app -name 'main.js' 2>/dev/null | grep -v node_modules | head -n 1); fi; echo \"==> Starting NestJS API from $ENTRY...\"; node \"$ENTRY\""]
