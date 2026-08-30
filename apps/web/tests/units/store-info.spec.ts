// tests/units/store-info.spec.ts
import { describe, it, expect } from 'vitest'
import { TenantSchema } from '~/types/tenant'

describe('Lógica de Horários de Funcionamento (StoreInfoModal)', () => {
    const parseTimeToMinutes = (timeStr: string): number => {
        const parts = timeStr.split(':')
        const h = parseInt(parts.at(0) || '0', 10)
        const m = parseInt(parts.at(1) || '0', 10)
        return h * 60 + m
    }

    const isStoreOpen = (
        hours: { open: string; close: string } | undefined,
        currentHourMin: string
    ): boolean => {
        if (!hours) return false

        const current = parseTimeToMinutes(currentHourMin)
        const openTotal = parseTimeToMinutes(hours.open)
        const closeTotal = parseTimeToMinutes(hours.close)

        if (closeTotal < openTotal) {
            return current >= openTotal || current < closeTotal
        }

        return current >= openTotal && current < closeTotal
    }

    it('deve identificar loja aberta em horário diurno normal', () => {
        const diurno = { open: '08:00', close: '18:00' }
        expect(isStoreOpen(diurno, '12:30')).toBe(true)
        expect(isStoreOpen(diurno, '07:59')).toBe(false)
        expect(isStoreOpen(diurno, '18:01')).toBe(false)
    })

    it('deve identificar loja aberta quando o horário cruza a meia-noite (noturno)', () => {
        const noturno = { open: '18:00', close: '02:00' }
        expect(isStoreOpen(noturno, '23:00')).toBe(true)
        expect(isStoreOpen(noturno, '01:30')).toBe(true)
        expect(isStoreOpen(noturno, '03:00')).toBe(false)
        expect(isStoreOpen(noturno, '17:59')).toBe(false)
    })

    it('deve retornar false caso a loja não possua horários cadastrados', () => {
        expect(isStoreOpen(undefined, '12:00')).toBe(false)
    })
})

describe('Sanidade Global de Todos os Arquivos JSON (data/*.json)', () => {
    it('todos os arquivos JSON de tenants devem passar no TenantSchema do Zod', () => {
        const jsonFiles = import.meta.glob('~/data/*.json', { eager: true }) as Record<
            string,
            { default: any }
        >

        const fileEntries = Object.entries(jsonFiles)
        expect(fileEntries.length).toBeGreaterThanOrEqual(7) // 👈 7 lojas cadastradas

        fileEntries.forEach(([path, content]) => {
            const data = content.default || content
            const result = TenantSchema.safeParse(data)
            expect(
                result.success,
                `Falha na validação do arquivo: ${path}`
            ).toBe(true)
        })
    })
})