import { describe, it, expect } from 'vitest'
import {
  CreateBookingSchema,
  BookingStatusSchema,
  UpdateBookingStatusSchema,
} from '../src/booking'

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

  describe('UpdateBookingStatusSchema (ADR 013 / Fase 2)', () => {
    it('deve validar todos os status operacionais do agendamento', () => {
      const validStatuses = [
        'scheduled',
        'confirmed',
        'completed',
        'cancelled',
        'no_show',
      ] as const

      validStatuses.forEach((status) => {
        expect(BookingStatusSchema.parse(status)).toBe(status)
        expect(UpdateBookingStatusSchema.parse({ status })).toEqual({ status })
      })
    })

    it('deve rejeitar status inválido no UpdateBookingStatusSchema', () => {
      expect(() => UpdateBookingStatusSchema.parse({ status: 'in_progress' })).toThrow()
      expect(() => UpdateBookingStatusSchema.parse({})).toThrow()
    })
  })
})
