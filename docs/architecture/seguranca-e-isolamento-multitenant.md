# Segurança e Isolamento Multi-Tenant — Alaska Local (Browser & Banco)

Este documento descreve os mecanismos de **segurança, isolamento de dados e blindagem multi-tenant** implementados no ecossistema Alaska Local, cobrindo desde o armazenamento local no navegador até as políticas no banco de dados relacional.

---

## 1. O Desafio Multi-Tenant

No modelo *One Codebase, Infinite Domains*, centenas de lojas distintas (hamburguerias, boutiques, barbearias e clínicas) compartilham a mesma infraestrutura de front-end Nuxt 3 e a mesma instância de banco de dados PostgreSQL:
* **Risco no Front-end**: Um cliente que visita a Loja A e depois a Loja B no mesmo smartphone não pode ter itens da Loja A misturados no carrinho da Loja B, nem ter acesso a dados administrativos da Loja A.
* **Risco no Back-end**: Uma consulta SQL mal formatada ou sem cláusula `WHERE` nunca pode vazar faturamento, pedidos ou dados de clientes de um estabelecimento para outro.

---

## 2. Isolamento no Navegador (`apps/web`)

O front-end implementa uma política de **Namespacing Estrito por Slug** em todas as APIs de armazenamento local:

```
┌────────────────────────────────────────────────────────┐
│                   NAVEGADOR DO CLIENTE                 │
├──────────────────────────┬─────────────────────────────┤
│ alaska_cart_adega-prime  │ alaska_cart_barbearia-style │
│ (Bebidas, Vinhos, Packs) │ (Cortes, Pomadas, Shampoos) │
├──────────────────────────┼─────────────────────────────┤
│ alaska_overrides_adega   │ alaska_overrides_barbearia  │
│ (Pausa de gelo e cerveja)│ (Bloqueio de horários)      │
├──────────────────────────┼─────────────────────────────┤
│ alaska_admin_auth_adega  │ alaska_admin_auth_barbearia │
│ (Sessão isolada por loja)│ (Sessão isolada por loja)   │
└──────────────────────────┴─────────────────────────────┘
```

### A. Sacola Isolada (`useCart.ts`):
* A chave do `localStorage` é computada reativamente: `alaska_cart_${tenant.slug}`.
* Trocar de loja na mesma janela zera o contexto visual do carrinho, prevenindo que um pedido de hambúrguer seja despachado para uma barbearia.
* **Guarda SSR (`import.meta.client`)**: A leitura do storage ocorre estritamente no cliente, prevenindo erros de *Hydration Mismatch* e exceptions no servidor Node.js/Edge.

### B. Overrides do Lojista (`useMerchantAdmin.ts`):
* Mutações operacionais do painel admin gravam exclusivamente em `alaska_overrides_${slug}`.
* O evento customizado `alaska_overrides_updated` emite o slug no payload, impedindo que vitrines de lojas vizinhas atualizem indevidamente.

### C. Sessão Administrativa Isolada:
* A autenticação por PIN salva o token de acesso em `sessionStorage` sob a chave `alaska_admin_auth_${slug}`.
* Fechar a aba do navegador encerra automaticamente a sessão do lojista no balcão.

---

## 3. Isolamento no Banco de Dados (`apps/api` / PostgreSQL 16)

A camada de persistência utiliza **Row Level Security (RLS)** nativo do PostgreSQL:

### A. Chaves Estrangeiras Obrigatórias com Cascata
Todas as tabelas de domínio secundárias (`categories`, `products`, `orders`, `bookings`) possuem a coluna obrigatória `tenant_id`:
```sql
ALTER TABLE products 
  ADD CONSTRAINT fk_products_tenant 
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
```

### B. Políticas de RLS Ativas
```sql
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_orders ON orders
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant_id', true));
```

### C. Contexto Transacional no `PostgresService`
Em consultas transacionais ou multi-tenant sensíveis, o serviço de banco injeta a variável de sessão antes da query:
```ts
await client.query("SELECT set_config('app.current_tenant_id', $1, true)", [tenantId]);
```
Mesmo que uma query SQL seja escrita acidentalmente sem cláusula `WHERE tenant_id = ...`, o próprio motor do PostgreSQL filtra os registros e impede o vazamento de dados.

---

## 4. Autenticação Segura do Lojista via PIN Hash (ADR 007)

* **Hashing sem Dependências Externas (`SimplePasswordHasher`)**:
  * Utiliza o módulo nativo `crypto` do Node.js com algoritmo SHA-256 e salt de domínio (`alaska_local_salt_v1`).
  * O PIN nunca é armazenado em texto plano no banco de dados (`pin_hash VARCHAR(255)`).
* **Guarda de Rotas (`MerchantAuthGuard`)**:
  * Inspeciona o cabeçalho `Authorization: Bearer <token>`.
  * Valida a integridade do token Base64 e compara o `tenantId` da sessão com o recurso acessado, bloqueando requisições cruzadas com HTTP 401 Unauthorized.
