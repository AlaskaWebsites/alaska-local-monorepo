import { describe, it, expect } from 'vitest'
import { MoneyCentsSchema, CepSchema, AddressSchema } from '../src/common'

describe('Common Schemas (@alaska/contracts/common)', () => {
  describe('MoneyCentsSchema', () => {
    it('deve aceitar inteiros não-negativos representando centavos', () => {
      expect(MoneyCentsSchema.parse(0)).toBe(0)
      expect(MoneyCentsSchema.parse(1500)).toBe(1500)
      expect(MoneyCentsSchema.parse(9990)).toBe(9990)
    })

    it('deve rejeitar números decimais de ponto flutuante e negativos', () => {
      expect(() => MoneyCentsSchema.parse(15.99)).toThrow()
      expect(() => MoneyCentsSchema.parse(-100)).toThrow()
      expect(() => MoneyCentsSchema.parse('1500')).toThrow()
    })
  })

  describe('CepSchema', () => {
    it('deve aceitar CEP com ou sem hífen', () => {
      expect(CepSchema.parse('01310-100')).toBe('01310-100')
      expect(CepSchema.parse('01310100')).toBe('01310100')
    })

    it('deve rejeitar CEPs com quantidade incorreta de dígitos', () => {
      expect(() => CepSchema.parse('1234')).toThrow()
      expect(() => CepSchema.parse('123456789')).toThrow()
      expect(() => CepSchema.parse('ABCDE-FGH')).toThrow()
    })
  })

  describe('AddressSchema', () => {
    it('deve validar um endereço completo', () => {
      const validAddress = {
        street: 'Avenida Paulista',
        number: '1000',
        complement: 'Apto 42',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
      }
      expect(AddressSchema.parse(validAddress)).toEqual(validAddress)
    })
  })
})
