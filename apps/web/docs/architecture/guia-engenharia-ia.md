# Guia de Engenharia, Padrões de Código e Harness de IA — Alaska Local

Este guia reúne as boas práticas de engenharia de software, padrões de projeto e convenções de código aplicadas em todo o ecossistema **Alaska Local**.

---

## 🏛️ 1. Padrões de Frontend (Nuxt 3 & Vue 3)

### 1.1. Estrutura de Componentes e Modais
* **Isolamento via Teleport**: Qualquer modal, drawer ou toast deve ser renderizado fora do fluxo de layout utilizando `<Teleport to="body">`.
* **Semântica W3C / WCAG**:
  ```vue
  <div role="dialog" aria-modal="true" :aria-labelledby="modalTitleId">
    <h2 :id="modalTitleId">Título do Modal</h2>
    ...
  </div>
  ```
* **Controle de Foco**: Utilize `nextTick()` e `setTimeout(() => inputRef.value?.focus(), 150)` para garantir autofocus imediato no mobile sem travar a animação de entrada.
* **Bloqueio de Rolagem**: O composable `useBodyScrollLock(isOpen)` deve ser invocado em todo modal para evitar rolagem do fundo (background scroll leak).

### 1.2. Composables e Reatividade
* Composables devem aceitar tanto `Ref<T>` quanto valores literais `T`:
  ```ts
  export function useFeature(target?: Ref<Tenant | null> | Tenant | null) {
    const data = computed(() => {
      const raw = isRef(target) ? target.value : target
      return raw ? transform(raw) : defaultVal
    })
    return { data }
  }
  ```
* Composables em `composables/*.ts` utilizam o auto-import nativo do Nuxt 3.

---

## 🔒 2. Tipagem, Schemas e Zod Fail-Fast

### 2.1. Centralização em `types/`
* Toda e qualquer interface deve residir em `types/cart.ts` ou `types/tenant.ts` e ser exportada através do *barrel file* `types/index.ts`.
* **Exemplo de importação padrão**:
  ```ts
  import type { Tenant, Product, CartItem, CheckoutFormData } from '~/types'
  ```

### 2.2. Parsing e Sanitização com Zod
* Schemas Zod devem aplicar transformações e valores padrão para garantir que objetos parciais ou malformados não quebrem o frontend:
  ```ts
  export const TenantSchema = z.object({
    slug: z.string(),
    name: z.string(),
    phoneWhatsApp: z.string().transform(v => v.replace(/\D/g, '')), // sanitização automática
    currency: z.string().default('R$'),
    deliveryFee: z.number().default(0),
    minOrderValue: z.number().default(0),
    theme: TenantThemeSchema.default('food')
  })
  ```

---

## 🧪 3. Padrões de Teste com Vitest

1. **Testes Unitários Puros**:
   * Priorize funções puras e regras de negócio desacopladas do DOM (ex: cálculo de subtotais, validação de checkout, cálculo de horários de funcionamento).
2. **Tratamento de Caracteres Unicode**:
   * O `Intl.NumberFormat` para `pt-BR` insere o espaço inquebrável `\u00A0` entre `R$` e os números. Nos testes, valide por inclusão semântica:
     ```ts
     expect(message).toContain('TOTAL:')
     expect(message).toContain('70')
     ```
3. **Mocks Válidos**:
   * Sempre passe os mocks pelo `TenantSchema.parse(...)` para que modificações futuras no schema quebrem os mocks desatualizados na hora do teste.

---

## 🚀 4. Checklist de Sanidade para Novos Recursos

Antes de finalizar qualquer modificação no projeto, execute a seguinte lista de checagem:

- [ ] Os tipos foram importados de `~/types` e não declarados localmente?
- [ ] O componente atende às regras de acessibilidade ARIA e trava de scroll?
- [ ] O tema responde dinamicamente via `useTenantTheme` e inclui `focusRing` nos inputs?
- [ ] O `npx vitest run` foi executado e todos os testes passaram com 100% de sucesso?
- [ ] A documentação em `docs/` e `AGENTS.md` foi atualizada se houver nova funcionalidade?
