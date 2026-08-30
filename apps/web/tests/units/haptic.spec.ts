// tests/units/haptic.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { triggerHaptic, useHaptic, hapticPatterns } from '~/composables/useHaptic'

describe('Unit: Feedback Tátil e Vibração Mobile (useHaptic.ts)', () => {
    const originalNavigator = global.navigator

    beforeEach(() => {
        vi.restoreAllMocks()
    })

    afterEach(() => {
        Object.defineProperty(global, 'navigator', {
            value: originalNavigator,
            configurable: true,
            writable: true,
        })
    })

    describe('1. Função Pura: triggerHaptic', () => {
        it('deve chamar navigator.vibrate com 30ms por padrão', () => {
            const vibrateMock = vi.fn().mockReturnValue(true)
            Object.defineProperty(global, 'navigator', {
                value: { vibrate: vibrateMock },
                configurable: true,
                writable: true,
            })

            const result = triggerHaptic()
            expect(vibrateMock).toHaveBeenCalledTimes(1)
            expect(vibrateMock).toHaveBeenCalledWith(30)
            expect(result).toBe(true)
        })

        it('deve chamar navigator.vibrate com padrão customizado de número ou array', () => {
            const vibrateMock = vi.fn().mockReturnValue(true)
            Object.defineProperty(global, 'navigator', {
                value: { vibrate: vibrateMock },
                configurable: true,
                writable: true,
            })

            triggerHaptic(50)
            expect(vibrateMock).toHaveBeenCalledWith(50)

            triggerHaptic([30, 50, 30])
            expect(vibrateMock).toHaveBeenCalledWith([30, 50, 30])
        })

        it('deve retornar false graciosamente se navigator.vibrate não existir (iOS / Desktop)', () => {
            Object.defineProperty(global, 'navigator', {
                value: {},
                configurable: true,
                writable: true,
            })

            const result = triggerHaptic(30)
            expect(result).toBe(false)
        })

        it('deve retornar false se navigator.vibrate lançar uma exceção', () => {
            const vibrateMock = vi.fn().mockImplementation(() => {
                throw new Error('Not allowed by user agent permissions')
            })
            Object.defineProperty(global, 'navigator', {
                value: { vibrate: vibrateMock },
                configurable: true,
                writable: true,
            })

            const result = triggerHaptic(30)
            expect(result).toBe(false)
        })
    })

    describe('2. Composable Reativo: useHaptic', () => {
        it('deve identificar suporte à Vibration API corretamente', () => {
            Object.defineProperty(global, 'navigator', {
                value: { vibrate: vi.fn() },
                configurable: true,
                writable: true,
            })

            const { isSupported } = useHaptic()
            expect(isSupported.value).toBe(true)
        })

        it('deve expor métodos helpers (vibrate, lightImpact, mediumImpact, successFeedback, errorFeedback)', () => {
            const vibrateMock = vi.fn().mockReturnValue(true)
            Object.defineProperty(global, 'navigator', {
                value: { vibrate: vibrateMock },
                configurable: true,
                writable: true,
            })

            const { vibrate, lightImpact, mediumImpact, successFeedback, errorFeedback } = useHaptic()

            vibrate()
            expect(vibrateMock).toHaveBeenCalledWith(hapticPatterns.tap)

            lightImpact()
            expect(vibrateMock).toHaveBeenCalledWith(hapticPatterns.light)

            mediumImpact()
            expect(vibrateMock).toHaveBeenCalledWith(hapticPatterns.medium)

            successFeedback()
            expect(vibrateMock).toHaveBeenCalledWith(hapticPatterns.success)

            errorFeedback()
            expect(vibrateMock).toHaveBeenCalledWith(hapticPatterns.error)
        })
    })
})
