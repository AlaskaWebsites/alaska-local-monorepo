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
  role: z.string(),
  avatar: z.string().optional(),
  availableDays: z.array(z.number().min(0).max(6)),
})

export const BookingSlotSchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/),
  isAvailable: z.boolean(),
})

export const CreateBookingSchema = z.object({
  tenantSlug: z.string(),
  serviceIds: z.array(z.string()).min(1, 'Selecione ao menos um serviço'),
  professionalId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Hora deve estar no formato HH:mm'),
  customerName: z.string().min(2, 'Nome é obrigatório'),
  customerPhone: z.string().min(10, 'Telefone é obrigatório'),
  upsellProductIds: z.array(z.string()).optional(),
})

export type BookingService = z.infer<typeof BookingServiceSchema>
export type Professional = z.infer<typeof ProfessionalSchema>
export type BookingSlot = z.infer<typeof BookingSlotSchema>
export type CreateBookingDto = z.infer<typeof CreateBookingSchema>
