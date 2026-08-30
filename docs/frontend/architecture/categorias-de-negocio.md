# Categorização de Negócios e Verticais — Alaska Local

Este documento define a taxonomia, as regras de negócio, as funcionalidades técnicas e o enquadramento comercial das verticais do ecossistema **Alaska Local**.

---

## 🎯 1. Visão Geral das 4 Verticais de Negócio

Para atender o comércio e prestadores de serviços locais de forma cirúrgica e sem complexidade desnecessária, o ecossistema é dividido em **4 Categorias de Negócio**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ECOSSISTEMA ALASKA LOCAL                         │
├───────────────────┬───────────────────┬───────────────────┬─────────────────┤
│    ALASKA MENU    │    ALASKA SHOP    │    ALASKA HUB     │   ALASKA PRO    │
│ (Alimentação/Deliv)│ (Lojas & Varejo) │ (Serviços/Agenda) │ (Autoridade/Adv)│
├───────────────────┼───────────────────┼───────────────────┼─────────────────┤
│ • Carrinho/Taxa   │ • Vitrine Produto │ • Links Rápidos   │ • Perfil/Bio    │
│ • Opcionais/Grupos│ • Grade Tam/Cor   │ • Grade Serviços  │ • Credenciais   │
│ • CEP + Endereço  │ • Sacola/WhatsApp │ • Agendamento WA  │ • Áreas Atuação │
│ • Pedido WhatsApp │ • Catálogo Foto   │ • Horário Funcion.│ • FAQ + Maps    │
└───────────────────┴───────────────────┴───────────────────┴─────────────────┘
```

---

## 📂 2. Detalhamento de Cada Categoria ("Tim-Tim por Tim-Tim")

### 1. 🍔 Alaska Menu (Food Service, Bares, Adegas & Delivery)
* **Público-Alvo**: Hamburguerias, pizzarias, adegas 24h, espetarias, confeitarias, lanchonetes e restaurantes.
* **Proposta de Valor**: Cardápio digital rápido no padrão iFood, eliminando taxas de até 27% de marketplaces e agilizando o atendimento de horário de pico.
* **Componentes & Recursos Utilizados**:
  - Modal de Opcionais (`ProductCustomizerModal.vue`) com grupos de escolha mínima/máxima obrigatória (ex: ponto da carne, queijos extras).
  - Drawer de Sacola (`CartDrawerModal.vue`) com persistência no LocalStorage.
  - Autopreenchimento de CEP via ViaCEP com foco automático no número da casa.
  - Cálculo de subtotal, taxa de entrega dinâmica ou retirada no balcão.
  - Despacho estruturado de pedido diretamente no WhatsApp do lojista.
  - Prova social estilo iFood (`StoreReviewsModal.vue`) e horários operacionais com virada de meia-noite (`StoreInfoModal.vue`).

---

### 2. 🛍️ Alaska Shop / Alaska Vitrine (Lojas, Boutiques & Varejo Local)
* **Público-Alvo**: Boutiques de moda feminina e masculina, semijoias e joalherias, óticas, lojas de calçados, cosméticos e perfumaria, pet shops e lojas de presentes.
* **Proposta de Valor**: Vitrine digital elegante com fotos de alta qualidade, grade de tamanhos/cores e fechamento consultivo de compra no WhatsApp, eliminando a barreira de cadastros pesados de e-commerces tradicionais.
* **Componentes & Recursos Utilizados**:
  - Catálogo em grid visual mobile-first focado nas fotos dos produtos.
  - Variações de produto como opcionais de tamanho (P, M, G, GG), cores e acabamentos (Ouro 18k, Ródio Branco, Prata 925).
  - Sacola com cálculo instantâneo e botão de fechamento direto no WhatsApp da vendedora.
  - Busca em tempo real insensível a acentos (`useProductSearch.ts`).
  - Feedback tátil sutil (`navigator.vibrate(30)`) ao adicionar peças à sacola.

---

### 3. 💈 Alaska Hub (Prestadores de Serviços, Salões & Barbearias)
* **Público-Alvo**: Barbearias, salões de beleza, estúdios de tatuagem, clínicas de estética, estúdios de sobrancelhas e depilação.
* **Proposta de Valor**: Hub de links de alta conversão para o link da bio do Instagram e WhatsApp, com apresentação clara dos serviços, preços e botão de agendamento rápido.
* **Componentes & Recursos Utilizados**:
  - Botões de links rápidos de ação (WhatsApp, Instagram, Google Maps, Agendar).
  - Tabela de serviços com valores, tempo estimado e descrição.
  - Modal de informações operacionais com horários e localização exata.
  - Botão de agendamento que já abre o WhatsApp com a mensagem pronta: *"Olá, gostaria de agendar um horário para [Serviço]"*.

---

### 4. ⚖️ Alaska Pro / Alaska Authority (Profissionais Liberais & Institucional One-Page)
* **Público-Alvo**: Advogados e escritórios de advocacia, médicos e consultórios particulares, psicólogos, contadores, arquitetos, engenheiros, corretores de imóveis e consultores de negócios.
* **Proposta de Valor**: Site institucional de página única (*One-Page*) que transmite autoridade imediata, posiciona o profissional no Google Meu Negócio e gera leads qualificados diretamente no WhatsApp.
* **Componentes & Recursos Utilizados**:
  - **Hero Section**: Foto profissional, proposta de valor de alto impacto e CTA principal.
  - **Sobre & Autoridade**: Mini-biografia, tempo de carreira e número de registro (OAB, CRM, CRP, CRECI, CRC).
  - **Áreas de Atuação**: Cards explicativos das especialidades do profissional em linguagem acessível.
  - **Prova Social**: Depoimentos de clientes e avaliações do Google.
  - **FAQ Interativo**: Perguntas e respostas frequentes para quebrar objeções.
  - **Localização / Consultório**: Fotos do espaço físico e rota do Google Maps.
  - **CTA Final**: Botão direto para agendar consulta/reunião de diagnóstico no WhatsApp.

---

## 🏬 3. Mapeamento das 9 Lojas Atuais no Repositório

| Slug do Tenant | Nome do Estabelecimento | Categoria de Negócio | Template Nuxt | Tema Visual |
| :--- | :--- | :--- | :--- | :--- |
| `hamburgueria-x` | Hamburgueria X | **Alaska Menu** (Food Service) | `menu` | `food` (Vermelho) |
| `restaurante-bella-italia` | Bella Italia | **Alaska Menu** (Food Service) | `menu` | `food` (Vermelho) |
| `espetaria-brasa` | Espetaria Brasa | **Alaska Menu** (Food Service) | `menu` | `food` (Vermelho) |
| `adega-prime` | Adega Prime | **Alaska Menu** (Bebidas 24h) | `menu` | `drinks` (Roxo Uva) |
| `cafe-central` | Café Central | **Alaska Menu / Hub** (Bistrô) | `hub` | `food` (Vermelho) |
| `bella-donna` | Bella Donna Boutique | **Alaska Shop** (Lojas / Moda) | `hub` (vitrine) | `food` (Elegante) |
| `karine-finardi` | Karine Finardi Semijoias | **Alaska Shop** (Lojas / Semijoias) | `hub` (vitrine) | `barber` (Ouro 18k) |
| `barbearia-style` | Barbearia Style | **Alaska Hub** (Serviços) | `hub` | `barber` (Âmbar) |
| `clinica-sorriso` | Clínica Sorriso | **Alaska Hub** (Saúde / Agenda) | `booking` | `health` (Ciano/Teal) |

---

## 💰 4. Matriz Comercial e Estratégia de Precificação (Done-for-You)

| Categoria | Nível de Complexidade | Setup Inicial (DFY) | Recorrência Mensal (Pix D+0) | Acelerador Anual (Caixa Rápido) |
| :--- | :--- | :--- | :--- | :--- |
| **Alaska Menu** | Média (Opcionais + CEP + Taxa) | R$ 350 a R$ 450 | R$ 60 a R$ 90/mês | R$ 720 à vista (Setup Grátis + Domínio) |
| **Alaska Shop** | Média (Catálogo + Grade de Variações) | R$ 350 a R$ 450 | R$ 60 a R$ 90/mês | R$ 720 à vista (Setup Grátis + Domínio) |
| **Alaska Hub** | Leve (Links + Serviços + Agenda) | R$ 250 a R$ 350 | R$ 50 a R$ 70/mês | R$ 600 à vista (Setup Grátis + Domínio) |
| **Alaska Pro** | Alta (Autoridade + FAQ + Conteúdo) | R$ 500 a R$ 800 | R$ 80 a R$ 120/mês | R$ 990 a R$ 1.200 à vista (Domínio Incluso) |

---

## 🚀 5. Roadmap Técnico para o Front-end

1. **Adição do Campo `businessCategory` no Schema Zod (`types/tenant.ts`)**:
   - `'menu' | 'shop' | 'hub' | 'pro'`
2. **Atualização do Filtro na Home (`pages/index.vue`)**:
   - Exibir abas/filtros: *Todos*, *Cardápios (Food)*, *Lojas & Vitrines (Shop)*, *Serviços & Barbearias (Hub)* e *Profissionais & Institucional (Pro)*.
3. **Criação do Template One-Page `pro`**:
   - Layout elegante com Hero, Sobre, Áreas de Atuação, Depoimentos, FAQ e CTA WhatsApp.
