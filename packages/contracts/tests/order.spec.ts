import { describe, it, expect } from 'vitest'
import {
  CreateOrderSchema,
  OrderStatusSchema,
  UpdateOrderStatusSchema,
} from '../src/order'

describe('Order Schemas (@alaska/contracts/order)', () => {
  it('deve validar a criação de um pedido de entrega', () => {
    const validOrder = {
      tenantSlug: 'hamburgueria-x',
      items: [
        {
          productId: 'prod-burger-01',
          name: 'Smash Bacon Duplo',
          quantity: 2,
          unitPrice: 32.5,
          selectedOptions: [
            { groupName: 'Ponto', itemName: 'Ao Ponto', price: 0 },
          ],
        },
      ],
      customer: {
        name: 'Danilo Silva',
        phone: '11988887777',
      },
      deliveryType: 'delivery',
      paymentMethod: 'pix',
    }

    const parsed = CreateOrderSchema.parse(validOrder)
    expect(parsed.items).toHaveLength(1)
  })

  it('deve rejeitar pedidos sem itens', () => {
    const emptyOrder = {
      tenantSlug: 'hamburgueria-x',
      items: [],
      customer: { name: 'Danilo', phone: '11988887777' },
      deliveryType: 'pickup',
      paymentMethod: 'money',
    }
    expect(() => CreateOrderSchema.parse(emptyOrder)).toThrow()
  })

  describe('UpdateOrderStatusSchema (ADR 013 / Fase 2)', () => {
    it('deve validar todos os status operacionais da esteira de pedidos', () => {
      const validStatuses = [
        'created',
        'pending_payment',
        'confirmed',
        'preparing',
        'dispatched',
        'completed',
        'cancelled',
      ] as const

      validStatuses.forEach((status) => {
        expect(OrderStatusSchema.parse(status)).toBe(status)
        expect(UpdateOrderStatusSchema.parse({ status })).toEqual({ status })
      })
    })

    it('deve rejeitar status desconhecido no UpdateOrderStatusSchema', () => {
      expect(() => UpdateOrderStatusSchema.parse({ status: 'invalid_status' })).toThrow()
      expect(() => UpdateOrderStatusSchema.parse({})).toThrow()
    })
  })
})
