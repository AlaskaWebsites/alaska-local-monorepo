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

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
const DAY_NAMES = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']

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
  openingHours?: any,
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

  if (!openingHours) {
    return {
      isOpen: true,
      statusText: 'Aberto agora',
      badgeLabel: '🟢 Aberto agora',
      nextTime: null,
      formattedHours: null
    }
  }

  // 1. Verifica configuração do dia da semana atual
  const dayIndex = now.getDay()
  const currentDayKey = DAY_KEYS[dayIndex]
  const dayConfig = openingHours[currentDayKey]

  // Se o dia da semana atual estiver marcado como fechado/folga
  if (dayConfig && dayConfig.closed) {
    let nextOpenText = ''
    for (let offset = 1; offset <= 7; offset++) {
      const nextIndex = (dayIndex + offset) % 7
      const nextKey = DAY_KEYS[nextIndex]
      const nextDay = openingHours[nextKey]
      if (nextDay && !nextDay.closed && (nextDay.open || openingHours.open)) {
        const openH = nextDay.open || openingHours.open
        const dayLabel = offset === 1 ? 'amanhã' : DAY_NAMES[nextIndex]
        nextOpenText = ` • Abre ${dayLabel} às ${openH}`
        break
      }
    }
    return {
      isOpen: false,
      statusText: `Fechado hoje${nextOpenText}`,
      badgeLabel: `🕒 Fechado hoje${nextOpenText}`,
      nextTime: null,
      formattedHours: 'Fechado'
    }
  }

  const openTime = dayConfig?.open || openingHours.open
  const closeTime = dayConfig?.close || openingHours.close

  if (!openTime || !closeTime) {
    return {
      isOpen: true,
      statusText: 'Aberto agora',
      badgeLabel: '🟢 Aberto agora',
      nextTime: null,
      formattedHours: null
    }
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const openMin = parseTimeToMinutes(openTime)
  const closeMin = parseTimeToMinutes(closeTime)
  const isOpen = isStoreOpenNow({ open: openTime, close: closeTime }, now)
  const formattedHours = `${openTime} às ${closeTime}`

  if (isOpen) {
    return {
      isOpen: true,
      statusText: `Aberto até às ${closeTime}`,
      badgeLabel: `🟢 Aberto até às ${closeTime}`,
      nextTime: closeTime,
      formattedHours
    }
  }

  // Fechado antes do expediente diurno
  if (closeMin >= openMin && currentMinutes < openMin) {
    return {
      isOpen: false,
      statusText: `Fechado • Abre hoje às ${openTime}`,
      badgeLabel: `🕒 Fechado • Abre hoje às ${openTime}`,
      nextTime: openTime,
      formattedHours
    }
  }

  // Fechado durante a tarde em turno noturno
  if (closeMin < openMin && currentMinutes > closeMin && currentMinutes < openMin) {
    return {
      isOpen: false,
      statusText: `Fechado • Abre hoje às ${openTime}`,
      badgeLabel: `🕒 Fechado • Abre hoje às ${openTime}`,
      nextTime: openTime,
      formattedHours
    }
  }

  // Fechado após o encerramento do dia
  return {
    isOpen: false,
    statusText: `Fechado • Abre às ${openTime}`,
    badgeLabel: `🕒 Fechado • Abre às ${openTime}`,
    nextTime: openTime,
    formattedHours
  }
}

export function useOpeningHours(
  tenantOrHours?: Tenant | Partial<Tenant> | OpeningHours | Ref<Tenant | Partial<Tenant> | OpeningHours | null | undefined> | null
) {
  const currentStatus = computed<OpeningStatus>(() => {
    const raw = isRef(tenantOrHours) ? tenantOrHours.value : tenantOrHours
    if (!raw) return getOpeningStatus(null)

    let hours: any = null
    let isEmergencyClosed = false

    if (typeof raw === 'object') {
      if ('isEmergencyClosed' in raw && (raw as any).isEmergencyClosed) {
        isEmergencyClosed = true
      }
      if ('openingHours' in raw && raw.openingHours) {
        hours = raw.openingHours
      } else if ('open' in raw && 'close' in raw) {
        hours = raw
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
