# 🤖 Framework de Engenharia Orientada a Agentes de IA (LLM-First & Test-Harness) — Alaska Local

> **Diretriz de Arquitetura de Software, Context Engineering e Desenvolvimento Assistido por IA**  
> **Versão:** 1.0.0  
> **Status:** Aprovado / Padrão Oficial  
> **Última Atualização:** 2026-08-27  

---

## 🎯 1. Filosofia: Por que "Contract-First & Test-Harness" é o Padrão Ouro para IA?

No desenvolvimento de software auxiliado por Grandes Modelos de Linguagem (LLMs), agentes autônomos e assistentes IDE (como Cursor, Claude Code e sparks), a abordagem ingênua de gerar código diretamente na interface de usuário (UI) sem contratos e sem testes leva invariavelmente a:
- **Alucinação de Schema:** O modelo inventa propriedades (ex: `item.options` em vez de `item.selectedOptions`).
- **Context Rot & Drift:** À medida que a conversa se estende, a IA perde contexto de decisões passadas e reintroduz bugs corrigidos anteriormente.
- **Regressões Silenciosas:** Mudanças em uma tela quebram contratos em componentes irmãos sem que o desenvolvedor perceba.

### 💡 A Solução: O Ciclo Determinístico em 5 Etapas
```
  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
  │ 1. ADR /     │ ──► │ 2. Schemas   │ ──► │ 3. Vitest    │ ──► │ 4. Lógica    │ ──► │ 5. Camada UI │
  │    Spec      │     │    Zod (Tipos│     │    Harness   │     │    Pura      │     │    & Build   │
  └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
   Regras de negócio    Fonte única de       Bancada de testes    Composables puros    Componentes Vue
   e decisões           verdade estrita      automatizados        desacoplados         finos + A11y
```

1. **ADR / Especificação Funcional:** Formaliza a intenção técnica e os limites do domínio antes de escrever qualquer código.
2. **Contratos Zod & Tipagem Estrita (Single Source of Truth):** Schemas que validam entradas em tempo de execução (*fail-fast*) e inferem tipos TypeScript estritos em tempo de compilação.
3. **Vitest como "Agent Harness" (Bancada de Verificação):** O agente de IA escreve e roda testes unitários contra os contratos antes de encostar na UI. O retorno do terminal (`PASS` / `FAIL`) fornece feedback objetivo sem ambiguidade.
4. **Composables e Lógica Pura Desacoplada:** Funções e hooks reativos puros testáveis sem necessidade de montar o DOM do navegador.
5. **Componentes Vue Finos & Validação de Build:** A UI apenas consome os composables blindados. O ciclo se encerra com `npx vitest run` e validação de acessibilidade W3C/WCAG.

---

## 🏗️ 2. Os Pilares de um Agente de IA de Alta Performance

### 1. Harness (A Bancada de Testes Automatizados)
Um LLM é um motor probabilístico de geração de tokens. Para torná-lo um engenheiro confiável, é indispensável colocá-lo dentro de um **Harness Determinístico**.
- O agente não precisa "adivinhar" se o cálculo de horários de agendamento está certo. Ele executa `npx vitest run tests/units/booking-slots.test.ts`. Se falhar, o relatório de erro indica exatamente a linha e a asserção divergente.

### 2. Context Window & MCP (Model Context Protocol)
- O MCP permite que o agente acesse ferramentas cirúrgicas do ambiente (inspeção de arquivos, leitura de commits, ferramentas de busca e execução).
- **Regra de Ouro de Contexto:** Mantenha os arquivos modulares e pequenos (< 300 linhas). Arquivos monolíticos causam saturação de contexto e perda de atenção do modelo.

### 3. Build Gate & Tipagem Estrita
- TypeScript no modo estrito (`strict: true`) e Zod atuam como compiladores e guardas de integridade estrutural.

---

## 📋 3. Checklist Obrigatório para Criação de Novas Funcionalidades

Toda nova feature no ecossistema Alaska Local deve seguir rigorosamente a ordem:

- [ ] **Etapa 1:** Criar ou atualizar a documentação arquitetural (`docs/architecture/` ou `docs/adrs/`).
- [ ] **Etapa 2:** Criar o schema Zod e as interfaces TypeScript em `types/`.
- [ ] **Etapa 3:** Criar a suíte de testes unitários com Vitest em `tests/units/` cobrindo casos válidos, inválidos e limites (*boundary testing*).
- [ ] **Etapa 4:** Implementar o composable com lógica pura em `composables/`.
- [ ] **Etapa 5:** Executar `npx vitest run` para garantir **100% de aprovação (Green)**.
- [ ] **Etapa 6:** Implementar ou conectar os componentes visuais em `components/` ou `pages/` aplicando padrões W3C/WCAG (`role="dialog"`, `aria-modal`, `useBodyScrollLock`).
- [ ] **Etapa 7:** Executar a suíte completa de testes de regressão global.

---

## 🚫 4. Anti-Padrões Proibidos para Agentes de IA

| Anti-Padrão | Por que é Danoso? | O que Fazer no Lugar |
| :--- | :--- | :--- |
| **Big Bang Coding** | Criar arquivos de 600 linhas misturando types, tela, API e regras de uma só vez. | Quebrar em Contrato Zod → Composable Puro → Componente UI. |
| **Type Assertion Preguiçosa (`any` / `as unknown`)** | Mascara erros em tempo de compilação que estouram no navegador do cliente. | Usar `z.infer` e tipagem estrita em todas as props e retornos. |
| **Testes Acoplados ao DOM do Navegador** | Testes lentos e frágeis que quebram com mudanças cosméticas de Tailwind. | Testar funções puras, schemas e composables no Vitest. |
| **Falta de Fallback em Dados Externos** | APIs como ViaCEP ou Unsplash fora do ar travam a aplicação inteira. | Tratamento gracioso com try/catch, `@error` em imagens e inputs manuais. |
