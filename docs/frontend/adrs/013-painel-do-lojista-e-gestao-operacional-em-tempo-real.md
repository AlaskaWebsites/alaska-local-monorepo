# ADR 013: Painel do Lojista, Gestão Operacional em Tempo Real e Autonomia Total

- **Status:** Aceito / Implementado (Consolidado com 7 Abas e 4 Modais)
- **Data:** 2026-08-31 (Atualizado em 2026-09-13)
- **Contexto:** `apps/web/pages/[slug]/admin.vue`, `apps/web/components/admin/`, `useMerchantAdmin.ts`, `tests/units/merchant-admin.test.ts`

---

## 1. Contexto & Problema

O ecossistema **Alaska Local** opera no modelo *One Codebase, Infinite Domains* servindo estabelecimentos locais em 4 verticais canônicas: **Alaska Menu**, **Alaska Shop**, **Alaska Hub** e **Alaska Pro**.

Na rotina diária do comércio local, o comerciante necessita de autonomia e agilidade para executar ações imediatas pelo celular, sem intervenção técnica da equipe de desenvolvimento ou necessidade de redeploy:
1. **Acabou um ingrediente ou item específico:** Pausar o produto ou opcional/adicional (ex: "Acabou o bacon", "Acabou a borda de catupiry") em menos de 3 segundos.
2. **Lançamento de novos itens:** Cadastrar novos pratos do dia, produtos ou procedimentos diretamente no catálogo.
3. **Mudança de equipe e horários:** Contratar ou remover especialistas/barbeiros, alterar escala semanal, horários individuais de expediente e pausas de almoço.
4. **Alteração de dados de pagamento e contato:** Mudar a chave Pix para outra conta bancária ou atualizar o número de WhatsApp da recepção.
5. **Pausa geral de emergência:** Suspender temporariamente os pedidos com aviso no topo em dias de chuva forte ou cozinha lotada.

---

## 2. Decisão Arquitetural: 7 Abas Operacionais

O painel administrativo (`/[slug]/admin`) é estruturado em **7 abas operacionais desacopladas**, refletindo dinamicamente as cores e identidade da loja (ADR 017):

```
┌────────────────────────────────────────────────────────────────────────┐
│                      PAINEL DO LOJISTA (ADR 013)                       │
├──────────────┬──────────────┬──────────────┬─────────────┬─────────────┤
│ ⚡ PRODUTOS  │ 📅 AGENDA    │ 💳 PIX/CONT. │ 🕒 HORÁRIOS │ 🛵 DELIVERY │
│ • Pausa < 3s │ • Especialist│ • Chave Pix  │ • Expediente│ • Taxa      │
│ • Preços     │ • Bloqueios  │ • WhatsApp   │ • Pausa     │ • Pedido mín│
│ • Opcionais  │ • Alerta Fim │ • Instagram  │   Geral     │ • Espera    │
├──────────────┴──────────────┴──────────────┴─────────────┴─────────────┤
│ 📢 COMUNICADO (Aba 6)          │ 🔒 SEGURANÇA / PIN (Aba 7)            │
│ • Banner oficial no topo       │ • Alteração de PIN de 4 a 8 dígitos   │
└────────────────────────────────┴───────────────────────────────────────┘
```

### Detalhamento das 7 Abas:
1. **`AdminCatalogTab.vue` (⚡ Cardápio / Serviços)**:
   - Switches W3C/WCAG para pausar/despausar produtos em < 3s.
   - Botão para abrir o modal de opcionais/adicionais (`AdminOptionsModal.vue`).
   - Botão de edição rápida de preço (`AdminPriceModal.vue`).
   - Botão `+ Novo Item` para cadastrar novos produtos (`AdminCreateProductModal.vue`).
2. **`AdminAgendaTab.vue` (📅 Agenda & Especialistas)** *(Hub & Pro)*:
   - Gestão de especialistas com escala de 7 dias, horários de expediente e pausas de almoço.
   - **Alerta Inteligente de Expediente**: Exibe aviso destacado quando o horário de atendimento do especialista ultrapassa o horário de fechamento geral do estabelecimento (`storeCloseHour`).
   - Grade interativa de horários para bloquear ou liberar slots de agendamento com 1 toque.
   - Botão `+ Novo Especialista` (`AdminCreateProfModal.vue`).
3. **`AdminPixContactTab.vue` (💳 Pix & Canais de Atendimento)**:
   - Configuração de recebimento Pix D+0: chave Pix, tipo (`cpf`, `cnpj`, `phone`, `email`, `random`), beneficiário e cidade.
   - Atualização do WhatsApp de vendas e link do perfil do Instagram.
4. **`AdminHoursTab.vue` (🕒 Horários & Pausa Geral)**:
   - Botão de emergência *"🛑 Pausar Atendimento da Loja Agora"* com mensagem customizável.
   - Configuração da grade de abertura e fechamento semanal (Segunda a Domingo).
5. **`AdminDeliveryTab.vue` (🛵 Delivery & Taxas)** *(Menu & Shop)*:
   - Taxa de entrega dinâmica, pedido mínimo e tempo estimado de entrega.
6. **`AdminAnnouncementTab.vue` (📢 Comunicado Oficial)**:
   - Ativação de banner de comunicado destacado no topo da vitrine pública.
7. **`AdminSecurityTab.vue` (🔒 Segurança & PIN)**:
   - Troca de PIN de segurança do lojista (4 a 8 dígitos), sincronizado com o backend.

---

## 3. Os 4 Modais Atômicos (`components/admin/modals/`)

1. **`AdminPriceModal.vue`**: Edição rápida de preço com atualização otimista na vitrine.
2. **`AdminCreateProductModal.vue`**: Criação de novos produtos com nome, descrição, categoria, preço e foto.
3. **`AdminCreateProfModal.vue`**: Cadastro de novos especialistas com escala semanal e intervalo de almoço.
4. **`AdminOptionsModal.vue`**: Pausa/ativação pontual de opcionais (ex: bacon esgotado, queijo indisponível) sem necessidade de alterar o cadastro do produto principal.

---

## 4. Reatividade Instantânea & Persistência Híbrida

* **Mutações Otimistas (< 50ms)**: Qualquer alteração no painel grava imediatamente no `localStorage` sob a chave isolada `alaska_overrides_<slug>` e dispara o evento `storage` e o custom event `alaska_overrides_updated`.
* **Sincronização com a API**: As mutações são sincronizadas assincronamente com o backend NestJS (`/api/tenants/...`).
* **Consumo na Vitrine**: A vitrine pública consome o objeto `effectiveTenant` computado, reagindo instantaneamente às mudanças sem que o cliente precise recarregar a página.
