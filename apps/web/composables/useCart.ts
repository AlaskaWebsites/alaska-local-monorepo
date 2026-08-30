// composables/useCart.ts
import { computed, isRef, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { useHaptic } from './useHaptic'
import type { CartItem, Tenant, DeliveryType, PaymentMethod, Address } from '~/types'

/**
 * Composable multi-tenant para gerenciamento e persistência reativa da sacola de compras.
 * Os itens são estritamente isolados e persistidos no localStorage com chave prefixada pelo slug da loja.
 * Ex: `alaska_cart_hamburgueria-x`, `alaska_cart_adega-prime`
 */
export function useCart(tenantSource?: Ref<Tenant | string | null | undefined> | Tenant | string | null) {
  const { triggerHaptic } = useHaptic()

  const tenantSlug = computed(() => {
    // 1. Se foi passado slug direto como string
    if (typeof tenantSource === 'string' && tenantSource.trim()) {
      return tenantSource.toLowerCase()
    }
    // 2. Se foi passado objeto Tenant ou Ref
    const raw = isRef(tenantSource) ? tenantSource.value : tenantSource
    if (raw && typeof raw === 'object' && 'slug' in raw && raw.slug) {
      return String(raw.slug).toLowerCase()
    }
    if (typeof raw === 'string' && raw.trim()) {
      return raw.toLowerCase()
    }
    // 3. Fallback síncrono seguro pela rota global do Nuxt (se disponível no runtime)
    try {
      // @ts-ignore
      if (typeof useRoute === 'function') {
        // @ts-ignore
        const route = useRoute()
        if (route?.params?.slug) {
          return String(route.params.slug).toLowerCase()
        }
      }
    } catch {}

    return 'default'
  })

  // Chave única e namespaced no localStorage para cada loja
  const storageKey = computed(() => `alaska_cart_${tenantSlug.value}`)

  // Armazenamento reativo e persistente no localStorage via VueUse (SSR-safe)
  const items = useLocalStorage<CartItem[]>(storageKey.value, [], {
    mergeDefaults: true,
    listenToStorageChanges: true,
  })

  function addItem(item: CartItem) {
    triggerHaptic(35)
    items.value.push(item)
  }

  function removeItem(index: number) {
    triggerHaptic(25)
    if (index >= 0 && index < items.value.length) {
      items.value.splice(index, 1)
    }
  }

  function updateQuantity(index: number, quantity: number) {
    triggerHaptic(20)
    if (index < 0 || index >= items.value.length) return
    if (quantity <= 0) {
      removeItem(index)
    } else {
      items.value[index].quantity = quantity
    }
  }

  function clearCart() {
    triggerHaptic(50)
    items.value = []
  }

  const totalItemsCount = computed(() => {
    return items.value.reduce((acc, item) => acc + (item.quantity || 1), 0)
  })

  const cartSubtotal = computed(() => {
    return items.value.reduce((acc, item) => acc + (item.unitPrice || 0) * (item.quantity || 1), 0)
  })

  const isEmpty = computed(() => items.value.length === 0)

  return {
    items,
    cartItems: items,
    addItem,
    addToCart: addItem,
    removeItem,
    removeCartItem: removeItem,
    updateQuantity,
    updateItemQuantity: updateQuantity,
    clearCart,
    totalItemsCount,
    totalItems: totalItemsCount,
    cartSubtotal,
    subtotal: cartSubtotal,
    isEmpty,
    storageKey,
  }
}

/**
 * Store Pinia (Legado / Compatibilidade com testes unitários globais)
 */
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    deliveryType: 'delivery' as DeliveryType,
    deliveryFee: 0,
    customerName: '',
    customerPhone: '',
    address: {
      street: '',
      number: '',
      neighborhood: '',
      complement: '',
    } as Address,
    paymentMethod: 'Pix' as PaymentMethod,
    changeFor: null as number | null,
  }),

  getters: {
    totalItems: (state): number =>
      (state.items || []).reduce((acc: number, item: CartItem) => acc + (item.quantity || 0), 0),

    subtotal: (state): number =>
      (state.items || []).reduce((acc: number, item: CartItem) => acc + (item.unitPrice || 0) * (item.quantity || 0), 0),

    total: (state): number => {
      const list = state.items || []
      if (list.length === 0) return 0
      const fee = state.deliveryType === 'delivery' ? (state.deliveryFee || 0) : 0
      const sub = list.reduce((acc: number, item: CartItem) => acc + (item.unitPrice || 0) * (item.quantity || 0), 0)
      return sub + fee
    },
  },

  actions: {
    addItem(item: CartItem) {
      this.items.push(item)
    },
    removeItem(index: number) {
      if (this.items && index >= 0 && index < this.items.length) {
        this.items.splice(index, 1)
      }
    },
    updateQuantity(index: number, quantity: number) {
      if (!this.items || index < 0 || index >= this.items.length) return
      if (quantity <= 0) {
        this.removeItem(index)
      } else {
        this.items[index].quantity = quantity
      }
    },
    clearCart() {
      this.items = []
      this.customerName = ''
      this.customerPhone = ''
      this.changeFor = null
    },
  },
})
