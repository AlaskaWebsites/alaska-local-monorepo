# Guia de Operações e Deploy

Este documento reúne os guias operacionais para deploy, execução em containers e provisionamento de demonstrações no ecossistema **Alaska Local**.

---

## 🚀 Guias de Deploy

1. **[Guia Definitivo de Deploy na Vercel (Nuxt 3 + Turborepo Monorepo)](./deploy-vercel-turborepo-monorepo.md):**  
   Referência técnica completa com tabela de configurações do dashboard, variáveis de ambiente obrigatórias (`ENABLE_EXPERIMENTAL_COREPACK=1`), `vercel.json`, `turbo.json` e o guia de troubleshooting dos 5 erros clássicos (EUNSUPPORTEDPROTOCOL, `@alaska/contracts`, Build Output API v3, `globalEnv` e EPERM no Windows).

2. **[Execução em Containers Docker](./docker-runbook.md):**  
   Procedimento para subir o ambiente local de banco PostgreSQL 16, Pgweb e Redis com BullMQ.

3. **[Guia de Provisionamento de Novas Demos](./new-demo-guide.md):**  
   Passo a passo para gerar cardápios e vitrines ativas em menos de 5 minutos via CLI (`node scripts/new-demo.js`).
