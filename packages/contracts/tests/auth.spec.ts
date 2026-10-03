import { describe, it, expect } from 'vitest'
import {
  MerchantCredentialsLoginSchema,
  ChangeMerchantPasswordSchema,
  CreateMerchantUserSchema,
  MerchantSessionSchema,
} from '../src/auth'

describe('Merchant Auth Schemas (@alaska/contracts/auth)', () => {
  describe('MerchantCredentialsLoginSchema', () => {
    it('deve validar login com e-mail, senha e slug válidos', () => {
      const payload = {
        email: '  DONO@HAMBURGUERIA.COM.BR  ',
        password: 'minhasenhasegura',
        tenantSlug: '  HAMBURGUERIA-X  ',
      }
      const parsed = MerchantCredentialsLoginSchema.parse(payload)
      expect(parsed.email).toBe('dono@hamburgueria.com.br')
      expect(parsed.tenantSlug).toBe('hamburgueria-x')
      expect(parsed.password).toBe('minhasenhasegura')
    })

    it('deve rejeitar e-mail inválido', () => {
      const invalid = {
        email: 'nao-e-um-email',
        password: '12345678',
        tenantSlug: 'hamburgueria-x',
      }
      expect(() => MerchantCredentialsLoginSchema.parse(invalid)).toThrow('E-mail corporativo inválido')
    })

    it('deve rejeitar senha com menos de 6 caracteres', () => {
      const invalid = {
        email: 'dono@loja.com.br',
        password: '123',
        tenantSlug: 'hamburgueria-x',
      }
      expect(() => MerchantCredentialsLoginSchema.parse(invalid)).toThrow('A senha deve ter no mínimo 6 caracteres')
    })
  })

  describe('ChangeMerchantPasswordSchema', () => {
    it('deve aceitar troca de senha quando a nova senha e a confirmação coincidem', () => {
      const payload = {
        currentPassword: 'SenhaAtual123',
        newPassword: 'NovaSenhaForte2026',
        confirmPassword: 'NovaSenhaForte2026',
      }
      const parsed = ChangeMerchantPasswordSchema.parse(payload)
      expect(parsed.newPassword).toBe('NovaSenhaForte2026')
    })

    it('deve rejeitar quando a nova senha e a confirmação são diferentes', () => {
      const payload = {
        currentPassword: 'SenhaAtual123',
        newPassword: 'NovaSenhaForte2026',
        confirmPassword: 'SenhaDiferente999',
      }
      expect(() => ChangeMerchantPasswordSchema.parse(payload)).toThrow(
        'A nova senha e a confirmação não coincidem'
      )
    })

    it('deve rejeitar nova senha com menos de 8 caracteres', () => {
      const payload = {
        currentPassword: 'SenhaAtual123',
        newPassword: '1234567',
        confirmPassword: '1234567',
      }
      expect(() => ChangeMerchantPasswordSchema.parse(payload)).toThrow(
        'A nova senha deve ter no mínimo 8 caracteres'
      )
    })
  })

  describe('CreateMerchantUserSchema', () => {
    it('deve validar criação manual de lojista pelo superadmin', () => {
      const payload = {
        email: 'CONTATO@BAMATEC.COM.BR',
        tenantSlug: 'BAMATEC',
        initialPassword: 'ProvisoriaBama2026',
        name: 'Carlos Bama',
      }
      const parsed = CreateMerchantUserSchema.parse(payload)
      expect(parsed.email).toBe('contato@bamatec.com.br')
      expect(parsed.tenantSlug).toBe('bamatec')
      expect(parsed.name).toBe('Carlos Bama')
    })
  })

  describe('MerchantSessionSchema', () => {
    it('deve validar payload de sessão ativa', () => {
      const session = {
        token: 'jwt.mock.token',
        userId: 'usr-123',
        tenantId: 'ten-bamatec',
        tenantSlug: 'bamatec',
        email: 'bamatec22@gmail.com',
        role: 'merchant',
        expiresAt: '2026-10-04T00:00:00.000Z',
      }
      const parsed = MerchantSessionSchema.parse(session)
      expect(parsed.role).toBe('merchant')
    })
  })
})
