import { z } from 'zod'

export const ProfessionalSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  role: z.string().optional().default('Especialista'),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  isAvailable: z.boolean().default(true),
})

export const BookingServiceSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional().default(''),
  price: z.number().nonnegative(),
  durationMinutes: z.number().int().positive().default(30),
  image: z.string().optional(),
  professionalIds: z.array(z.string()).optional().default([]),
})

export const BookingSlotSchema = z.object({
  time: z.string().regex(/^\d{2}:\d{2}$/),
  available: z.boolean().default(true),
  professionalId: z.string().optional(),
})

export const CreateBookingSchema = z.object({
  tenantId: z.string().min(1),
  customerName: z.string().min(2),
  customerPhone: z.string().min(10),
  serviceId: z.string().min(1),
  professionalId: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  depositAmount: z.number().nonnegative().optional().default(0),
  notes: z.string().optional(),
})

export const BlockBookingSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  reason: z.string().optional().default('Horário Bloqueado pelo Lojista'),
})

export type Professional = z.infer<typeof ProfessionalSchema>
export type BookingService = z.infer<typeof BookingServiceSchema>
export type BookingSlot = z.infer<typeof BookingSlotSchema>
export type CreateBookingDto = z.infer<typeof CreateBookingSchema>
export type BlockBookingSlotDto = z.infer<typeof BlockBookingSlotSchema>
