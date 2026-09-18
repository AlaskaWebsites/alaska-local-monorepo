import { z } from 'zod';

export const WorkHoursSchema = z.object({
  start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato deve ser HH:mm').default('08:00'),
  end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato deve ser HH:mm').default('18:00'),
});

export const LunchBreakSchema = z.object({
  start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato deve ser HH:mm').default('12:00'),
  end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato deve ser HH:mm').default('13:00'),
  enabled: z.boolean().default(true),
});

export const ProfessionalSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nome do profissional é obrigatório'),
  role: z.string().optional().default('Profissional'),
  avatar: z.string().optional(),
  availableDays: z.array(z.number().min(0).max(6)).optional().default([1, 2, 3, 4, 5]),
  isAvailable: z.boolean().optional().default(true),
  available: z.boolean().optional().default(true),
  workHours: WorkHoursSchema.optional().default({ start: '08:00', end: '18:00' }),
  lunchBreak: LunchBreakSchema.optional().default({ start: '12:00', end: '13:00', enabled: true }),
});

export const BookingProfessionalSchema = ProfessionalSchema;

export const CreateProfessionalSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome do profissional é obrigatório'),
  role: z.string().optional().default('Profissional'),
  avatar: z.string().optional(),
  availableDays: z.array(z.number().min(0).max(6)).optional().default([1, 2, 3, 4, 5]),
  isAvailable: z.boolean().optional().default(true),
  workHours: WorkHoursSchema.optional().default({ start: '08:00', end: '18:00' }),
  lunchBreak: LunchBreakSchema.optional().default({ start: '12:00', end: '13:00', enabled: true }),
});

export const UpdateProfessionalSchema = z.object({
  name: z.string().optional(),
  role: z.string().optional(),
  avatar: z.string().optional(),
  availableDays: z.array(z.number().min(0).max(6)).optional(),
  isAvailable: z.boolean().optional(),
  workHours: z.object({
    start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato deve ser HH:mm'),
    end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato deve ser HH:mm'),
  }).optional(),
  lunchBreak: z.object({
    start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato deve ser HH:mm'),
    end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato deve ser HH:mm'),
    enabled: z.boolean().optional(),
  }).optional(),
});

export const ToggleProfessionalAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
});

export const BlockSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato deve ser YYYY-MM-DD'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato deve ser HH:mm'),
  reason: z.string().optional().default('Horário Bloqueado pelo Lojista'),
});

export const ToggleSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato deve ser YYYY-MM-DD'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato deve ser HH:mm'),
  reason: z.string().optional().default('Horário Bloqueado pelo Lojista'),
});

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
  reason: z.enum(['available', 'booked', 'past', 'blocked']).optional().default('available'),
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
  customerName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
  customerPhone: z.string().min(10, 'Telefone inválido'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data no formato YYYY-MM-DD'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Horário no formato HH:mm'),
  serviceIds: z.array(z.string()).min(1, 'Ao menos um serviço deve ser selecionado'),
  professionalId: z.string().optional(),
  paymentMethod: z.string().optional().default('Pix'),
  depositAmountCents: z.number().int().nonnegative().optional().default(0),
  notes: z.string().optional(),
  paymentMode: z.enum(['on_service', 'pix_deposit', 'pix_full']).optional().default('on_service'),
});

export const BlockBookingSlotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  reason: z.string().optional().default('Horário Bloqueado pelo Lojista'),
});

export type WorkHours = z.infer<typeof WorkHoursSchema>;
export type LunchBreak = z.infer<typeof LunchBreakSchema>;
export type Professional = z.infer<typeof ProfessionalSchema>;
export type BookingProfessional = z.infer<typeof BookingProfessionalSchema>;
export type CreateProfessionalDto = z.infer<typeof CreateProfessionalSchema>;
export type UpdateProfessionalDto = z.infer<typeof UpdateProfessionalSchema>;
export type ToggleProfessionalAvailabilityDto = z.infer<typeof ToggleProfessionalAvailabilitySchema>;
export type BlockSlotDto = z.infer<typeof BlockSlotSchema>;
export type ToggleSlotDto = z.infer<typeof ToggleSlotSchema>;
export type BookingService = z.infer<typeof BookingServiceSchema>;
export type BookingSlot = z.infer<typeof BookingSlotSchema>;
export type BookingDay = z.infer<typeof BookingDaySchema>;
export type BookingAppointmentPayload = z.infer<typeof BookingAppointmentPayloadSchema>;
export type BookingRequest = z.infer<typeof BookingRequestSchema>;
export type CreateBookingDto = z.infer<typeof CreateBookingSchema>;
export type BlockBookingSlotDto = z.infer<typeof BlockBookingSlotSchema>;
