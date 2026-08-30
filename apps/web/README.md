# 🏔️ Alaska Local — Vitrines Digitais & Catálogos Mobile-First

> Solução digital de alta performance para estabelecimentos locais (alimentação, adegas, boutiques, semijoias, barbearias e clínicas). Desenvolvido com **Nuxt 3**, **Vue 3**, **Tailwind CSS**, **Zod** e integração híbrida API-First com o backend **NestJS 11**.

[![Nuxt 3](https://img.shields.io/badge/Nuxt-3.17.6-00DC82?logo=nuxt.js)](https://nuxt.com/)
[![Vue 3](https://img.shields.io/badge/Vue-3.5.13-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-4.1.11-6E9F18?logo=vitest)](https://vitest.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 Visão Geral & 4 Verticais Canônicas

O **Alaska Local** é uma plataforma *One Codebase, Infinite Domains* projetada para transformar o atendimento de pequenos e médios comércios em uma experiência moderna, sem taxas por pedido e com fechamento direto no WhatsApp.

* 🍔 **Alaska Menu**: Food service, hamburguerias, pizzarias, adegas 24h, espetarias e confeitarias.
* 🛍️ **Alaska Shop**: Boutiques de moda feminina, semijoias finas, calçados e cosméticos com sacola inteligente.
* 💈 **Alaska Hub**: Barbearias, salões de beleza e estúdios com agendamento de horários e venda de produtos upsell.
* ⚖️ **Alaska Pro**: Clínicas médicas, odontologia, psicólogos e advogados com agendamento de consultas e avaliações.

---

## ✨ Funcionalidades Principais

* **📱 Mobile-First & PWA-Ready**: Interface fluida, rápida e responsiva otimizada para smartphones.
* **🔍 Busca em Tempo Real (Zero Latência)**: Composable `useProductSearch` com normalização Unicode, ignorando acentos e cedilhas.
* **📍 Autopreenchimento de CEP (ViaCEP)**: Validação Zod, preenchimento automático de logradouro/bairro e máscara dinâmica.
* **💠 Pagamento Instantâneo Pix D+0**:
  * Geração do **BR Code EMV oficial** do Banco Central com checksum **CRC-16 CCITT**.
  * Geração visual de **QR Code** no client-side em Base64 Data URL.
  * Botões de um clique: **Copiar Chave** e **Copia e Cola**.
  * **🧪 Modo de Teste de 1 Centavo (R$ 0,01)** para validação real de recebimento bancário.
* **📅 Agendamento de Serviços (`useBookingSlots`)**: Seleção de procedimentos, profissional, carrossel de 30 dias e horários livres com sinal opcional via Pix.
* **⭐ Prova Social Estilo iFood**: Sistema de avaliações em 5 níveis de serviço, distribuição de notas e selos de confiança.
* **📳 Feedback Tátil (`useHaptic`)**: Vibração suave ao adicionar itens na sacola via Vibration API.
* **♿ Acessibilidade W3C / WCAG**: Modais semânticos (`role="dialog"`, `aria-modal="true"`, `useBodyScrollLock` e suporte à tecla `Escape`).

---

## 🏛️ Lojas de Demonstração Disponíveis

| Slug | Nome | Vertical | Tema Visual |
| :--- | :--- | :--- | :--- |
| `/adega-prime` | Adega & Distribuidora Prime | Alaska Menu | Amber (Dourado/Âmbar) |
| `/hamburgueria-x` | Hamburgueria X Artesanal | Alaska Menu | Food (Vermelho) |
| `/espetaria-brasa` | Espetaria & Jantinha Brasa Nobre | Alaska Menu | Food (Vermelho) |
| `/cafe-central` | Café Central & Bistrô | Alaska Menu | Food (Vermelho) |
| `/restaurante-bella-italia` | Restaurante Bella Italia | Alaska Menu | Food (Vermelho) |
| `/bella-donna` | Bella Donna Boutique | Alaska Shop | Drinks (Púrpura/Rosa) |
| `/karine-finardi` | Karine Finardi Semijoias | Alaska Shop | Barber/Rose (Dourado) |
| `/barbearia-style` | Barbearia Style | Alaska Hub | Barber (Âmbar/Dark) |
| `/clinica-sorriso` | Clínica Sorriso Odontologia | Alaska Pro | Health (Azul/Teal) |

---

## 🛠️ Tecnologias & Arquitetura

* **Framework**: Nuxt 3 (SSR + Nitro Engine)
* **Linguagem**: TypeScript 5.8 (Strict Mode)
* **Estilização**: Tailwind CSS 3.4 com paletas dinâmicas por vertical
* **Validação de Dados**: Zod 3.24 (Schemas canônicos em `types/`)
* **Ícones**: Lucide Vue Next
* **Gerador de QR Code**: `qrcode` (PNG Base64)
* **Testes**: Vitest 4.1 (22 suítes, 163 testes automatizados)

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
* Node.js 20+ ou 22+
* npm ou pnpm

### 2. Instalação das Dependências
```bash
git clone https://github.com/AlaskaWebsites/Alaska-local.git
cd Alaska-local
npm install
```

### 3. Configuração de Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto (opcional para rodar com fallback JSON local ou integrado ao backend):
```env
# URL da API NestJS (Opcional - se vazio, utiliza os catálogos data/*.json)
NUXT_PUBLIC_API_BASE_URL=http://localhost:3333/api/v1
```

### 4. Executando em Desenvolvimento
```bash
npm run dev
```
Acesse no navegador:
* Showcase geral: `http://localhost:3000`
* Demonstração direta: `http://localhost:3000/adega-prime`

### 5. Executando os Testes Automatizados (Vitest)
```bash
npm run test
```
*Suíte com 22 arquivos de teste e 163 testes unitários com 100% de aprovação.*

---

## 📜 Licença
Distribuído sob licença MIT. Desenvolvido pela equipe **Alaska Websites**.
