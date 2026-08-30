// composables/useHaptic.ts
import { ref } from 'vue'

/**
 * Utilitário puro e SSR-safe para acionar vibração tátil via Vibration API do navegador móvel.
 * Retorna true se a vibração foi acionada com sucesso, ou false caso a API não seja suportada/disponível.
 */
export function triggerHaptic(pattern: number | number[] | readonly number[] = 30): boolean {
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') {
        return false
    }

    try {
        return navigator.vibrate(pattern as any)
    } catch {
        return false
    }
}

/**
 * Padrões de feedback tátil pré-configurados
 */
export const hapticPatterns = {
    /** Toque suave (30ms) ao adicionar itens à sacola */
    tap: 30,
    /** Impacto leve (20ms) para seleções rápidas e filtros */
    light: 20,
    /** Impacto médio (50ms) para ações importantes */
    medium: 50,
    /** Padrão de confirmação de sucesso [30ms vibra, 50ms pausa, 30ms vibra] */
    success: [30, 50, 30] as const,
    /** Padrão de erro ou alerta [50ms vibra, 50ms pausa, 50ms vibra] */
    error: [50, 50, 50] as const,
}

/**
 * Composable Reativo para Feedback Tátil (Vibration API)
 */
export function useHaptic() {
    const isSupported = ref(
        typeof navigator !== 'undefined' &&
        typeof navigator.vibrate === 'function'
    )

    function vibrate(pattern: number | number[] | readonly number[] = hapticPatterns.tap): boolean {
        return triggerHaptic(pattern)
    }

    function lightImpact(): boolean {
        return triggerHaptic(hapticPatterns.light)
    }

    function mediumImpact(): boolean {
        return triggerHaptic(hapticPatterns.medium)
    }

    function successFeedback(): boolean {
        return triggerHaptic(hapticPatterns.success)
    }

    function errorFeedback(): boolean {
        return triggerHaptic(hapticPatterns.error)
    }

    return {
        isSupported,
        vibrate,
        lightImpact,
        mediumImpact,
        successFeedback,
        errorFeedback,
        vibrateLight: lightImpact,
        vibrateMedium: mediumImpact,
        vibrateSuccess: successFeedback,
        vibrateError: errorFeedback,
        triggerHaptic,
        hapticPatterns,
        patterns: hapticPatterns,
    }
}
