// composables/useTenantTheme.ts
import { computed, isRef, type Ref } from 'vue'
import type { Tenant, TenantTheme } from '~/types/tenant'

export interface ThemeColors {
  primaryText: string
  primaryTextHover: string
  primaryBg: string
  primaryBgHover: string
  primaryBorder: string
  buttonPrimary: string
  badgeBg: string
  badgeText: string
  badgeBorder: string
  categoryIndicator: string
  focusRing: string
}

const RED_THEME: ThemeColors = {
  primaryText: 'text-red-600',
  primaryTextHover: 'hover:text-red-700',
  primaryBg: 'bg-red-600',
  primaryBgHover: 'hover:bg-red-700',
  primaryBorder: 'border-red-600',
  buttonPrimary: 'bg-red-600 hover:bg-red-700 text-white',
  badgeBg: 'bg-red-50',
  badgeText: 'text-red-700',
  badgeBorder: 'border-red-200',
  categoryIndicator: 'bg-red-500',
  focusRing: 'focus:ring-red-500'
}

const BARBER_THEME: ThemeColors = {
  primaryText: 'text-amber-500',
  primaryTextHover: 'hover:text-amber-600',
  primaryBg: 'bg-amber-500',
  primaryBgHover: 'hover:bg-amber-600',
  primaryBorder: 'border-amber-500',
  buttonPrimary: 'bg-amber-500 hover:bg-amber-600 text-white',
  badgeBg: 'bg-amber-50',
  badgeText: 'text-amber-800',
  badgeBorder: 'border-amber-200',
  categoryIndicator: 'bg-amber-500',
  focusRing: 'focus:ring-amber-500'
}

const HEALTH_THEME: ThemeColors = {
  primaryText: 'text-teal-600',
  primaryTextHover: 'hover:text-teal-700',
  primaryBg: 'bg-teal-600',
  primaryBgHover: 'hover:bg-teal-700',
  primaryBorder: 'border-teal-600',
  buttonPrimary: 'bg-teal-600 hover:bg-teal-700 text-white',
  badgeBg: 'bg-teal-50',
  badgeText: 'text-teal-700',
  badgeBorder: 'border-teal-200',
  categoryIndicator: 'bg-teal-500',
  focusRing: 'focus:ring-teal-500'
}

const DRINKS_THEME: ThemeColors = {
  primaryText: 'text-purple-600',
  primaryTextHover: 'hover:text-purple-700',
  primaryBg: 'bg-purple-600',
  primaryBgHover: 'hover:bg-purple-700',
  primaryBorder: 'border-purple-600',
  buttonPrimary: 'bg-purple-600 hover:bg-purple-700 text-white',
  badgeBg: 'bg-purple-50',
  badgeText: 'text-purple-800',
  badgeBorder: 'border-purple-200',
  categoryIndicator: 'bg-purple-500',
  focusRing: 'focus:ring-purple-500'
}

const AMBER_THEME: ThemeColors = {
  primaryText: 'text-amber-600',
  primaryTextHover: 'hover:text-amber-700',
  primaryBg: 'bg-amber-600',
  primaryBgHover: 'hover:bg-amber-700',
  primaryBorder: 'border-amber-600',
  buttonPrimary: 'bg-amber-600 hover:bg-amber-700 text-white',
  badgeBg: 'bg-amber-50',
  badgeText: 'text-amber-800',
  badgeBorder: 'border-amber-200',
  categoryIndicator: 'bg-amber-500',
  focusRing: 'focus:ring-amber-500'
}

const ROSE_THEME: ThemeColors = {
  primaryText: 'text-rose-600',
  primaryTextHover: 'hover:text-rose-700',
  primaryBg: 'bg-rose-600',
  primaryBgHover: 'hover:bg-rose-700',
  primaryBorder: 'border-rose-600',
  buttonPrimary: 'bg-rose-600 hover:bg-rose-700 text-white',
  badgeBg: 'bg-rose-50',
  badgeText: 'text-rose-700',
  badgeBorder: 'border-rose-200',
  categoryIndicator: 'bg-rose-500',
  focusRing: 'focus:ring-rose-500'
}

const VIOLET_THEME: ThemeColors = {
  primaryText: 'text-violet-600',
  primaryTextHover: 'hover:text-violet-700',
  primaryBg: 'bg-violet-600',
  primaryBgHover: 'hover:bg-violet-700',
  primaryBorder: 'border-violet-600',
  buttonPrimary: 'bg-violet-600 hover:bg-violet-700 text-white',
  badgeBg: 'bg-violet-50',
  badgeText: 'text-violet-700',
  badgeBorder: 'border-violet-200',
  categoryIndicator: 'bg-violet-500',
  focusRing: 'focus:ring-violet-500'
}

const BLUE_THEME: ThemeColors = {
  primaryText: 'text-blue-600',
  primaryTextHover: 'hover:text-blue-700',
  primaryBg: 'bg-blue-600',
  primaryBgHover: 'hover:bg-blue-700',
  primaryBorder: 'border-blue-600',
  buttonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
  badgeBg: 'bg-blue-50',
  badgeText: 'text-blue-700',
  badgeBorder: 'border-blue-200',
  categoryIndicator: 'bg-blue-500',
  focusRing: 'focus:ring-blue-500'
}

const EMERALD_THEME: ThemeColors = {
  primaryText: 'text-emerald-600',
  primaryTextHover: 'hover:text-emerald-700',
  primaryBg: 'bg-emerald-600',
  primaryBgHover: 'hover:bg-emerald-700',
  primaryBorder: 'border-emerald-600',
  buttonPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  badgeBg: 'bg-emerald-50',
  badgeText: 'text-emerald-700',
  badgeBorder: 'border-emerald-200',
  categoryIndicator: 'bg-emerald-500',
  focusRing: 'focus:ring-emerald-500'
}

const SLATE_THEME: ThemeColors = {
  primaryText: 'text-slate-900',
  primaryTextHover: 'hover:text-slate-700',
  primaryBg: 'bg-slate-900',
  primaryBgHover: 'hover:bg-slate-800',
  primaryBorder: 'border-slate-900',
  buttonPrimary: 'bg-slate-900 hover:bg-slate-800 text-white',
  badgeBg: 'bg-slate-100',
  badgeText: 'text-slate-800',
  badgeBorder: 'border-slate-200',
  categoryIndicator: 'bg-slate-900',
  focusRing: 'focus:ring-slate-500'
}

export const THEME_PRESETS: Record<TenantTheme, ThemeColors> = {
  default: RED_THEME,
  food: RED_THEME,
  barber: BARBER_THEME,
  health: HEALTH_THEME,
  drinks: DRINKS_THEME,
  rose: ROSE_THEME,
  amber: AMBER_THEME,
  violet: VIOLET_THEME,
  blue: BLUE_THEME,
  emerald: EMERALD_THEME,
  slate: SLATE_THEME
}

export function useTenantTheme(
  tenantOrTheme?: Tenant | Partial<Tenant> | TenantTheme | Ref<Tenant | Partial<Tenant> | TenantTheme | null | undefined> | null
) {
  const activeTheme = computed<TenantTheme>(() => {
    if (!tenantOrTheme) return 'food'
    const val = isRef(tenantOrTheme) ? tenantOrTheme.value : tenantOrTheme
    if (!val) return 'food'

    if (typeof val === 'string') {
      return (val as TenantTheme) in THEME_PRESETS ? (val as TenantTheme) : 'food'
    }

    if (typeof val === 'object' && 'theme' in val && val.theme) {
      return val.theme in THEME_PRESETS ? val.theme : 'food'
    }

    return 'food'
  })

  const themeClasses = computed<ThemeColors>(() => {
    return THEME_PRESETS[activeTheme.value] || THEME_PRESETS.food
  })

  return {
    theme: activeTheme,
    activeTheme,
    themeClasses
  }
}
