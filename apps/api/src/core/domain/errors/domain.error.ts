export abstract class DomainError extends Error {
  abstract readonly code: string
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class EntityNotFoundError extends DomainError {
  readonly code = 'ENTITY_NOT_FOUND'
  constructor(entityName: string, identifier: string) {
    super(`${entityName} com identificador '${identifier}' não foi encontrado.`)
  }
}

export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR'
  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message)
  }
}

export class InvalidMoneyAmountError extends DomainError {
  readonly code = 'INVALID_MONEY_AMOUNT'
  constructor(amount: number) {
    super(`O valor monetário informado (${amount}) é inválido. Não são permitidos valores negativos.`)
  }
}
