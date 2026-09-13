# Protocolo de Despacho e Mensageria WhatsApp — Alaska Local Frontend

Este documento estabelece o padrão arquitetural, as regras de negócio e os algoritmos de montagem de mensagens determinísticas para o fechamento de pedidos e agendamentos via **WhatsApp** (`apps/web/utils/whatsapp.ts`).

---

## 1. O "Motor Comercial": Por que Despacho via WhatsApp?

O modelo de negócio do **Alaska Local** elimina as taxas abusivas cobradas por marketplaces e intermediadores tradicionais (que variam entre 12% e 27% por transação):
* O cliente monta a sacola ou escolhe os horários de agendamento na vitrine digital de alta velocidade.
* Ao clicar em finalizar, a aplicação gera uma mensagem estruturada e abre organicamente a conversa no WhatsApp do lojista através do link universal `https://wa.me/55...`.
* **Zero Risco de Banimento**: Não utiliza automações não oficiais ou bots que violam os termos do WhatsApp; o envio da mensagem parte voluntariamente do smartphone do cliente.
* **Agilidade Operacional no Balcão**: O atendente ou a cozinha recebe uma comanda legível, pronta para impressão, aceite e preparo.

---

## 2. Sanitização Rigorosa de Telefones (Padrão E.164)

Para garantir que o link do WhatsApp nunca quebre, o número do lojista passa por sanitização defensiva:
1. Remoção de parênteses, traços, espaços e caracteres não numéricos: `phone.replace(/\D/g, '')`.
2. Inclusão automática do código de país do Brasil (`55`) caso o lojista tenha cadastrado apenas o DDD + número (10 ou 11 dígitos).
3. Montagem do link URL encoded com quebras de linha (`%0A`) e emojis universais.

---

## 3. Template de Pedido de Compras (`buildOrderWhatsAppMessage`)

Utilizado nas verticais **Alaska Menu** (food service, pizzarias, adegas) e **Alaska Shop** (boutiques de moda, semijoias):

```markdown
🛒 *NOVO PEDIDO - Hamburgueria X*
----------------------------------------

📋 *ITENS DO PEDIDO:*
1x Smash Bacon Duplo - R$ 36,00
   • Ponto: Ao ponto
   • Adicional: Queijo Cheddar Extra (+R$ 4,00)
   • Obs: Sem cebola, por favor

1x Batata Rústica com Alecrim - R$ 18,00
1x Coca-Cola Lata 350ml - R$ 6,00

----------------------------------------
📍 *ENTREGA (Delivery):*
Rua das Flores, 123, Apto 42 - Centro
CEP: 01234-567 - São Paulo/SP
Ref: Próximo à padaria central

💳 *PAGAMENTO:*
Forma: Pix Direto (D+0)
Código Copia e Cola Pix:
00020126580014br.gov.bcb.pix...

----------------------------------------
Subtotal: R$ 64,00
Taxa de Entrega: R$ 6,00
*TOTAL DO PEDIDO: R$ 70,00*
```

### Regras de Negócio do Template de Pedido:
* **Detalhamento de Opcionais**: Cada adicional selecionado no `ProductCustomizerModal.vue` é listado abaixo do item com o respectivo valor acrescido.
* **Modalidade de Entrega**:
  * Se for `delivery`: Exibe endereço completo com logradouro, número, complemento, bairro, cidade/UF e referência.
  * Se for `pickup`: Exibe com destaque `📍 RETIRADA NO BALCÃO (Takeout)`.
* **Formas de Pagamento**:
  * *Dinheiro*: Exibe o valor do troco solicitado pelo cliente (ex: `Precisa de troco para R$ 100,00`).
  * *Cartão na Entrega*: Especifica Débito ou Crédito.
  * *Pix Direto*: Anexa a chave Pix e o código Copia e Cola gerado para pagamento imediato, orientando o cliente a enviar o comprovante.

---

## 4. Template de Agendamento Híbrido (`buildBookingWhatsAppMessage`)

Utilizado nas verticais **Alaska Hub** (barbearias, salões de beleza) e **Alaska Pro** (clínicas odontológicas, médicos):

```markdown
📅 *NOVO AGENDAMENTO - Barbearia Style*
----------------------------------------

👤 *CLIENTE:* André Silva (11 97777-8888)
📅 *DATA & HORÁRIO:* 15/09/2026 às 14:30
✂️ *ESPECIALISTA:* Carlos Visagista

📋 *PROCEDIMENTOS AGENDADOS:*
• Corte Degradé / Fade Navalhado (45 min) - R$ 45,00
• Barboterapia com Toalha Quente (30 min) - R$ 40,00
⏱️ *Duração Total Estimada:* 75 minutos

🛍️ *PRODUTOS ADICIONAIS (Upsell):*
• 1x Pomada Modeladora Efeito Matte - R$ 35,00

----------------------------------------
💳 *CONDIÇÃO DE RESERVA:*
Modalidade: Sinal de Reserva via Pix (30%)
Sinal Pago: R$ 25,50
Saldo Restante no Local: R$ 59,50
*VALOR TOTAL DO ATENDIMENTO: R$ 120,00*
```

### Regras de Negócio do Agendamento:
* **Soma de Durações**: A mensagem exibe a duração total somada dos procedimentos (`calculateTotalDurationMinutes`), permitindo ao profissional organizar sua grade.
* **Venda Híbrida (Cross-Selling)**: Se o cliente adicionou produtos físicos à sacola junto com o agendamento, eles são listados na seção de *Produtos Adicionais*, maximizando o ticket médio.
* **Sinal de Garantia**: Discrimina o valor do sinal pago via Pix e o saldo restante a ser liquidado presencialmente no balcão.
