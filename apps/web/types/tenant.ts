// types/tenant.ts
import { z } from 'zod'

// 1. Schemas de Opcionais e Variações
export const OptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().default(0),
  maxQuantity: z.number().optional().default(1)
})

export const OptionGroupSchema = z.object({
  id: z.string(),
  title: z.string(),
  required: z.boolean().default(false),
  min: z.number().default(0),
  max: z.number().default(1),
  options: z.array(OptionSchema).default([])
})

// 2. Schema de Produtos
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().default(''),
  price: z.number(),
  image: z.string().optional().default(''),
  available: z.boolean().default(true),
  durationMinutes: z.number().optional(),
  optionGroups: z.array(OptionGroupSchema).optional().default([])
})

// 3. Schema de Categorias
export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().optional(),
  products: z.array(ProductSchema).default([])
})

// 4. Schema de Horários de Funcionamento
export const OpeningHoursSchema = z.object({
  open: z.string(),
  close: z.string()
})

// 5. Schema de Prova Social (Reviews iFood-Style)
export const ReviewBadgeSchema = z.object({
  icon: z.string(),
  label: z.string(),
  status: z.enum(['success', 'warning', 'neutral']).default('success')
})

export const ServiceQualitySchema = z.object({
  level: z.number().min(1).max(5).default(5),
  experienceLabel: z.string().default('Excelente'),
  description: z.string().optional(),
  badges: z.array(ReviewBadgeSchema).optional().default([])
})

export const ReviewCommentSchema = z.object({
  id: z.string(),
  author: z.string(),
  rating: z.number().min(1).max(5),
  date: z.string(),
  comment: z.string(),
  itemsOrdered: z.array(z.string()).optional().default([])
})

export const StoreReviewsSchema = z.object({
  score: z.number().min(0).max(5).default(5),
  totalReviews: z.number().default(0),
  serviceQuality: ServiceQualitySchema.optional(),
  distribution: z.record(z.string(), z.number()).optional().default({}),
  comments: z.array(ReviewCommentSchema).optional().default([])
})

// 6. Schema de Configuração de Pix Direto (Estágio 1)
export const PixKeyTypeSchema = z.enum(['cpf', 'cnpj', 'email', 'phone', 'random']).default('random')

export const PixConfigSchema = z.object({
  key: z.string(),
  keyType: PixKeyTypeSchema.optional().default('random'),
  beneficiary: z.string().optional(),
  city: z.string().optional().default('SAO PAULO'),
  allowTestCent: z.boolean().optional().default(true),
  depositPercentage: z.number().min(0).max(100).optional().default(30)
})

// 7. Temas e Cores Ampliados
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
  'default'
]).default('food')

// 8. Categorias Canônicas de Negócio
export const BusinessCategorySchema = z.enum(['menu', 'shop', 'hub', 'pro'])

// 9. Schema Principal de Tenant
export const TenantSchema = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string().optional().default(''),
  logo: z.string().optional().default(''),
  banner: z.string().optional().default(''),
  phoneWhatsApp: z.string(),
  address: z.string().optional().default(''),
  currency: z.string().default('R$'),
  deliveryFee: z.number().default(0),
  minOrderValue: z.number().default(0),
  template: z.string().optional(),
  businessCategory: BusinessCategorySchema.optional(),
  theme: TenantThemeSchema.optional().default('food'),
  openingHours: OpeningHoursSchema.optional(),
  pixConfig: PixConfigSchema.optional(),
  pix: PixConfigSchema.optional(),
  pixKey: z.string().optional(),
  pixKeyType: PixKeyTypeSchema.optional(),
  pixBeneficiary: z.string().optional(),
  pixCity: z.string().optional(),
  professionals: z.array(z.object({
    id: z.string(),
    name: z.string(),
    role: z.string().optional(),
    avatar: z.string().optional()
  })).optional().default([]),
  services: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    price: z.number(),
    durationMinutes: z.number().optional()
  })).optional().default([]),
  categories: z.array(CategorySchema).optional().default([]),
  reviews: StoreReviewsSchema.optional(),
  paymentMethods: z.array(z.string()).optional().default(['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro']),
  category: z.string().optional(),
  distance: z.string().optional(),
  priceRange: z.string().optional().default('$$')
})

// Tipos Inferidos do Zod
export type Option = z.infer<typeof OptionSchema>
export type OptionGroup = z.infer<typeof OptionGroupSchema>
export type Product = z.infer<typeof ProductSchema>
export type Category = z.infer<typeof CategorySchema>
export type OpeningHours = z.infer<typeof OpeningHoursSchema>
export type StoreReviews = z.infer<typeof StoreReviewsSchema>
export type ServiceQuality = z.infer<typeof ServiceQualitySchema>
export type ReviewBadge = z.infer<typeof ReviewBadgeSchema>
export type ReviewComment = z.infer<typeof ReviewCommentSchema>
export type PixKeyType = z.infer<typeof PixKeyTypeSchema>
export type PixConfig = z.infer<typeof PixConfigSchema>
export type TenantTheme = z.infer<typeof TenantThemeSchema>
export type BusinessCategory = z.infer<typeof BusinessCategorySchema>
export type Tenant = z.infer<typeof TenantSchema>
