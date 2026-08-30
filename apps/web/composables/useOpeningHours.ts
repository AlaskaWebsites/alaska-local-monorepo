// composables/useOpeningHours.ts
import { computed, isRef, type Ref } from 'vue'
import type { Tenant, OpeningHours } from '~/types/tenant'

export interface OpeningStatus {
  isOpen: boolean
  statusText: string
  badgeLabel: string
  nextTime: string | null
  formattedHours: string | null
}

export function parseTimeToMinutes(timeStr?: string | null): number {
  if (!timeStr) return 0
  const [hStr, mStr] = timeStr.split(':')
  const hours = parseInt(hStr || '0', 10)
  const minutes = parseInt(mStr || '0', 10)
  return hours * 60 + minutes
}

export function isStoreOpenNow(openingHours?: { open?: string; close?: string } | null, now = new Date()): boolean {
  if (!openingHours?.open || !openingHours?.close) return true

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const openMin = parseTimeToMinutes(openingHours.open)
  const closeMin = parseTimeToMinutes(openingHours.close)

  // Turno diurno normal (ex: 08:00 às 18:00 ou 00:00 às 23:59)
  if (closeMin >= openMin) {
    return currentMinutes >= openMin && currentMinutes <= closeMin
  }

  // Turno noturno que vira a meia-noite (ex: 18:00 às 03:00)
  return currentMinutes >= openMin || currentMinutes <= closeMin
}

export function getOpeningStatus(
  openingHours?: { open?: string; close?: string } | null,
  now = new Date(),
  isEmergencyClosed = false
): OpeningStatus {
  if (isEmergencyClosed) {
    return {
      isOpen: false,
      statusText: 'Pausado temporariamente',
      badgeLabel: '🛑 Pausado temporariamente',
      nextTime: null,
      formattedHours: openingHours?.open && openingHours?.close ? `${openingHours.open} às ${openingHours.close}` : null
    }
  }

  if (!openingHours?.open || !openingHours?.close) {
    return {
      isOpen: true,
      statusText: 'Aberto agora',
      badgeLabel: '🟢 Aberto agora',
      nextTime: null,
      formattedHours: null
    }
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const openMin = parseTimeToMinutes(openingHours.open)
  const closeMin = parseTimeToMinutes(openingHours.close)
  const isOpen = isStoreOpenNow(openingHours, now)
  const formattedHours = `${openingHours.open} às ${openingHours.close}`

  if (isOpen) {
    return {
      isOpen: true,
      statusText: `Aberto até às ${openingHours.close}`,
      badgeLabel: `🟢 Aberto até às ${openingHours.close}`,
      nextTime: openingHours.close,
      formattedHours
    }
  }

  // Fechado antes do horário de abertura diurno
  if (closeMin >= openMin && currentMinutes < openMin) {
    return {
      isOpen: false,
      statusText: `Fechado • Abre hoje às ${openingHours.open}`,
      badgeLabel: `🕒 Fechado • Abre hoje às ${openingHours.open}`,
      nextTime: openingHours.open,
      formattedHours
    }
  }

  // Fechado durante a tarde em horário noturno
  if (closeMin < openMin && currentMinutes > closeMin && currentMinutes < openMin) {
    return {
      isOpen: false,
      statusText: `Fechado • Abre hoje às ${openingHours.open}`,
      badgeLabel: `🕒 Fechado • Abre hoje às ${openingHours.open}`,
      nextTime: openingHours.open,
      formattedHours
    }
  }

  // Fechado após o encerramento do dia
  return {
    isOpen: false,
    statusText: `Fechado • Abre às ${openingHours.open}`,
    badgeLabel: `🕒 Fechado • Abre às ${openingHours.open}`,
    nextTime: openingHours.open,
    formattedHours
  }
}

export function useOpeningHours(
  tenantOrHours?: Tenant | Partial<Tenant> | OpeningHours | Ref<Tenant | Partial<Tenant> | OpeningHours | null | undefined> | null
) {
  const currentStatus = computed<OpeningStatus>(() => {
    const raw = isRef(tenantOrHours) ? tenantOrHours.value : tenantOrHours
    if (!raw) return getOpeningStatus(null)

    let hours: { open?: string; close?: string } | null = null
    let isEmergencyClosed = false

    if (typeof raw === 'object') {
      if ('isEmergencyClosed' in raw && (raw as any).isEmergencyClosed) {
        isEmergencyClosed = true
      }
      if ('openingHours' in raw && raw.openingHours) {
        hours = raw.openingHours
      } else if ('open' in raw && 'close' in raw) {
        hours = raw as { open?: string; close?: string }
      }
    }

    return getOpeningStatus(hours, new Date(), isEmergencyClosed)
  })

  return {
    isOpen: computed(() => currentStatus.value.isOpen),
    statusText: computed(() => currentStatus.value.statusText),
    statusBadgeLabel: computed(() => currentStatus.value.badgeLabel),
    nextTime: computed(() => currentStatus.value.nextTime),
    formattedOpeningHours: computed(() => currentStatus.value.formattedHours),
    ariaLabel: computed(() => {
      const s = currentStatus.value
      return s.isOpen
        ? `Estabelecimento aberto até às ${s.nextTime || 'horário de encerramento'}`
        : `Estabelecimento fechado no momento`
    })
  }
}
