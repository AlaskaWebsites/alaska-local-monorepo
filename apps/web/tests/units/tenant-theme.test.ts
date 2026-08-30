// tests/units/tenant-theme.test.ts
import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useTenantTheme } from '~/composables/useTenantTheme'
import type { TenantTheme } from '~/types/tenant'
import { TenantThemeSchema } from '~/types/tenant'

describe('Sistema de Temas Dinâmicos por Segmento (useTenantTheme)', () => {
    it('deve aplicar o tema "food" (Vermelho iFood) por padrão quando o tema for omitido ou nulo', () => {
        const { theme, themeClasses } = useTenantTheme()
        expect(theme.value).toBe('food')
        expect(themeClasses.value.primaryText).toBe('text-red-600')
        expect(themeClasses.value.primaryBg).toBe('bg-red-600')
    })

    it('deve resolver corretamente o tema a partir de uma string válida', () => {
        const { theme: foodTheme, themeClasses: foodClasses } = useTenantTheme('food')
        expect(foodTheme.value).toBe('food')
        expect(foodClasses.value.primaryText).toBe('text-red-600')

        const { theme: barberTheme, themeClasses: barberClasses } = useTenantTheme('barber')
        expect(barberTheme.value).toBe('barber')
        expect(barberClasses.value.primaryText).toBe('text-amber-500')
        expect(barberClasses.value.primaryBg).toBe('bg-amber-500')

        const { theme: healthTheme, themeClasses: healthClasses } = useTenantTheme('health')
        expect(healthTheme.value).toBe('health')
        expect(healthClasses.value.primaryText).toBe('text-teal-600')
        expect(healthClasses.value.primaryBg).toBe('bg-teal-600')

        const { theme: drinksTheme, themeClasses: drinksClasses } = useTenantTheme('drinks')
        expect(drinksTheme.value).toBe('drinks')
        expect(drinksClasses.value.primaryText).toBe('text-purple-600')
    })

    it('deve resolver o tema reativamente a partir de um objeto Ref de Tenant', () => {
        const tenantRef = ref({
            slug: 'hamburgueria-x',
            theme: 'food' as TenantTheme,
        })

        const { theme, themeClasses } = useTenantTheme(tenantRef as any)
        expect(theme.value).toBe('food')
        expect(themeClasses.value.primaryBg).toBe('bg-red-600')

        // Mudança reativa de tema
        tenantRef.value.theme = 'barber'
        expect(theme.value).toBe('barber')
        expect(themeClasses.value.primaryBg).toBe('bg-amber-500')
    })

    it('deve validar e aplicar default no TenantThemeSchema do Zod', () => {
        expect(TenantThemeSchema.parse('food')).toBe('food')
        expect(TenantThemeSchema.parse('barber')).toBe('barber')
        expect(TenantThemeSchema.parse('health')).toBe('health')
        expect(TenantThemeSchema.parse('drinks')).toBe('drinks')
        expect(TenantThemeSchema.parse(undefined)).toBe('food')

        const invalidResult = TenantThemeSchema.safeParse('outro-tema')
        expect(invalidResult.success).toBe(false)
    })
})
