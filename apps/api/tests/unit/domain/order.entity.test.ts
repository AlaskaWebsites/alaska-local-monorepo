import { describe, it, expect } from 'vitest'
import { Order } from '@core/domain/entities/order.entity'
import { Address } from '@core/domain/value-objects/address.vo'

describe('Unit: Entidade Order', () => {
  const sampleAddress = new Address({
    street: 'Rua das Palmeiras',
    number: '200',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP'
  })

  it('deve calcular subtotal e total com entrega corretamente', () => {
    const order = new Order({
      id: 'ord-1',
      tenantId: 'ten-1',
      customerName: 'Danilo Santos',
      customerPhone: '11999998888',
      deliveryType: 'delivery',
      address: sampleAddress,
      deliveryFeeCents: 500, // R$ 5,00
      paymentMethod: 'Pix',
      items: [
        {
          productId: 'prod-1',
          productName: 'X-Salada',
          quantity: 2,
          unitPriceCents: 2500, // R$ 25,00
          options: [{ id: 'opt-1', name: 'Bacon', priceCents: 300 }] // + R$ 3,00
        }
      ]
    })

    // (25 + 3) * 2 = R$ 56,00 subtotal
    expect(order.calculateSubtotal().amount).toBe(56.00)
    // 56 + 5 = R$ 61,00 total
    expect(order.calculateTotal().amount).toBe(61.00)
  })

  it('deve zerar taxa de entrega para modalidade Retirada', () => {
    const order = new Order({
      id: 'ord-2',
      tenantId: 'ten-1',
      customerName: 'Danilo Santos',
      customerPhone: '11999998888',
      deliveryType: 'pickup',
      deliveryFeeCents: 500,
      paymentMethod: 'Dinheiro',
      items: [
        {
          productId: 'prod-1',
          productName: 'Pizza Grande',
          quantity: 1,
          unitPriceCents: 6000
        }
      ]
    })

    expect(order.calculateTotal().amount).toBe(60.00)
  })

  it('deve atualizar o status operacional com updateStatus (ADR 013 / Fase 3)', () => {
    const order = new Order({
      id: 'ord-3',
      tenantId: 'ten-1',
      customerName: 'Danilo Santos',
      customerPhone: '11999998888',
      deliveryType: 'delivery',
      address: sampleAddress,
      deliveryFeeCents: 500,
      paymentMethod: 'Pix',
      items: [
        {
          productId: 'prod-1',
          productName: 'X-Burger',
          quantity: 1,
          unitPriceCents: 2000
        }
      ]
    })

    expect(order.status).toBe('pending_payment')
    order.updateStatus('confirmed')
    expect(order.status).toBe('confirmed')
    order.updateStatus('preparing')
    expect(order.status).toBe('preparing')
    order.updateStatus('dispatched')
    expect(order.status).toBe('dispatched')
    order.updateStatus('completed')
    expect(order.status).toBe('completed')
  })
})
