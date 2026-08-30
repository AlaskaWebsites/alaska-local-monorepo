import { z } from 'zod'
import { AddressSchema } from '../common'

export const DeliveryTypeSchema = z.enum(['delivery', 'pickup'])
export const PaymentMethodSchema = z.enum(['pix', 'money', 'credit', 'debit'])
export const OrderStatusSchema = z.enum(['created', 'confirmed', 'dispatched', 'completed', 'cancelled'])

export const OrderItemOptionSchema = z.object({
  groupName: z.string(),
  itemName: z.string(),
  price: z.number().nonnegative(),
})

export const OrderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  selectedOptions: z.array(OrderItemOptionSchema).optional(),
  observation: z.string().optional(),
})

export const CustomerInfoSchema = z.object({
  name: z.string().min(2, 'Nome é obrigatório'),
  phone: z.string().min(10, 'Telefone é obrigatório'),
  address: AddressSchema.optional(),
})

export const CreateOrderSchema = z.object({
  tenantSlug: z.string(),
  items: z.array(OrderItemSchema).min(1, 'O pedido deve conter pelo menos um item'),
  customer: CustomerInfoSchema,
  deliveryType: DeliveryTypeSchema,
  paymentMethod: PaymentMethodSchema,
  changeFor: z.number().positive().optional(),
  notes: z.string().optional(),
})

export type DeliveryType = z.infer<typeof DeliveryTypeSchema>
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>
export type OrderStatus = z.infer<typeof OrderStatusSchema>
export type OrderItem = z.infer<typeof OrderItemSchema>
export type CustomerInfo = z.infer<typeof CustomerInfoSchema>
export type CreateOrderDto = z.infer<typeof CreateOrderSchema>
