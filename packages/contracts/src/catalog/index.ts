import { z } from 'zod'

export const OptionItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  price: z.number().nonnegative().default(0),
  description: z.string().optional(),
  maxQuantity: z.number().optional().default(1),
  isAvailable: z.boolean().default(true),
})

export const OptionGroupSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  title: z.string().optional(),
  required: z.boolean().default(false),
  min: z.number().int().nonnegative().default(0),
  max: z.number().int().positive().default(1),
  items: z.array(OptionItemSchema).optional().default([]),
  options: z.array(OptionItemSchema).optional().default([]),
})

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional().default(''),
  price: z.number(),
  originalPrice: z.number().positive().optional(),
  categoryId: z.string().optional(),
  image: z.string().optional().default(''),
  isAvailable: z.boolean().default(true),
  available: z.boolean().default(true),
  options: z.array(OptionGroupSchema).optional(),
  optionGroups: z.array(OptionGroupSchema).optional().default([]),
  durationMinutes: z.number().int().positive().optional(),
})

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  icon: z.string().optional().default(''),
  order: z.number().int().optional().default(0),
  products: z.array(ProductSchema).optional().default([]),
})

// Schemas de Mutação para o Painel do Lojista (ADR 013)
export const ToggleProductAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
})

export const UpdateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  priceCents: z.number().int().nonnegative().optional(),
  originalPrice: z.number().positive().optional(),
  isAvailable: z.boolean().optional(),
  options: z.array(OptionGroupSchema).optional(),
  durationMinutes: z.number().int().positive().optional(),
})

export type OptionItem = z.infer<typeof OptionItemSchema>
export type OptionGroup = z.infer<typeof OptionGroupSchema>
export type Product = z.infer<typeof ProductSchema>
export type Category = z.infer<typeof CategorySchema>
export type ToggleProductAvailabilityDto = z.infer<typeof ToggleProductAvailabilitySchema>
export type UpdateProductDto = z.infer<typeof UpdateProductSchema>
