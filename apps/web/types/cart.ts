// types/cart.ts
import { z } from 'zod'
import type { Product, Option, ProductOption } from './tenant'

export type DeliveryType = 'delivery' | 'takeaway' | 'pickup'

export type PaymentMethod = 'Pix' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro'

export interface Address {
    cep?: string
    street: string
    number: string
    neighborhood: string
    complement?: string
    city?: string
    state?: string
}

export interface CheckoutFormData {
    customerName: string
    customerPhone?: string
    deliveryType: DeliveryType
    address: Address
    paymentMethod: PaymentMethod | string
    changeFor?: number | null
    notes?: string
}

export interface CartItem {
    id?: string
    product: Product
    quantity: number
    selectedOptions?: Record<string, string | string[]> | Option[] | ProductOption[] | any
    options?: (Option | ProductOption)[] | any[]
    notes?: string
    observation?: string
    unitPrice: number
}

export interface CartState {
    items: CartItem[]
    deliveryType: DeliveryType
    deliveryFee: number
    customerName: string
    customerPhone?: string
    address: Address
    paymentMethod: PaymentMethod
    changeFor?: number | null
    subtotal: number
    total: number
}

/**
 * Schema Zod para validação da resposta da API pública do ViaCEP
 */
export const ViaCepResponseSchema = z.object({
    cep: z.string().optional(),
    logradouro: z.string().optional().default(''),
    complemento: z.string().optional().default(''),
    bairro: z.string().optional().default(''),
    localidade: z.string().optional().default(''),
    uf: z.string().optional().default(''),
    ibge: z.string().optional(),
    gia: z.string().optional(),
    ddd: z.string().optional(),
    siafi: z.string().optional(),
    erro: z.union([z.boolean(), z.string()]).optional(),
})

export type ViaCepResponse = z.infer<typeof ViaCepResponseSchema>
