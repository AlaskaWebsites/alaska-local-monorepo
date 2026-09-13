# Tratamento de Erros de Domínio & Padrão RFC 7807 — Alaska Local Backend

Este guia documenta como o backend padroniza erros de aplicação e regras de negócio seguindo a especificação internacional **RFC 7807 (Problem Details for HTTP APIs)** através do `DomainExceptionFilter`.

---

## 1. Filosofia: Erros de Domínio Puros

Na Clean Architecture adotada pelo ecossistema Alaska Local, a camada de regras de negócio (`src/core/domain/`) **nunca lança exceções HTTP do NestJS** (`BadRequestException`, `NotFoundException`, etc.).

Em vez disso, o domínio define exceções puras TypeScript herdadas da classe abstrata `DomainError`:

```ts
// src/core/domain/errors/domain.error.ts
export abstract class DomainError extends Error {
  abstract readonly code: string
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}
```

### Exceções Canônicas de Domínio:
1. **`EntityNotFoundError`**:
   - Disparada quando um estabelecimento, produto, pedido ou agendamento não é localizado.
   - Código: `ENTITY_NOT_FOUND`.
2. **`ValidationError`**:
   - Disparada quando uma regra de negócio ou invariante é violada (ex: sacola vazia, agendamento sem serviço, pedido fora do horário).
   - Código: `VALIDATION_ERROR` (suporta payload de `details`).
3. **`InvalidMoneyAmountError`**:
   - Disparada quando há tentativa de instanciar o `Money` VO com centavos negativos.
   - Código: `INVALID_MONEY_AMOUNT`.

---

## 2. O Interceptor `DomainExceptionFilter` (RFC 7807)

O `DomainExceptionFilter` atua como uma barreira na camada HTTP do NestJS. Ele intercepta qualquer `DomainError` e formata a resposta JSON segundo a RFC 7807:

```json
{
  "type": "https://alaska.app/errors/ENTITY_NOT_FOUND",
  "title": "Recurso Não Encontrado",
  "status": 404,
  "detail": "Tenant com identificador 'loja-inexistente' não foi encontrado.",
  "instance": "/api/tenants/loja-inexistente",
  "timestamp": "2026-09-13T04:20:00.000Z"
}
```

### Mapeamento de Códigos de Status HTTP:

| Exceção de Domínio | Status HTTP | Descrição do Erro |
| :--- | :--- | :--- |
| `EntityNotFoundError` | **404 Not Found** | O identificador solicitado não existe no banco. |
| `ValidationError` | **400 Bad Request** | Dados de entrada ou regras de negócio inválidas. |
| `InvalidMoneyAmountError` | **400 Bad Request** | Valor monetário negativo ou corrompido. |
| Exceções não tratadas | **500 Internal Server Error** | Erro inesperado (logado no servidor sem vazar stack trace). |

---

## 3. Validação de Entrada na Borda com `ZodValidationPipe`

Antes que a requisição chegue aos casos de uso, o `ZodValidationPipe` valida os dados de entrada usando os schemas de `@alaska/contracts`:

* Se o payload for inválido, o pipe lança imediatamente um `BadRequestException` contendo o mapa de erros por campo (`result.error.flatten().fieldErrors`).
* Isso impede que dados inválidos alcancem o domínio da aplicação (*Fail-Fast Principle*).
