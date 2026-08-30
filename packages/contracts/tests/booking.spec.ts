import { describe, it, expect } from 'vitest'
import { CreateBookingSchema } from '../src/booking'

describe('Booking Schemas (@alaska/contracts/booking)', () => {
  it('deve validar agendamento com múltiplos serviços e upsell', () => {
    const validBooking = {
      tenantSlug: 'barbearia-style',
      serviceIds: ['serv-corte', 'serv-barba'],
      professionalId: 'prof-marcos',
      date: '2026-09-01',
      time: '14:30',
      customerName: 'Carlos Eduardo',
      customerPhone: '11977776666',
      upsellProductIds: ['prod-pomada'],
    }

    const parsed = CreateBookingSchema.parse(validBooking)
    expect(parsed.serviceIds).toHaveLength(2)
  })
})
