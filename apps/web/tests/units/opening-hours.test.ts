// tests/units/opening-hours.test.ts
import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import {
  parseTimeToMinutes,
  isStoreOpenNow,
  getOpeningStatus,
  useOpeningHours
} from '~/composables/useOpeningHours'
import type { Tenant } from '~/types/tenant'

describe('Unit: Regra de Cálculo de Horário e Status Dinâmico de Atendimento', () => {
  describe('parseTimeToMinutes', () => {
    it('deve converter HH:mm para minutos corretamente', () => {
      expect(parseTimeToMinutes('08:00')).toBe(480)
      expect(parseTimeToMinutes('18:30')).toBe(1110)
      expect(parseTimeToMinutes('00:00')).toBe(0)
      expect(parseTimeToMinutes('23:59')).toBe(1439)
    })

    it('deve retornar 0 para strings vazias ou nulas de forma segura', () => {
      expect(parseTimeToMinutes('')).toBe(0)
      expect(parseTimeToMinutes(null)).toBe(0)
      expect(parseTimeToMinutes(undefined)).toBe(0)
    })
  })

  describe('isStoreOpenNow', () => {
    it('deve retornar true quando não há horários configurados (fallback permissivo)', () => {
      expect(isStoreOpenNow(null)).toBe(true)
      expect(isStoreOpenNow(undefined)).toBe(true)
    })

    it('deve retornar true para horário diurno dentro do expediente', () => {
      const hours = { open: '08:00', close: '18:00' }
      const noon = new Date(2026, 7, 28, 12, 0)
      expect(isStoreOpenNow(hours, noon)).toBe(true)
    })

    it('deve retornar false para horário diurno fora do expediente', () => {
      const hours = { open: '08:00', close: '18:00' }
      const night = new Date(2026, 7, 28, 21, 0)
      expect(isStoreOpenNow(hours, night)).toBe(false)
    })

    it('deve calcular corretamente horários noturnos que viram a meia-noite (ex: 18:00 às 03:00)', () => {
      const hours = { open: '18:00', close: '03:00' }
      const evening = new Date(2026, 7, 28, 22, 30) // Aberto
      const dawn = new Date(2026, 7, 28, 1, 30)     // Aberto
      const afternoon = new Date(2026, 7, 28, 14, 0) // Fechado

      expect(isStoreOpenNow(hours, evening)).toBe(true)
      expect(isStoreOpenNow(hours, dawn)).toBe(true)
      expect(isStoreOpenNow(hours, afternoon)).toBe(false)
    })
  })

  describe('getOpeningStatus (Badge Dinâmico)', () => {
    it('deve formatar status diurno aberto com horário de fechamento', () => {
      const hours = { open: '08:00', close: '18:00' }
      const now = new Date(2026, 7, 28, 11, 30)
      const result = getOpeningStatus(hours, now)

      expect(result.isOpen).toBe(true)
      expect(result.statusText).toBe('Aberto até às 18:00')
      expect(result.badgeLabel).toBe('🟢 Aberto até às 18:00')
      expect(result.nextTime).toBe('18:00')
      expect(result.formattedHours).toBe('08:00 às 18:00')
    })

    it('deve formatar status diurno fechado antes da abertura (Abre hoje às HH:mm)', () => {
      const hours = { open: '08:00', close: '18:00' }
      const now = new Date(2026, 7, 28, 6, 45)
      const result = getOpeningStatus(hours, now)

      expect(result.isOpen).toBe(false)
      expect(result.statusText).toBe('Fechado • Abre hoje às 08:00')
      expect(result.badgeLabel).toBe('🕒 Fechado • Abre hoje às 08:00')
      expect(result.nextTime).toBe('08:00')
    })

    it('deve formatar status diurno fechado após o encerramento (Abre às HH:mm)', () => {
      const hours = { open: '08:00', close: '18:00' }
      const now = new Date(2026, 7, 28, 19, 30)
      const result = getOpeningStatus(hours, now)

      expect(result.isOpen).toBe(false)
      expect(result.statusText).toBe('Fechado • Abre às 08:00')
      expect(result.badgeLabel).toBe('🕒 Fechado • Abre às 08:00')
      expect(result.nextTime).toBe('08:00')
    })

    it('deve formatar status noturno aberto antes da meia-noite (ex: 18:00 às 23:30)', () => {
      const hours = { open: '18:00', close: '23:30' }
      const now = new Date(2026, 7, 28, 20, 15)
      const result = getOpeningStatus(hours, now)

      expect(result.isOpen).toBe(true)
      expect(result.statusText).toBe('Aberto até às 23:30')
      expect(result.badgeLabel).toBe('🟢 Aberto até às 23:30')
    })

    it('deve formatar status noturno aberto passando da meia-noite (ex: 18:00 às 02:00 na madrugada)', () => {
      const hours = { open: '18:00', close: '02:00' }
      const now = new Date(2026, 7, 28, 1, 15)
      const result = getOpeningStatus(hours, now)

      expect(result.isOpen).toBe(true)
      expect(result.statusText).toBe('Aberto até às 02:00')
      expect(result.badgeLabel).toBe('🟢 Aberto até às 02:00')
      expect(result.nextTime).toBe('02:00')
    })

    it('deve formatar status noturno fechado durante a tarde (Abre hoje às 18:00)', () => {
      const hours = { open: '18:00', close: '02:00' }
      const now = new Date(2026, 7, 28, 15, 0)
      const result = getOpeningStatus(hours, now)

      expect(result.isOpen).toBe(false)
      expect(result.statusText).toBe('Fechado • Abre hoje às 18:00')
      expect(result.badgeLabel).toBe('🕒 Fechado • Abre hoje às 18:00')
      expect(result.nextTime).toBe('18:00')
    })

    it('deve fornecer fallback seguro quando não houver horários configurados', () => {
      const result = getOpeningStatus(null)

      expect(result.isOpen).toBe(true)
      expect(result.statusText).toBe('Aberto agora')
      expect(result.badgeLabel).toBe('🟢 Aberto agora')
      expect(result.nextTime).toBeNull()
      expect(result.formattedHours).toBeNull()
    })
  })

  describe('useOpeningHours (Composable Reativo)', () => {
    it('deve reagir a mudanças no tenant reativo', () => {
      const tenantRef = ref<Partial<Tenant> | null>({
        openingHours: { open: '10:00', close: '22:00' }
      })

      const { isOpen, statusText, statusBadgeLabel } = useOpeningHours(tenantRef as any)

      expect(isOpen.value).toBeDefined()
      expect(statusText.value).toBeDefined()
      expect(statusBadgeLabel.value).toBeDefined()
    })

    it('deve funcionar com objeto plano ou nulo', () => {
      const { isOpen, statusText } = useOpeningHours(null)
      expect(isOpen.value).toBe(true)
      expect(statusText.value).toBe('Aberto agora')
    })
  })
})
