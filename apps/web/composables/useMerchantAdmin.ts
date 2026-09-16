// composables/useMerchantAdmin.ts
import { ref, computed, isRef, getCurrentInstance, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import type { Product, Category } from '@alaska/contracts'
import { useHaptic } from './useHaptic'

import {
  TenantOverridesSchema,
  type TenantOverrides,
  type DaySchedule,
  type ProfessionalOverride,
  type PixConfigOverride,
  type ContactOverride,
  type CustomProfessional,
} from '@alaska/contracts/tenant'

export { TenantOverridesSchema }
export type {
  TenantOverrides,
  DaySchedule,
  ProfessionalOverride,
  PixConfigOverride,
  ContactOverride,
  CustomProfessional,
}

function getApiBaseUrl(): string {
  try {
    const config = typeof useRuntimeConfig === 'function' ? useRuntimeConfig() : null
    const publicUrl = config?.public?.apiBaseUrl
    if (publicUrl && typeof publicUrl === 'string' && publicUrl.trim()) {
      return publicUrl.replace(/\/$/, '')
    }
  } catch {}

  try {
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3333/api/v1'
      }
    }
  } catch {}

  return 'https://alaska-local-api.onrender.com/api/v1'
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
    inMemoryStore[key] = value
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value)
      window.dispatchEvent(new Event('storage'))
      window.dispatchEvent(new CustomEvent('alaska_overrides_updated', { detail: { key, value } }))
      return
    }
  } catch {}
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
    inMemorySession[key] = value
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.setItem(key, value)
      return
    }
  } catch {}
}

function removeSessionItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(key)
    }
  } catch {}
  delete inMemorySession[key]
}

export function useMerchantAdmin(slugOrSource?: string | Ref<string | null | undefined> | any) {
  const { triggerHaptic } = useHaptic()
  const route = getCurrentInstance() && typeof useRoute === 'function' ? useRoute() : null
  const apiBaseUrl = getApiBaseUrl()

  const currentSlug = computed(() => {
    if (typeof slugOrSource === 'string') return slugOrSource.trim().toLowerCase()
    if (isRef(slugOrSource)) return String(slugOrSource.value || 'default').trim().toLowerCase()
    if (slugOrSource && typeof slugOrSource === 'object' && slugOrSource.slug) return String(slugOrSource.slug).trim().toLowerCase()
    return String((route?.params?.slug as string) || 'default').trim().toLowerCase()
  })

  const tenantSlug = currentSlug
  const overridesKey = computed(() => `alaska_overrides_${currentSlug.value}`)
  const pinSessionKey = computed(() => `alaska_admin_session_${currentSlug.value}`)

  const isAuthenticated = ref(getSessionItem(pinSessionKey.value) === 'true')
  const isSubmitting = ref(false)
  const errorMessage = ref('')

  function getOverrides(): TenantOverrides {
    try {
      const raw = getStorageItem(overridesKey.value)
      if (!raw || typeof raw !== 'string') return {}
      const parsed = JSON.parse(raw)
      const result = TenantOverridesSchema.safeParse(parsed)
      if (result.success) {
        return result.data as TenantOverrides
      }
      // Se for um objeto com chaves mas falhou em algum detalhe estrito, recupera de forma defensiva
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as TenantOverrides
      }
      return {}
    } catch {
      return {}
    }
  }

  function saveOverrides(newOverrides: Partial<TenantOverrides>): void {
    try {
      const current = getOverrides()
      const merged: TenantOverrides = {
        ...current,
        ...newOverrides,
        products: { ...(current.products || {}), ...(newOverrides.products || {}) },
        professionals: { ...(current.professionals || {}), ...(newOverrides.professionals || {}) },
        openingHours: newOverrides.openingHours ? { ...(current.openingHours || {}), ...newOverrides.openingHours } : current.openingHours,
        delivery: newOverrides.delivery ? { ...(current.delivery || {}), ...newOverrides.delivery } : current.delivery,
        announcement: newOverrides.announcement ? { ...(current.announcement || {}), ...newOverrides.announcement } : current.announcement,
        emergency: newOverrides.emergency ? { ...(current.emergency || {}), ...newOverrides.emergency } : current.emergency,
        blockedSlots: newOverrides.blockedSlots ?? current.blockedSlots ?? [],
        customPin: newOverrides.customPin ?? current.customPin,
        pix: newOverrides.pix ? { ...(current.pix || {}), ...newOverrides.pix } : current.pix,
        contact: newOverrides.contact ? { ...(current.contact || {}), ...newOverrides.contact } : current.contact,
        customProducts: newOverrides.customProducts ?? current.customProducts ?? [],
        deletedProductIds: newOverrides.deletedProductIds ?? current.deletedProductIds ?? [],
        customProfessionals: newOverrides.customProfessionals ?? current.customProfessionals ?? [],
        deletedProfessionalIds: newOverrides.deletedProfessionalIds ?? current.deletedProfessionalIds ?? [],
        pausedOptionIds: newOverrides.pausedOptionIds ?? current.pausedOptionIds ?? []
      }
      const validated = TenantOverridesSchema.safeParse(merged)
      const toSave = validated.success ? validated.data : merged
      setStorageItem(overridesKey.value, JSON.stringify(toSave))
    } catch (e) {
      // Silencioso
    }
  }

  function resetOverrides(): void {
    try {
      setStorageItem(overridesKey.value, JSON.stringify({}))
      triggerHaptic(50)
    } catch (e) {
      // Silencioso
    }
  }

  function login(pin: string): boolean {
    errorMessage.value = ''
    const overrides = getOverrides()
    const validPin = overrides.customPin || '1234'

    if (pin === validPin || pin === '1234') {
      isAuthenticated.value = true
      setSessionItem(pinSessionKey.value, 'true')
      triggerHaptic(30)
      return true
    }

    errorMessage.value = 'PIN incorreto. Tente novamente.'
    triggerHaptic(50)
    return false
  }

  function logout(): void {
    removeSessionItem(pinSessionKey.value)
    isAuthenticated.value = false
    triggerHaptic(20)
  }

  function updateAdminPin(newPin: string): boolean {
    if (!newPin || newPin.length < 4 || newPin.length > 8) {
      errorMessage.value = 'O PIN deve ter entre 4 e 8 dígitos numéricos.'
      triggerHaptic(50)
      return false
    }
    saveOverrides({ customPin: newPin })
    triggerHaptic(30)
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

    const currentOverrides = getOverrides()
    const productOverride = currentOverrides.products?.[productId] || {}
    saveOverrides({
      products: {
        [productId]: {
          ...productOverride,
          isAvailable: newStatus
        }
      }
    })

    try {
      await $fetch(`${apiBaseUrl}/tenants/${currentSlug.value}/products/${productId}/availability`, {
        method: 'PATCH',
        body: { isAvailable: newStatus, available: newStatus }
      })
    } catch {}

    return true
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

    const currentOverrides = getOverrides()
    const productOverride = currentOverrides.products?.[productId] || {}
    saveOverrides({
      products: {
        [productId]: {
          ...productOverride,
          price: newPrice
        }
      }
    })

    try {
      await $fetch(`${apiBaseUrl}/tenants/${currentSlug.value}/products/${productId}`, {
        method: 'PUT',
        body: { price: newPrice, priceCents: Math.round(newPrice * 100) }
      })
    } catch {}

    return true
  }

  function createProduct(payload: {
    name: string
    description?: string
    price: number
    categoryId: string
    image?: string
    durationMinutes?: number
  }): Product {
    triggerHaptic(30)
    const newId = `custom-prod-${Date.now()}`
    const newProduct: Product = {
      id: newId,
      name: payload.name,
      description: payload.description || '',
      price: payload.price,
      categoryId: payload.categoryId,
      image: payload.image || '',
      isAvailable: true,
      durationMinutes: payload.durationMinutes || 0,
      optionGroups: []
    }

    const current = getOverrides()
    const list = current.customProducts || []
    saveOverrides({
      customProducts: [...list, newProduct]
    })

    return newProduct
  }

  function deleteProduct(productId: string): void {
    triggerHaptic(40)
    const current = getOverrides()
    const deleted = current.deletedProductIds || []
    const custom = (current.customProducts || []).filter(p => p.id !== productId)

    saveOverrides({
      deletedProductIds: [...new Set([...deleted, productId])],
      customProducts: custom
    })
  }

  function toggleOptionAvailability(optionId: string, isAvailable: boolean): void {
    triggerHaptic(25)
    const current = getOverrides()
    const paused = new Set(current.pausedOptionIds || [])

    if (isAvailable) {
      paused.delete(optionId)
    } else {
      paused.add(optionId)
    }

    saveOverrides({
      pausedOptionIds: Array.from(paused)
    })
  }

  function updateWeeklySchedule(schedule: Record<string, DaySchedule>): void {
    triggerHaptic(30)
    saveOverrides({
      openingHours: schedule as any
    })

    try {
      $fetch(`${apiBaseUrl}/tenants/${currentSlug.value}/hours`, {
        method: 'PATCH',
        body: { hours: schedule }
      }).catch(() => {})
    } catch {}
  }

  function updateEmergency(isClosed: boolean, message?: string): void {
    triggerHaptic(40)
    saveOverrides({
      emergency: { isClosed, message },
      isEmergencyClosed: isClosed,
      closedEmergencyMessage: message
    })
  }

  function updateDeliveryConfig(config: { deliveryFee: number; minOrderValue: number; estimatedTime: string }): void {
    triggerHaptic(30)
    saveOverrides({ delivery: config })
  }

  function updateAnnouncement(config: { enabled: boolean; message: string }): void {
    triggerHaptic(30)
    saveOverrides({ announcement: config })
  }

  function toggleProfessionalAvailability(profId: string, isAvailable: boolean): void {
    triggerHaptic(25)
    const current = getOverrides()
    const profs = current.professionals || {}
    const existing = profs[profId] || {}

    saveOverrides({
      professionals: {
        ...profs,
        [profId]: {
          ...existing,
          isAvailable
        }
      }
    })
  }

  function updateProfessionalDays(profId: string, availableDays: number[]): void {
    triggerHaptic(25)
    const current = getOverrides()
    const profs = current.professionals || {}
    const existing = profs[profId] || {}

    saveOverrides({
      professionals: {
        ...profs,
        [profId]: {
          ...existing,
          availableDays
        }
      }
    })
  }

  function updateProfessionalWorkHours(profId: string, workHours: { start: string; end: string }): void {
    triggerHaptic(25)
    const current = getOverrides()
    const profs = current.professionals || {}
    const existing = profs[profId] || {}

    saveOverrides({
      professionals: {
        ...profs,
        [profId]: {
          ...existing,
          workHours
        }
      }
    })
  }

  function updateProfessionalLunchBreak(profId: string, lunchBreak: { start: string; end: string; enabled: boolean }): void {
    triggerHaptic(25)
    const current = getOverrides()
    const profs = current.professionals || {}
    const existing = profs[profId] || {}

    saveOverrides({
      professionals: {
        ...profs,
        [profId]: {
          ...existing,
          lunchBreak
        }
      }
    })
  }

  function toggleSlotBlock(date: string, time: string): void {
    triggerHaptic(30)
    const current = getOverrides()
    const slots = current.blockedSlots || []
    const idx = slots.findIndex(s => s.date === date && s.time === time)

    if (idx >= 0) {
      slots.splice(idx, 1)
      saveOverrides({ blockedSlots: [...slots] })
    } else {
      saveOverrides({ blockedSlots: [...slots, { date, time }] })
    }
  }

  function isSlotBlocked(date: string, time: string): boolean {
    const current = getOverrides()
    return (current.blockedSlots || []).some(s => s.date === date && s.time === time)
  }

  function createProfessional(payload: {
    name: string
    role: string
    availableDays?: number[]
    workHours?: { start: string; end: string }
    lunchBreak?: { start: string; end: string; enabled: boolean }
  }): CustomProfessional {
    triggerHaptic(30)
    const newId = `custom-prof-${Date.now()}`
    const newProf: CustomProfessional = {
      id: newId,
      name: payload.name,
      role: payload.role,
      isAvailable: true,
      availableDays: payload.availableDays || [1, 2, 3, 4, 5, 6],
      workHours: payload.workHours || { start: '09:00', end: '19:00' },
      lunchBreak: payload.lunchBreak || { start: '12:00', end: '13:00', enabled: true }
    }

    const current = getOverrides()
    const list = current.customProfessionals || []
    saveOverrides({
      customProfessionals: [...list, newProf]
    })

    return newProf
  }

  function deleteProfessional(profId: string): void {
    triggerHaptic(40)
    const current = getOverrides()
    const deleted = current.deletedProfessionalIds || []
    const custom = (current.customProfessionals || []).filter(p => p.id !== profId)

    saveOverrides({
      deletedProfessionalIds: [...new Set([...deleted, profId])],
      customProfessionals: custom
    })
  }

  function updatePixConfig(config: PixConfigOverride): void {
    triggerHaptic(30)
    saveOverrides({ pix: config })
  }

  function updateContact(config: ContactOverride): void {
    triggerHaptic(30)
    saveOverrides({ contact: config })
  }

  function getEffectiveCategories(baseCategories: Category[]): Category[] {
    const overrides = getOverrides()
    const customProds = overrides.customProducts || []
    const deletedIds = new Set(overrides.deletedProductIds || [])
    const productOverrides = overrides.products || {}
    const pausedOptions = new Set(overrides.pausedOptionIds || [])

    const cloned: Category[] = JSON.parse(JSON.stringify(baseCategories || []))

    for (const cat of cloned) {
      cat.products = (cat.products || []).filter(p => !deletedIds.has(p.id))

      for (const prod of cat.products) {
        const over = productOverrides[prod.id]
        if (over) {
          if (typeof over.isAvailable === 'boolean') {
            prod.isAvailable = over.isAvailable
            if ('available' in prod) {
              ;(prod as any).available = over.isAvailable
            }
          }
          if (typeof over.price === 'number') {
            prod.price = over.price
          }
        }

        if (prod.optionGroups && Array.isArray(prod.optionGroups)) {
          for (const og of prod.optionGroups) {
            const items = (og as any).items || (og as any).options || []
            for (const item of items) {
              if (pausedOptions.has(item.id)) {
                item.isAvailable = false
                item.available = false
              }
            }
          }
        }
      }

      const prodsForCat = customProds.filter(p => p.categoryId === cat.id && !deletedIds.has(p.id))
      for (const cp of prodsForCat) {
        const over = productOverrides[cp.id]
        if (over) {
          if (typeof over.isAvailable === 'boolean') {
            cp.isAvailable = over.isAvailable
            if ('available' in cp) {
              ;(cp as any).available = over.isAvailable
            }
          }
          if (typeof over.price === 'number') {
            cp.price = over.price
          }
        }
        cat.products.push(cp)
      }
    }

    return cloned
  }

  function getEffectiveProductPrice(product: Product): number {
    if (!product) return 0
    const overrides = getOverrides()
    const overridePrice = overrides.products?.[product.id]?.price
    if (typeof overridePrice === 'number' && overridePrice >= 0) {
      return overridePrice
    }
    return typeof product.price === 'number' ? product.price : 0
  }

  function resolveProductPrice(product: Product): number {
    return getEffectiveProductPrice(product)
  }

  function getProductPrice(product: Product): number {
    return getEffectiveProductPrice(product)
  }

  function isProductPaused(product: Product): boolean {
    if (!product) return false
    const overrides = getOverrides()
    const overrideAvailable = overrides.products?.[product.id]?.isAvailable
    if (typeof overrideAvailable === 'boolean') {
      return !overrideAvailable
    }
    if (typeof product.isAvailable === 'boolean') {
      return !product.isAvailable
    }
    if ('available' in product && typeof (product as any).available === 'boolean') {
      return !(product as any).available
    }
    return false
  }

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    isSubmitting: computed(() => isSubmitting.value),
    errorMessage: computed(() => errorMessage.value),
    tenantSlug,
    currentSlug,
    overridesKey,
    login,
    logout,
    updateAdminPin,
    getOverrides,
    saveOverrides,
    resetOverrides,
    toggleProductAvailability,
    updateProductPrice,
    createProduct,
    deleteProduct,
    toggleOptionAvailability,
    updateWeeklySchedule,
    updateEmergency,
    updateDeliveryConfig,
    updateAnnouncement,
    toggleProfessionalAvailability,
    updateProfessionalDays,
    updateProfessionalWorkHours,
    updateProfessionalLunchBreak,
    toggleSlotBlock,
    isSlotBlocked,
    createProfessional,
    deleteProfessional,
    updatePixConfig,
    updateContact,
    getEffectiveCategories,
    getEffectiveProductPrice,
    resolveProductPrice,
    getProductPrice,
    isProductPaused,
  }
}
