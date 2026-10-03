# Governança de Escopo Estrito e Protocolo Anti-Regressão

> **Diretriz Arquitetural Mandatória para Agentes de IA, LLMs e Engenharia no Monorepo**  
> Ecossistema Alaska Local (`AlaskaWebsites/alaska-local-monorepo`)

---

## 🎯 1. Objetivo & Motivação

O ecossistema **Alaska Local** opera com um modelo de evolução contínua, onde dezenas de decisões de arquitetura (ADRs), otimizações de performance, contratos de acessibilidade WCAG 2.1 AA e tratamentos defensivos são agregados diariamente no código.

Em fluxos de engenharia assistida por agentes de IA e LLMs via Model Context Protocol (MCP), um dos problemas mais críticos e custosos é a **alucinação regressiva**:
- O agente, ao receber a solicitação de criar uma feature A ou corrigir um detalhe B, reescreve arquivos inteiros a partir da memória volátil ou de contextos antigos da janela de atenção, **apagando silenciosamente métodos, props, emits, sanitizações Zod e funcionalidades criadas em dias ou ciclos anteriores**.
- O agente realiza **refatorações oportunistas não solicitadas** em módulos periféricos ("já que estou mexendo aqui, vou limpar aquele arquivo"), introduzindo efeitos colaterais e quebrando fluxos estáveis.

Este documento estabelece as **Travas de Escopo Cirúrgico e o Protocolo Anti-Regressão**, com aplicação estrita e mandatória antes de qualquer commit ou modificação de arquivos.

---

## 🛡️ 2. As 5 Regras Invioláveis de Escopo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       FLUXO DA TRAVA DE ESCOPO                              │
│                                                                             │
│  1. ESCOPO CIRÚRGICO  ──►  2. PRÉ-LEITURA HEAD  ──►  3. PRESERVAÇÃO TOTAL   │
│  (Apenas o solicitado)     (Ler arquivo na main)     (100% código mantido)  │
│                                                                             │
│                                      │                                      │
│                                      ▼                                      │
│                            4. VERIFICAÇÃO DIFF                              │
│                            ("Só mudei o pedido?")                           │
│                                      │                                      │
│                                      ▼                                      │
│                            5. PORTÃO DE TESTES                              │
│                            (pnpm test & validate)                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Regra 1: Princípio do Escopo Cirúrgico Mínimo (Strict Scope Boundary)
- **Alterações Estritamente Solicitadas**: O agente deve alterar **única e exclusivamente** os arquivos, componentes ou funções diretamente necessários para atender à instrução do usuário.
- **Tolerância Zero para Refatorações Oportunistas**: É terminantemente proibido renomear variáveis, reordenar imports, alterar convenções de estilo, "simplificar" métodos ou reformatar arquivos alheios ao escopo do pedido.
- **Sem Efeitos Colaterais**: Se o usuário pediu para ajustar a cor de um botão em `StoreHeroBanner.vue`, o agente não tem permissão para alterar `StoreHeaderCard.vue` ou `useCart.ts`.

### Regra 2: Protocolo de Pré-Leitura Obrigatória do HEAD (Read Before Write Lock)
- **Proibição de Escrita Cega**: O agente é estritamente proibido de gerar o conteúdo de um arquivo baseado na memória de turnos anteriores ou em snippets parciais.
- **Inspeção Prévia no GitHub**: Antes de tocar em qualquer arquivo existente, deve-se invocar `get_file_contents` para obter o código exato da branch `main`.
- **Inspeção de Commits Recentes do Arquivo**: Para arquivos de alta densidade (`admin.vue`, `useMerchantAdmin.ts`, `pages/[slug]/index.vue`, `StoreHeaderCard.vue`, `TenantController.ts`), o agente deve consultar `list_commits` filtrando pelo `path` do arquivo para entender os últimos contratos e correções implementados.

### Regra 3: Preservação Sagrada do Código Existente (Preserve & Extend)
- **Manutenção de 100% dos Contratos Anteriores**: Todas as funções, computadas, métodos defensivos, props, emits e tipagens já presentes no arquivo DEVE SER PRESERVADOS integralmente.
- **Proibição de Reversão Silenciosa**: Nunca desfaça lógicas consolidadas (ex: deduplicação de produtos, categorias dinâmicas, suporte polimórfico de props, modais acessíveis, sanitização de LocalStorage com `safeParse`).
- **Exclusão Justificada**: Linhas de código existentes só podem ser removidas se forem a causa raiz explícita do bug relatado ou se o usuário tiver solicitado a remoção textualmente.

### Regra 4: Verificação Mental de Diff antes de Persistir
- Antes de disparar `push_files` ou `create_or_update_file`, o agente deve executar o checklist de auto-auditoria:
  1. *O que foi alterado além do que o usuário pediu?* (Resposta esperada: **Nada**).
  2. *Alguma função ou propriedade pré-existente foi apagada ou simplificada?* (Resposta esperada: **Não**).
  3. *Os contratos com outros componentes continuam intactos?* (Resposta esperada: **Sim**).

### Regra 5: Portão de Testes e Validação Determinística
- Toda entrega deve ser validada contra a suíte de testes unitários (`pnpm test:api`, `pnpm test`) e scripts de validação (`node apps/web/scripts/validate-tenants.mjs`). Nenhuma tarefa é declarada pronta com testes falhando ou regredidos.

---

## 📋 3. Matriz de Decisão: O que Pode vs O que Não Pode

| Situação | Ação Permitida? | Conduta Obrigatória |
| :--- | :---: | :--- |
| Adicionar um novo campo no formulário do Admin | ✅ Permitido | Adicionar o campo mantendo todos os outros campos, validações e computadas intactos. |
| Corrigir um bug no `useCart.ts` e aproveitar para "refatorar" o `useBookingSlots.ts` | ❌ Proibido | Alterar estritamente o `useCart.ts`. Manter o `useBookingSlots.ts` 100% intocado. |
| Sobrescrever um componente Vue a partir do código visto em mensagens antigas | ❌ Proibido | Ler primeiro o código atualizado da branch `main` via `get_file_contents`. |
| Substituir métodos auxiliares defensivos por chamadas diretas | ❌ Proibido | Preservar os fallbacks defensivos (`resolve*`, defaults, `safeParse`). |
| Apagar uma rota ou DTO porque parece "não utilizada" sem pedido do usuário | ❌ Proibido | Manter a rota/DTO. Solicitar confirmação ao usuário caso identifique código morto. |

---

## 🔗 4. Integração com Habilidades e Ferramentas

Esta diretriz está incorporada diretamente nas habilidades:
- **`user:alaska-local`**: Seção 7 (*Trava de Escopo Cirúrgico e Protocolo Anti-Regressão*).
- **`user:alaska-local-harness`**: Portão 4 (*Trava de Escopo Cirúrgico e Anti-Regressão*).
- **ADRs Associados**: [ADR 015 (Backend)](../backend/adrs/015-governanca-de-escopo-cirurgico-e-prevencao-de-regressoes.md) e [ADR 028 (Frontend)](../frontend/adrs/028-governanca-de-escopo-cirurgico-e-prevencao-de-regressoes.md).
