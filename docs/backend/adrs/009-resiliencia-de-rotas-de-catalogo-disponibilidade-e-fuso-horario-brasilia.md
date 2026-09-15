# ADR 009: Resiliência de Rotas de Catálogo, Sincronização de Disponibilidade e Fuso Horário de Brasília

- **Status:** Aceito / Implementado
- **Data:** 2026-09-15
- **Contexto:** `apps/api/src/presentation/controllers/product.controller.ts`, `apps/api/src/infrastructure/persistence/postgres/postgres-product.repository.ts`, `apps/api/src/core/domain/entities/tenant.entity.ts`, `apps/web/composables/useOpeningHours.ts`, `apps/web/composables/useMerchantAdmin.ts`

---

## 1. Contexto & Diagnóstico dos Problemas

Durante a operação do ecossistema Alaska Local em ambiente de produção (Vercel + Render + PostgreSQL), foram identificadas três fragilidades de integração entre o Frontend Nuxt 3 e o Backend NestJS 11:

```
┌────────────────────────────────────────────────────────────────────────┐
│             DESAFIOS DE SINCRONIZAÇÃO API-CLIENTE                      │
│                                                                        │
│  1. Rota de Disponibilidade:                                           │
│     Client passava boolean no lugar do ID ──> PATCH /products/true/..  │
│     API respondia 404: "Product com identificador 'true' não achado"   │
│                                                                        │
│  2. Fuso Horário UTC em SSR e Cloud:                                   │
│     Node.js na Vercel e Render rodam em UTC ──> Loja aberta às 21h     │
│     era calculada como 00h UTC (dia seguinte) ──> Status falso-fechado │
│                                                                        │
│  3. Formato Estruturado de Horários Semanais:                          │
│     Lojas com grade detalhada (Seg-Dom) não possuíam open/close topo  │
│     Storefront exibia " às " por falta de resolução da chave do dia   │
└────────────────────────────────────────────────────────────────────────┘
```

### Detalhamento das Ocorrências:

1. **Erro 404 em `PATCH /api/v1/tenants/:slug/products/:id/availability`**:
   * **Sintoma**: Ao alternar o switch de disponibilidade de um produto no painel admin, a API retornava HTTP 404 Not Found com a mensagem:
     `{"statusCode":404,"error":"ENTITY_NOT_FOUND","message":"Product com identificador 'true' não foi encontrado."}`.
   * **Causa Raiz**: O componente admin invocava a função com parâmetros invertidos ou omitia o array de produtos, fazendo com que o valor booleano `currentStatus` (`true`) fosse injetado no parâmetro de URL `:id`. No backend, a consulta SQL procurava um registro com ID literalmente igual a `'true'`.
   * **Agravante**: Diferenças entre identificadores de seeds locais (`prod-conjunto-alfaiataria`) e IDs gerados por auto-seeding no PostgreSQL podiam gerar desencontros de chaves.

2. **Divergência de Fuso Horário (UTC vs Horário de Brasília)**:
   * **Sintoma**: Lojas que deveriam estar abertas apareciam como "Fechadas" durante a noite, ou fechavam 3 horas antes do horário programado.
   * **Causa Raiz**: Servidores serverless na Vercel e containers no Render executam com `TZ=UTC`. Ao executar `new Date().getHours()`, a hora retornada era UTC (+3 horas em relação a Brasília). O método `isStoreOpenNow` da entidade de domínio `Tenant` e o composable `useOpeningHours` comparavam minutos locais de Brasília com minutos UTC.

3. **Inexistência de Horários Top-Level em Lojas com Grade Semanal Completa**:
   * **Sintoma**: O componente de vitrine tentava acessar `tenant.openingHours.open` e `tenant.openingHours.close`. Em lojas migradas para grade de 7 dias (`openingHours.monday`, `openingHours.tuesday`, etc.), esses campos eram `undefined`, resultando na exibição truncada `" às "`.

---

## 2. Decisões Arquiteturais

### A. Validação Defensiva e Mapeamento Resiliente de Produtos (`PostgresProductRepository`)
No repositório de persistência do PostgreSQL (`postgres-product.repository.ts`), a localização e mutação de disponibilidade de produtos foi estruturada em três níveis de correspondência:

```typescript
// 1. Busca por ID exato
let res = await this.db.query('SELECT * FROM products WHERE id = $1', [id]);

// 2. Busca com/sem prefixo canônico 'prod-'
if (res.rows.length === 0) {
  res = await this.db.query(
    `SELECT * FROM products
     WHERE LOWER(id) = LOWER($1)
        OR LOWER(id) = LOWER('prod-' || $1)
        OR LOWER(REPLACE(id, 'prod-', '')) = LOWER($1)`,
    [id]
  );
}

// 3. Busca por similaridade semântica de tokens no nome do produto
if (res.rows.length === 0) {
  const tokens = id.replace(/^prod-/, '').split('-').filter(t => t.length >= 3);
  if (tokens.length > 0) {
    const conditions = tokens.map((_, i) => `LOWER(name) LIKE '%' || $${i + 1} || '%'`).join(' AND ');
    res = await this.db.query(`SELECT * FROM products WHERE ${conditions} LIMIT 1`, tokens);
  }
}
```

No cliente (`useMerchantAdmin.ts`), adicionamos uma guarda estrita de integridade que impede o despacho de identificadores espúrios:
```typescript
if (!productId || productId === 'true' || productId === 'false') {
  console.warn('[AlaskaAdmin] ID de produto inválido rejeitado:', productId);
  return false;
}
```

### B. Padronização Global no Fuso `America/Sao_Paulo` (Horário de Brasília)
Tanto no backend quanto no frontend, a data de referência para cálculo de expediente é normalizada para o fuso oficial brasileiro:

```typescript
// Backend (tenant.entity.ts) e Frontend (useOpeningHours.ts):
export function getSaoPauloDate(date = new Date()): Date {
  try {
    const str = date.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' });
    return new Date(str);
  } catch {
    return date;
  }
}
```

Com essa normalização:
* `dayIndex = spNow.getDay()` reflete com precisão o dia da semana no Brasil.
* `currentMinutes = spNow.getHours() * 60 + spNow.getMinutes()` calcula o minuto exato do dia comercial.
* O suporte a **turnos noturnos** (ex: 18:00 às 03:00) funciona deterministicamente mesmo após a meia-noite UTC.

### C. Resolução Dinâmica de Horários no Cabeçalho (`StoreHeaderCard.vue`)
Em vez de depender das propriedades fixas `tenant.openingHours.open`, o componente resolve dinamicamente a grade do dia atual através da computada `displayHours`:
1. Mapeia o dia da semana atual (`DAY_KEYS[spNow.getDay()]`).
2. Se o dia estiver marcado como `closed: true`, exibe `"Fechado hoje"`.
3. Se estiver aberto, exibe `${open} às ${close}` daquele dia específico.
4. Caso a loja utilize horário geral, busca o primeiro dia útil ativo como fallback.

### D. Integração de Regras Comerciais de Delivery (Pedido Mínimo e Prazo)
1. **Contrato de Domínio**: `Tenant` armazena `deliveryFeeCents` e `minOrderValueCents` (Money VO em centavos inteiros), exportando `deliveryFee` e `minOrderValue` em reais nos DTOs de saída.
2. **Storefront & Checkout**: `CartDrawerModal.vue` implementa a trava `isBelowMinOrder`, impedindo a finalização do pedido no WhatsApp se o subtotal de itens for inferior ao valor mínimo estipulado pelo lojista, orientando o cliente com a quantia exata que falta adicionar.

---

## 3. Consequências & Benefícios

1. **Eliminação de 404 em Mutações Operacionais**: Produtos são ativados ou pausados em tempo real sem erros de rota causados por argumentos invertidos.
2. **Consistência Temporal Absoluta**: Lojas nunca mais exibem falso status de fechamento devido ao relógio UTC dos servidores em nuvem.
3. **Proteção da Margem Comercial**: Estabelecimentos não recebem pedidos inviáveis abaixo do custo mínimo de entrega.
4. **Layout Simétrico e Responsivo**: A apresentação visual dos dados no cabeçalho e modais mantém harmonia estética em celulares e desktops.
