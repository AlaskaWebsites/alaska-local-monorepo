import { z } from 'zod'

export const BookingServiceSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  price: z.number().nonnegative(),
  durationMinutes: z.number().int().positive(),
  description: z.string().optional(),
})

export const ProfessionalSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  role: z.string().optional().default('Especialista'),
  avatar: z.string().optional(),
  availableDays: z.array(z.number().min(0).max(6)).optional(),
  isAvailable: z.boolean().optional().default(true),
})

export const BookingSlotSchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/),
  isAvailable: z.boolean().optional().default(true),
  available: z.boolean().optional().default(true),
  professionalId: z.string().optional(),
})

export const CreateBookingSchema = z.object({
  tenantSlug: z.string().optional(),
  tenantId: z.string().optional(),
  serviceIds: z.array(z.string()).min(1, 'Selecione ao menos um serviço').optional(),
  serviceId: z.string().optional(),
  professionalId: z.string().optional(),
  professionalName: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Hora deve estar no formato HH:mm'),
  customerName: z.string().min(2, 'Nome é obrigatório'),
  customerPhone: z.string().min(10, 'Telefone é obrigatório'),
  upsellProductIds: z.array(z.string()).optional(),
  depositAmount: z.number().nonnegative().optional().default(0),
  depositAmountCents: z.number().int().nonnegative().optional().default(0),
  notes: z.string().optional(),
  paymentMode: z.enum(['on_service', 'pix_deposit', 'pix_full']).optional().default('on_service'),
})

export const BlockBookingSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  reason: z.string().optional().default('Horário Bloqueado pelo Lojista'),
})

export type BookingService = z.infer<typeof BookingServiceSchema>
export type Professional = z.infer<typeof ProfessionalSchema>
export type BookingSlot = z.infer<typeof BookingSlotSchema>
export type CreateBookingDto = z.infer<typeof CreateBookingSchema>
export type BlockBookingSlotDto = z.infer<typeof BlockBookingSlotSchema>
