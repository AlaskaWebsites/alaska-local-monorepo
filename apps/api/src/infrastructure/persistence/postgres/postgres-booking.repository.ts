import { Injectable } from '@nestjs/common'
import { IBookingRepository } from '@core/application/ports/booking.repository.port'
import { Booking } from '@core/domain/entities/booking.entity'
import { PostgresService } from './postgres.service'
import { BookingMapper, BookingRow } from './mappers/booking.mapper'

@Injectable()
export class PostgresBookingRepository implements IBookingRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async findById(id: string): Promise<Booking | null> {
    const res = await this.postgresService.query<BookingRow>(
      `SELECT * FROM bookings WHERE id = $1 LIMIT 1`,
      [id]
    )
    if (res.rowCount === 0 || !res.rows[0]) return null
    return BookingMapper.toDomain(res.rows[0])
  }

  async listByTenantAndDate(tenantId: string, date: string): Promise<Booking[]> {
    const res = await this.postgresService.query<BookingRow>(
      `SELECT * FROM bookings WHERE tenant_id = $1 AND booking_date = $2 AND status != 'cancelled' ORDER BY booking_time ASC`,
      [tenantId, date]
    )
    return res.rows.map(row => BookingMapper.toDomain(row))
  }

  async save(booking: Booking): Promise<void> {
    const p = BookingMapper.toPersistence(booking)
    await this.postgresService.query(
      `INSERT INTO bookings (
        id, tenant_id, customer_name, customer_phone, services,
        professional_id, professional_name, booking_date, booking_time,
        total_price_cents, total_duration_minutes, payment_mode, deposit_amount_cents,
        status, notes, pix_code, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        pix_code = EXCLUDED.pix_code`,
      [
        p.id, p.tenant_id, p.customer_name, p.customer_phone, p.services,
        p.professional_id, p.professional_name, p.booking_date, p.booking_time,
        p.total_price_cents, p.total_duration_minutes, p.payment_mode, p.deposit_amount_cents,
        p.status, p.notes, p.pix_code, p.created_at
      ]
    )
  }
}
