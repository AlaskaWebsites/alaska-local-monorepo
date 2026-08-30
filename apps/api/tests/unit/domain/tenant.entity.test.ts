import { describe, it, expect } from 'vitest'
import { Tenant } from '@core/domain/entities/tenant.entity'
import { ValidationError } from '@core/domain/errors/domain.error'

describe('Unit: Entidade Tenant (Clean Architecture)', () => {
  const validProps = {
    id: 'ten-123',
    slug: 'karine-finardi',
    name: 'Karine Finardi Semijoias',
    description: 'Semijoias finas e revenda',
    phoneWhatsApp: '11999998888',
    address: 'Francisco Morato - SP',
    businessCategory: 'shop' as const,
    theme: 'rose' as const,
    openingHours: { open: '09:00', close: '19:00' },
    pixConfig: {
      key: '11999998888',
      keyType: 'phone' as const,
      beneficiary: 'Karine Finardi',
      city: 'FRANCISCO MORATO'
    }
  }

  it('deve instanciar uma entidade Tenant válida', () => {
    const tenant = new Tenant(validProps)
    expect(tenant.id).toBe('ten-123')
    expect(tenant.slug).toBe('karine-finardi')
    expect(tenant.name).toBe('Karine Finardi Semijoias')
    expect(tenant.businessCategory).toBe('shop')
    expect(tenant.isActive).toBe(true)
  })

  it('deve lançar erro se o slug for inválido', () => {
    expect(() => new Tenant({ ...validProps, slug: '' })).toThrow(ValidationError)
  })

  it('deve calcular status de abertura diurno corretamente', () => {
    const tenant = new Tenant(validProps)
    const midDay = new Date(2026, 7, 28, 14, 0)
    const night = new Date(2026, 7, 28, 22, 0)

    expect(tenant.isOpen(midDay)).toBe(true)
    expect(tenant.isOpen(night)).toBe(false)
  })

  it('deve calcular status de abertura noturno que cruza meia-noite', () => {
    const nightTenant = new Tenant({
      ...validProps,
      openingHours: { open: '18:00', close: '03:00' }
    })

    const evening = new Date(2026, 7, 28, 22, 0)
    const dawn = new Date(2026, 7, 28, 1, 30)
    const afternoon = new Date(2026, 7, 28, 15, 0)

    expect(nightTenant.isOpen(evening)).toBe(true)
    expect(nightTenant.isOpen(dawn)).toBe(true)
    expect(nightTenant.isOpen(afternoon)).toBe(false)
  })
})
