# ADR 003: Multi-Tenancy e Segurança com PostgreSQL Row Level Security (RLS)

- **Status:** Aceito / Implementado
- **Data:** 2026-08-28
- **Contexto:** Banco de Dados Supabase / PostgreSQL, Isolamento de Dados, Políticas de Segurança

---

## 1. Contexto & Problema

O Alaska Local atende centenas de comércios simultaneamente (Food, Semijoias, Barbearias, Clínicas).

Em arquiteturas multi-tenant tradicionais, depender apenas de cláusulas `WHERE tenant_id = 'xxx'` nas queries do backend cria riscos graves:
- Um desenvolvedor esquecer o filtro `tenant_id` em uma query pode expor dados confidenciais (pedidos, faturamento, clientes) de um lojista para outro.
- Falhas de injeção ou parâmetros incorretos violam o isolamento de dados.

## 2. Decisão Arquitetural

Implementamos **Isolamento em Nível de Linha (Row Level Security - RLS)** no PostgreSQL / Supabase:

### A. Coluna Obrigatória `tenant_id`
Todas as tabelas de domínio (`products`, `categories`, `orders`, `bookings`, `customers`) possuem chave estrangeira para a tabela `tenants`.

### B. Políticas de RLS no Banco de Dados
```sql
-- Ativação de RLS na tabela de pedidos
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Política de leitura restrita ao tenant autenticado
CREATE POLICY tenant_isolation_policy ON orders
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true));
```

### C. Contexto Transacional no Backend
A cada requisição HTTP, o middleware/interceptor extrai o `tenant_id` autenticado (via JWT ou subdomínio) e define a variável de sessão do Postgres `app.current_tenant_id`.

## 3. Consequências & Benefícios

- **Blindagem no Banco de Dados:** Mesmo se uma query SQL for escrita sem `WHERE tenant_id`, o PostgreSQL bloqueia e retorna apenas as linhas do tenant da sessão.
- **Conformidade LGPD:** Garantia técnica de privacidade de dados para cada estabelecimento comercial.
