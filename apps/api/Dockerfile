FROM node:22-alpine AS base

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @alaska/contracts build
RUN pnpm --filter @alaska/api build

EXPOSE 3333

CMD ["pnpm", "--filter", "@alaska/api", "start:prod"]
