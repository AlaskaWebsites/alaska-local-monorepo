# ADR 015: Governança de Escopo Cirúrgico e Prevenção de Regressões no Backend

## Status
**Aprovado e Implementado** — Outubro de 2026

## Contexto
O backend da Alaska Local (`@alaska/api`) possui arquitetura hexagonal estrita com dezenas de use cases, entidades DDD puras, Value Objects imutáveis e persistência relacional com PostgreSQL e RLS. Durante o desenvolvimento contínuo via agentes de IA e LLMs, identificou-se o risco de alterações em controladores ou use cases resultarem na remoção acidental de validações de borda, substituição de DTOs tipados por tipos anêmicos ou reversão de lógicas de domínio consolidadas.

Para blindar o backend contra regressões acidentais, formaliza-se a política de **Escopo Cirúrgico Mínimo e Anti-Regressão**.

---

## Decisão de Arquitetura

### 1. Limite Estrito de Mutações (Strict Scope)
- Toda alteração no backend deve se restringir ao caso de uso, porta, adaptador ou controlador diretamente envolvido na solicitação.
- Proibido alterar schemas compartilhados em `@alaska/contracts` a menos que a nova feature exija explicitamente uma alteração de contrato combinada.

### 2. Protocolo Read Before Write no Backend
- Antes de editar qualquer arquivo em `apps/api/src/`, o agente deve inspecionar a versão atual na branch `main` e analisar os testes unitários correspondentes em `apps/api/tests/`.
- Proibido reimplementar controllers ou use cases de memória.

### 3. Preservação de Invariantes e Métodos de Ciclo de Vida
- Métodos canônicos introduzidos no domínio (como `updateStatus`, `cancel`, `changePassword`, `toggleAvailability`) e a utilização do Value Object `Money` em centavos inteiros são invariantes sagradas e NUNCA podem ser substituídos por mutações diretas de propriedades.

### 4. Portão de Testes Automatizados
- Toda modificação deve passar com 100% de sucesso na suíte de testes unitários do backend (`pnpm test:api` com 108 testes em 31 arquivos).

---

## Consequências & Benefícios

- **Zero Regressão**: Proteção contra exclusão acidental de endpoints, validações ou regras de negócio.
- **Estabilidade do Core**: As camadas de domínio e aplicação mantêm-se puras e protegidas contra refatorações não autorizadas.
