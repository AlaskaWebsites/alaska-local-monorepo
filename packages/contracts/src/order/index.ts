import { z } from 'zod'
import { AddressSchema } from '../common'

export const DeliveryTypeSchema = z.enum(['delivery', 'pickup'])
export const PaymentMethodSchema = z.enum(['pix', 'money', 'credit', 'debit'])
export const OrderStatusSchema = z.enum([
  'created',
  'pending_payment',
  'confirmed',
  'preparing',
  'dispatched',
  'completed',
  'cancelled',
])

export const OrderItemOptionSchema = z.object({
  groupName: z.string(),
  itemName: z.string(),
  price: z.number().default(0),
})

export const OrderItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
  selectedOptions: z.array(OrderItemOptionSchema).optional(),
})

export const CustomerInfoSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
})

export const CreateOrderSchema = z.object({
  tenantSlug: z.string().optional(),
  tenantId: z.string().optional(),
  customer: CustomerInfoSchema,
  items: z.array(OrderItemSchema).min(1),
  deliveryType: DeliveryTypeSchema,
  address: AddressSchema.optional(),
  paymentMethod: PaymentMethodSchema,
  notes: z.string().optional(),
})

// Schemas Operacionais do Painel do Lojista e Entregas (ADR 013 / Fase 2)
export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusSchema,
})

// Schema do Mural de Pedidos em Tempo Real (Order Dashboard / ADR 024)
export const OrderDashboardItemSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  deliveryType: z.string().or(DeliveryTypeSchema),
  address: AddressSchema.optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().optional(),
        productName: z.string(),
        quantity: z.number().int().positive(),
        unitPriceCents: z.number().int().nonnegative().optional(),
        unitPrice: z.number().nonnegative().optional(),
        options: z
          .array(
            z.object({
              id: z.string().optional(),
              name: z.string(),
              priceCents: z.number().int().nonnegative().optional(),
              price: z.number().nonnegative().optional(),
            }),
          )
          .optional()
          .default([]),
        notes: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
  paymentMethod: z.string(),
  subtotal: z.number().nonnegative().optional(),
  deliveryFee: z.number().nonnegative().optional(),
  total: z.number().nonnegative(),
  status: OrderStatusSchema,
  pixCode: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  createdAt: z.string().or(z.date()).optional(),
})

export type DeliveryType = z.infer<typeof DeliveryTypeSchema>
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>
export type OrderStatus = z.infer<typeof OrderStatusSchema>
export type OrderItem = z.infer<typeof OrderItemSchema>
export type CustomerInfo = z.infer<typeof CustomerInfoSchema>
export type CreateOrderDto = z.infer<typeof CreateOrderSchema>
export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusSchema>
export type OrderDashboardItem = z.infer<typeof OrderDashboardItemSchema>
