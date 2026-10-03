import { z } from 'zod'

export const MerchantLoginSchema = z.object({
  email: z.string().email('E-mail corporativo inválido').toLowerCase().trim(),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  tenantSlug: z.string().min(2, 'Slug do estabelecimento é obrigatório').toLowerCase().trim(),
})

export const ChangeMerchantPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z.string().min(8, 'A nova senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z.string().min(8, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'A nova senha e a confirmação não coincidem',
    path: ['confirmPassword'],
  })

export const CreateMerchantUserSchema = z.object({
  email: z.string().email('E-mail corporativo inválido').toLowerCase().trim(),
  tenantSlug: z.string().min(2, 'Slug do estabelecimento é obrigatório').toLowerCase().trim(),
  initialPassword: z.string().min(8, 'A senha inicial deve ter no mínimo 8 caracteres').optional(),
  name: z.string().min(2, 'Nome do responsável deve ter no mínimo 2 caracteres').optional(),
})

export const MerchantSessionSchema = z.object({
  token: z.string().min(1),
  userId: z.string().min(1),
  tenantId: z.string().min(1),
  tenantSlug: z.string().min(1),
  email: z.string().email(),
  role: z.literal('merchant').default('merchant'),
  expiresAt: z.union([z.string(), z.number()]),
})

export type MerchantLoginDto = z.infer<typeof MerchantLoginSchema>
export type ChangeMerchantPasswordDto = z.infer<typeof ChangeMerchantPasswordSchema>
export type CreateMerchantUserDto = z.infer<typeof CreateMerchantUserSchema>
export type MerchantSession = z.infer<typeof MerchantSessionSchema>
