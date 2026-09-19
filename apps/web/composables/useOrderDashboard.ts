import { ref, computed, onMounted, onUnmounted, type Ref, isRef } from 'vue'
import { useRoute } from 'vue-router'
import { useHaptic } from './useHaptic'
import type { OrderStatus, OrderDashboardItem } from '@alaska/contracts'

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

function getStoredOrders(key: string): OrderDashboardItem[] {
  try {
    if (typeof localStorage === 'undefined') return []
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveStoredOrders(key: string, orders: OrderDashboardItem[]): void {
  try {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(key, JSON.stringify(orders))
  } catch {}
}

export function useOrderDashboard(slugOrSource?: string | Ref<string> | null | undefined) {
  const route = typeof useRoute === 'function' ? useRoute() : null
  const { triggerHaptic } = useHaptic()
  const apiBaseUrl = getApiBaseUrl()

  const currentSlug = computed(() => {
    if (typeof slugOrSource === 'string') return slugOrSource.trim().toLowerCase()
    if (isRef(slugOrSource)) return String(slugOrSource.value || 'default').trim().toLowerCase()
    if (slugOrSource && typeof slugOrSource === 'object' && (slugOrSource as any).slug) {
      return String((slugOrSource as any).slug).trim().toLowerCase()
    }
    return String((route?.params?.slug as string) || 'default').trim().toLowerCase()
  })

  const storageKey = computed(() => `alaska_orders_${currentSlug.value}`)

  const orders = ref<OrderDashboardItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isAutoRefresh = ref(true)
  const lastUpdated = ref<Date | null>(null)
  const searchQuery = ref('')
  const statusFilter = ref<OrderStatus | 'all'>('all')

  let refreshTimer: any = null

  // 1. Carregamento de Pedidos (Híbrido: LocalStorage + API NestJS)
  async function fetchOrders(): Promise<void> {
    loading.value = true
    error.value = null

    // Leitura local inicial para exibição instantânea (< 50ms)
    const local = getStoredOrders(storageKey.value)
    if (local.length > 0 && orders.value.length === 0) {
      orders.value = local
    }

    try {
      if (typeof $fetch === 'function') {
        const url = `${apiBaseUrl}/orders/tenant/${currentSlug.value}`
        const res = await $fetch<any>(url, { timeout: 4500 }).catch(() => null)

        if (res && res.success && Array.isArray(res.data)) {
          const remoteOrders: OrderDashboardItem[] = res.data

          // Mescla desduplicada priorizando pedidos remotos autoritativos
          const map = new Map<string, OrderDashboardItem>()
          local.forEach((o) => map.set(o.id, o))
          remoteOrders.forEach((o) => map.set(o.id, o))

          const merged = Array.from(map.values()).sort((a, b) => {
            const timeA = new Date(a.createdAt || 0).getTime()
            const timeB = new Date(b.createdAt || 0).getTime()
            return timeB - timeA
          })

          orders.value = merged
          saveStoredOrders(storageKey.value, merged)
          lastUpdated.value = new Date()
          loading.value = false
          return
        }
      }
    } catch (err: any) {
      error.value = err?.message || 'Falha ao sincronizar pedidos com o servidor.'
    }

    // Se a API estiver offline e não houver pedidos locais, gera comanda demo realista
    if (orders.value.length === 0) {
      const demoOrders: OrderDashboardItem[] = [
        {
          id: `ord-${Date.now().toString().slice(-4)}1`,
          tenantId: `ten-${currentSlug.value}`,
          customerName: 'Danilo Algaranaz',
          customerPhone: '11999998888',
          deliveryType: 'delivery',
          address: {
            street: 'Rua das Flores',
            number: '450',
            neighborhood: 'Centro',
            city: 'São Paulo',
            state: 'SP',
            complement: 'Apto 12',
            reference: 'Próximo à praça',
            cep: '01001-000',
          },
          items: [
            {
              productId: 'prod-demo-1',
              productName: 'Combo Especial da Casa',
              quantity: 1,
              unitPrice: 38.9,
              unitPriceCents: 3890,
              options: [{ id: 'opt-1', name: 'Bacon Crocante Extra', price: 5.0, priceCents: 500 }],
              notes: 'Sem cebola, por favor',
            },
            {
              productId: 'prod-demo-2',
              productName: 'Refrigerante Lata 350ml',
              quantity: 2,
              unitPrice: 6.0,
              unitPriceCents: 600,
            },
          ],
          paymentMethod: 'Pix',
          subtotal: 55.9,
          deliveryFee: 6.0,
          total: 61.9,
          status: 'created',
          pixCode: '00020126580014br.gov.bcb.pix...',
          notes: 'Tocar a campainha ao chegar',
          createdAt: new Date().toISOString(),
        },
        {
          id: `ord-${Date.now().toString().slice(-4)}2`,
          tenantId: `ten-${currentSlug.value}`,
          customerName: 'Mariana Souza',
          customerPhone: '11988887777',
          deliveryType: 'pickup',
          address: null,
          items: [
            {
              productId: 'prod-demo-3',
              productName: 'Item Promocional do Dia',
              quantity: 1,
              unitPrice: 29.9,
              unitPriceCents: 2990,
            },
          ],
          paymentMethod: 'Cartão de Crédito',
          subtotal: 29.9,
          deliveryFee: 0,
          total: 29.9,
          status: 'preparing',
          notes: 'Vou retirar em 20 minutos',
          createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
        },
      ]

      orders.value = demoOrders
      saveStoredOrders(storageKey.value, demoOrders)
    }

    lastUpdated.value = new Date()
    loading.value = false
  }

  // 2. Atualização de Status Operacional em Tempo Real (< 50ms)
  async function updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<boolean> {
    triggerHaptic(30)
    const target = orders.value.find((o) => o.id === orderId)
    if (!target) return false

    // Mutação otimista na memória e na UI
    target.status = newStatus

    // Persistência local imediata
    saveStoredOrders(storageKey.value, orders.value)

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(
        new CustomEvent('alaska_orders_updated', {
          detail: { orderId, status: newStatus },
        }),
      )
    }

    // Persistência assíncrona no PostgreSQL via API NestJS
    try {
      if (typeof $fetch === 'function') {
        await $fetch(`${apiBaseUrl}/orders/${orderId}/status`, {
          method: 'PATCH',
          body: { status: newStatus },
          timeout: 4000,
        }).catch(() => {})
      }
    } catch {}

    return true
  }

  // 3. Adição de Novo Pedido (usado na sacola ou admin)
  function addOrder(orderData: Partial<OrderDashboardItem>): OrderDashboardItem {
    triggerHaptic(35)
    const newOrder: OrderDashboardItem = {
      id: orderData.id || `ord-${Date.now()}`,
      tenantId: orderData.tenantId || `ten-${currentSlug.value}`,
      customerName: orderData.customerName || 'Cliente Balcão',
      customerPhone: orderData.customerPhone || '',
      deliveryType: orderData.deliveryType || 'delivery',
      address: orderData.address || null,
      items: orderData.items || [],
      paymentMethod: orderData.paymentMethod || 'Pix',
      subtotal: orderData.subtotal || 0,
      deliveryFee: orderData.deliveryFee || 0,
      total: orderData.total || 0,
      status: orderData.status || 'created',
      pixCode: orderData.pixCode || null,
      notes: orderData.notes || '',
      createdAt: orderData.createdAt || new Date().toISOString(),
    }

    orders.value = [newOrder, ...orders.value]
    saveStoredOrders(storageKey.value, orders.value)

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(
        new CustomEvent('alaska_orders_updated', {
          detail: { orderId: newOrder.id, status: newOrder.status },
        }),
      )
    }

    // Envio para o backend em background
    try {
      if (typeof $fetch === 'function') {
        $fetch(`${apiBaseUrl}/orders`, {
          method: 'POST',
          body: {
            tenantSlug: currentSlug.value,
            customerName: newOrder.customerName,
            customerPhone: newOrder.customerPhone || '11999999999',
            deliveryType: newOrder.deliveryType === 'pickup' ? 'pickup' : 'delivery',
            address: newOrder.address || undefined,
            items: newOrder.items.map((i) => ({
              productId: i.productId || 'prod-item',
              productName: i.productName,
              quantity: i.quantity,
              unitPriceCents: i.unitPriceCents || Math.round((i.unitPrice || 0) * 100),
              options: i.options || [],
              notes: i.notes,
            })),
            paymentMethod: newOrder.paymentMethod,
            notes: newOrder.notes,
          },
          timeout: 4000,
        }).catch(() => {})
      }
    } catch {}

    return newOrder
  }

  // 4. Gerador de Mensagens e Links do WhatsApp por Status
  function generateStatusWhatsAppUrl(
    order: OrderDashboardItem,
    status: OrderStatus,
    tenantName: string,
  ): string {
    const cleanPhone = (order.customerPhone || '').replace(/\D/g, '')
    if (!cleanPhone) return ''

    const shortId = order.id.slice(-6).toUpperCase()

    let message = ''
    switch (status) {
      case 'confirmed':
        message = `👍 *PEDIDO CONFIRMADO!*\n\nOlá, *${order.customerName}*! Seu pedido *#${shortId}* no *${tenantName}* foi confirmado e já entrou na esteira.\n\nFique de olho, avisaremos assim que iniciar o preparo!`
        break
      case 'preparing':
        message = `👨‍🍳 *PEDIDO EM PREPARO!*\n\nOlá, *${order.customerName}*! Seu pedido *#${shortId}* no *${tenantName}* já está sendo preparado com todo carinho!\n\nAvisaremos quando sair para entrega.`
        break
      case 'dispatched':
        message =
          order.deliveryType === 'pickup'
            ? `🛍️ *PRONTO PARA RETIRADA!*\n\nOlá, *${order.customerName}*! Seu pedido *#${shortId}* no *${tenantName}* está prontinho esperando por você no balcão!`
            : `🛵 *SAIU PARA ENTREGA!*\n\nOlá, *${order.customerName}*! Seu pedido *#${shortId}* no *${tenantName}* acabou de sair com o entregador.\n\nPor favor, fique atento(a) ao interfone ou portão!`
        break
      case 'completed':
        message = `✅ *PEDIDO FINALIZADO!*\n\nOlá, *${order.customerName}*! Seu pedido *#${shortId}* foi concluído com sucesso.\n\nMuito obrigado pela preferência no *${tenantName}*! Esperamos que goste e volte sempre! ⭐`
        break
      case 'cancelled':
        message = `❌ *PEDIDO CANCELADO*\n\nOlá, *${order.customerName}*. Informamos que o pedido *#${shortId}* no *${tenantName}* precisou ser cancelado.\n\nSe tiver qualquer dúvida ou desejar refazer, estamos à disposição por aqui.`
        break
      default:
        message = `📋 *ATUALIZAÇÃO DO PEDIDO #${shortId}*\n\nOlá, *${order.customerName}*! O status do seu pedido no *${tenantName}* agora é: *${status}*.`
    }

    return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`
  }

  // 5. Cálculos & Filtros Computados
  const filteredOrders = computed(() => {
    let list = orders.value

    if (statusFilter.value !== 'all') {
      if (statusFilter.value === 'created') {
        list = list.filter((o) => o.status === 'created' || o.status === 'pending_payment')
      } else if (statusFilter.value === 'preparing') {
        list = list.filter((o) => o.status === 'preparing' || o.status === 'confirmed')
      } else {
        list = list.filter((o) => o.status === statusFilter.value)
      }
    }

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      list = list.filter(
        (o) =>
          o.customerName.toLowerCase().includes(q) ||
          (o.customerPhone && o.customerPhone.includes(q)) ||
          o.id.toLowerCase().includes(q),
      )
    }

    return list
  })

  const todayOrders = computed(() => {
    const today = new Date().toISOString().slice(0, 10)
    return orders.value.filter((o) => {
      const dateStr = o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 10) : today
      return dateStr === today
    })
  })

  const todayOrdersCount = computed(() => todayOrders.value.length)

  const todayRevenue = computed(() => {
    return todayOrders.value
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0)
  })

  const todayAverageTicket = computed(() => {
    const valid = todayOrders.value.filter((o) => o.status !== 'cancelled')
    if (valid.length === 0) return 0
    return todayRevenue.value / valid.length
  })

  const pendingCount = computed(
    () => orders.value.filter((o) => o.status === 'created' || o.status === 'pending_payment').length,
  )

  const preparingCount = computed(
    () => orders.value.filter((o) => o.status === 'preparing' || o.status === 'confirmed').length,
  )

  const dispatchedCount = computed(() => orders.value.filter((o) => o.status === 'dispatched').length)

  const completedCount = computed(() => orders.value.filter((o) => o.status === 'completed').length)

  const cancelledCount = computed(() => orders.value.filter((o) => o.status === 'cancelled').length)

  // 6. Polling Inteligente (15s)
  function startPolling(): void {
    stopPolling()
    refreshTimer = setInterval(() => {
      if (isAutoRefresh.value && typeof document !== 'undefined' && !document.hidden) {
        fetchOrders()
      }
    }, 15000)
  }

  function stopPolling(): void {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  try {
    onMounted(() => {
      fetchOrders()
      startPolling()
    })

    onUnmounted(() => {
      stopPolling()
    })
  } catch {}

  return {
    orders,
    filteredOrders,
    loading,
    error,
    isAutoRefresh,
    lastUpdated,
    searchQuery,
    statusFilter,
    todayOrdersCount,
    todayRevenue,
    todayAverageTicket,
    pendingCount,
    preparingCount,
    dispatchedCount,
    completedCount,
    cancelledCount,
    fetchOrders,
    updateOrderStatus,
    addOrder,
    generateStatusWhatsAppUrl,
  }
}
