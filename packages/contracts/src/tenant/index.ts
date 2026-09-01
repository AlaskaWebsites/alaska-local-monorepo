import { z } from 'zod';

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
]);

export const TenantCategorySchema = z.enum(['menu', 'shop', 'hub', 'pro']);
export const BusinessCategorySchema = TenantCategorySchema;

export const PixKeyTypeSchema = z.enum(['cpf', 'cnpj', 'email', 'phone', 'random']);

export const OpeningHoursDaySchema = z.object({
  open: z.string(),
  close: z.string(),
  closed: z.boolean().default(false).optional(),
});

export const OpeningHoursSchema = z.record(z.string(), OpeningHoursDaySchema);

export const PixConfigSchema = z.object({
  key: z.string(),
  keyType: PixKeyTypeSchema,
  name: z.string().optional(),
  beneficiary: z.string().optional(),
  city: z.string(),
  allowTestCent: z.boolean().default(false).optional(),
  depositPercentage: z.number().min(0).max(100).optional(),
});

export const StoreReviewsSchema = z.object({
  rating: z.number().min(1).max(5).default(5.0),
  count: z.number().int().nonnegative().default(0),
});

export const TenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  businessCategory: TenantCategorySchema.default('menu'),
  theme: TenantThemeSchema.default('default'),
  banner: z.string().optional(),
  logo: z.string().optional(),
  whatsapp: z.string().optional(),
  phoneWhatsApp: z.string().optional(),
  address: z.string().optional(),
  openingHours: OpeningHoursSchema.optional(),
  pixConfig: PixConfigSchema.optional(),
  reviews: StoreReviewsSchema.optional(),
  customDomain: z.string().optional(),
  isClosedEmergency: z.boolean().default(false).optional(),
  closedEmergencyMessage: z.string().optional(),
  pinHash: z.string().optional(),
  deliveryFeeCents: z.number().int().nonnegative().optional(),
  minOrderValueCents: z.number().int().nonnegative().optional(),
  categories: z.array(z.any()).optional(),
  isActive: z.boolean().default(true).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Schemas de Gestão Operacional e Painel do Lojista (ADR 013 e ADR 007)
export const UpdateTenantHoursSchema = z.object({
  openingHours: OpeningHoursSchema.optional(),
  hours: OpeningHoursSchema.optional(),
});

export const VerifyAdminPinSchema = z.object({
  pin: z.string().min(4, 'PIN deve ter no mínimo 4 dígitos').max(8, 'PIN deve ter no máximo 8 dígitos'),
});

export const MerchantLoginSchema = VerifyAdminPinSchema;

export const MerchantAuthResponseSchema = z.object({
  authenticated: z.boolean(),
  token: z.string().optional(),
  tenantSlug: z.string(),
  message: z.string().optional(),
});

export type TenantCategory = z.infer<typeof TenantCategorySchema>;
export type BusinessCategory = z.infer<typeof BusinessCategorySchema>;
export type TenantTheme = z.infer<typeof TenantThemeSchema>;
export type PixKeyType = z.infer<typeof PixKeyTypeSchema>;
export type OpeningHoursDay = z.infer<typeof OpeningHoursDaySchema>;
export type OpeningHours = z.infer<typeof OpeningHoursSchema>;
export type PixConfig = z.infer<typeof PixConfigSchema>;
export type StoreReviews = z.infer<typeof StoreReviewsSchema>;
export type Tenant = z.infer<typeof TenantSchema>;
export type UpdateTenantHoursDto = z.infer<typeof UpdateTenantHoursSchema>;
export type VerifyAdminPinDto = z.infer<typeof VerifyAdminPinSchema>;
export type MerchantLoginInput = z.infer<typeof MerchantLoginSchema>;
export type MerchantAuthResponse = z.infer<typeof MerchantAuthResponseSchema>;
