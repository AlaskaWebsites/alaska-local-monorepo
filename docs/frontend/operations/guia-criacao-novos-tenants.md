# Guia Operacional: Criação e Manutenção de Lojas (Tenants) no Alaska Local

Este guia estabelece o padrão arquitetural e o checklist obrigatório para o cadastro de novos estabelecimentos no ecossistema **Alaska Local** (`apps/web/data/*.json`), garantindo que a vitrine pública, o agendamento online, o checkout Pix e o Painel do Lojista funcionem perfeitamente sem retrabalho manual.

---

## 1. As 4 Verticais e Temas Canônicos

Ao criar um novo estabelecimento, defina com precisão a sua vertical (`businessCategory`) e o seu tema cromático (`theme`):

| Vertical | `businessCategory` | Temas Recomendados | Tipo de Operação Principal |
| :--- | :--- | :--- | :--- |
| **Alaska Menu** | `menu` | `food`, `amber`, `drinks` | Delivery de comida, pizzarias, hamburguerias, adegas e distribuidoras |
| **Alaska Shop** | `shop` | `rose`, `violet`, `slate` | Boutiques de moda, semijoias, cosméticos e calçados |
| **Alaska Hub** | `hub` | `barber`, `rose`, `amber` | Barbearias, salões de beleza, nail design e estética |
| **Alaska Pro** | `pro` | `health`, `blue`, `slate` | Consultórios odontológicos, clínicas médicas e profissionais liberais |

---

## 2. Estrutura Obrigatória do JSON (`apps/web/data/<slug>.json`)

### Campos Base de Identificação
```json
{
  "slug": "nome-da-loja",
  "name": "Nome Fantasia da Loja",
  "description": "Descrição comercial de alto impacto para SEO e compartilhamento.",
  "logo": "URL da logo em alta resolução (aspect ratio 1:1)",
  "banner": "URL do banner de capa (aspect ratio 3:1)",
  "phoneWhatsApp": "11988887777",
  "address": "Rua Exemplo, 123 - Bairro",
  "currency": "R$",
  "deliveryFee": 0.0,
  "minOrderValue": 0.0,
  "theme": "amber",
  "businessCategory": "menu",
  "openingHours": {
    "open": "09:00",
    "close": "22:00"
  },
  "pixConfig": {
    "key": "7e3ed5e6-6097-4b15-88a3-221caba64141",
    "keyType": "random",
    "beneficiary": "Razão Social da Loja LTDA",
    "city": "SAO PAULO",
    "allowTestCent": true,
    "depositPercentage": 30
  }
}
```

---

## 3. Lojas com Agendamento (Alaska Hub & Alaska Pro)

Para estabelecimentos que oferecem serviços e consultas (barbearias, clínicas, nail design):

### A. Cadastro de Especialistas / Profissionais
Cada especialista DEVE ter horários completos e a flag de disponibilidade ativa por padrão:

```json
"professionals": [
  {
    "id": "prof-1",
    "name": "Nome do Profissional",
    "role": "Especialidade ou Cargo",
    "isAvailable": true,
    "availableDays": [1, 2, 3, 4, 5, 6],
    "workHours": { "start": "09:00", "end": "19:00" },
    "lunchBreak": { "start": "12:00", "end": "13:00", "enabled": true }
  }
]
```
> **Regra de Ouro dos IDs:** Utilize sempre IDs padronizados sequenciais (`prof-1`, `prof-2`, `prof-3`). O Painel do Lojista gerencia os overrides diretamente por esses IDs.

### B. Separação Estrita de Serviços vs Produtos de Venda
- **Procedimentos e Serviços de Agendamento:** DEVEM ter `durationMinutes > 0` (ex: 30, 45, 60, 90). Eles serão listados no `BookingModal.vue`.
- **Produtos Físicos para Venda de Balcão / Upsell:** DEVEM ter `durationMinutes: 0` e categoria com nome contendo "Produto" ou "Venda". Eles serão exibidos apenas no cardápio/vitrine para compra direta na sacola, sendo filtrados fora da grade de agendamento.

---

## 4. Checklist de Integridade Automatizado

Antes de fazer o commit de uma nova loja, execute o script de verificação:

```bash
pnpm validate:tenants
```

O script valida automaticamente:
- [x] O slug do arquivo bate exatamente com o campo `slug` interno.
- [x] O `theme` pertence aos 11 temas canônicos suportados pelo `useTenantTheme.ts`.
- [x] O `businessCategory` é um dos 4 aceitos: `menu`, `shop`, `hub`, `pro`.
- [x] Todos os profissionais possuem `id`, `name`, `role` e `isAvailable === true`.
- [x] Lojas de agendamento possuem serviços com `durationMinutes > 0`.
- [x] A chave Pix possui formato e campos obrigatórios (`key`, `keyType`, `beneficiary`, `city`).
