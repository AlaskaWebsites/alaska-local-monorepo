// composables/useCart.ts
import { computed, isRef, type Ref } from 'vue'
import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'
import { useHaptic } from './useHaptic'
import type { CartItem, Tenant, DeliveryType, PaymentMethod, Address } from '~/types'

function areOptionsEqual(opt1?: any[], opt2?: any[]): boolean {
  const list1 = Array.isArray(opt1) ? opt1 : []
  const list2 = Array.isArray(opt2) ? opt2 : []
  if (list1.length !== list2.length) return false

  const keys1 = list1.map(o => o.id || o.name || o.label).sort().join(',')
  const keys2 = list2.map(o => o.id || o.name || o.label).sort().join(',')
  return keys1 === keys2
}

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
    
    const productId = item.product?.id || item.id
    const itemObs = (item.observations || item.notes || item.observation || '').trim()

    // Verifica se já existe exatamente o mesmo item com as mesmas opções e observações para somar a quantidade
    const existingIndex = items.value.findIndex(existing => {
      const existingId = existing.product?.id || existing.id
      if (existingId !== productId) return false

      const existingObs = (existing.observations || existing.notes || existing.observation || '').trim()
      if (existingObs !== itemObs) return false

      return areOptionsEqual(existing.options, item.options)
    })

    if (existingIndex >= 0) {
      items.value[existingIndex].quantity = (items.value[existingIndex].quantity || 1) + (item.quantity || 1)
    } else {
      items.value.push({ ...item })
    }
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
    return items.value.reduce((acc, item) => {
      const price = item.unitPrice || item.product?.price || 0
      return acc + price * (item.quantity || 1)
    }, 0)
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
      (state.items || []).reduce((acc: number, item: CartItem) => {
        const price = item.unitPrice || item.product?.price || 0
        return acc + price * (item.quantity || 0)
      }, 0),

    total: (state): number => {
      const list = state.items || []
      if (list.length === 0) return 0
      const fee = state.deliveryType === 'delivery' ? (state.deliveryFee || 0) : 0
      const sub = list.reduce((acc: number, item: CartItem) => {
        const price = item.unitPrice || item.product?.price || 0
        return acc + price * (item.quantity || 0)
      }, 0)
      return sub + fee
    },
  },

  actions: {
    addItem(item: CartItem) {
      const productId = item.product?.id || item.id
      const itemObs = (item.observations || item.notes || item.observation || '').trim()

      const existingIndex = this.items.findIndex(existing => {
        const existingId = existing.product?.id || existing.id
        if (existingId !== productId) return false

        const existingObs = (existing.observations || existing.notes || existing.observation || '').trim()
        if (existingObs !== itemObs) return false

        return areOptionsEqual(existing.options, item.options)
      })

      if (existingIndex >= 0) {
        this.items[existingIndex].quantity = (this.items[existingIndex].quantity || 1) + (item.quantity || 1)
      } else {
        this.items.push(item)
      }
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
