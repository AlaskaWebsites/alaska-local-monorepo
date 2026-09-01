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

export const BusinessCategorySchema = z.enum(['menu', 'shop', 'hub', 'pro']);

export const OpeningHoursDaySchema = z.object({
  open: z.string(),
  close: z.string(),
  closed: z.boolean().default(false),
});

export const OpeningHoursSchema = z.record(z.string(), OpeningHoursDaySchema);

export const PixConfigSchema = z.object({
  key: z.string(),
  keyType: z.enum(['cpf', 'cnpj', 'email', 'phone', 'random']),
  name: z.string(),
  city: z.string(),
  allowTestCent: z.boolean().default(false),
});

export const StoreReviewsSchema = z.object({
  rating: z.number().min(1).max(5).default(5.0),
  count: z.number().int().nonnegative().default(0),
});

export const TenantSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  category: z.string().optional(),
  businessCategory: BusinessCategorySchema.default('menu'),
  theme: TenantThemeSchema.default('default'),
  banner: z.string().optional(),
  logo: z.string().optional(),
  whatsapp: z.string(),
  openingHours: OpeningHoursSchema.optional(),
  pixConfig: PixConfigSchema.optional(),
  reviews: StoreReviewsSchema.optional(),
  customDomain: z.string().optional(),
  isClosedEmergency: z.boolean().default(false),
  closedEmergencyMessage: z.string().optional(),
  pinHash: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const MerchantLoginSchema = z.object({
  pin: z.string().min(4, 'O PIN deve ter no mínimo 4 dígitos').max(8, 'O PIN deve ter no máximo 8 dígitos'),
});

export const MerchantAuthResponseSchema = z.object({
  authenticated: z.boolean(),
  token: z.string().optional(),
  tenantSlug: z.string(),
  message: z.string().optional(),
});

export type TenantTheme = z.infer<typeof TenantThemeSchema>;
export type BusinessCategory = z.infer<typeof BusinessCategorySchema>;
export type OpeningHoursDay = z.infer<typeof OpeningHoursDaySchema>;
export type OpeningHours = z.infer<typeof OpeningHoursSchema>;
export type PixConfig = z.infer<typeof PixConfigSchema>;
export type StoreReviews = z.infer<typeof StoreReviewsSchema>;
export type Tenant = z.infer<typeof TenantSchema>;
export type MerchantLoginInput = z.infer<typeof MerchantLoginSchema>;
export type MerchantAuthResponse = z.infer<typeof MerchantAuthResponseSchema>;
