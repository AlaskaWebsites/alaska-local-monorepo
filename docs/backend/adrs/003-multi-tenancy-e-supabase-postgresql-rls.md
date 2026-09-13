# ADR 003: Multi-Tenancy e Segurança com PostgreSQL Row Level Security (RLS)

- **Status:** Aceito / Implementado
- **Data:** 2026-08-28 (Atualizado em 2026-09-13)
- **Contexto:** Persistência Nativa PostgreSQL 16, Isolamento de Dados Multi-Tenant, Políticas de Segurança e Driver `pg`

---

## 1. Contexto & Problema

O Alaska Local atende centenas de comércios locais simultaneamente (Alaska Menu, Shop, Hub, Pro) em um banco de dados compartilhado.

Em arquiteturas multi-tenant, depender exclusivamente de cláusulas manuais `WHERE tenant_id = 'xxx'` nas consultas de aplicação gera riscos críticos de vazamento de dados caso um desenvolvedor omita o filtro.

## 2. Decisão Arquitetural

Implementamos **Isolamento em Nível de Linha (Row Level Security - RLS)** diretamente no **PostgreSQL 16** (utilizando conexão nativa com pooling via `pg.Pool` tanto localmente via Docker quanto em produção no Render):

### A. Coluna Obrigatória `tenant_id`
Todas as tabelas de domínio dependentes (`products`, `categories`, `orders`, `bookings`) possuem chave estrangeira `tenant_id` referenciando `tenants(id)` com `ON DELETE CASCADE`.

### B. Políticas de RLS no Banco de Dados
```sql
-- Ativação de RLS na tabela de pedidos
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Política de leitura restrita ao tenant da sessão
CREATE POLICY tenant_isolation_policy ON orders
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true));
```

### C. Contexto Transacional no Backend (`PostgresService`)
No `PostgresService`, métodos transacionais podem definir a variável de sessão `app.current_tenant_id`:
```ts
await client.query("SELECT set_config('app.current_tenant_id', $1, true)", [tenantId]);
```

### D. Persistência PostgreSQL Pura (Sem SDK Supabase)
A aplicação se conecta diretamente ao banco PostgreSQL usando `DATABASE_URL` padrão, eliminando acoplamento a bibliotecas proprietárias (`@supabase/supabase-js`).

## 3. Consequências & Benefícios

- **Blindagem no Banco de Dados:** O próprio PostgreSQL garante o isolamento entre lojistas.
- **Portabilidade Total:** O banco pode rodar em Docker local, VPS, Render PostgreSQL ou qualquer provedor gerenciado compatível sem alterações de código.
