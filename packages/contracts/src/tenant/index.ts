import { z } from 'zod'
import { AddressSchema } from '../common'

export const TenantCategorySchema = z.enum(['menu', 'shop', 'hub', 'pro'])

export const TenantThemeSchema = z.enum([
  'food', 'barber', 'health', 'drinks', 'rose', 
  'amber', 'violet', 'blue', 'emerald', 'slate', 'default'
])

export const OpeningHoursDaySchema = z.object({
  open: z.string().regex(/^\d{2}:\d{2}$/),
  close: z.string().regex(/^\d{2}:\d{2}$/),
  closed: z.boolean().optional(),
})

export const OpeningHoursSchema = z.object({
  monday: OpeningHoursDaySchema.optional(),
  tuesday: OpeningHoursDaySchema.optional(),
  wednesday: OpeningHoursDaySchema.optional(),
  thursday: OpeningHoursDaySchema.optional(),
  friday: OpeningHoursDaySchema.optional(),
  saturday: OpeningHoursDaySchema.optional(),
  sunday: OpeningHoursDaySchema.optional(),
})

export const PixKeyTypeSchema = z.enum(['cpf', 'cnpj', 'email', 'phone', 'random'])

export const PixConfigSchema = z.object({
  key: z.string().min(1),
  keyType: PixKeyTypeSchema,
  name: z.string().min(1),
  city: z.string().min(1),
  allowTestCent: z.boolean().optional(),
})

export const StoreReviewItemSchema = z.object({
  author: z.string(),
  comment: z.string(),
  rating: z.number().min(1).max(5),
  date: z.string(),
})

export const StoreReviewsSchema = z.object({
  rating: z.number().min(0).max(5),
  totalReviews: z.number().int().nonnegative(),
  badge: z.string(),
  distribution: z.record(z.string(), z.number()).optional(),
  highlights: z.array(StoreReviewItemSchema).optional(),
})

export const TenantSchema = z.object({
  id: z.string().uuid().or(z.string()),
  slug: z.string().min(2),
  name: z.string().min(2),
  category: TenantCategorySchema,
  theme: TenantThemeSchema.default('default'),
  description: z.string().optional(),
  phone: z.string(),
  address: AddressSchema.optional(),
  openingHours: OpeningHoursSchema.optional(),
  pixConfig: PixConfigSchema.optional(),
  reviews: StoreReviewsSchema.optional(),
  customDomains: z.array(z.string()).optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
})

export type TenantCategory = z.infer<typeof TenantCategorySchema>
export type TenantTheme = z.infer<typeof TenantThemeSchema>
export type OpeningHoursDay = z.infer<typeof OpeningHoursDaySchema>
export type OpeningHours = z.infer<typeof OpeningHoursSchema>
export type PixConfig = z.infer<typeof PixConfigSchema>
export type StoreReviews = z.infer<typeof StoreReviewsSchema>
export type Tenant = z.infer<typeof TenantSchema>
