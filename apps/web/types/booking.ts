// types/booking.ts
import { z } from 'zod'

// 1. Schema de Profissional / Prestador
export const ProfessionalSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  role: z.string().optional().default('Profissional'),
  avatar: z.string().optional(),
  available: z.boolean().optional().default(true)
})
export const BookingProfessionalSchema = ProfessionalSchema

// 2. Schema de Serviço com Duração e Profissionais Habilitados
export const BookingServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().default(''),
  price: z.number().min(0, 'Preço não pode ser negativo'),
  durationMinutes: z.number().optional().default(30),
  professionalIds: z.array(z.string()).optional().default([]),
  image: z.string().optional()
})

// 3. Schema de Slot de Horário
export const BookingSlotSchema = z.object({
  id: z.string().optional(),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato deve ser HH:mm'),
  available: z.boolean().optional().default(true),
  reason: z.enum(['available', 'booked', 'past']).optional().default('available'),
  period: z.enum(['morning', 'afternoon', 'night']).optional().default('morning')
})

// 4. Schema de Dia de Agendamento
export const BookingDaySchema = z.object({
  dateStr: z.string().optional(),
  isoDate: z.string().optional(),
  date: z.string().optional(),
  dayOfWeek: z.string().optional(),
  dayNumber: z.number().optional(),
  monthName: z.string().optional(),
  monthShort: z.string().optional(),
  year: z.number().optional(),
  displayDate: z.string().optional(),
  weekDay: z.string().optional(),
  isToday: z.boolean().optional().default(false),
  isTomorrow: z.boolean().optional().default(false),
  isClosed: z.boolean().optional().default(false),
  available: z.boolean().optional().default(true)
})

// 5. Schema do Payload / Requisição de Agendamento
export const BookingAppointmentPayloadSchema = z.object({
  tenantName: z.string(),
  customerName: z.string().min(2),
  customerPhone: z.string().min(10),
  date: z.string(),
  time: z.string(),
  services: z.array(BookingServiceSchema).min(1, 'Selecione ao menos um serviço'),
  professional: ProfessionalSchema.optional(),
  totalDurationMinutes: z.number(),
  totalPrice: z.number(),
  paymentMethod: z.string().optional().default('Pix'),
  paymentMode: z.enum(['on_service', 'pix_deposit', 'pix_full']).optional().default('on_service'),
  depositAmount: z.number().optional().default(0),
  notes: z.string().optional()
})
export const BookingFormDataSchema = BookingAppointmentPayloadSchema
export const BookingRequestSchema = BookingAppointmentPayloadSchema

export type Professional = z.infer<typeof ProfessionalSchema>
export type BookingProfessional = z.infer<typeof BookingProfessionalSchema>
export type BookingService = z.infer<typeof BookingServiceSchema>
export type BookingSlot = z.infer<typeof BookingSlotSchema>
export type BookingDay = z.infer<typeof BookingDaySchema>
export type BookingAppointmentPayload = z.infer<typeof BookingAppointmentPayloadSchema>
export type BookingRequest = z.infer<typeof BookingRequestSchema>
