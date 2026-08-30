import { describe, it, expect } from 'vitest'
import { TenantSchema, TenantCategorySchema, TenantThemeSchema, OpeningHoursSchema } from '../src/tenant'

describe('Tenant Schemas (@alaska/contracts/tenant)', () => {
  it('deve aceitar as 4 verticais canônicas', () => {
    const categories = ['menu', 'shop', 'hub', 'pro']
    categories.forEach((cat) => {
      expect(TenantCategorySchema.parse(cat)).toBe(cat)
    })
    expect(() => TenantCategorySchema.parse('invalid_category')).toThrow()
  })

  it('deve aceitar todos os 11 temas cromáticos do design system', () => {
    const themes = [
      'food', 'barber', 'health', 'drinks', 'rose',
      'amber', 'violet', 'blue', 'emerald', 'slate', 'default'
    ]
    themes.forEach((theme) => {
      expect(TenantThemeSchema.parse(theme)).toBe(theme)
    })
    expect(() => TenantThemeSchema.parse('neon_pink')).toThrow()
  })

  it('deve validar horários com suporte a turnos noturnos', () => {
    const openingHours = {
      friday: { open: '18:00', close: '04:00' },
      saturday: { open: '18:00', close: '04:00' },
      sunday: { open: '12:00', close: '22:00' },
    }
    expect(OpeningHoursSchema.parse(openingHours)).toBeDefined()
  })
})
