import { Booking, BookingStatus, BookingPaymentMode, BookingServiceItem } from '@core/domain/entities/booking.entity'

export interface BookingRow {
  id: string
  tenant_id: string
  customer_name: string
  customer_phone: string
  services: BookingServiceItem[]
  professional_id?: string | null
  professional_name?: string | null
  booking_date: string | Date
  booking_time: string
  total_price_cents: number
  total_duration_minutes: number
  payment_mode: string
  deposit_amount_cents?: number | null
  status: string
  notes?: string | null
  pix_code?: string | null
  created_at?: Date | string | null
  updated_at?: Date | string | null
}

export class BookingMapper {
  static toDomain(row: BookingRow): Booking {
    const dateStr = typeof row.booking_date === 'string'
      ? row.booking_date.split('T')[0]
      : row.booking_date instanceof Date
        ? row.booking_date.toISOString().split('T')[0]
        : String(row.booking_date)

    const booking = new Booking({
      id: row.id,
      tenantId: row.tenant_id,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      services: row.services || [],
      professionalId: row.professional_id || undefined,
      professionalName: row.professional_name || undefined,
      date: dateStr,
      time: row.booking_time,
      notes: row.notes || undefined,
      paymentMode: (row.payment_mode || 'on_service') as BookingPaymentMode,
      depositAmountCents: row.deposit_amount_cents ?? 0,
      status: (row.status || 'scheduled') as BookingStatus,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined
    })

    if (row.pix_code) {
      booking.setPixCode(row.pix_code)
    }

    return booking
  }

  static toPersistence(booking: Booking): Record<string, unknown> {
    return {
      id: booking.id,
      tenant_id: booking.tenantId,
      customer_name: booking.customerName,
      customer_phone: booking.customerPhone,
      services: JSON.stringify(booking.services),
      professional_id: null,
      professional_name: booking.professionalName,
      booking_date: booking.date,
      booking_time: booking.time,
      total_price_cents: booking.calculateTotalPrice().inCents,
      total_duration_minutes: booking.calculateTotalDurationMinutes(),
      payment_mode: booking.paymentMode,
      deposit_amount_cents: 0,
      status: booking.status,
      notes: null,
      pix_code: booking.pixCode || null,
      created_at: new Date()
    }
  }
}
