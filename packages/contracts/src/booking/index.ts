import { z } from 'zod';

export const ProfessionalSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  role: z.string().optional().default('Profissional'),
  avatar: z.string().optional(),
  availableDays: z.array(z.number().min(0).max(6)).optional(),
  isAvailable: z.boolean().optional().default(true),
  available: z.boolean().optional().default(true),
});

export const BookingProfessionalSchema = ProfessionalSchema;

export const BookingServiceSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional().default(''),
  price: z.number().min(0, 'Preço não pode ser negativo'),
  durationMinutes: z.number().int().positive().optional().default(30),
  professionalIds: z.array(z.string()).optional().default([]),
  image: z.string().optional(),
});

export const BookingSlotSchema = z.object({
  id: z.string().optional(),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato deve ser HH:mm'),
  isAvailable: z.boolean().optional().default(true),
  available: z.boolean().optional().default(true),
  reason: z.enum(['available', 'booked', 'past']).optional().default('available'),
  period: z.enum(['morning', 'afternoon', 'night']).optional().default('morning'),
  professionalId: z.string().optional(),
});

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
  available: z.boolean().optional().default(true),
});

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
  notes: z.string().optional(),
});

export const BookingFormDataSchema = BookingAppointmentPayloadSchema;
export const BookingRequestSchema = BookingAppointmentPayloadSchema;

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
});

export const BlockBookingSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  reason: z.string().optional().default('Horário Bloqueado pelo Lojista'),
});

export type Professional = z.infer<typeof ProfessionalSchema>;
export type BookingProfessional = z.infer<typeof BookingProfessionalSchema>;
export type BookingService = z.infer<typeof BookingServiceSchema>;
export type BookingSlot = z.infer<typeof BookingSlotSchema>;
export type BookingDay = z.infer<typeof BookingDaySchema>;
export type BookingAppointmentPayload = z.infer<typeof BookingAppointmentPayloadSchema>;
export type BookingRequest = z.infer<typeof BookingRequestSchema>;
export type CreateBookingDto = z.infer<typeof CreateBookingSchema>;
export type BlockBookingSlotDto = z.infer<typeof BlockBookingSlotSchema>;
