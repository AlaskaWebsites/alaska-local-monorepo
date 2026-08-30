// tests/units/booking-schema.test.ts
import { describe, it, expect } from 'vitest'
import {
  ProfessionalSchema,
  BookingServiceSchema,
  BookingSlotSchema,
  BookingDaySchema,
  BookingAppointmentPayloadSchema,
} from '~/types/booking'

describe('Unit: Schemas Zod de Agendamento (types/booking.ts)', () => {
  describe('1. ProfessionalSchema', () => {
    it('deve validar profissional com todos os campos preenchidos', () => {
      const mock = {
        id: 'prof-1',
        name: 'Lucas Mendes',
        role: 'Barbeiro Master',
        avatar: 'https://images.unsplash.com/avatar.jpg',
        available: true,
      }
      const parsed = ProfessionalSchema.parse(mock)
      expect(parsed.id).toBe('prof-1')
      expect(parsed.name).toBe('Lucas Mendes')
      expect(parsed.role).toBe('Barbeiro Master')
      expect(parsed.available).toBe(true)
    })

    it('deve aplicar defaults para campos opcionais omitidos', () => {
      const mock = {
        id: 'prof-2',
        name: 'Marcos Silva',
      }
      const parsed = ProfessionalSchema.parse(mock)
      expect(parsed.role).toBe('Profissional')
      expect(parsed.available).toBe(true)
      expect(parsed.avatar).toBeUndefined()
    })

    it('deve rejeitar objeto sem nome ou sem id', () => {
      expect(() => ProfessionalSchema.parse({ id: 'prof-3' })).toThrow()
      expect(() => ProfessionalSchema.parse({ name: 'Nome' })).toThrow()
    })
  })

  describe('2. BookingServiceSchema', () => {
    it('deve validar um serviço de agendamento válido', () => {
      const mock = {
        id: 'serv-1',
        name: 'Corte Degradê Navalhado',
        description: 'Fade com acabamento navalhado',
        price: 45.0,
        durationMinutes: 40,
        professionalIds: ['prof-1', 'prof-2'],
      }
      const parsed = BookingServiceSchema.parse(mock)
      expect(parsed.id).toBe('serv-1')
      expect(parsed.price).toBe(45.0)
      expect(parsed.durationMinutes).toBe(40)
    })

    it('deve aplicar default de 30 min para durationMinutes e array vazio para professionalIds', () => {
      const mock = {
        id: 'serv-2',
        name: 'Barba Terapia',
        price: 35.0,
      }
      const parsed = BookingServiceSchema.parse(mock)
      expect(parsed.durationMinutes).toBe(30)
      expect(parsed.professionalIds).toEqual([])
      expect(parsed.description).toBe('')
    })

    it('deve rejeitar serviço com preço negativo', () => {
      expect(() =>
        BookingServiceSchema.parse({
          id: 'serv-err',
          name: 'Inválido',
          price: -10,
        })
      ).toThrow()
    })
  })

  describe('3. BookingSlotSchema', () => {
    it('deve validar slot no formato HH:mm com status de disponibilidade', () => {
      const valid1 = BookingSlotSchema.parse({ time: '14:30', available: true })
      expect(valid1.time).toBe('14:30')
      expect(valid1.available).toBe(true)
      expect(valid1.reason).toBe('available')

      const valid2 = BookingSlotSchema.parse({ time: '15:00', available: false, reason: 'booked' })
      expect(valid2.available).toBe(false)
      expect(valid2.reason).toBe('booked')

      const valid3 = BookingSlotSchema.parse({ time: '09:00', available: false, reason: 'past' })
      expect(valid3.reason).toBe('past')
    })

    it('deve rejeitar horários com formato inválido', () => {
      expect(() => BookingSlotSchema.parse({ time: '2:30 PM' })).toThrow()
      expect(() => BookingSlotSchema.parse({ time: '900' })).toThrow()
      expect(() => BookingSlotSchema.parse({ time: 'invalid' })).toThrow()
    })
  })

  describe('4. BookingDaySchema', () => {
    it('deve validar dia do calendário com metadados de mês e semana', () => {
      const mock = {
        dateStr: '27/08/2026',
        isoDate: '2026-08-27',
        dayNumber: 27,
        monthName: 'Agosto',
        monthShort: 'Ago',
        year: 2026,
        displayDate: '27/08',
        weekDay: 'Hoje',
        isToday: true,
        isClosed: false,
      }
      const parsed = BookingDaySchema.parse(mock)
      expect(parsed.dateStr).toBe('27/08/2026')
      expect(parsed.monthName).toBe('Agosto')
      expect(parsed.isToday).toBe(true)
      expect(parsed.isClosed).toBe(false)
    })
  })

  describe('5. BookingAppointmentPayloadSchema', () => {
    it('deve validar um payload completo de agendamento para despacho WhatsApp', () => {
      const mock = {
        tenantName: 'Barbearia Style',
        customerName: 'Danilo Gozzi',
        customerPhone: '11999999999',
        date: '30/08/2026',
        time: '15:30',
        services: [
          {
            id: 'serv-1',
            name: 'Corte Degradê',
            price: 45,
            durationMinutes: 40,
          },
        ],
        totalDurationMinutes: 40,
        totalPrice: 45,
      }
      const parsed = BookingAppointmentPayloadSchema.parse(mock)
      expect(parsed.tenantName).toBe('Barbearia Style')
      expect(parsed.customerName).toBe('Danilo Gozzi')
      expect(parsed.paymentMethod).toBe('Pix')
      expect(parsed.services.length).toBe(1)
    })

    it('deve rejeitar agendamento sem nenhum serviço selecionado', () => {
      const mock = {
        tenantName: 'Barbearia Style',
        customerName: 'Danilo',
        customerPhone: '11999999999',
        date: '30/08/2026',
        time: '15:30',
        services: [],
        totalDurationMinutes: 0,
        totalPrice: 0,
      }
      expect(() => BookingAppointmentPayloadSchema.parse(mock)).toThrow()
    })
  })
})
