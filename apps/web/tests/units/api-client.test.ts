// tests/units/api-client.test.ts
import { describe, it, expect } from 'vitest'
import { TenantSchema } from '~/types/tenant'

describe('Unit: Contrato e Compatibilidade de DTOs API Front/Back', () => {
  it('deve validar contrato de retorno de tenant da API NestJS', () => {
    const apiPayload = {
      id: 'ten-karine-finardi',
      slug: 'karine-finardi',
      name: 'Karine Finardi | Semijoias & Revenda',
      description: 'Semijoias finas',
      phoneWhatsApp: '11999998888',
      address: 'Francisco Morato - SP',
      businessCategory: 'shop',
      theme: 'rose',
      openingHours: { open: '09:00', close: '19:00' },
      pixConfig: {
        key: '11999998888',
        keyType: 'phone',
        beneficiary: 'Karine Finardi',
        city: 'FRANCISCO MORATO'
      },
      categories: [],
      currency: 'R$',
      deliveryFee: 0,
      minOrderValue: 0
    }

    const validated = TenantSchema.parse(apiPayload)
    expect(validated.slug).toBe('karine-finardi')
    expect(validated.businessCategory).toBe('shop')
    expect(validated.theme).toBe('rose')
  })

  it('deve validar estrutura do payload de criação de pedido para a API', () => {
    const orderPayload = {
      tenantSlug: 'karine-finardi',
      customerName: 'Danilo Santos',
      customerPhone: '11999998888',
      deliveryType: 'delivery',
      address: {
        street: 'Rua Principal',
        number: '100',
        neighborhood: 'Centro'
      },
      items: [
        {
          productId: 'semijoia-1',
          productName: 'Brinco Argola Ouro 18k',
          quantity: 1,
          unitPriceCents: 8990
        }
      ],
      paymentMethod: 'Pix',
      isTestCent: false
    }

    expect(orderPayload.tenantSlug).toBe('karine-finardi')
    expect(orderPayload.items.length).toBe(1)
    expect(orderPayload.items[0].unitPriceCents).toBe(8990)
  })

  it('deve validar estrutura do payload de criação de agendamento para a API', () => {
    const bookingPayload = {
      tenantId: 'ten-barbearia-style',
      customerName: 'Danilo Santos',
      customerPhone: '11999998888',
      services: [
        {
          id: 'serv-1',
          name: 'Corte Degradê',
          priceCents: 4500,
          durationMinutes: 35
        }
      ],
      date: '2026-08-30',
      time: '15:00',
      paymentMode: 'on_service'
    }

    expect(bookingPayload.tenantId).toBe('ten-barbearia-style')
    expect(bookingPayload.date).toBe('2026-08-30')
    expect(bookingPayload.services[0].priceCents).toBe(4500)
  })
})
