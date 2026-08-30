# 🌐 @alaska/web — Frontend Nuxt 3 & Vitrines Mobile-First

> Aplicação frontend do ecossistema **Alaska Local Monorepo**, desenvolvida com **Nuxt 3**, **Vue 3**, **Tailwind CSS**, consumo de contratos compartilhados com **`@alaska/contracts`** e suíte de testes no **Vitest** (22 suítes, 163 testes).

[![Nuxt 3](https://img.shields.io/badge/Nuxt-3.17.6-00DC82?logo=nuxt.js)](https://nuxt.com/)
[![Vue 3](https://img.shields.io/badge/Vue-3.5.13-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-4.1.11-6E9F18?logo=vitest)](https://vitest.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel)](https://vercel.com/)

---

## 🎯 As 4 Verticais Canônicas

* 🍔 **Alaska Menu**: Food service, hamburguerias, pizzarias, adegas 24h, espetarias e delivery.
* 🛍️ **Alaska Shop**: Boutiques de moda feminina, semijoias finas, calçados e cosméticos com sacola em tempo real.
* 💈 **Alaska Hub**: Barbearias, salões de beleza e estúdios com agendamento de horários e venda de produtos upsell.
* ⚖️ **Alaska Pro**: Clínicas médicas, odontologia, psicólogos e advogados com agendamento de consultas e avaliações.

---

## 🚀 Como Executar

### A partir da raiz do Monorepo:
```bash
# Rodar o frontend em modo desenvolvimento (http://localhost:3000)
pnpm dev:web

# Rodar todos os testes unitários do frontend no Vitest
pnpm test:web

# Rodar os testes em modo watch
pnpm --filter @alaska/web test:watch
```

### De dentro da pasta `apps/web`:
```bash
pnpm dev
pnpm test
```

---

## 📁 Estrutura de Pastas

```
apps/web/
├── components/                       # Modais e componentes com acessibilidade W3C/WCAG
├── composables/                      # useCart, useBookingSlots, useCep, useTenantTheme, useHaptic
├── data/                             # Catálogos locais JSON das 9 lojas ativas de demonstração
├── pages/                            # index.vue (Showcase geral) e [slug].vue (Vitrine dinâmica)
├── public/                           # Favicon, robots.txt e assets estáticos
├── scripts/                          # new-demo.js (Gerador CLI de vitrines em 10s)
├── server/                           # Middleware de resolução de domínios (tenant.ts)
├── tests/units/                      # 22 suítes de testes unitários no Vitest (163 testes)
├── types/                            # Adaptador reexportando @alaska/contracts
└── utils/                            # formatters, images, pix (EMV) e whatsapp
```

---

## 📚 Documentação Completa

Para especificações detalhadas de Design System, Acessibilidade WCAG e ADRs, consulte a pasta centralizada **[`docs/`](../../docs/)** na raiz do monorepo.
