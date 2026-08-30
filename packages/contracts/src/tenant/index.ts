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
  open: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  close: z.string().regex(/^\d{2}:\d{2}$/).optional(),
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
  name: z.string().min(1).optional(),
  beneficiary: z.string().min(1).optional(),
  city: z.string().min(1),
  allowTestCent: z.boolean().optional(),
  depositPercentage: z.number().int().min(0).max(100).optional().default(30),
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
  category: TenantCategorySchema.optional(),
  businessCategory: TenantCategorySchema.optional(),
  template: TenantCategorySchema.optional(),
  theme: TenantThemeSchema.default('default'),
  description: z.string().optional(),
  phone: z.string().optional(),
  phoneWhatsApp: z.string().optional(),
  address: AddressSchema.optional().or(z.string().optional()),
  openingHours: OpeningHoursSchema.optional(),
  pixConfig: PixConfigSchema.optional(),
  reviews: StoreReviewsSchema.optional(),
  customDomains: z.array(z.string()).optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
  deliveryFee: z.number().optional().default(0),
  deliveryFeeCents: z.number().optional().default(0),
  minOrderValue: z.number().optional().default(0),
  minOrderValueCents: z.number().optional().default(0),
  badge: z.string().optional(),
  deliveryType: z.string().optional(),
})

// Schemas de Gestão Operacional e Painel do Lojista (ADR 013)
export const UpdateTenantHoursSchema = z.object({
  openingHours: OpeningHoursSchema,
})

export const UpdateTenantDeliverySchema = z.object({
  deliveryFee: z.number().nonnegative().optional(),
  minOrderValue: z.number().nonnegative().optional(),
  estimatedTime: z.string().optional(),
})

export const UpdateTenantAnnouncementSchema = z.object({
  isEnabled: z.boolean().default(false),
  message: z.string().optional().default(''),
})

export const UpdateTenantEmergencyCloseSchema = z.object({
  isClosed: z.boolean().default(false),
  reason: z.string().optional().default(''),
})

export const VerifyAdminPinSchema = z.object({
  pin: z.string().min(4, 'PIN deve ter no mínimo 4 dígitos').max(8, 'PIN deve ter no máximo 8 dígitos'),
})

export type TenantCategory = z.infer<typeof TenantCategorySchema>
export type TenantTheme = z.infer<typeof TenantThemeSchema>
export type OpeningHoursDay = z.infer<typeof OpeningHoursDaySchema>
export type OpeningHours = z.infer<typeof OpeningHoursSchema>
export type PixConfig = z.infer<typeof PixConfigSchema>
export type StoreReviews = z.infer<typeof StoreReviewsSchema>
export type Tenant = z.infer<typeof TenantSchema>
export type UpdateTenantHoursDto = z.infer<typeof UpdateTenantHoursSchema>
export type UpdateTenantDeliveryDto = z.infer<typeof UpdateTenantDeliverySchema>
export type UpdateTenantAnnouncementDto = z.infer<typeof UpdateTenantAnnouncementSchema>
export type UpdateTenantEmergencyCloseDto = z.infer<typeof UpdateTenantEmergencyCloseSchema>
export type VerifyAdminPinDto = z.infer<typeof VerifyAdminPinSchema>
