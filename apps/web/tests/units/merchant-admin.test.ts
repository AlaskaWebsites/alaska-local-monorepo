import { describe, it, expect, beforeEach } from 'vitest'
import { useMerchantAdmin } from '~/composables/useMerchantAdmin'
import type { Product } from '@alaska/contracts'

describe('Unit: useMerchantAdmin Composable (ADR 013)', () => {
  const slug = 'barbearia-style'

  let mockProducts: Product[] = []

  beforeEach(() => {
    mockProducts = [
      {
        id: 'prod-corte',
        name: 'Corte Degradé',
        description: 'Fade navalhado',
        price: 45.0,
        isAvailable: true,
        categoryId: 'cat-1'
      }
    ]
  })

  it('deve realizar login com PIN válido', () => {
    const admin = useMerchantAdmin(slug)
    const success = admin.login('1234')
    expect(success).toBe(true)
    expect(admin.isAuthenticated.value).toBe(true)
  })

  it('deve permitir atualizar o PIN de acesso da loja', () => {
    const admin = useMerchantAdmin(slug)
    const updated = admin.updateAdminPin('5678')
    expect(updated).toBe(true)
    
    const overrides = admin.getOverrides()
    expect(overrides.customPin).toBe('5678')
  })

  it('deve salvar programação semanal de 7 dias com sucesso', () => {
    const admin = useMerchantAdmin(slug)
    admin.updateWeeklySchedule({
      monday: { open: '09:00', close: '20:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: true }
    })

    const overrides = admin.getOverrides()
    expect(overrides.openingHours?.sunday?.closed).toBe(true)
    expect(overrides.openingHours?.monday?.open).toBe('09:00')
  })

  it('deve gerenciar disponibilidade e folga de barbeiros', () => {
    const admin = useMerchantAdmin(slug)
    admin.toggleProfessionalAvailability('prof-1', false)
    admin.updateProfessionalDays('prof-1', [2, 3, 4, 5, 6])

    const overrides = admin.getOverrides()
    expect(overrides.professionals?.['prof-1']?.isAvailable).toBe(false)
    expect(overrides.professionals?.['prof-1']?.availableDays).toEqual([2, 3, 4, 5, 6])
  })
})
