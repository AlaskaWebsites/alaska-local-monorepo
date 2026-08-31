# ADR 013: Painel do Lojista, Gestão Operacional em Tempo Real e Autonomia Total

- **Status:** Aceito / Expandido (Fase 2)
- **Data:** 2026-08-31
- **Contexto:** Composable `apps/web/composables/useMerchantAdmin.ts`, Rota `apps/web/pages/[slug]/admin.vue`, Modais `ProductCustomizerModal.vue`, `BookingModal.vue` e Suíte `tests/units/merchant-admin.test.ts`

---

## 1. Contexto & Problema

O ecossistema **Alaska Local** opera no modelo *One Codebase, Infinite Domains* servindo estabelecimentos locais em 4 verticais canônicas: **Alaska Menu**, **Alaska Shop**, **Alaska Hub** e **Alaska Pro**.

Na rotina diária do comércio local, o lojista necessita de agilidade para executar ações imediatas no celular sem intervenção da equipe técnica de TI:
1. **Acabou um ingrediente ou item específico:** Pausar o produto ou opcional/adicional (ex: "Acabou o bacon", "Acabou a borda de catupiry") em menos de 3 segundos.
2. **Lançamento de novos itens:** Cadastrar novos pratos do dia, produtos ou procedimentos diretamente no catálogo.
3. **Mudança de equipe e horários:** Contratar ou remover especialistas/barbeiros, alterar escala semanal, horários individuais de expediente e pausas de almoço.
4. **Alteração de dados de pagamento e contato:** Mudar a chave Pix para outra conta bancária ou atualizar o número de WhatsApp da recepção sem precisar de novo deploy.

---

## 2. Decisão Arquitetural & Pilares de Implementação

Expandimos a arquitetura do Painel do Lojista (`/admin`) e do composable `useMerchantAdmin.ts` em 4 pilares:

### A. Autonomia de Catálogo (Criação, Edição de Preços e Exclusão)
- `createProduct(productData)`: Gera ID determinístico (`prod-custom-{timestamp}`) e anexa o novo item à categoria correspondente.
- `deleteProduct(productId)`: Registra o ID em `deletedProductIds`, ocultando o item da vitrine instantaneamente.
- `updateProductPrice(products, productId, newPrice)`: Atualização de preço com reflexo otimista na vitrine.
- `toggleProductAvailability(products, productId, currentStatus)`: Pausa e reativação rápida de produtos.

### B. Gestão de Equipe & Especialistas (Hub & Pro)
- `createProfessional(profData)`: Cadastro de novo profissional com nome, cargo/especialidade, dias de atendimento e horário de expediente/almoço.
- `deleteProfessional(profId)`: Remoção do profissional com reflexo imediato na grade de slots do `BookingModal.vue`.
- `updateProfessionalHours` & `updateProfessionalLunch`: Ajuste de início/fim de expediente e intervalo de almoço por especialista.
- `updateProfessionalDays`: Escala semanal de 7 dias com seleção interativa de dias úteis e folgas.

### C. Chave Pix & Contatos em Tempo Real
- `updatePixConfig(pixData)`: Suporte aos tipos canônicos de chave (`cpf`, `cnpj`, `phone`, `email`, `random`), nome do favorecido e cidade BACEN.
- `updateContact(contactData)`: Atualização do número de WhatsApp de recebimento e link do perfil do Instagram com sanitização automática de caracteres.

### D. Pausa de Opcionais & Adicionais (Estoque em Tempo Real)
- `toggleOptionAvailability(optionId, isAvailable)`: Gerencia o array `pausedOptionIds`.
- `ProductCustomizerModal.vue`: Inspeciona os opcionais pausados, renderiza o badge visual `(Esgotado)` e desabilita a seleção/adição à sacola pelo cliente.

---

## 3. Reatividade Instantânea & Persistência

Todas as mutações do `/admin` disparam eventos customizados de storage (`window.dispatchEvent(new CustomEvent('alaska_overrides_updated', ...))`), garantindo sincronização imediata entre abas e recarregamento tolerante a F5 via `localStorage` com namespacing por tenant (`alaska_overrides_<slug>`).

---

## 4. Testes & Qualidade (Vitest Test Harness)

A suíte em `apps/web/tests/units/merchant-admin.test.ts` cobre 100% das novas capacidades:
- Autenticação e validação de PIN
- Criação e exclusão de produtos
- Criação e exclusão de especialistas
- Pausa e reativação de opcionais
- Atualização de Pix e contatos
- Bloqueio de slots de agenda
