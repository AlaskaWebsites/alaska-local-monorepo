import { z } from 'zod'
import { AddressSchema } from '../common'

export const DeliveryTypeSchema = z.enum(['delivery', 'pickup', 'takeaway'])
export const PaymentMethodSchema = z.enum(['pix', 'money', 'credit', 'debit', 'Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'])
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
  groupName: z.string().optional(),
  itemName: z.string().optional(),
  id: z.string().optional(),
  name: z.string().optional(),
  label: z.string().optional(),
  price: z.number().nonnegative().optional(),
}).passthrough()

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

// Schemas Operacionais do Painel do Lojista e Entregas (ADR 013 / Fase 2)
export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusSchema,
})

// Schemas da Sacola de Compras e Persistência no LocalStorage (ADR 011 / Fase 4)
export const CartItemSchema = z.object({
  id: z.string().optional(),
  product: z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().nonnegative().optional().default(0),
    description: z.string().optional(),
    image: z.string().optional(),
    isAvailable: z.boolean().optional(),
    available: z.boolean().optional(),
    categoryId: z.string().optional(),
    durationMinutes: z.number().optional(),
    optionGroups: z.array(z.any()).optional(),
  }).passthrough(),
  quantity: z.number().int().positive().default(1),
  unitPrice: z.number().nonnegative().optional(),
  selectedOptions: z.any().optional(),
  options: z.array(z.any()).optional(),
  notes: z.string().optional(),
  observation: z.string().optional(),
  observations: z.string().optional(),
}).passthrough();

export const CartItemsArraySchema = z.array(CartItemSchema);

export type CartItem = z.infer<typeof CartItemSchema>;

export type DeliveryType = z.infer<typeof DeliveryTypeSchema>
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>
export type OrderStatus = z.infer<typeof OrderStatusSchema>
export type OrderItem = z.infer<typeof OrderItemSchema>
export type CustomerInfo = z.infer<typeof CustomerInfoSchema>
export type CreateOrderDto = z.infer<typeof CreateOrderSchema>
export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusSchema>
