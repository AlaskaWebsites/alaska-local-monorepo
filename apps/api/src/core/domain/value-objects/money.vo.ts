import { InvalidMoneyAmountError } from '../errors/domain.error'

/**
 * Value Object imutável para tratamento monetário em centavos (evita imprecisão de ponto flutuante).
 */
export class Money {
  private readonly cents: number

  private constructor(cents: number) {
    if (cents < 0) {
      throw new InvalidMoneyAmountError(cents / 100)
    }
    this.cents = Math.round(cents)
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
    return this.cents / 100
  }

  get inCents(): number {
    return this.cents
  }

  add(other: Money): Money {
    return new Money(this.cents + other.cents)
  }

  subtract(other: Money): Money {
    return new Money(this.cents - other.cents)
  }

  multiply(multiplier: number): Money {
    return new Money(this.cents * multiplier)
  }

  equals(other: Money): boolean {
    return this.cents === other.cents
  }

  formatBRL(): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(this.amount)
  }
}
