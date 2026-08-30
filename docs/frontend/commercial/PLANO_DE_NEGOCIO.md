# 💼 Plano de Negócios, Monetização & Engenharia Comercial — Alaska Local

> **Diretriz Estratégica, Financeira e Operacional**  
> **Ecossistema:** Alaska Local (Menu, Shop, Hub, Pro)  
> **Versão:** 2.0.0  
> **Última Atualização:** 2026-08-27  
> **Status:** Ativo / Aprovado  

---

## 🎯 1. Visão Geral do Modelo de Negócio

O **Alaska Local** é uma solução *B2B Local* no modelo **Done-for-You (DFY)** de alta conversão. Transformamos a presença digital de comércios de bairro e prestadores de serviços através de vitrines mobile-first ultra-rápidas, cardápios interativos, prova social no padrão iFood e checkout estruturado direto no WhatsApp.

### 💡 Os Três Pilares Centrais
1. **Zero Esforço para o Lojista (Modelo DFY)**: Nós cuidamos de toda a estruturação da vitrine digital, curadoria de fotos, cadastro do cardápio/catálogo, configuração de domínio próprio (`.com.br`) e integração com o WhatsApp. O cliente não precisa aprender a usar painéis complexos.
2. **Zero Taxas sobre Vendas (0% vs até 27% do iFood)**: O comerciante ou profissional fica com 100% da receita de suas vendas e agendamentos. A plataforma não cobra comissão por pedido.
3. **One Codebase, Infinite Domains**: Custo de infraestrutura inicial de **R$ 0** (Vercel Serverless + Nuxt 3), garantindo margem de lucro operacional superior a **95%**.

---

## 🚀 2. Como a Arquitetura de Software Potencializa o Negócio

A tecnologia do Alaska Local não é apenas um detalhe de implementação — ela é a principal alavanca de viabilidade financeira, velocidade de vendas e rentabilidade do negócio:

```
┌────────────────────────────────────────┐
│     ARQUITETURA TÉCNICA ALASKA         │
└───────────────────┬────────────────────┘
                    │
   ┌────────────────┼────────────────┬────────────────┐
   ▼                ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ One Codebase │ │ Show, Don't  │ │ Mobile-First │ │ Zero Custo   │
│ Multi-Tenant │ │ Tell (CLI)   │ │ W3C / WCAG   │ │ Infra (Edge) │
├──────────────┤ ├──────────────┤ ├──────────────┤ ├──────────────┤
│ 100+ tenants │ │ Demo pronta  │ │ UX padrão    │ │ Vercel $0    │
│ num só deploy│ │ em 10 min    │ │ iFood        │ │ Margem > 96% │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

| Decisão Técnica | Benefício Arquitetural | Impacto Direto na Regra de Negócio |
| :--- | :--- | :--- |
| **One Codebase, Infinite Domains** | Todos os clientes rodam na mesma base Nuxt 3, com resolução dinâmica de domínios via middleware. | Escala ilimitada sem custo adicional de manutenção ou múltiplos deploys. |
| **Show, Don't Tell via CLI (`new-demo.js`)** | Script que gera uma demonstração funcional com dados reais do cliente em minutos. | Aumenta a taxa de conversão na prospecção de ~5% para mais de **35%**, eliminando reuniões longas. |
| **Frontend Estático + WhatsApp URL Scheme** | Sem dependência de banco de dados no Estágio 1; pedidos chegam formatados no WhatsApp do lojista. | Zero custo operacional, zero risco de indisponibilidade de servidor de banco e onboarding imediato. |
| **Dark Slate 950 / Emerald + Acessibilidade** | Design system moderno, responsivo, com modais acessíveis (`role="dialog"`, WCAG). | Percepção de valor premium: o pequeno comerciante tem uma vitrine que transmite o padrão de grandes apps. |

---

## 📊 3. Estratégia de Precificação: Plano Anual vs. Plano Mensal

A estratégia de precificação foi desenhada para resolver simultaneamente duas necessidades vitais:
- **Curto Prazo:** Injeção imediata de caixa para capital de giro através do **Plano Anual**.
- **Médio/Longo Prazo:** Construção de receita previsível através do **Plano Mensal (MRR)**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ESTRUTURA DE PRECIFICAÇÃO                        │
├──────────────────────────────────────┬──────────────────────────────────────┤
│      PLANO ANUAL (Acelerador Caixa)   │      PLANO MENSAL (Recorrência MRR)  │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • SETUP 100% GRATUITO                │ • Taxa de Setup Inicial: R$ 250 a R$ 600│
│ • Domínio Próprio Incluso (1º Ano)   │ • Mensalidade: R$ 50 a R$ 120/mês    │
│ • Pagamento à Vista Pix ou 12x Cartão│ • Cobrança Automática Asaas Pix D+0  │
│ • Zero Risco de Inadimplência/Churn  │ • Contrato de Permanência Mínima (3m)│
│ • Foco: Primeiros 10 a 20 clientes   │ • Foco: Clientes com fluxo restrito  │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### ⚡ Por que priorizar o Plano Anual nas primeiras vendas?
1. **Meta de Capital Rápido:** Fechar 10 clientes anuais gera entre **R$ 7.200 a R$ 9.900 de caixa líquido à vista**.
2. **Comparativo de Entrada Financeira (10 Clientes)**:
   - *10 no Mensal:* R$ 3.500 (setup) + R$ 600 (mês 1) = **R$ 4.100**.
   - *10 no Anual:* **R$ 7.200 a R$ 9.900 à vista**.
3. **Redução Drástica de Churn:** O plano anual bloqueia cancelamentos por 12 meses, tempo suficiente para o lojista consolidar o canal direto de vendas no WhatsApp.

---

## 🏬 4. Matriz de Precificação por Vertical de Negócio

A divisão em 4 categorias de negócio (`menu`, `shop`, `hub`, `pro`) permite **precificação assimétrica** alinhada ao ticket médio e à capacidade de investimento de cada segmento:

| Vertical | Segmentos Atendidos | Plano Anual (À Vista / 12x) | Plano Mensal (Setup + Recorrência) | Ticket Médio do Cliente Final | Argumento de Venda & ROI |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 🍔 **Alaska Menu** | Hamburguerias, Pizzarias, Adegas 24h, Espetarias, Docerias | **R$ 720** (ou 12x R$ 72) | Setup R$ 350 + **R$ 60/mês** | R$ 40 a R$ 90 | **Economia de Taxas:** Com o iFood cobrando 27%, economizar taxas em apenas 3 a 4 pedidos no mês já paga a mensalidade de R$ 60. |
| 🛍️ **Alaska Shop** | Boutiques de Moda, Semijoias, Calçados, Cosméticos | **R$ 720** (ou 12x R$ 72) | Setup R$ 350 + **R$ 60/mês** | R$ 80 a R$ 350 | **Sem Fricção de Cadastro:** Vitrine visual mobile rápida; o cliente não abandona carrinho por ter que criar senha, fechando direto no WhatsApp. |
| 💈 **Alaska Hub** | Barbearias, Salões de Beleza, Estúdios de Tatuagem, Clínicas | **R$ 600** (ou 12x R$ 60) | Setup R$ 250 + **R$ 50/mês** | R$ 35 a R$ 120 | **Substituição de Linktree:** Domínio próprio, tabela interativa de serviços e agendamento instantâneo sem poluição visual. |
| ⚖️ **Alaska Pro** | Advogados, Médicos, Psicólogos, Contadores, Arquitetos | **R$ 990 a R$ 1.200** (ou 12x R$ 99 a R$ 120) | Setup R$ 600 + **R$ 90 a R$ 120/mês** | R$ 250 a R$ 5.000+ | **Autoridade Imediata:** Um único novo cliente ou consulta fechada pelo site com credencial profissional paga o ano inteiro da plataforma. |

---

## 💳 5. Gestão Financeira & Automação no Asaas (Pix D+0)

Toda a infraestrutura de pagamentos e cobranças recorrentes opera através do **Asaas**:

1. **Liquidação Pix D+0**: Recebimento instantâneo no mesmo dia da confirmação, maximizando o fluxo de caixa diário.
2. **Régua de Cobrança Automática (Plano Mensal)**:
   - **D-3 (3 dias antes do vencimento):** Notificação amigável no WhatsApp e E-mail com QR Code Pix copia e cola.
   - **D0 (Dia do vencimento):** Lembrete de pagamento.
   - **D+3 (3 dias de tolerância):** Aviso de pendência amigável.
3. **Política de Inadimplência & Bloqueio Gracioso**:
   - Após **5 dias úteis de atraso**, a vitrine do cliente é redirecionada automaticamente pelo middleware para uma página amigável de manutenção (*"Estamos atualizando nosso catálogo, volte em breve"*), preservando a imagem do cliente enquanto sinaliza a necessidade de regularização.

---

## 📈 6. Projeção de Faturamento e LTV (Fases 1, 2 e 3)

```
Cenário de Escala Gradual (Meta: 30 Clientes Ativos):
• 15 Clientes Alaska Menu / Shop (R$ 60/mês)  = R$ 900,00/mês
•  8 Clientes Alaska Hub (R$ 50/mês)          = R$ 400,00/mês
•  7 Clientes Alaska Pro (R$ 100/mês)         = R$ 700,00/mês
-----------------------------------------------------------------
Receita Recorrente Mensal (MRR):              R$ 2.000,00/mês
Receita Anual Recorrente (ARR):               R$ 24.000,00/ano
Custo de Infraestrutura de Servidor:          R$ 0,00 (Vercel Serverless)
Margem de Lucro Operacional:                  > 96%
```

### 🎯 Evolução por Fases
- **Fase 1 (0 a 5 Clientes):** Validação manual pura com JSONs estáticos (`data/*.json`), foco 100% no Plano Anual (R$ 720) para gerar caixa rápido. Custo de infra: R$ 0.
- **Fase 2 (6 a 15 Clientes):** Backend NestJS opcional + Painel lojista simples para atualização de preços e horários. Equilíbrio entre Anual e Mensal.
- **Fase 3 (16 a 30+ Clientes):** Integração automática Asaas via Webhooks, suporte a impressão térmica Bluetooth e módulo de agendamento integrado ao Google Calendar.

---

## 🛠️ 7. Fluxo Operacional de Onboarding (Done-for-You em 3 Passos)

```
┌───────────────────────────┐     ┌───────────────────────────┐     ┌───────────────────────────┐
│ Passo 1: Demo em 10 min   │ ──► │ Passo 2: Pitch Consultivo │ ──► │ Passo 3: Ativação & Setup │
├───────────────────────────┤     ├───────────────────────────┤     ├───────────────────────────┤
│ Coletar fotos do Instagram│     │ Enviar link da demo ativa │     │ Cobrança Asaas (Pix D+0)  │
│ Rodar node new-demo.js    │     │ Oferta do Plano Anual     │     │ Configurar DNS do domínio │
│ Deploy instantâneo Vercel │     │ Argumento de ROI (Taxas)  │     │ Entrega pronta ao cliente │
└───────────────────────────┘     └───────────────────────────┘     └───────────────────────────┘
```

1. **Passo 1 — Geração da Demo Funcional (10 minutos)**:
   - Coletar nome, logo e produtos/fotos públicas do Instagram ou Google Maps do lead.
   - Executar `node scripts/new-demo.js <slug> "<Nome>" "<Telefone>"`.
   - Subir commit: a demonstração entra no ar imediatamente em `alaskalocal.vercel.app/<slug>`.

2. **Passo 2 — Fechamento Consultivo no WhatsApp**:
   - Abordagem não agressiva: *"Fiz uma demonstração visual exclusiva de como ficaria a vitrine digital do seu estabelecimento..."*
   - Apresentar o Plano Anual (Setup Gratuito + Domínio Incluso no 1º Ano).

3. **Passo 3 — Ativação e Cobrança**:
   - Gerar link de pagamento ou QR Code Pix no Asaas.
   - Ao receber confirmação, apontar o domínio próprio do cliente no DNS da Vercel (`server/middleware/tenant.ts`).
