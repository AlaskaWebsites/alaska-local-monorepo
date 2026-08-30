# Guia de Persistência PostgreSQL & Docker — Alaska Local Backend

Este guia documenta o funcionamento, schema, execução via Docker e boas práticas da camada de banco de dados do **Alaska Local Backend**.

---

## 1. Estrutura do Banco de Dados (`docker/init.sql`)

O banco de dados relacional utiliza o **PostgreSQL 16** com as seguintes tabelas centrais:

| Tabela | Descrição | Chave Primária | RLS Ativo |
| :--- | :--- | :--- | :--- |
| `tenants` | Estabelecimentos cadastrados, temas, horários e configurações Pix | `id VARCHAR(100)` | Não (Tabela Pai) |
| `categories` | Categorias de produtos/serviços de cada tenant | `id VARCHAR(100)` | ✅ Sim (`tenant_id`) |
| `products` | Produtos físicos ou serviços para agendamento | `id VARCHAR(100)` | ✅ Sim (`tenant_id`) |
| `orders` | Pedidos de compra (Delivery e Retirada) | `id VARCHAR(100)` | ✅ Sim (`tenant_id`) |
| `bookings` | Agendamentos de horários (Alaska Hub e Pro) | `id VARCHAR(100)` | ✅ Sim (`tenant_id`) |

---

## 2. Como Rodar Localmente via Docker

### A. Subir os Serviços
```bash
docker compose up -d
```

### B. Serviços Disponíveis
* **PostgreSQL:** `localhost:5432` (`user: alaska_admin`, `pass: alaska_secret_2026`, `db: alaska_local_db`)
* **Pgweb (Web UI):** `http://localhost:8081` (Painel visual para inspeção de tabelas e queries)
* **Redis:** `localhost:6379` (Fila BullMQ)

---

## 3. Conexão em Produção (Supabase)

Para conectar o backend ao Supabase em produção, basta definir a variável `DATABASE_URL` no `.env`:
```env
DATABASE_URL=postgres://postgres:[SUA_SENHA]@db.[PROJECT_REF].supabase.co:5432/postgres
```
Ou fornecer `SUPABASE_URL` e `SUPABASE_KEY`.

---

## 4. Padrão de Repositórios e Mappers

1. **Repositório:** Executa a query SQL parametrizada `$1, $2` via `PostgresService.query()`.
2. **Mapper:** Converte o `QueryResultRow` bruto para a entidade de domínio correspondente (`TenantMapper.toDomain(row)`).
3. **Caso de Uso:** Recebe a entidade pura de domínio e executa a regra de negócio sem conhecimento de SQL.
