# Estratégia de Testes e Engenharia de Qualidade (Vitest Test Harness)

A estabilidade e confiabilidade do ecossistema Alaska Local são sustentadas por uma suíte completa de testes unitários executados via **Vitest**.

---

## 1. Pirâmide de Testes & Ciclo de Engenharia

Seguimos a metodologia **Spec -> Zod -> Vitest -> Composable -> UI**:
1. **Contratos e Schemas:** Validação de entradas e estruturas com Zod (`booking-schema.test.ts`, `tenant-schema.test.ts`).
2. **Composables Puros:** Testes isolados de regras de negócio sem acoplamento a DOM ou navegador (`opening-hours.test.ts`, `cart.test.ts`, `booking-slots.test.ts`, `cep.spec.ts`, `product-search.spec.ts`).
3. **Segurança SSR (Server-Side Rendering):** Testes de ausência de dependências de `window` ou `document` durante execução server-side (`ssr-safety.test.ts`).
4. **Formatação & Integração Externa:** Testes de mensagens de WhatsApp, máscaras de moeda BRL, CEP e fallback de imagens (`whatsapp-order.test.ts`, `images.test.ts`).

---

## 2. Mapa de Cobertura Unitária

| Arquivo de Teste | Área de Cobertura | Casos Principais |
| :--- | :--- | :--- |
| `opening-hours.test.ts` | Cálculo de Horários | Turnos diurnos, turnos noturnos pós meia-noite, fallbacks nulos, badges dinâmicos. |
| `cart.test.ts` / `cart-drawer.spec.ts` | Sacola de Compras | Adição, remoção, cálculo de adicionais, subtotal com frete, persistência local. |
| `booking-slots.test.ts` | Agendamento de Serviços | Geração de intervalos de 30/45/60 min, dias úteis, filtro por profissional, conflito de horários. |
| `cep.spec.ts` | Autopreenchimento CEP | Consulta ViaCEP, sanitização de máscara, tratamento de CEP inexistente e timeout. |
| `product-search.spec.ts` | Busca Client-Side | Normalização Unicode NFD (acentos/cedilha), busca parcial em nome/descrição, contagem de itens. |
| `images.test.ts` | Resiliência de Imagens | Fallback para SVG Data URI, temas de cores, prevenção de loop infinito de erro. |
| `whatsapp-order.test.ts` | Despacho de Pedidos | Sanitização E.164 (+55), formato do pedido, formas de pagamento, troco e venda híbrida. |
| `ssr-safety.test.ts` | Segurança de SSR | Inicialização síncrona sem quebra de hidratação no Nuxt 3. |

---

## 3. Execução dos Testes

Para rodar todos os testes unitários do projeto:
```bash
npm run test
# ou diretamente via Vitest
npx vitest run
```