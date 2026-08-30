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
  name: z.string().min(1),
  required: z.boolean(),
  min: z.number().int().nonnegative().default(0),
  max: z.number().int().positive().default(1),
  items: z.array(OptionItemSchema),
})

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().default(''),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  categoryId: z.string(),
  image: z.string().optional(),
  isAvailable: z.boolean().default(true),
  options: z.array(OptionGroupSchema).optional(),
  durationMinutes: z.number().int().positive().optional(),
})

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  icon: z.string().optional(),
  order: z.number().int().default(0),
})

export type OptionItem = z.infer<typeof OptionItemSchema>
export type OptionGroup = z.infer<typeof OptionGroupSchema>
export type Product = z.infer<typeof ProductSchema>
export type Category = z.infer<typeof CategorySchema>
