import { z } from 'zod';
import { CategorySchema } from '../catalog';

export const TenantCategorySchema = z.enum(['menu', 'shop', 'hub', 'pro']);
export const BusinessCategorySchema = TenantCategorySchema;

export const TenantThemeSchema = z.enum([
  'food',
  'barber',
  'health',
  'drinks',
  'rose',
  'amber',
  'violet',
  'blue',
  'emerald',
  'slate',
  'default',
]).default('food');

export const OpeningHoursDaySchema = z.object({
  open: z.string().regex(/^\d{2}:\d{2}$/).or(z.string()),
  close: z.string().regex(/^\d{2}:\d{2}$/).or(z.string()),
  closed: z.boolean().optional().default(false),
});

export const OpeningHoursSchema = z.record(z.string(), OpeningHoursDaySchema).or(
  z.object({
    open: z.string().optional(),
    close: z.string().optional(),
    monday: OpeningHoursDaySchema.optional(),
    tuesday: OpeningHoursDaySchema.optional(),
    wednesday: OpeningHoursDaySchema.optional(),
    thursday: OpeningHoursDaySchema.optional(),
    friday: OpeningHoursDaySchema.optional(),
    saturday: OpeningHoursDaySchema.optional(),
    sunday: OpeningHoursDaySchema.optional(),
  })
);

export const PixKeyTypeSchema = z.enum(['cpf', 'cnpj', 'email', 'phone', 'random']);

export const PixConfigSchema = z.object({
  key: z.string().min(1),
  keyType: PixKeyTypeSchema.optional().default('random'),
  name: z.string().optional(),
  beneficiary: z.string().optional(),
  city: z.string().optional().default('SAO PAULO'),
  allowTestCent: z.boolean().optional().default(true),
  depositPercentage: z.number().int().min(0).max(100).optional().default(30),
});

export const ReviewBadgeSchema = z.object({
  icon: z.string(),
  label: z.string(),
  status: z.enum(['success', 'warning', 'neutral']).default('success'),
});

export const ServiceQualitySchema = z.object({
  level: z.number().min(1).max(5).default(5),
  experienceLabel: z.string().default('Excelente'),
  description: z.string().optional(),
  badges: z.array(ReviewBadgeSchema).optional().default([]),
});

export const ReviewCommentSchema = z.object({
  id: z.string().optional(),
  author: z.string(),
  rating: z.number().min(1).max(5),
  date: z.string(),
  comment: z.string().optional(),
  text: z.string().optional(),
  likes: z.number().optional().default(0),
  storeReply: z.any().optional(),
  itemsOrdered: z.array(z.string()).optional().default([]),
});

export const StoreReviewsSchema = z
  .object({
    rating: z.number().min(0).max(5).optional(),
    score: z.number().min(0).max(5).optional(),
    count: z.number().int().nonnegative().optional(),
    totalReviews: z.number().int().nonnegative().optional(),
    serviceQuality: ServiceQualitySchema.optional(),
    distribution: z.record(z.string(), z.number()).optional().default({}),
    comments: z.array(ReviewCommentSchema).optional().default([]),
  })
  .transform((val) => {
    const score =
      typeof val.score === 'number'
        ? val.score
        : typeof val.rating === 'number'
          ? val.rating
          : 5.0;
    const count =
      typeof val.count === 'number'
        ? val.count
        : typeof val.totalReviews === 'number'
          ? val.totalReviews
          : 0;
    return {
      ...val,
      score,
      rating: score,
      count,
      totalReviews: count,
    };
  });

export const TenantSchema = z
  .object({
    id: z.string().optional(),
    name: z.string(),
    slug: z.string(),
    description: z.string().optional().default(''),
    logo: z.string().optional().default(''),
    banner: z.string().optional().default(''),
    whatsapp: z.string().optional(),
    phoneWhatsApp: z.string().optional(),
    address: z.any().optional(),
    currency: z.string().optional().default('R$'),
    deliveryFee: z.number().optional().default(0),
    minOrderValue: z.number().optional().default(0),
    deliveryFeeCents: z.number().int().nonnegative().optional().default(0),
    minOrderValueCents: z.number().int().nonnegative().optional().default(0),
    category: z.string().optional(),
    businessCategory: BusinessCategorySchema.optional(),
    template: z.enum(['menu', 'shop', 'hub', 'pro', 'booking']).optional().default('menu'),
    theme: TenantThemeSchema.optional().default('food'),
    openingHours: OpeningHoursSchema.optional(),
    pixConfig: PixConfigSchema.optional(),
    pix: PixConfigSchema.optional(),
    pixKey: z.string().optional(),
    pixKeyType: PixKeyTypeSchema.optional(),
    pixBeneficiary: z.string().optional(),
    pixCity: z.string().optional(),
    professionals: z.array(z.any()).optional().default([]),
    services: z.array(z.any()).optional().default([]),
    categories: z.array(CategorySchema).optional().default([]),
    reviews: StoreReviewsSchema.optional(),
    paymentMethods: z.array(z.string()).optional().default(['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro']),
    customDomains: z.array(z.string()).optional(),
    distance: z.string().optional(),
    priceRange: z.string().optional().default('$$'),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .passthrough();

// Schemas de Gestão Operacional e Painel do Lojista (ADR 013)
export const UpdateTenantHoursSchema = z.object({
  openingHours: OpeningHoursSchema,
});

export const VerifyAdminPinSchema = z.object({
  pin: z
    .string()
    .min(4, 'PIN deve ter no mínimo 4 dígitos')
    .max(8, 'PIN deve ter no máximo 8 dígitos'),
});

export const MerchantLoginSchema = z.object({
  pin: z
    .string()
    .min(4, 'O PIN deve ter no mínimo 4 dígitos')
    .max(8, 'O PIN deve ter no máximo 8 dígitos'),
});

export const MerchantAuthResponseSchema = z.object({
  success: z.boolean(),
  token: z.string().optional(),
  slug: z.string().optional(),
  message: z.string().optional(),
});

export type TenantCategory = z.infer<typeof TenantCategorySchema>;
export type BusinessCategory = z.infer<typeof BusinessCategorySchema>;
export type TenantTheme = z.infer<typeof TenantThemeSchema>;
export type OpeningHoursDay = z.infer<typeof OpeningHoursDaySchema>;
export type OpeningHours = z.infer<typeof OpeningHoursSchema>;
export type PixKeyType = z.infer<typeof PixKeyTypeSchema>;
export type PixConfig = z.infer<typeof PixConfigSchema>;
export type ReviewBadge = z.infer<typeof ReviewBadgeSchema>;
export type ServiceQuality = z.infer<typeof ServiceQualitySchema>;
export type ReviewComment = z.infer<typeof ReviewCommentSchema>;
export type StoreReviews = z.infer<typeof StoreReviewsSchema>;
export type Tenant = z.infer<typeof TenantSchema>;
export type UpdateTenantHoursDto = z.infer<typeof UpdateTenantHoursSchema>;
export type VerifyAdminPinDto = z.infer<typeof VerifyAdminPinSchema>;
export type MerchantLoginInput = z.infer<typeof MerchantLoginSchema>;
export type MerchantAuthResponse = z.infer<typeof MerchantAuthResponseSchema>;
