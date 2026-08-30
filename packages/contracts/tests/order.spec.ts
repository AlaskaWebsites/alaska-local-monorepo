import { describe, it, expect } from 'vitest'
import { CreateOrderSchema } from '../src/order'

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
            { groupName: 'Ponto', itemName: 'Ao Ponto', price: 0 }
          ]
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
})
