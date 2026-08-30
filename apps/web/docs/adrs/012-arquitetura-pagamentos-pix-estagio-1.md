# ADR 012: Arquitetura de Pagamentos Pix no Estágio 1 (BR Code EMV, Teste de 1 Centavo e Sinal de Agendamento)

- **Status:** Aceito / Implementado
- **Data:** 2026-08-28
- **Contexto:** Módulos `utils/pix.ts`, `utils/whatsapp.ts`, `components/CartDrawerModal.vue`, `components/BookingModal.vue`, `types/tenant.ts`, `types/booking.ts`, `tests/units/pix.test.ts`

---

## 1. Contexto & Desafio de Segurança

No **Estágio 1** do Alaska Local, a aplicação opera no modelo *Zero Custo de Servidor* (Vercel Serverless + Nuxt 3), sem banco de dados ou backend de transações em tempo real.

O pagamento via **Pix** apresenta três desafios fundamentais:
1. **Risco de Golpes de Comprovante Falso:** Aplicações front-end que fingem confirmar o pagamento criam uma falsa sensação de segurança para o comerciante.
2. **Fricção de Pagamento:** Pedir para o cliente transferir para uma chave avulsa e digitar o valor manualmente no app do banco gera erros de digitação e desistência.
3. **Validação & Testes Reais em Produção:** Lojistas e desenvolvedores precisam testar o fluxo de ponta a ponta com transferências reais de baixo valor (ex: **R$ 0,01**) antes de abrir a loja ao público.

---

## 2. Decisão Arquitetural & Princípios de Segurança

Adotamos uma arquitetura de pagamento Pix híbrida e segura, baseada em 4 pilares:

### A. Geração Determinística de BR Code EMV (Banco Central do Brasil)
Em `utils/pix.ts`, implementamos a geração do payload oficial do Banco Central (Padrão EMV QRCPS-MPM):
- **Tag 00:** `01` (Versão do payload)
- **Tag 26:** Domínio `br.gov.bcb.pix` + Chave Pix do lojista
- **Tag 52/53:** Categoria `0000` e Moeda `986` (BRL)
- **Tag 54:** Valor exato da transação formatado com 2 casas decimais
- **Tag 58/59/60:** País `BR`, Nome do Beneficiário (sanitizado sem acentos) e Cidade
- **Tag 62:** Campo TXID de rastreamento do pedido
- **Tag 63:** Checksum polinomial **CRC-16 CCITT (0x1021, Init 0xFFFF)**

Qualquer aplicativo bancário brasileiro (Nubank, Itaú, Inter, Bradesco, etc.) faz a leitura instantânea com o valor e favorecido já preenchidos.

### B. Modo de Teste de 1 Centavo (`allowTestCent` / `R$ 0,01`)
O componente de checkout disponibiliza uma opção interativa de teste:
- Quando ativado, o gerador de BR Code recalcula o payload com o valor de **R$ 0,01**.
- Permite que o lojista e o desenvolvedor executem um Pix real de 1 centavo pelo app do banco para validar o recebimento no extrato bancário.

### C. Sinal de Reserva para Agendamentos (*Alaska Hub / Pro*)
Para serviços de barbearias, salões e clínicas, o `BookingModal.vue` oferece duas modalidades:
- **Pagar no Local:** Pagamento presencial no momento do atendimento.
- **Garantir Horário com Sinal via Pix:** Exibição da chave e Copia e Cola para pagamento de sinal (ex: 30% ou valor fixo), desincentivando faltas (*no-show*).

### D. Política de Liberação e Notificação no WhatsApp
- O front-end **nunca** marca um pedido como "Pago no Banco"; ele gera a mensagem estruturada com a etiqueta `Forma de Pagamento: Pix Direto`.
- O cliente é orientado a anexar o comprovante na conversa do WhatsApp.
- O comerciante é orientado a conferir a notificação do app do seu banco antes de despachar a mercadoria ou confirmar o agendamento na agenda.

---

## 3. Consequências & Benefícios

- **Zero Taxas de Intermediação:** Todo o valor cai 100% líquido na conta do comerciante (Pix D+0).
- **Sem Fricção:** Botão "Copiar Chave" e "Copiar Código Copia e Cola" aceleram a compra no celular.
- **Ambiente Seguro:** Não há armazenamento de dados sensíveis de cartão ou senhas na aplicação.
