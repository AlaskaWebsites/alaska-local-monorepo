import { describe, it, expect } from 'vitest'
import { PixKey } from '@core/domain/value-objects/pix-key.vo'
import { ValidationError } from '@core/domain/errors/domain.error'

describe('Unit: Value Object PixKey', () => {
  it('deve sanitizar telefone e formatar para exibição', () => {
    const key = new PixKey('(11) 98888-7777', 'phone')
    expect(key.value).toBe('11988887777')
    expect(key.formatDisplay()).toBe('(11) 98888-7777')
  })

  it('deve aceitar chave de email sem alterações', () => {
    const key = new PixKey('financeiro@loja.com.br', 'email')
    expect(key.value).toBe('financeiro@loja.com.br')
    expect(key.keyType).toBe('email')
  })

  it('deve lançar erro se a chave for vazia', () => {
    expect(() => new PixKey('', 'phone')).toThrow(ValidationError)
  })
})
