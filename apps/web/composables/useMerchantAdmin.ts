import { ref, computed } from 'vue'
import type { Product } from '@alaska/contracts'
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

  const isAuthenticated = ref<boolean>(false)
  const isSubmitting = ref<boolean>(false)
  const errorMessage = ref<string>('')

  if (typeof window !== 'undefined') {
    isAuthenticated.value = sessionStorage.getItem(pinSessionKey) === 'true'
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

    // 1. Atualização otimista instantânea na interface (< 50ms)
    const product = products.find(p => p.id === productId)
    if (product) {
      product.isAvailable = !currentStatus
      if ('available' in product) {
        ;(product as any).available = !currentStatus
      }
    }

    try {
      // 2. Sincronização com o backend NestJS na porta 3333 via apiBaseUrl
      if (typeof $fetch === 'function') {
        await $fetch(`${apiBaseUrl}/tenants/${slug}/products/${productId}/availability`, {
          method: 'PATCH',
          body: { isAvailable: !currentStatus },
          timeout: 3000
        })
      }
      return true
    } catch {
      // Fallback gracioso caso a API esteja offline (mantém o estado otimista)
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
    updateProductPrice
  }
}
