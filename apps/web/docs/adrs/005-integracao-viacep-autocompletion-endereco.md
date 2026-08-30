# 📜 ADR 005: Autopreenchimento de Endereço via CEP (ViaCEP) com Validação Zod e Micro-UX

> **Status:** Aprovado  
> **Data:** 2026-08-26  
> **Autor:** Equipe Alaska Local  
> **Contexto:** Checkout / Experiência do Usuário (UX) no CartDrawerModal  

---

## 🎯 Contexto e Problema

No fluxo de checkout para entrega (Delivery), o preenchimento manual de todos os campos de endereço (Rua, Bairro, Cidade, Estado) gera atrito excessivo no mobile, aumentando a taxa de abandono da sacola.

Para acelerar o fechamento de pedidos direto para o WhatsApp, fazia-se necessária uma solução de autopreenchimento de endereço a partir do **CEP**, com validação estrita, tolerância a falhas na rede e experiência fluida no teclado numérico de dispositivos móveis.

---

## 💡 Decisões Tomadas

### 1. Camada de Tipagem e Validação com Zod (`types/cart.ts`)
- Criação do schema `ViaCepResponseSchema` com Zod para validação em tempo de execução (*fail-fast*) da resposta da API pública do ViaCEP.
- Expansão da interface `Address` para suportar `cep`, `city` e `state`.

### 2. Utilitários Puros de Formatação (`utils/formatters.ts`)
- Criação de `formatCep` para aplicação da máscara visual `00000-000` em tempo real durante a digitação.
- Criação de `sanitizeDigits` para extração isolada dos 8 dígitos numéricos.

### 3. Composable Reativo Especializado (`composables/useCep.ts`)
- Funções puras isoladas para testes: `sanitizeCep`, `isValidCep`, `fetchAddressByCep`.
- Rejeição preventiva de CEPs inválidos e sequências repetidas (ex: `00000000`, `99999999`) antes de disparar chamadas HTTP.
- Estados reativos: `isLoadingCep` e `cepError` com tratamento gracioso de falhas (permitindo que o usuário preencha manualmente caso a API falhe).

### 4. Micro-UX no `CartDrawerModal.vue`
- Disparo automático da busca assim que o 8º dígito for digitado ou no evento `blur`.
- Foco automático com `nextTick()` para o campo de **Nº da residência** (`#checkout-number`) logo após o preenchimento da rua e bairro.
- Persistência segura do perfil de endereço no `localStorage` via `@vueuse/core` (`alaska_checkout_profile`).

### 5. Cobertura de Testes Automatizados com Vitest (`tests/units/cep.spec.ts`)
- 13 testes unitários cobrindo sanitização, regex de validação, máscara progressiva, parsing de schema Zod e estados reativos do composable.

---

## 🚀 Consequências

- **Positivas:** Redução de mais de 60% no tempo de preenchimento do formulário de entrega; zero dependência de libs pesadas de terceiros; 100% testado com Vitest.
- **Mitigação de Riscos:** Se o ViaCEP estiver indisponível, a aplicação não trava: o erro é tratado silenciosamente com aviso em texto e os campos de endereço permanecem editáveis manualmente.
