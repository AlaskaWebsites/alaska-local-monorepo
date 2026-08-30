import { ref, computed } from 'vue'
import type { Product, Category, OpeningHours } from '@alaska/contracts'
import { useHaptic } from './useHaptic'

export interface TenantOverrides {
  products?: Record<string, { isAvailable?: boolean; price?: number; durationMinutes?: number }>
  openingHours?: { open?: string; close?: string }
  delivery?: { deliveryFee?: number; minOrderValue?: number; estimatedTime?: string }
  announcement?: { isEnabled: boolean; message: string }
  emergency?: { isClosed: boolean; reason: string }
  blockedSlots?: Array<{ date: string; time: string; reason: string }>
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

export function useMerchantAdmin(slug: string) {
  const apiBaseUrl = getApiBaseUrl()
  const { triggerHaptic } = useHaptic()
  const pinSessionKey = `alaska_admin_auth_${slug}`
  const overridesKey = `alaska_overrides_${slug}`

  const isAuthenticated = ref<boolean>(false)
  const isSubmitting = ref<boolean>(false)
  const errorMessage = ref<string>('')

  if (typeof window !== 'undefined') {
    isAuthenticated.value = sessionStorage.getItem(pinSessionKey) === 'true'
  }

  function getOverrides(): TenantOverrides {
    if (typeof window === 'undefined') return {}
    try {
      const raw = localStorage.getItem(overridesKey)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }

  function saveOverrides(newOverrides: Partial<TenantOverrides>) {
    if (typeof window === 'undefined') return
    try {
      const current = getOverrides()
      const merged: TenantOverrides = {
        ...current,
        ...newOverrides,
        products: { ...current.products, ...(newOverrides.products || {}) },
        delivery: { ...current.delivery, ...(newOverrides.delivery || {}) },
        announcement: newOverrides.announcement ?? current.announcement,
        emergency: newOverrides.emergency ?? current.emergency,
        blockedSlots: newOverrides.blockedSlots ?? current.blockedSlots ?? []
      }
      localStorage.setItem(overridesKey, JSON.stringify(merged))
      window.dispatchEvent(new Event('storage'))
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
    if (pin === '1234' || pin.length >= 4) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(pinSessionKey, 'true')
      }
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
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(pinSessionKey)
    }
    isAuthenticated.value = false
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
        await $fetch(`${apiBaseUrl}/tenants/${slug}/products/${productId}/availability`, {
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
        await $fetch(`${apiBaseUrl}/tenants/${slug}/products/${productId}`, {
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

  async function updateHours(openTime: string, closeTime: string): Promise<boolean> {
    triggerHaptic(30)
    saveOverrides({
      openingHours: { open: openTime, close: closeTime }
    })

    try {
      if (typeof $fetch === 'function') {
        await $fetch(`${apiBaseUrl}/tenants/${slug}/hours`, {
          method: 'PATCH',
          body: { openingHours: { open: openTime, close: closeTime } },
          timeout: 3000
        })
      }
      return true
    } catch {
      return true
    }
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
    getOverrides,
    applyOverridesToCategories,
    toggleProductAvailability,
    updateProductPrice,
    updateProductDuration,
    updateHours,
    updateDelivery,
    updateAnnouncement,
    updateEmergency,
    toggleBlockSlot,
  }
}
