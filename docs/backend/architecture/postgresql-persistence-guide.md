# Guia de Persistência PostgreSQL & Docker — Alaska Local Backend

Este guia documenta o funcionamento, schema, execução local via Docker, auto-migração e conexão em nuvem da camada de banco de dados do **Alaska Local Backend**.

---

## 1. Estrutura do Banco de Dados

O banco de dados relacional utiliza o **PostgreSQL 16** com as seguintes tabelas centrais:

| Tabela | Descrição | Chave Primária | RLS Ativo |
| :--- | :--- | :--- | :--- |
| `tenants` | Estabelecimentos cadastrados, temas, horários, configurações Pix e `pin_hash` | `id VARCHAR(100)` | Não (Tabela Pai) |
| `categories` | Categorias de produtos/serviços de cada tenant | `id VARCHAR(100)` | ✅ Sim (`tenant_id`) |
| `products` | Produtos físicos ou serviços para agendamento (com `option_groups`) | `id VARCHAR(100)` | ✅ Sim (`tenant_id`) |
| `orders` | Pedidos de compra (Delivery e Retirada) | `id VARCHAR(100)` | ✅ Sim (`tenant_id`) |
| `bookings` | Agendamentos de horários (Alaska Hub e Pro) | `id VARCHAR(100)` | ✅ Sim (`tenant_id`) |

---

## 2. Auto-Migration e Auto-Seed no Bootstrap (`PostgresService.ts`)

A inicialização do banco de dados não depende de comandos manuais no deploy:
1. **Auto-Migration (`initSchema()`)**:
   - Disparada no hook `onModuleInit()` do NestJS.
   - Executa `CREATE TABLE IF NOT EXISTS` para todas as tabelas essenciais.
   - Aplica `ALTER TABLE tenants ADD COLUMN IF NOT EXISTS` para colunas novas (`pin_hash`, `professionals`, `reviews`).
2. **Auto-Seed dos 10 Estabelecimentos (`seedAllStores()`)**:
   - Verifica se a contagem de categorias é igual a 0 (`SELECT COUNT(*) FROM categories`).
   - Se estiver vazio (novo banco de dados), executa automaticamente o seed dos 10 estabelecimentos canônicos a partir de `seed-catalog.ts`, cadastrando lojas, categorias, produtos e fotos com valores em centavos inteiros.

---

## 3. Como Rodar Localmente via Docker

### Subir o Banco Local
```bash
# Na raiz do monorepo
pnpm db:up
```

### Credenciais Locais Padrão
* **Host / Porta:** `localhost:5432`
* **Usuário:** `alaska_admin`
* **Senha:** `alaska_secret_2026`
* **Database:** `alaska_local_db`
* **URL de Conexão:** `postgres://alaska_admin:alaska_secret_2026@localhost:5432/alaska_local_db`

---

## 4. Conexão em Produção (Render PostgreSQL)

Em produção no Render, a conexão é configurada automaticamente pelo blueprint `render.yaml` através da variável `DATABASE_URL`.

O `PostgresService` detecta automaticamente provedores em nuvem e ativa a camada de segurança SSL:
```ts
const connectionString = validateEnv().DATABASE_URL || ''
const isCloudOrSSL =
  connectionString.includes('render.com') ||
  connectionString.includes('dpg-') ||
  connectionString.includes('oregon-postgres') ||
  connectionString.includes('sslmode=require') ||
  connectionString.includes('ssl=true')

this.pool = new Pool({
  connectionString,
  ssl: isCloudOrSSL ? { rejectUnauthorized: false } : undefined,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})
```
