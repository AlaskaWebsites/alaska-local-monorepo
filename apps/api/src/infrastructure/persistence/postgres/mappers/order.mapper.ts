import { Order, DeliveryType, PaymentMethod, OrderStatus, OrderItem } from '@core/domain/entities/order.entity'
import { Address } from '@core/domain/value-objects/address.vo'

export interface OrderRow {
  id: string
  tenant_id: string
  customer_name: string
  customer_phone: string
  delivery_type: string
  address?: {
    street: string
    number: string
    neighborhood: string
    cep?: string
    city?: string
    state?: string
    complement?: string
    reference?: string
  } | null
  items: OrderItem[]
  subtotal_cents: number
  delivery_fee_cents: number
  total_cents: number
  payment_method: string
  change_for_cents?: number | null
  status: string
  pix_code?: string | null
  created_at?: Date | string | null
  updated_at?: Date | string | null
}

export class OrderMapper {
  static toDomain(row: OrderRow): Order {
    let addressVo: Address | undefined
    if (row.address && row.address.street && row.address.number && row.address.neighborhood) {
      addressVo = new Address({
        street: row.address.street,
        number: row.address.number,
        neighborhood: row.address.neighborhood,
        cep: row.address.cep,
        city: row.address.city,
        state: row.address.state,
        complement: row.address.complement,
        reference: row.address.reference
      })
    }

    const order = new Order({
      id: row.id,
      tenantId: row.tenant_id,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      deliveryType: row.delivery_type as DeliveryType,
      address: addressVo,
      items: row.items || [],
      paymentMethod: row.payment_method as PaymentMethod,
      changeForCents: row.change_for_cents ?? undefined,
      deliveryFeeCents: row.delivery_fee_cents ?? 0,
      status: (row.status || 'created') as OrderStatus,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined
    })

    if (row.pix_code) {
      order.setPixCode(row.pix_code)
    }

    return order
  }

  static toPersistence(order: Order): Record<string, unknown> {
    const addressJson = order.address ? {
      street: order.address.street,
      number: order.address.number,
      neighborhood: order.address.neighborhood,
      cep: order.address.cep,
      city: order.address.city,
      state: order.address.state,
      complement: order.address.complement,
      reference: order.address.reference
    } : null

    return {
      id: order.id,
      tenant_id: order.tenantId,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      delivery_type: order.deliveryType,
      address: addressJson ? JSON.stringify(addressJson) : null,
      items: JSON.stringify(order.items),
      subtotal_cents: order.calculateSubtotal().inCents,
      delivery_fee_cents: order.deliveryType === 'delivery' ? (order.calculateTotal().inCents - order.calculateSubtotal().inCents) : 0,
      total_cents: order.calculateTotal().inCents,
      payment_method: order.paymentMethod,
      change_for_cents: null,
      status: order.status,
      pix_code: order.pixCode || null,
      created_at: order.createdAt
    }
  }
}
