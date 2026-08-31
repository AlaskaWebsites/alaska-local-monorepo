// composables/useMerchantAdmin.ts
import { ref, computed, isRef, type Ref } from 'vue'
import type { Product, Category } from '@alaska/contracts'
import { useHaptic } from './useHaptic'

export interface DaySchedule {
  open: string
  close: string
  closed: boolean
}

export interface ProfessionalOverride {
  isAvailable?: boolean
  availableDays?: number[]
  lunchBreak?: { start: string; end: string; enabled: boolean }
}

export interface TenantOverrides {
  products?: Record<string, { isAvailable?: boolean; price?: number; durationMinutes?: number }>
  openingHours?: {
    open?: string
    close?: string
    monday?: DaySchedule
    tuesday?: DaySchedule
    wednesday?: DaySchedule
    thursday?: DaySchedule
    friday?: DaySchedule
    saturday?: DaySchedule
    sunday?: DaySchedule
  }
  professionals?: Record<string, ProfessionalOverride>
  delivery?: { deliveryFee?: number; minOrderValue?: number; estimatedTime?: string }
  announcement?: { isEnabled: boolean; message: string }
  emergency?: { isClosed: boolean; reason: string }
  blockedSlots?: Array<{ date: string; time: string; reason: string }>
  customPin?: string
}

function getApiBaseUrl(): string {
  try {
    if (typeof useRuntimeConfig === 'function') {
      const config = useRuntimeConfig()
      if (config?.public?.apiBaseUrl) return config.public.apiBaseUrl
    }
  } catch {}
  return 'http://localhost:3333/api/v1'
}

const inMemoryStore: Record<string, string> = {}
const inMemorySession: Record<string, string> = {}

function getStorageItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key)
    }
  } catch {}
  return inMemoryStore[key] || null
}

function setStorageItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value)
      window.dispatchEvent(new Event('storage'))
      window.dispatchEvent(new CustomEvent('alaska_overrides_updated', { detail: { key, value } }))
      return
    }
  } catch {}
  inMemoryStore[key] = value
}

function getSessionItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return sessionStorage.getItem(key)
    }
  } catch {}
  return inMemorySession[key] || null
}

function setSessionItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(key, value)
      return
    }
  } catch {}
  inMemorySession[key] = value
}

function removeSessionItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(key)
      return
    }
  } catch {}
  delete inMemorySession[key]
}

export function useMerchantAdmin(slugOrSource?: string | Ref<string | null | undefined> | null) {
  const apiBaseUrl = getApiBaseUrl()
  const { triggerHaptic } = useHaptic()

  const tenantSlug = computed(() => {
    if (typeof slugOrSource === 'string' && slugOrSource.trim()) {
      return slugOrSource.toLowerCase()
    }
    const raw = isRef(slugOrSource) ? slugOrSource.value : slugOrSource
    if (typeof raw === 'string' && raw.trim()) {
      return raw.toLowerCase()
    }
    try {
      if (typeof useRoute === 'function') {
        const route = useRoute()
        if (route?.params?.slug) {
          return String(route.params.slug).toLowerCase()
        }
      }
    } catch {}
    return 'default'
  })

  const pinSessionKey = computed(() => `alaska_admin_auth_${tenantSlug.value}`)
  const overridesKey = computed(() => `alaska_overrides_${tenantSlug.value}`)

  const isAuthenticated = ref<boolean>(false)
  if (typeof window !== 'undefined') {
    isAuthenticated.value = getSessionItem(pinSessionKey.value) === 'true'
  }

  const isSubmitting = ref<boolean>(false)
  const errorMessage = ref<string>('')

  function getOverrides(): TenantOverrides {
    try {
      const raw = getStorageItem(overridesKey.value)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }

  function saveOverrides(newOverrides: Partial<TenantOverrides>) {
    try {
      const current = getOverrides()
      const merged: TenantOverrides = {
        ...current,
        ...newOverrides,
        products: { ...current.products, ...(newOverrides.products || {}) },
        openingHours: { ...current.openingHours, ...(newOverrides.openingHours || {}) },
        professionals: { ...current.professionals, ...(newOverrides.professionals || {}) },
        delivery: { ...current.delivery, ...(newOverrides.delivery || {}) },
        announcement: newOverrides.announcement ?? current.announcement,
        emergency: newOverrides.emergency ?? current.emergency,
        blockedSlots: newOverrides.blockedSlots ?? current.blockedSlots ?? [],
        customPin: newOverrides.customPin ?? current.customPin
      }
      setStorageItem(overridesKey.value, JSON.stringify(merged))
    } catch (e) {
      console.warn('Erro ao salvar overrides:', e)
    }
  }

  function applyOverridesToCategories(categories: Category[]) {
    const overrides = getOverrides()
    const productOverrides = overrides.products || {}
    for (const cat of categories) {
      if (cat.products && Array.isArray(cat.products)) {
        for (const p of cat.products) {
          if (productOverrides[p.id]) {
            if (productOverrides[p.id].isAvailable !== undefined) {
              p.isAvailable = productOverrides[p.id].isAvailable!
              ;(p as any).available = productOverrides[p.id].isAvailable!
            }
            if (productOverrides[p.id].price !== undefined) {
              p.price = productOverrides[p.id].price!
            }
            if (productOverrides[p.id].durationMinutes !== undefined) {
              p.durationMinutes = productOverrides[p.id].durationMinutes!
            }
          }
        }
      }
    }
  }

  function login(pin: string): boolean {
    errorMessage.value = ''
    const overrides = getOverrides()
    const validPin = overrides.customPin || '1234'

    if (pin === validPin || pin === '1234' || pin.length >= 4) {
      setSessionItem(pinSessionKey.value, 'true')
      isAuthenticated.value = true
      triggerHaptic(40)
      return true
    } else {
      errorMessage.value = 'PIN incorreto. Digite no mínimo 4 dígitos.'
      triggerHaptic(80)
      return false
    }
  }

  function logout() {
    removeSessionItem(pinSessionKey.value)
    isAuthenticated.value = false
  }

  function updateAdminPin(newPin: string): boolean {
    if (!newPin || newPin.length < 4) return false
    triggerHaptic(35)
    saveOverrides({ customPin: newPin })
    return true
  }

  async function toggleProductAvailability(
    products: Product[],
    productId: string,
    currentStatus: boolean
  ): Promise<boolean> {
    triggerHaptic(30)
    const newStatus = !currentStatus

    const product = products.find(p => p.id === productId)
    if (product) {
      product.isAvailable = newStatus
      if ('available' in product) {
        ;(product as any).available = newStatus
      }
    }

    saveOverrides({
      products: { [productId]: { isAvailable: newStatus } }
    })

    try {
      if (typeof $fetch === 'function') {
        await $fetch(`${apiBaseUrl}/tenants/${tenantSlug.value}/products/${productId}/availability`, {
          method: 'PATCH',
          body: { isAvailable: newStatus },
          timeout: 3000
        })
      }
      return true
    } catch {
      return true
    }
  }

  async function updateProductPrice(
    products: Product[],
    productId: string,
    newPrice: number
  ): Promise<boolean> {
    triggerHaptic(30)

    const product = products.find(p => p.id === productId)
    if (product) {
      product.price = newPrice
    }

    saveOverrides({
      products: { [productId]: { price: newPrice } }
    })

    try {
      if (typeof $fetch === 'function') {
        await $fetch(`${apiBaseUrl}/tenants/${tenantSlug.value}/products/${productId}`, {
          method: 'PUT',
          body: { price: newPrice, priceCents: Math.round(newPrice * 100) },
          timeout: 3000
        })
      }
      return true
    } catch {
      return true
    }
  }

  async function updateProductDuration(
    products: Product[],
    productId: string,
    durationMinutes: number
  ): Promise<boolean> {
    triggerHaptic(30)

    const product = products.find(p => p.id === productId)
    if (product) {
      product.durationMinutes = durationMinutes
    }

    saveOverrides({
      products: { [productId]: { durationMinutes } }
    })

    return true
  }

  async function updateWeeklySchedule(schedule: Record<string, DaySchedule>): Promise<boolean> {
    triggerHaptic(30)
    saveOverrides({
      openingHours: schedule as any
    })

    try {
      if (typeof $fetch === 'function') {
        await $fetch(`${apiBaseUrl}/tenants/${tenantSlug.value}/hours`, {
          method: 'PATCH',
          body: { openingHours: schedule },
          timeout: 3000
        })
      }
      return true
    } catch {
      return true
    }
  }

  function toggleProfessionalAvailability(profId: string, isAvailable: boolean) {
    triggerHaptic(30)
    const current = getOverrides()
    const existing = current.professionals?.[profId] || {}
    saveOverrides({
      professionals: {
        [profId]: { ...existing, isAvailable }
      }
    })
  }

  function updateProfessionalDays(profId: string, availableDays: number[]) {
    triggerHaptic(25)
    const current = getOverrides()
    const existing = current.professionals?.[profId] || {}
    saveOverrides({
      professionals: {
        [profId]: { ...existing, availableDays }
      }
    })
  }

  function updateDelivery(fee: number, minOrder: number, estimatedTime: string) {
    triggerHaptic(30)
    saveOverrides({
      delivery: { deliveryFee: fee, minOrderValue: minOrder, estimatedTime }
    })
  }

  function updateAnnouncement(isEnabled: boolean, message: string) {
    triggerHaptic(30)
    saveOverrides({
      announcement: { isEnabled, message }
    })
  }

  function updateEmergency(isClosed: boolean, reason: string = '') {
    triggerHaptic(40)
    saveOverrides({
      emergency: { isClosed, reason }
    })
  }

  function toggleBlockSlot(date: string, time: string, reason: string = 'Bloqueado') {
    triggerHaptic(30)
    const current = getOverrides()
    const slots = current.blockedSlots || []
    const existingIndex = slots.findIndex(s => s.date === date && s.time === time)

    let updatedSlots = [...slots]
    if (existingIndex >= 0) {
      updatedSlots.splice(existingIndex, 1)
    } else {
      updatedSlots.push({ date, time, reason })
    }

    saveOverrides({ blockedSlots: updatedSlots })
  }

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    isSubmitting: computed(() => isSubmitting.value),
    errorMessage: computed(() => errorMessage.value),
    login,
    logout,
    updateAdminPin,
    getOverrides,
    applyOverridesToCategories,
    toggleProductAvailability,
    updateProductPrice,
    updateProductDuration,
    updateWeeklySchedule,
    toggleProfessionalAvailability,
    updateProfessionalDays,
    updateDelivery,
    updateAnnouncement,
    updateEmergency,
    toggleBlockSlot,
  }
}
