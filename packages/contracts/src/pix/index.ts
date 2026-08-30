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

export type PixQrCodeRequest = z.infer<typeof PixQrCodeRequestSchema>
export type PixQrCodeResponse = z.infer<typeof PixQrCodeResponseSchema>
