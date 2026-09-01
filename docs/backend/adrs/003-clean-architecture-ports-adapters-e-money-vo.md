# ADR 003: Adoção de Clean Architecture (Ports & Adapters) e Money Value Object no Backend

## Status
**Aceito e Implementado** (2026-09-01)

## Contexto
O ecossistema Alaska Local opera simultaneamente 4 verticais com transações de pedidos e agendamentos com sinal Pix. Para evitar problemas crônicos em sistemas e-commerce, tais como:
1. Acoplamento direto de regras de negócio a frameworks HTTP ou ORMs específicos.
2. Erros de arredondamento de ponto flutuante em somas de pedidos e taxas de entrega.
3. Dificuldade de testar fluxos de negócio sem depender de banco de dados ativo.

## Decisão
1. **Clean Architecture (Hexagonal)**:
   - O domínio (`src/core/domain`) é 100% puro e sem dependências externas.
   - Todos os casos de uso comunicam-se com a infraestrutura apenas por meio de interfaces de portas (`ports/`) injetadas via tokens de injeção.
2. **Money Value Object**:
   - Todo valor monetário é encapsulado na classe `Money`, armazenando e calculando valores exclusivamente como centavos inteiros (`price_cents INT`).
3. **Validação Fail-Fast com Zod**:
   - DTOs são validados no pipe HTTP via schemas compartilhados de `@alaska/contracts`.

## Consequências

### Positivas
- **Imutabilidade e Precisão Financeira**: Erros de arredondamento de centavos são impossíveis por design.
- **Velocidade de Testes**: Suíte de testes unitários roda em milissegundos sem depender de banco.
- **Portabilidade**: O backend pode trocar de banco de dados ou framework HTTP sem alterar uma única linha de regras de negócio.
