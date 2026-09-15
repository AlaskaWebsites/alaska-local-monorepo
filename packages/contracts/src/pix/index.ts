import { z } from 'zod'
import { PixKeyTypeSchema } from '../tenant'

export const PixQrCodeRequestSchema = z.object({
  key: z.string().min(1),
  keyType: PixKeyTypeSchema,
  name: z.string().min(1),
  city: z.string().min(1),
  amount: z.number().positive(),
  txid: z.string().optional(),
})

export const PixQrCodeResponseSchema = z.object({
  brCode: z.string(),
  qrCodeDataUrl: z.string(),
  amount: z.number(),
  txid: z.string(),
})

// Schemas Canônicos de Geração e Consulta Pix (Fase 3)
export const GeneratePixDtoSchema = z.object({
  tenantSlug: z.string().min(1, 'Slug do tenant é obrigatório'),
  amount: z.number().min(0.01, 'Valor deve ser no mínimo R$ 0,01'),
  txid: z.string().optional(),
  isTestCent: z.boolean().optional(),
})

export const QueryPixQrCodeSchema = z.object({
  tenantSlug: z.string().min(1, 'Slug do tenant é obrigatório'),
  amount: z.coerce.number().min(0.01, 'Valor deve ser no mínimo R$ 0,01'),
  txid: z.string().optional(),
  isTestCent: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
})

export type PixQrCodeRequest = z.infer<typeof PixQrCodeRequestSchema>
export type PixQrCodeResponse = z.infer<typeof PixQrCodeResponseSchema>
export type GeneratePixDto = z.infer<typeof GeneratePixDtoSchema>
export type QueryPixQrCodeDto = z.infer<typeof QueryPixQrCodeSchema>
