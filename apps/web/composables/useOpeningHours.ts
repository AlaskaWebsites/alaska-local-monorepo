// composables/useOpeningHours.ts
import { computed, isRef, type Ref } from 'vue'
import type { Tenant } from '~/types/tenant'

export interface OpeningHoursConfig {
    open: string
    close: string
}

export interface OpeningStatus {
    isOpen: boolean
    statusText: string
    badgeLabel: string
    ariaLabel: string
    nextTime: string | null
    formattedHours: string | null
}

/**
 * Converte horário HH:mm em minutos de forma segura contra noUncheckedIndexedAccess.
 */
export function parseTimeToMinutes(timeStr?: string | null): number {
    if (!timeStr) return 0
    const parts = timeStr.split(':')
    const hours = parseInt(parts[0] || '0', 10) || 0
    const minutes = parseInt(parts[1] || '0', 10) || 0
    return hours * 60 + minutes
}

/**
 * Verifica se o estabelecimento está aberto no momento fornecido.
 */
export function isStoreOpenNow(
    hours?: OpeningHoursConfig | null,
    currentDate: Date = new Date()
): boolean {
    if (!hours?.open || !hours?.close) return true

    const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes()
    const openMin = parseTimeToMinutes(hours.open)
    const closeMin = parseTimeToMinutes(hours.close)

    if (closeMin >= openMin) {
        return currentMinutes >= openMin && currentMinutes <= closeMin
    }

    // Horário noturno que vira a meia-noite (ex: 18:00 às 02:00)
    return currentMinutes >= openMin || currentMinutes <= closeMin
}

/**
 * Retorna o status detalhado e os textos dinâmicos de atendimento (Aberto até às HH:mm / Fechado • Abre hoje às HH:mm).
 */
export function getOpeningStatus(
    hours?: OpeningHoursConfig | null,
    currentDate: Date = new Date()
): OpeningStatus {
    if (!hours?.open || !hours?.close) {
        return {
            isOpen: true,
            statusText: 'Aberto agora',
            badgeLabel: '🟢 Aberto agora',
            ariaLabel: 'Estabelecimento aberto para atendimento',
            nextTime: null,
            formattedHours: null,
        }
    }

    const open = hours.open
    const close = hours.close
    const formattedHours = `${open} às ${close}`

    const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes()
    const openMin = parseTimeToMinutes(open)
    const closeMin = parseTimeToMinutes(close)

    // 1. Horário de funcionamento diurno no mesmo dia (ex: 08:00 às 18:00)
    if (closeMin >= openMin) {
        if (currentMinutes >= openMin && currentMinutes <= closeMin) {
            return {
                isOpen: true,
                statusText: `Aberto até às ${close}`,
                badgeLabel: `🟢 Aberto até às ${close}`,
                ariaLabel: `Estabelecimento aberto hoje até às ${close}`,
                nextTime: close,
                formattedHours,
            }
        }

        if (currentMinutes < openMin) {
            return {
                isOpen: false,
                statusText: `Fechado • Abre hoje às ${open}`,
                badgeLabel: `🕒 Fechado • Abre hoje às ${open}`,
                ariaLabel: `Estabelecimento fechado no momento, abre hoje às ${open}`,
                nextTime: open,
                formattedHours,
            }
        }

        // currentMinutes > closeMin
        return {
            isOpen: false,
            statusText: `Fechado • Abre às ${open}`,
            badgeLabel: `🕒 Fechado • Abre às ${open}`,
            ariaLabel: `Estabelecimento fechado no momento, abre amanhã às ${open}`,
            nextTime: open,
            formattedHours,
        }
    }

    // 2. Horário noturno que passa da meia-noite (ex: 18:00 às 03:00)
    if (currentMinutes >= openMin || currentMinutes <= closeMin) {
        return {
            isOpen: true,
            statusText: `Aberto até às ${close}`,
            badgeLabel: `🟢 Aberto até às ${close}`,
            ariaLabel: `Estabelecimento aberto até às ${close}`,
            nextTime: close,
            formattedHours,
        }
    }

    // Intervalo durante o dia antes de abrir à noite (ex: 14:00 quando abre às 18:00)
    return {
        isOpen: false,
        statusText: `Fechado • Abre hoje às ${open}`,
        badgeLabel: `🕒 Fechado • Abre hoje às ${open}`,
        ariaLabel: `Estabelecimento fechado no momento, abre hoje às ${open}`,
        nextTime: open,
        formattedHours,
    }
}

/**
 * Composable reativo para cálculo de horários e status dinâmico de atendimento
 */
export function useOpeningHours(
    tenantOrHours?: Ref<Tenant | null | undefined> | Tenant | OpeningHoursConfig | null
) {
    const rawConfig = computed<OpeningHoursConfig | null>(() => {
        const raw = isRef(tenantOrHours) ? tenantOrHours.value : tenantOrHours
        if (!raw) return null

        if ('openingHours' in raw && raw.openingHours) {
            return raw.openingHours
        }

        if ('open' in raw && 'close' in raw) {
            return raw as OpeningHoursConfig
        }

        return null
    })

    const status = computed<OpeningStatus>(() => {
        return getOpeningStatus(rawConfig.value)
    })

    const isOpen = computed(() => status.value.isOpen)
    const statusText = computed(() => status.value.statusText)
    const statusBadgeText = computed(() => status.value.statusText)
    const statusBadgeLabel = computed(() => status.value.badgeLabel)
    const ariaLabel = computed(() => status.value.ariaLabel)
    const formattedOpeningHours = computed(() => status.value.formattedHours)

    return {
        isOpen,
        status,
        statusText,
        statusBadgeText,
        statusBadgeLabel,
        ariaLabel,
        formattedOpeningHours,
        parseTimeToMinutes,
        isStoreOpenNow,
        getOpeningStatus,
    }
}
