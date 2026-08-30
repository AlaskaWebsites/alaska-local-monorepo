# 📖 Runbook: Como Criar e Publicar uma Nova Demo em 5 Minutos

Este guia descreve o processo operacional para gerar uma demonstração personalizada para um novo lead durante a prospecção.

---

### Passo 1: Executar o Script CLI

No terminal do projeto, execute:

```bash
node scripts/new-demo.js <slug-do-lead> "<Nome do Estabelecimento>" "<WhatsApp com DDD>"

```

Exemplo prático:

```bash
node scripts/new-demo.js pizzaria-do-ze "Pizzaria do Zé" "11999998888"

```

O script criará automaticamente o arquivo `data/pizzaria-do-ze.json`.

---

### Passo 2: Personalizar o JSON

Abra o arquivo `data/<slug-do-lead>.json` recém-criado e ajuste em 3 minutos:

1. **`logo`**: Cole o link da foto de perfil do Instagram do lead.
2. **`banner`**: Cole o link de uma foto atraente de produto ou ambiente.
3. Altere de 3 a 5 produtos para os itens mais vendidos do lead com os preços reais.

---

### Passo 3: Deploy na Nuvem

Envie a atualização para a Vercel através do Git:

```bash
git add .
git commit -m "feat(demo): adiciona demo de <Nome do Estabelecimento>"
git push

```

A demonstração estará online e pronta para envio no WhatsApp em menos de 1 minuto em:
🔗 `[https://seu-projeto.vercel.app/](https://seu-projeto.vercel.app/)<slug-do-lead>`