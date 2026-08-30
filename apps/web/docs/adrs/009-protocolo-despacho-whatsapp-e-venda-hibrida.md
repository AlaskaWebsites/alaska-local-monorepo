# ADR 009: Protocolo de Despacho de Pedidos e Agendamentos Estruturados via WhatsApp

- **Status:** Aceito / Implementado
- **Data:** 2026-08-28
- **Contexto:** Módulo `utils/whatsapp.ts`, Drawer `CartDrawerModal.vue`, Modal `BookingModal.vue`, Suíte `tests/units/whatsapp-order.test.ts`

---

## 1. Contexto & Problema

O Alaska Local substitui intermediários e aplicativos com taxas abusivas (12% a 27% sobre cada pedido) conectando o cliente final diretamente ao WhatsApp do comerciante.

No entanto, pedidos enviados como texto livre pelo cliente causam:
- Erros de endereço e falta de número/complemento.
- Dúvidas sobre forma de pagamento e necessidade de troco.
- Dificuldade para o atendente lançar o pedido na cozinha ou sistema de PDV.
- Incompatibilidade entre venda de produtos tradicionais e agendamentos de serviços (*Alaska Hub / Pro*).

## 2. Decisão Arquitetural

Padronizamos o protocolo de formatação determinística de mensagens em `utils/whatsapp.ts`:

### A. Sanitização de Telefones E.164
Todos os números de WhatsApp passam por sanitização regex estrita:
- Remoção de parênteses, espaços e traços: `phone.replace(/\D/g, '')`.
- Inclusão automática do DDI `55` do Brasil caso ausente.
- Validação de comprimento de 10 ou 11 dígitos (DDD + Número).

### B. Template de Venda Tradicional (Delivery & Retirada)
Estrutura com markdown limpo do WhatsApp:
1. **Cabeçalho:** Identificação da Loja e número do pedido/timestamp.
2. **Itens e Adicionais:** Lista numerada com nome do produto, quantidade, adicionais/opções selecionadas e observações específicas.
3. **Endereço Completo:** Dados obtidos e validados via ViaCEP (Rua, Número, Bairro, Cidade, CEP e Referência) ou indicação clara de "Retirada no Balcão".
4. **Forma de Pagamento:** Pix Direto (D+0), Cartão na Entrega (Débito/Crédito) ou Dinheiro (com cálculo do troco para R$ X).
5. **Resumo Financeiro:** Subtotal dos itens, Taxa de Entrega e Valor Total destacado em negrito (`*Total: R$ XX,XX*`).

### C. Template de Venda Híbrida & Agendamento de Serviços (*Alaska Hub & Pro*)
Quando o checkout envolve um serviço (ex: Corte de Cabelo, Consulta Odontológica):
1. **Identificação do Agendamento:** Data formatada (`DD/MM/YYYY`) e Horário exato (`HH:mm`).
2. **Profissional Escolhido:** Nome do barbeiro/médico ou "Qualquer profissional disponível".
3. **Serviço Principal & Duração:** Nome do procedimento e tempo estimado.
4. **Produtos de Upsell (Cross-Selling):** Pomadas, shampoos ou itens adicionais inseridos na sacola.
5. **Instruções de Confirmação:** Texto de boas-vindas incentivando a resposta rápida da recepção.

## 3. Consequências & Benefícios

- **Zero Taxas de Intermediação:** 100% do valor transacionado fica com o comerciante.
- **Anti-Ban do WhatsApp:** Não utiliza bots não oficiais ou automações proibidas; a mensagem é aberta organicamente pelo cliente através do protocolo universal `https://wa.me/{numero}?text={encodedText}`.
- **Agilidade no Balcão:** O atendente recebe uma mensagem legível e pronta para impressão ou aceite no WhatsApp Business.