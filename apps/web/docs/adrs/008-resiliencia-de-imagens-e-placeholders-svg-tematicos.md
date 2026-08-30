# ADR 008: Resiliência de Imagens e Placeholders SVG Dinâmicos por Tema

- **Status:** Aceito / Implementado
- **Data:** 2026-08-28
- **Contexto:** Módulo `utils/images.ts`, Diretiva/Handler `@error="handleImageError"`, Suíte de Testes `tests/units/images.test.ts`

---

## 1. Contexto & Problema

Em vitrines digitais multi-tenant (*Alaska Menu*, *Alaska Shop*, *Alaska Hub*, *Alaska Pro*), as imagens de produtos, logotipos e banners são carregadas a partir de URLs externas (Unsplash, CDNs, redes sociais dos clientes ou links de cardápio original).

Falhas no carregamento de imagens (erros 404, domínios expirados, bloqueios CORS ou conexões 3G/4G instáveis) causavam:
- Exibição de ícones nativos de "imagem quebrada" do navegador.
- Quebra de layout visual (CLS - Cumulative Layout Shift).
- Destruição da experiência *Done-for-You (DFY)* apresentada ao cliente durante demonstrações comerciais ao vivo.

## 2. Decisão Arquitetural

Implementamos um mecanismo centralizado de resiliência e fallback SVG dinâmico em `utils/images.ts`:

### A. Fallback Baseado em Data URI SVG Inline
Ao ocorrer um evento de erro (`@error="handleImageError($event, tenant?.theme)"`), o handler:
1. Interrompe a propagação do erro.
2. Evita loops infinitos marcando o elemento com atributo `data-fallback-applied="true"`.
3. Substitui o `src` da tag `<img>` por um SVG gerado em memória codificado em Data URI UTF-8 (`data:image/svg+xml;charset=utf-8,...`).

### B. Coerência com a Paleta de Cores do Tenant (`themePalette`)
O SVG gerado adota cores de fundo e contraste alinhadas com o tema configurado no tenant:
- `food` / `emerald`: Fundo Esmeralda Suave (`#ecfdf5`), Ícone (`#059669`)
- `barber` / `violet`: Fundo Violeta Suave (`#f5f3ff`), Ícone (`#7c3aed`)
- `health` / `blue`: Fundo Azul Claro (`#eff6ff`), Ícone (`#2563eb`)
- `drinks` / `amber`: Fundo Âmbar (`#fffbeb`), Ícone (`#d97706`)
- `shop` / `rose`: Fundo Rosa Claro (`#fff1f2`), Ícone (`#e11d48`)
- `slate` / `dark`: Fundo Ardósia (`#f8fafc`), Ícone (`#475569`)

### C. Ícones Vetoriais e Tipografia Neutra
O placeholder contém ilustração geométrica vetorial limpa com texto indicativo suave ("Alaska Local"), preservando o aspecto profissional da aplicação.

## 3. Consequências & Benefícios

- **Zero Layout Shifts:** A imagem mantém suas dimensões e proporções CSS sem deformar o card.
- **Independência de Rede:** Nenhum asset extra é baixado; a geração do SVG é 100% síncrona e local no navegador.
- **Elegância Comercial:** Demos geradas via CLI continuam impecáveis visualmente mesmo se fotos de produtos específicos falharem.