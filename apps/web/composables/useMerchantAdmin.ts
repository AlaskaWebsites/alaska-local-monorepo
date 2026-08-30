import { ref, computed, watch } from 'vue'
import type { Product, Category } from '@alaska/contracts'
import { useHaptic } from './useHaptic'

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

  function getLocalOverrides(): Record<string, { isAvailable?: boolean; price?: number }> {
    if (typeof window === 'undefined') return {}
    try {
      const raw = localStorage.getItem(overridesKey)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }

  function saveLocalOverride(productId: string, override: { isAvailable?: boolean; price?: number }) {
    if (typeof window === 'undefined') return
    try {
      const current = getLocalOverrides()
      current[productId] = { ...current[productId], ...override }
      localStorage.setItem(overridesKey, JSON.stringify(current))
    } catch (e) {
      console.warn('Erro ao salvar override no localStorage:', e)
    }
  }

  function applyOverridesToCategories(categories: Category[]) {
    const overrides = getLocalOverrides()
    for (const cat of categories) {
      if (cat.products && Array.isArray(cat.products)) {
        for (const p of cat.products) {
          if (overrides[p.id]) {
            if (overrides[p.id].isAvailable !== undefined) {
              p.isAvailable = overrides[p.id].isAvailable!
              ;(p as any).available = overrides[p.id].isAvailable!
            }
            if (overrides[p.id].price !== undefined) {
              p.price = overrides[p.id].price!
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

    // 1. Atualização reativa imediata na UI (< 50ms)
    const product = products.find(p => p.id === productId)
    if (product) {
      product.isAvailable = newStatus
      if ('available' in product) {
        ;(product as any).available = newStatus
      }
    }

    // 2. Persistência de override local instantânea para que a vitrine reflita na hora
    saveLocalOverride(productId, { isAvailable: newStatus })

    try {
      // 3. Sincronização assíncrona com o backend NestJS
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

    saveLocalOverride(productId, { price: newPrice })

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

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    isSubmitting: computed(() => isSubmitting.value),
    errorMessage: computed(() => errorMessage.value),
    login,
    logout,
    toggleProductAvailability,
    updateProductPrice,
    applyOverridesToCategories
  }
}
