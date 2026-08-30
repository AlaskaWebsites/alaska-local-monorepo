import { describe, it, expect } from 'vitest'
import { TenantMapper } from '@infra/persistence/postgres/mappers/tenant.mapper'
import { OrderMapper } from '@infra/persistence/postgres/mappers/order.mapper'
import { BookingMapper } from '@infra/persistence/postgres/mappers/booking.mapper'
import { Tenant } from '@core/domain/entities/tenant.entity'
import { Order } from '@core/domain/entities/order.entity'
import { Booking } from '@core/domain/entities/booking.entity'
import { Address } from '@core/domain/value-objects/address.vo'

describe('Unit: Postgres Mappers (Clean Architecture)', () => {
  it('deve mapear TenantRow para Entidade Tenant e vice-versa', () => {
    const row = {
      id: 'ten-test',
      slug: 'loja-teste',
      name: 'Loja de Teste',
      description: 'Descrição da loja',
      phone_whatsapp: '11999998888',
      address: 'Rua Central, 50',
      business_category: 'menu',
      theme: 'food',
      custom_domain: 'lojateste.com.br',
      opening_hours: { open: '10:00', close: '22:00' },
      pix_config: { key: '11999998888', keyType: 'phone' as const, beneficiary: 'Loja Teste' },
      delivery_fee_cents: 800,
      min_order_value_cents: 2000,
      is_active: true
    }

    const tenant = TenantMapper.toDomain(row)
    expect(tenant).toBeInstanceOf(Tenant)
    expect(tenant.id).toBe('ten-test')
    expect(tenant.slug).toBe('loja-teste')
    expect(tenant.deliveryFeeCents).toBe(800)

    const persistence = TenantMapper.toPersistence(tenant)
    expect(persistence.slug).toBe('loja-teste')
    expect(persistence.phone_whatsapp).toBe('11999998888')
  })

  it('deve mapear OrderRow para Entidade Order e calcular totais', () => {
    const row = {
      id: 'ord-123',
      tenant_id: 'ten-test',
      customer_name: 'Danilo Santos',
      customer_phone: '11999998888',
      delivery_type: 'delivery',
      address: {
        street: 'Rua A',
        number: '123',
        neighborhood: 'Bairro Novo'
      },
      items: [
        {
          productId: 'prod-1',
          productName: 'Burger',
          quantity: 2,
          unitPriceCents: 3000
        }
      ],
      subtotal_cents: 6000,
      delivery_fee_cents: 500,
      total_cents: 6500,
      payment_method: 'Pix',
      status: 'pending_payment',
      pix_code: 'BR_CODE_PAYLOAD'
    }

    const order = OrderMapper.toDomain(row)
    expect(order).toBeInstanceOf(Order)
    expect(order.calculateSubtotal().amount).toBe(60.00)
    expect(order.calculateTotal().amount).toBe(65.00)
    expect(order.pixCode).toBe('BR_CODE_PAYLOAD')

    const persistence = OrderMapper.toPersistence(order)
    expect(persistence.customer_name).toBe('Danilo Santos')
    expect(persistence.total_cents).toBe(6500)
  })

  it('deve mapear BookingRow para Entidade Booking', () => {
    const row = {
      id: 'bk-123',
      tenant_id: 'ten-test',
      customer_name: 'Cliente Teste',
      customer_phone: '11988887777',
      services: [
        { id: 'srv-1', name: 'Corte Degradê', priceCents: 4500, durationMinutes: 40 }
      ],
      professional_name: 'Mestre da Navalha',
      booking_date: '2026-08-30',
      booking_time: '14:30',
      total_price_cents: 4500,
      total_duration_minutes: 40,
      payment_mode: 'on_service',
      status: 'scheduled'
    }

    const booking = BookingMapper.toDomain(row)
    expect(booking).toBeInstanceOf(Booking)
    expect(booking.date).toBe('2026-08-30')
    expect(booking.time).toBe('14:30')
    expect(booking.calculateTotalPrice().amount).toBe(45.00)
  })
})
