import { z } from 'zod'

export const OptionItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  description: z.string().optional(),
  isAvailable: z.boolean().default(true),
})

export const OptionGroupSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  title: z.string().optional(),
  required: z.boolean().optional().default(false),
  min: z.number().int().nonnegative().optional().default(0),
  max: z.number().int().positive().optional().default(1),
  items: z.array(OptionItemSchema).optional().default([]),
  options: z.array(OptionItemSchema).optional().default([]),
})

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().default(''),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  categoryId: z.string(),
  image: z.string().optional(),
  imageUrl: z.string().optional(),
  isAvailable: z.boolean().default(true),
  available: z.boolean().default(true),
  options: z.array(OptionGroupSchema).optional(),
  optionGroups: z.array(OptionGroupSchema).optional().default([]),
  durationMinutes: z.number().int().nonnegative().optional(),
})

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  icon: z.string().optional(),
  order: z.number().int().default(0),
  products: z.array(ProductSchema).optional().default([]),
})

// Schemas de Mutação para o Painel do Lojista (ADR 013 / Fase 2)
export const ToggleProductAvailabilitySchema = z
  .object({
    isAvailable: z.boolean().optional(),
    available: z.boolean().optional(),
  })
  .refine((data) => data.isAvailable !== undefined || data.available !== undefined, {
    message: 'isAvailable ou available deve ser informado',
  })
  .transform((data) => ({
    isAvailable: (data.isAvailable ?? data.available) as boolean,
  }))

export const ToggleOptionAvailabilitySchema = z
  .object({
    isAvailable: z.boolean().optional(),
    available: z.boolean().optional(),
    productId: z.string().optional(),
  })
  .refine((data) => data.isAvailable !== undefined || data.available !== undefined, {
    message: 'isAvailable ou available deve ser informado',
  })
  .transform((data) => ({
    isAvailable: (data.isAvailable ?? data.available) as boolean,
    productId: data.productId,
  }))

export const UpdateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  priceCents: z.number().int().nonnegative().optional(),
  originalPrice: z.number().positive().optional(),
  isAvailable: z.boolean().optional(),
  options: z.array(OptionGroupSchema).optional(),
  durationMinutes: z.number().int().nonnegative().optional(),
})

// Schema Canônico de Criação de Produto / Serviço (ADR 010 - Persistência Real no PostgreSQL)
export const CreateProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome do produto é obrigatório'),
  description: z.string().optional().default(''),
  price: z.number().nonnegative('Preço deve ser não-negativo'),
  priceCents: z.number().int().nonnegative().optional(),
  categoryId: z.string().min(1, 'Categoria é obrigatória'),
  image: z.string().optional().default(''),
  imageUrl: z.string().optional(),
  durationMinutes: z.number().int().nonnegative().optional().default(0),
  isAvailable: z.boolean().optional().default(true),
  available: z.boolean().optional().default(true),
  options: z.array(OptionGroupSchema).optional().default([]),
  optionGroups: z.array(OptionGroupSchema).optional().default([]),
})

export type OptionItem = z.infer<typeof OptionItemSchema>
export type OptionGroup = z.infer<typeof OptionGroupSchema>
export type Product = z.infer<typeof ProductSchema>
export type Category = z.infer<typeof CategorySchema>
export type ToggleProductAvailabilityDto = z.infer<typeof ToggleProductAvailabilitySchema>
export type ToggleOptionAvailabilityDto = z.infer<typeof ToggleOptionAvailabilitySchema>
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>
export type CreateProductDto = z.infer<typeof CreateProductSchema>
