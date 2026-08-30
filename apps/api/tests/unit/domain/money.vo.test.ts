import { describe, it, expect } from 'vitest'
import { Money } from '@core/domain/value-objects/money.vo'
import { InvalidMoneyAmountError } from '@core/domain/errors/domain.error'

describe('Unit: Value Object Money', () => {
  it('deve criar valor em centavos e converter para decimal corretamente', () => {
    const m = Money.fromCents(2590)
    expect(m.amount).toBe(25.90)
    expect(m.inCents).toBe(2590)
  })

  it('deve criar a partir de decimal e arredondar centavos', () => {
    const m = Money.fromDecimal(89.99)
    expect(m.inCents).toBe(8999)
    expect(m.amount).toBe(89.99)
  })

  it('deve somar valores monetários com precisão absoluta', () => {
    const m1 = Money.fromDecimal(10.10)
    const m2 = Money.fromDecimal(20.20)
    const sum = m1.add(m2)
    expect(sum.amount).toBe(30.30)
    expect(sum.inCents).toBe(3030)
  })

  it('deve lançar InvalidMoneyAmountError para valores negativos', () => {
    expect(() => Money.fromCents(-100)).toThrow(InvalidMoneyAmountError)
  })

  it('deve formatar para moeda brasileira BRL', () => {
    const m = Money.fromDecimal(150.50)
    const formatted = m.formatBRL()
    expect(formatted).toContain('150,50')
  })
})
