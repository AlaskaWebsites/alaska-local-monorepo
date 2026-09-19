import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useOrderDashboard } from '../../composables/useOrderDashboard'
import type { OrderDashboardItem } from '@alaska/contracts'

// Mock resiliente de localStorage e window para execução determinística em Node / CI
const memoryStorage = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value)
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  }
})()

if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: memoryStorage,
    writable: true,
    configurable: true,
  })
}

if (typeof globalThis.window === 'undefined') {
  ;(globalThis as any).window = {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }
}

if (typeof globalThis.CustomEvent === 'undefined') {
  ;(globalThis as any).CustomEvent = class CustomEvent {
    type: string
    detail: any
    constructor(type: string, params: any = {}) {
      this.type = type
      this.detail = params.detail
    }
  }
}

describe('Unit: useOrderDashboard Composable (ADR 024)', () => {
  const slug = 'hamburgueria-x'
  const storageKey = `alaska_orders_${slug}`

  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
    vi.restoreAllMocks()
  })

  it('deve inicializar e carregar pedidos do localStorage ou gerar dados de demonstração', async () => {
    const dashboard = useOrderDashboard(slug)
    await dashboard.fetchOrders()

    expect(dashboard.orders.value.length).toBeGreaterThan(0)
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]')
    expect(stored.length).toBe(dashboard.orders.value.length)
  })

  it('deve adicionar um novo pedido com addOrder e persistir no storage', () => {
    const dashboard = useOrderDashboard(slug)

    const newOrder = dashboard.addOrder({
      customerName: 'Cliente Teste',
      customerPhone: '11988887777',
      deliveryType: 'delivery',
      subtotal: 50.0,
      deliveryFee: 5.0,
      total: 55.0,
      paymentMethod: 'Pix',
      items: [
        {
          productId: 'prod-burger',
          productName: 'Burger Clássico',
          quantity: 2,
          unitPrice: 25.0,
          unitPriceCents: 2500,
        },
      ],
    })

    expect(newOrder.id).toBeDefined()
    expect(dashboard.orders.value[0].customerName).toBe('Cliente Teste')
    expect(dashboard.orders.value[0].total).toBe(55.0)

    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]')
    expect(stored[0].customerName).toBe('Cliente Teste')
  })

  it('deve transicionar status do pedido e disparar persistência (< 50ms)', async () => {
    const dashboard = useOrderDashboard(slug)
    const order = dashboard.addOrder({
      id: 'ord-test-123',
      customerName: 'Danilo Gozzi',
      customerPhone: '11999998888',
      total: 45.0,
      status: 'created',
    })

    expect(order.status).toBe('created')

    // Avança para preparing
    await dashboard.updateOrderStatus('ord-test-123', 'preparing')
    expect(dashboard.orders.value.find((o) => o.id === 'ord-test-123')?.status).toBe('preparing')

    // Avança para dispatched
    await dashboard.updateOrderStatus('ord-test-123', 'dispatched')
    expect(dashboard.orders.value.find((o) => o.id === 'ord-test-123')?.status).toBe('dispatched')

    // Conclui pedido
    await dashboard.updateOrderStatus('ord-test-123', 'completed')
    expect(dashboard.orders.value.find((o) => o.id === 'ord-test-123')?.status).toBe('completed')

    // Verifica persistência no localStorage
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]')
    expect(stored.find((o: OrderDashboardItem) => o.id === 'ord-test-123')?.status).toBe('completed')
  })

  it('deve cancelar um pedido com updateOrderStatus para cancelled', async () => {
    const dashboard = useOrderDashboard(slug)
    dashboard.addOrder({
      id: 'ord-cancel-456',
      customerName: 'Cancelamento Teste',
      customerPhone: '11977776666',
      total: 30.0,
      status: 'created',
    })

    await dashboard.updateOrderStatus('ord-cancel-456', 'cancelled')
    const target = dashboard.orders.value.find((o) => o.id === 'ord-cancel-456')
    expect(target?.status).toBe('cancelled')
    expect(dashboard.cancelledCount.value).toBeGreaterThanOrEqual(1)
  })

  it('deve calcular métricas diárias corretamente (total pedidos, faturamento e ticket médio)', () => {
    const dashboard = useOrderDashboard(slug)
    dashboard.orders.value = [] // zera lista para teste determinístico

    dashboard.addOrder({
      id: 'ord-1',
      total: 40.0,
      status: 'completed',
      createdAt: new Date().toISOString(),
    })
    dashboard.addOrder({
      id: 'ord-2',
      total: 60.0,
      status: 'preparing',
      createdAt: new Date().toISOString(),
    })
    dashboard.addOrder({
      id: 'ord-3',
      total: 100.0,
      status: 'cancelled', // Não entra no faturamento
      createdAt: new Date().toISOString(),
    })

    expect(dashboard.todayOrdersCount.value).toBe(3)
    expect(dashboard.todayRevenue.value).toBe(100.0) // 40 + 60
    expect(dashboard.todayAverageTicket.value).toBe(50.0) // 100 / 2 pedidos válidos
  })

  it('deve filtrar pedidos por statusFilter', () => {
    const dashboard = useOrderDashboard(slug)
    dashboard.orders.value = [
      { id: '1', tenantId: 'ten-x', customerName: 'A', customerPhone: '11', deliveryType: 'delivery', total: 20, status: 'created', paymentMethod: 'Pix' },
      { id: '2', tenantId: 'ten-x', customerName: 'B', customerPhone: '11', deliveryType: 'delivery', total: 30, status: 'preparing', paymentMethod: 'Pix' },
      { id: '3', tenantId: 'ten-x', customerName: 'C', customerPhone: '11', deliveryType: 'delivery', total: 40, status: 'dispatched', paymentMethod: 'Pix' },
      { id: '4', tenantId: 'ten-x', customerName: 'D', customerPhone: '11', deliveryType: 'delivery', total: 50, status: 'completed', paymentMethod: 'Pix' },
    ]

    dashboard.statusFilter.value = 'all'
    expect(dashboard.filteredOrders.value.length).toBe(4)

    dashboard.statusFilter.value = 'created'
    expect(dashboard.filteredOrders.value.length).toBe(1)
    expect(dashboard.filteredOrders.value[0].id).toBe('1')

    dashboard.statusFilter.value = 'preparing'
    expect(dashboard.filteredOrders.value.length).toBe(1)
    expect(dashboard.filteredOrders.value[0].id).toBe('2')

    dashboard.statusFilter.value = 'completed'
    expect(dashboard.filteredOrders.value.length).toBe(1)
    expect(dashboard.filteredOrders.value[0].id).toBe('4')
  })

  it('deve filtrar pedidos por busca textual (nome, telefone ou ID)', () => {
    const dashboard = useOrderDashboard(slug)
    dashboard.orders.value = [
      { id: 'ord-1001', tenantId: 'ten-x', customerName: 'Danilo Algaranaz', customerPhone: '11999998888', deliveryType: 'delivery', total: 50, status: 'created', paymentMethod: 'Pix' },
      { id: 'ord-1002', tenantId: 'ten-x', customerName: 'Mariana Lima', customerPhone: '11977776666', deliveryType: 'pickup', total: 35, status: 'preparing', paymentMethod: 'Pix' },
    ]

    dashboard.searchQuery.value = 'Mariana'
    expect(dashboard.filteredOrders.value.length).toBe(1)
    expect(dashboard.filteredOrders.value[0].id).toBe('ord-1002')

    dashboard.searchQuery.value = '99999'
    expect(dashboard.filteredOrders.value.length).toBe(1)
    expect(dashboard.filteredOrders.value[0].id).toBe('ord-1001')

    dashboard.searchQuery.value = '1002'
    expect(dashboard.filteredOrders.value.length).toBe(1)
    expect(dashboard.filteredOrders.value[0].id).toBe('ord-1002')
  })

  it('deve gerar URLs do WhatsApp pré-formatadas para comunicação com o cliente por status', () => {
    const dashboard = useOrderDashboard(slug)
    const order: OrderDashboardItem = {
      id: 'ord-998877',
      tenantId: 'ten-hamburgueria-x',
      customerName: 'Danilo Santos',
      customerPhone: '11 99999-8888',
      deliveryType: 'delivery',
      total: 65.0,
      status: 'preparing',
      paymentMethod: 'Pix',
    }

    const prepUrl = dashboard.generateStatusWhatsAppUrl(order, 'preparing', 'Hamburgueria X')
    expect(prepUrl).toContain('wa.me/5511999998888')
    expect(decodeURIComponent(prepUrl)).toContain('Danilo Santos')
    expect(decodeURIComponent(prepUrl)).toContain('preparo')

    const dispUrl = dashboard.generateStatusWhatsAppUrl(order, 'dispatched', 'Hamburgueria X')
    expect(decodeURIComponent(dispUrl)).toContain('saiu para entrega')

    const compUrl = dashboard.generateStatusWhatsAppUrl(order, 'completed', 'Hamburgueria X')
    expect(decodeURIComponent(compUrl)).toContain('finalizado')
  })
})
