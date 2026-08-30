# 📜 ADR 006: Módulo de Agendamentos, Serviços e Venda Híbrida (Alaska Hub & Pro)

> **Status:** Aprovado  
> **Data:** 2026-08-27  
> **Autor:** Equipe Alaska Local  
> **Contexto:** Verticais de Prestadores de Serviços, Barbearias, Clínicas e Venda Híbrida  

---

## 🎯 Contexto e Problema

O ecossistema **Alaska Local** nasceu atendendo primariamente *Food Service* (`menu`), mas expandiu para *Boutiques/Vitrines* (`shop`), *Barbearias/Salões* (`hub`) e *Profissionais Liberais/Clínicas* (`pro`).

Identificamos duas necessidades arquiteturais críticas:
1. **Diferenciação Semântica e Visual:** Estabelecimentos como barbearias e clínicas odontológicas não devem exibir a tag "Cardápio & Delivery", mas sim "Serviços & Agendamento" ou "Consultas & Avaliações".
2. **Modelo Híbrido (Serviço + Produto Upsell):** Um barbeiro vende o serviço de corte/barba, mas também vende pomadas, óleos e tônicos. Uma clínica estética vende procedimentos e kits home care. A plataforma precisa suportar agendamento de serviços combinado com carrinho de produtos físicos sem fragmentar o codebase.

---

## 💡 Decisões Tomadas

### 1. Unificação da Sacola Híbrida (`CartItem` com Suporte a Serviços)
- Mantemos uma única experiência de sacola no frontend (`CartDrawerModal.vue`), permitindo itens de serviço (`type: 'service'`) e produtos físicos (`type: 'product'`).
- Quando a sacola contiver serviços, o fluxo de finalização ativa a seleção de **Profissional** e **Data/Horário**.

### 2. Estratégia Tecnológica em 2 Fases
- **Fase 1 (Client-Side & WhatsApp Direct):**
  - Composable `useBookingSlots` calcula os blocos de horários livres a partir dos `openingHours` do tenant.
  - O cliente escolhe profissional e horário; o pedido é despachado estruturado no WhatsApp para confirmação imediata.
  - Custo de infraestrutura: **R$ 0,00**.
- **Fase 2 (Google Calendar API + Supabase PostgreSQL):**
  - Integração com a Google Calendar API (Service Account) como fonte da verdade da agenda do profissional (eliminando a necessidade de o profissional aprender um painel novo).
  - Consulta `freeBusy` para bloqueio de horários em tempo real.
  - Tabela `appointments` no Supabase com fila assíncrona BullMQ para disparo de lembretes automáticos anti-*no-show* via WhatsApp.

### 3. Categorização Canônica e Badges Reativos na Home (`pages/index.vue`)
- O showcase da home passa a resolver a categoria do estabelecimento dinamicamente via `resolveCategory(tenant)`, aplicando badges e botões de ação condizentes:
  - `menu`: *"🍔 Cardápio & Delivery"* -> *"Acessar cardápio completo"*
  - `shop`: *"🛍️ Loja & Vitrine"* -> *"Ver vitrine de peças"*
  - `hub`: *"💈 Serviços & Agenda"* -> *"Ver serviços e agendar"*
  - `pro`: *"⚖️ Institucional & Pro"* -> *"Acessar perfil institucional"*

---

## 🚀 Consequências

- **Positivas:** 
  - Zero duplicação de código (*One Codebase, Infinite Domains*).
  - Experiência natural para prestadores de serviços, aumentando a conversão na prospecção.
  - Aumento do ticket médio do lojista através de vendas adicionais de produtos no momento do agendamento.
- **Mitigação de Riscos:**
  - Adoção do Google Calendar na Fase 2 garante que o profissional não precise mudar seus hábitos, já que a agenda dele toca direto no smartphone.
