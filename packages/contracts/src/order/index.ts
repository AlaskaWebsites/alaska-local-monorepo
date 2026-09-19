import { z } from 'zod'
import { AddressSchema } from '../common'

export const OrderStatusSchema = z.enum([
  'created',
  'pending_payment',
  'confirmed',
  'preparing',
  'dispatched',
  'completed',
  'cancelled',
])
export type OrderStatus = z.infer<typeof OrderStatusSchema>

export const OrderItemOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  priceCents: z.number().int().nonnegative(),
})
export type OrderItemOption = z.infer<typeof OrderItemOptionSchema>

export const OrderItemSchema = z.object({
  productId: z.string(),
  productName: z.string().optional(),
  quantity: z.number().int().positive(),
  unitPriceCents: z.number().int().nonnegative(),
  options: z.array(OrderItemOptionSchema).optional().default([]),
  observation: z.string().optional(),
  notes: z.string().optional(),
})
export type OrderItem = z.infer<typeof OrderItemSchema>

export const CreateOrderSchema = z.object({
  tenantSlug: z.string().min(1),
  customerName: z.string().min(1),
  customerPhone: z.string().min(10),
  deliveryType: z.enum(['delivery', 'pickup']),
  address: AddressSchema.optional(),
  items: z.array(OrderItemSchema).min(1),
  paymentMethod: z.enum(['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro']),
  changeForCents: z.number().int().positive().optional(),
  notes: z.string().optional(),
  isTestCent: z.boolean().optional(),
})
export type CreateOrderDto = z.infer<typeof CreateOrderSchema>

export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusSchema,
})
export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusSchema>

// Schemas para o Cart (Sacola de Compras) consumidos por apps/web
export const CartItemOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().nonnegative(),
  priceCents: z.number().int().nonnegative().optional(),
})
export type CartItemOption = z.infer<typeof CartItemOptionSchema>

export const CartItemSchema = z.object({
  product: z.any(),
  quantity: z.number().int().positive(),
  selectedOptions: z.array(CartItemOptionSchema).optional().default([]),
  notes: z.string().optional(),
})
export type CartItem = z.infer<typeof CartItemSchema>

export const CartItemsArraySchema = z.array(CartItemSchema)
export type CartItemsArray = z.infer<typeof CartItemsArraySchema>

// Schemas para o Mural de Pedidos em Tempo Real (ADR 024)
export const OrderDashboardItemSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  deliveryType: z.enum(['delivery', 'pickup']),
  address: AddressSchema.nullable().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().optional(),
        productName: z.string(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().nonnegative().optional(),
        unitPriceCents: z.number().int().nonnegative().optional(),
        options: z
          .array(
            z.object({
              id: z.string().optional(),
              name: z.string(),
              price: z.number().nonnegative().optional(),
              priceCents: z.number().int().nonnegative().optional(),
            }),
          )
          .optional()
          .default([]),
        notes: z.string().nullable().optional(),
      }),
    )
    .optional()
    .default([]),
  paymentMethod: z.string(),
  subtotal: z.number().nonnegative().optional(),
  deliveryFee: z.number().nonnegative().optional(),
  total: z.number().nonnegative(),
  status: OrderStatusSchema,
  pixCode: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})
export type OrderDashboardItem = z.infer<typeof OrderDashboardItemSchema>

export const OrderDashboardFilterSchema = z.object({
  status: z.union([OrderStatusSchema, z.literal('all')]).default('all'),
  search: z.string().optional(),
})
export type OrderDashboardFilter = z.infer<typeof OrderDashboardFilterSchema>
