// tests/units/booking-slots.test.ts
import { describe, it, expect } from 'vitest'
import {
  timeToMinutes,
  minutesToTime,
  generateTimeSlots,
  calculateTotalDuration,
  calculateTotalPrice,
  generateBookingDays,
  getMockBookedSlotsForDate,
  formatBookingWhatsAppMessage,
} from '~/composables/useBookingSlots'
import type { BookingService, BookingAppointmentPayload } from '~/types/booking'

describe('Unit: Lógica de Agendamentos, Calendário e Slots (useBookingSlots.ts)', () => {
  describe('1. Conversão de Horários', () => {
    it('deve converter corretamente HH:mm para minutos a partir da meia-noite', () => {
      expect(timeToMinutes('00:00')).toBe(0)
      expect(timeToMinutes('09:30')).toBe(570)
      expect(timeToMinutes('14:45')).toBe(885)
      expect(timeToMinutes('23:59')).toBe(1439)
    })

    it('deve converter minutos para formato HH:mm com zero à esquerda', () => {
      expect(minutesToTime(0)).toBe('00:00')
      expect(minutesToTime(570)).toBe('09:30')
      expect(minutesToTime(885)).toBe('14:45')
      expect(minutesToTime(1439)).toBe('23:59')
    })
  })

  describe('2. Geração Contínua de Dias de Calendário', () => {
    it('deve gerar 30 dias contínuos a partir de uma data de referência', () => {
      const refDate = new Date(2026, 7, 1) // 01/08/2026
      const days = generateBookingDays(refDate, 30, [0])

      expect(days.length).toBe(30)
      expect(days[0]?.dateStr).toBe('01/08/2026')
      expect(days[0]?.isToday).toBe(true)
      expect(days[1]?.isTomorrow).toBe(true)
    })

    it('deve identificar e marcar domingos como dias fechados', () => {
      const sunday = new Date(2026, 7, 2) // 02/08/2026 é Domingo
      const days = generateBookingDays(sunday, 7, [0])

      expect(days[0]?.isClosed).toBe(true)
      expect(days[1]?.isClosed).toBe(false)
    })
  })

  describe('3. Geração de Slots de Horários com Bloqueios', () => {
    it('deve gerar slots de 30 em 30 minutos entre 09:00 e 12:00', () => {
      const slots = generateTimeSlots('09:00', '12:00', 30)

      expect(slots.length).toBe(6)
      expect(slots[0]?.time).toBe('09:00')
      expect(slots[0]?.available).toBe(true)
      expect(slots[5]?.time).toBe('11:30')
    })

    it('deve bloquear slots que constam na lista de bookedSlots', () => {
      const slots = generateTimeSlots('09:00', '11:00', 30, {
        bookedSlots: ['09:30', '10:00'],
      })

      const s0900 = slots.find((s) => s.time === '09:00')
      const s0930 = slots.find((s) => s.time === '09:30')
      const s1000 = slots.find((s) => s.time === '10:00')
      const s1030 = slots.find((s) => s.time === '10:30')

      expect(s0900?.available).toBe(true)
      expect(s0930?.available).toBe(false)
      expect(s0930?.reason).toBe('booked')
      expect(s1000?.available).toBe(false)
      expect(s1000?.reason).toBe('booked')
      expect(s1030?.available).toBe(true)
    })

    it('deve bloquear horários passados quando o dia selecionado for hoje', () => {
      const refDate = new Date(2026, 7, 27, 10, 15) // 10:15 da manhã
      const todayStr = '27/08/2026'

      const slots = generateTimeSlots('09:00', '12:00', 30, {
        selectedDateStr: todayStr,
        referenceDate: refDate,
      })

      const s0900 = slots.find((s) => s.time === '09:00')
      const s0930 = slots.find((s) => s.time === '09:30')
      const s1000 = slots.find((s) => s.time === '10:00')
      const s1030 = slots.find((s) => s.time === '10:30')

      expect(s0900?.available).toBe(false)
      expect(s0900?.reason).toBe('past')
      expect(s0930?.available).toBe(false)
      expect(s0930?.reason).toBe('past')
      expect(s1000?.available).toBe(false)
      expect(s1000?.reason).toBe('past')
      expect(s1030?.available).toBe(true)
    })

    it('deve retornar array vazio se o horário de fechamento for menor ou igual ao de abertura', () => {
      expect(generateTimeSlots('18:00', '09:00', 30)).toEqual([])
      expect(generateTimeSlots('12:00', '12:00', 30)).toEqual([])
    })
  })

  describe('4. Mock Determinístico de Horários Ocupados', () => {
    it('deve retornar lista consistente de horários ocupados para a data', () => {
      const booked1 = getMockBookedSlotsForDate('28/08/2026')
      const booked2 = getMockBookedSlotsForDate('28/08/2026')

      expect(booked1).toEqual(booked2)
      expect(Array.isArray(booked1)).toBe(true)
      expect(booked1.length).toBeGreaterThan(0)
    })
  })

  describe('5. Cálculos de Duração e Preço Total de Serviços', () => {
    const mockServices: BookingService[] = [
      { id: 's1', name: 'Corte', description: '', price: 45, durationMinutes: 40, professionalIds: [] },
      { id: 's2', name: 'Barba', description: '', price: 35, durationMinutes: 30, professionalIds: [] },
    ]

    it('deve somar a duração total de múltiplos serviços', () => {
      expect(calculateTotalDuration(mockServices)).toBe(70)
    })

    it('deve somar o valor total de múltiplos serviços', () => {
      expect(calculateTotalPrice(mockServices)).toBe(80)
    })
  })

  describe('6. Formatação de Mensagem de Agendamento para WhatsApp', () => {
    it('deve gerar a mensagem estruturada com todos os dados do agendamento', () => {
      const mockPayload: BookingAppointmentPayload = {
        tenantName: 'Barbearia Style',
        customerName: 'Danilo Gozzi',
        customerPhone: '(11) 99999-9999',
        date: '30/08/2026',
        time: '15:30',
        professional: {
          id: 'p1',
          name: 'Lucas Mendes',
          role: 'Barbeiro Master',
          available: true,
        },
        services: [
          { id: 's1', name: 'Corte Degradê Navalhado', description: '', price: 45, durationMinutes: 40, professionalIds: [] },
          { id: 's2', name: 'Barba Terapia', description: '', price: 35, durationMinutes: 30, professionalIds: [] },
        ],
        totalDurationMinutes: 70,
        totalPrice: 80,
        paymentMethod: 'Pix',
        notes: 'Toalha quente caprichada',
      }

      const message = formatBookingWhatsAppMessage(mockPayload)

      expect(message).toContain('💈 *NOVO AGENDAMENTO — BARBEARIA STYLE*')
      expect(message).toContain('• Data: 30/08/2026')
      expect(message).toContain('• Horário: 15:30')
      expect(message).toContain('• Profissional: Lucas Mendes')
      expect(message).toContain('• Corte Degradê Navalhado (40 min)')
      expect(message).toContain('• Barba Terapia (30 min)')
      expect(message).toContain('⏱️ Duração Estimada: 70 minutos')
      expect(message).toContain('VALOR TOTAL: R$')
      expect(message).toContain('Danilo Gozzi')
      expect(message).toContain('Toalha quente caprichada')
    })
  })
})
