// composables/useBookingSlots.ts
import { ref, computed } from 'vue'
import type {
  BookingService,
  Professional,
  BookingSlot,
  BookingDay,
  BookingAppointmentPayload,
} from '~/types/booking'
import { formatCurrency } from '~/utils/formatters'

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

const MONTH_SHORTS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

/**
 * Converte horário HH:mm em minutos a partir da meia-noite de forma segura contra noUncheckedIndexedAccess.
 */
export function timeToMinutes(time: string): number {
  if (!time) return 0
  const parts = time.split(':')
  const hours = Number(parts[0] || 0)
  const minutes = Number(parts[1] || 0)
  return hours * 60 + minutes
}

/**
 * Converte minutos a partir da meia-noite em string formatada HH:mm.
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Gera lista de dias do mês atual e próximos dias de forma contínua e automática.
 */
export function generateBookingDays(
  startDate: Date = new Date(),
  totalDays: number = 30,
  closedDaysOfWeek: number[] = [0]
): BookingDay[] {
  const days: BookingDay[] = []

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(startDate)
    d.setDate(startDate.getDate() + i)

    const dayNum = d.getDate()
    const monthIndex = d.getMonth()
    const year = d.getFullYear()

    const dayStr = `${String(dayNum).padStart(2, '0')}/${String(monthIndex + 1).padStart(2, '0')}/${year}`
    const isoDate = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    const displayDate = `${String(dayNum).padStart(2, '0')}/${String(monthIndex + 1).padStart(2, '0')}`

    const isToday = i === 0
    const isTomorrow = i === 1
    const weekDay = isToday ? 'Hoje' : isTomorrow ? 'Amanhã' : (WEEK_DAYS[d.getDay()] || 'Dia')
    const isClosed = closedDaysOfWeek.includes(d.getDay())

    days.push({
      dateStr: dayStr,
      isoDate,
      dayNumber: dayNum,
      monthName: MONTH_NAMES[monthIndex] || 'Mês',
      monthShort: MONTH_SHORTS[monthIndex] || 'Mês',
      year,
      displayDate,
      weekDay,
      isToday,
      isTomorrow,
      isClosed,
    })
  }

  return days
}

/**
 * Retorna slots ocupados determinísticos para simulação realista em demonstrações.
 */
export function getMockBookedSlotsForDate(dateStr: string): string[] {
  const dayNum = parseInt(dateStr.split('/')[0] || '1', 10) || 1
  const presets: string[][] = [
    ['10:00', '11:30', '15:00', '17:30'],
    ['09:30', '14:00', '16:00', '18:30'],
    ['10:30', '11:00', '14:30', '16:30', '19:00'],
    ['09:00', '13:30', '15:30', '17:00'],
  ]
  const presetIndex = dayNum % presets.length
  return presets[presetIndex] || []
}

export interface GenerateTimeSlotsOptions {
  selectedDateStr?: string
  bookedSlots?: string[]
  referenceDate?: Date
}

/**
 * Gera slots de horários entre o horário de abertura e fechamento com bloqueio de horários passados e ocupados.
 */
export function generateTimeSlots(
  openTime: string,
  closeTime: string,
  intervalMinutes: number = 30,
  options?: GenerateTimeSlotsOptions
): BookingSlot[] {
  const start = timeToMinutes(openTime)
  const end = timeToMinutes(closeTime)
  const slots: BookingSlot[] = []

  if (end <= start) return slots

  const booked = new Set(options?.bookedSlots || [])
  const refDate = options?.referenceDate || new Date()
  const todayStr = `${String(refDate.getDate()).padStart(2, '0')}/${String(refDate.getMonth() + 1).padStart(2, '0')}/${refDate.getFullYear()}`
  const isToday = options?.selectedDateStr === todayStr
  const currentMinutes = refDate.getHours() * 60 + refDate.getMinutes()

  for (let current = start; current < end; current += intervalMinutes) {
    const timeStr = minutesToTime(current)

    if (isToday && current <= currentMinutes) {
      slots.push({
        time: timeStr,
        available: false,
        reason: 'past',
      })
    } else if (booked.has(timeStr)) {
      slots.push({
        time: timeStr,
        available: false,
        reason: 'booked',
      })
    } else {
      slots.push({
        time: timeStr,
        available: true,
        reason: 'available',
      })
    }
  }

  return slots
}

/**
 * Calcula a duração total somada de múltiplos serviços.
 */
export function calculateTotalDuration(services: BookingService[]): number {
  return (services || []).reduce((acc, s) => acc + (s?.durationMinutes || 30), 0)
}

/**
 * Calcula o preço total somado de múltiplos serviços.
 */
export function calculateTotalPrice(services: BookingService[]): number {
  return (services || []).reduce((acc, s) => acc + (s?.price || 0), 0)
}

/**
 * Formata a mensagem de agendamento estruturada para despacho no WhatsApp.
 */
export function formatBookingWhatsAppMessage(payload: BookingAppointmentPayload): string {
  const lines: string[] = []

  lines.push(`💈 *NOVO AGENDAMENTO — ${payload.tenantName.toUpperCase()}*`)
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`)
  lines.push(`📅 *DATA & HORÁRIO:*`)
  lines.push(`• Data: ${payload.date}`)
  lines.push(`• Horário: ${payload.time}`)

  if (payload.professional) {
    lines.push(`• Profissional: ${payload.professional.name} (${payload.professional.role || 'Especialista'})`)
  } else {
    lines.push(`• Profissional: Qualquer disponível`)
  }

  lines.push(``)
  lines.push(`✂️ *SERVIÇOS ESCOLHIDOS:*`)
  payload.services.forEach((service) => {
    lines.push(`• ${service.name} (${service.durationMinutes} min) — ${formatCurrency(service.price)}`)
  })

  lines.push(``)
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`)
  lines.push(`⏱️ Duração Estimada: ${payload.totalDurationMinutes} minutos`)
  lines.push(`*VALOR TOTAL: ${formatCurrency(payload.totalPrice)}*`)
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`)
  lines.push(`👤 *CLIENTE:* ${payload.customerName}`)
  lines.push(`📱 *WHATSAPP:* ${payload.customerPhone}`)
  lines.push(`💳 *PAGAMENTO:* ${payload.paymentMethod}`)

  if (payload.notes) {
    lines.push(`💬 *OBSERVAÇÕES:* "${payload.notes}"`)
  }

  return lines.join('\n')
}

/**
 * Composable reativo para gestão de agendamento na interface com suporte a múltiplos meses e bloqueios
 */
export function useBookingSlots(options?: {
  openTime?: string
  closeTime?: string
  closedDays?: number[]
  totalDays?: number
}) {
  const selectedServices = ref<BookingService[]>([])
  const selectedProfessional = ref<Professional | null>(null)
  const selectedDate = ref<string>('')
  const selectedTime = ref<string>('')
  const selectedMonthFilter = ref<string>('all')

  const open = options?.openTime || '09:00'
  const close = options?.closeTime || '20:00'
  const closedDays = options?.closedDays || [0]
  const totalDays = options?.totalDays || 30

  // Gera os 30 dias contínuos a partir de hoje
  const allDays = computed(() => generateBookingDays(new Date(), totalDays, closedDays))

  // Lista única de meses presentes nos dias gerados
  const availableMonths = computed(() => {
    const months = new Map<string, { label: string; year: number }>()
    allDays.value.forEach((d) => {
      const key = `${d.monthName} ${d.year}`
      if (!months.has(key)) {
        months.set(key, { label: d.monthName, year: d.year })
      }
    })
    return Array.from(months.entries()).map(([key, value]) => ({
      key,
      ...value,
    }))
  })

  // Dias filtrados pelo mês ativo (ou todos)
  const filteredDays = computed(() => {
    if (selectedMonthFilter.value === 'all') return allDays.value
    return allDays.value.filter((d) => `${d.monthName} ${d.year}` === selectedMonthFilter.value)
  })

  // Auto-seleciona o primeiro dia não fechado
  if (!selectedDate.value) {
    const firstOpen = allDays.value.find((d) => !d.isClosed)
    if (firstOpen) {
      selectedDate.value = firstOpen.dateStr
    }
  }

  // Gera slots para o dia selecionado com bloqueios realistas
  const timeSlots = computed(() => {
    if (!selectedDate.value) return []
    const selectedDayObj = allDays.value.find((d) => d.dateStr === selectedDate.value)
    if (selectedDayObj?.isClosed) return []

    const bookedMock = getMockBookedSlotsForDate(selectedDate.value)
    return generateTimeSlots(open, close, 30, {
      selectedDateStr: selectedDate.value,
      bookedSlots: bookedMock,
      referenceDate: new Date(),
    })
  })

  const totalDuration = computed(() => calculateTotalDuration(selectedServices.value))
  const totalPrice = computed(() => calculateTotalPrice(selectedServices.value))

  function toggleService(service: BookingService) {
    const idx = selectedServices.value.findIndex((s) => s.id === service.id)
    if (idx >= 0) {
      selectedServices.value.splice(idx, 1)
    } else {
      selectedServices.value.push(service)
    }
  }

  function clearBooking() {
    selectedServices.value = []
    selectedProfessional.value = null
    selectedDate.value = ''
    selectedTime.value = ''
  }

  return {
    selectedServices,
    selectedProfessional,
    selectedDate,
    selectedTime,
    selectedMonthFilter,
    allDays,
    availableMonths,
    filteredDays,
    timeSlots,
    totalDuration,
    totalPrice,
    toggleService,
    clearBooking,
    generateBookingDays,
    generateTimeSlots,
    getMockBookedSlotsForDate,
    formatBookingWhatsAppMessage,
  }
}
