# 🛠️ Guia de Criação Rápida de Lojas de Demonstração (CLI)

O script `scripts/new-demo.js` permite criar uma vitrine de demonstração completa para um cliente potencial em menos de **10 segundos** antes do contato comercial.

---

## 🚀 Como Executar

A partir da raiz do monorepo:

```bash
node apps/web/scripts/new-demo.js <slug> "<Nome do Estabelecimento>" "<Telefone WhatsApp>"
```

### Exemplo:
```bash
node apps/web/scripts/new-demo.js pizzaria-napoli "Pizzaria Napoli" "11987654321"
```

---

## 🎯 O que o script gera automaticamente:
1. Cria o arquivo `apps/web/data/<slug>.json` com produtos, categorias e horários pré-configurados.
2. Registra o estabelecimento na vitrine de showcase em `apps/web/pages/index.vue`.
3. Define o tema visual adequado de acordo com a vertical.
