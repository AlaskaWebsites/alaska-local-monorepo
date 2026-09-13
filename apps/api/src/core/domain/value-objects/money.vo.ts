import { InvalidMoneyAmountError } from '../errors/domain.error'

/**
 * Value Object imutável para tratamento monetário em centavos (evita imprecisão de ponto flutuante).
 */
export class Money {
  private readonly _cents: number

  private constructor(cents: number) {
    if (cents < 0) {
      throw new InvalidMoneyAmountError(cents / 100)
    }
    this._cents = Math.round(cents)
  }

  static fromCents(cents: number): Money {
    return new Money(cents)
  }

  static fromDecimal(amount: number): Money {
    return new Money(amount * 100)
  }

  static zero(): Money {
    return new Money(0)
  }

  get amount(): number {
    return this._cents / 100
  }

  get inCents(): number {
    return this._cents
  }

  get cents(): number {
    return this._cents
  }

  add(other: Money): Money {
    return new Money(this._cents + other._cents)
  }

  subtract(other: Money): Money {
    return new Money(this._cents - other._cents)
  }

  multiply(multiplier: number): Money {
    return new Money(this._cents * multiplier)
  }

  equals(other: Money): boolean {
    return this._cents === other._cents
  }

  formatBRL(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this.amount)
  }
}
