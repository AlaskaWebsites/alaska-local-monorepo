import { IBookingRepository } from '@core/application/ports/booking.repository.port'
import { Booking } from '@core/domain/entities/booking.entity'
import { PostgresService } from './postgres.service'
import { BookingMapper } from './mappers/booking.mapper'

export class PostgresBookingRepository implements IBookingRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async save(booking: Booking): Promise<void> {
    const raw = BookingMapper.toPersistence(booking)

    // 1. Assegura que o tenant existe na tabela tenants antes de inserir para evitar violação de FK
    const tenantCheck = await this.postgresService.query(
      'SELECT id FROM tenants WHERE id = $1',
      [raw.tenant_id]
    )

    if (tenantCheck.rows.length === 0) {
      const slug = raw.tenant_id.replace(/^ten-/, '')
      await this.postgresService.query(
        `INSERT INTO tenants (id, slug, name, phone_whatsapp, business_category, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         ON CONFLICT (id) DO NOTHING`,
        [raw.tenant_id, slug, slug, '11999999999', 'hub']
      )
    }

    const query = `
      INSERT INTO bookings (
        id, tenant_id, customer_name, customer_phone,
        services, professional_id, professional_name,
        booking_date, booking_time, total_price_cents,
        total_duration_minutes, payment_mode, deposit_amount_cents,
        status, notes, pix_code, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
      )
      ON CONFLICT (id) DO UPDATE SET
        customer_name = EXCLUDED.customer_name,
        customer_phone = EXCLUDED.customer_phone,
        services = EXCLUDED.services,
        professional_id = EXCLUDED.professional_id,
        professional_name = EXCLUDED.professional_name,
        booking_date = EXCLUDED.booking_date,
        booking_time = EXCLUDED.booking_time,
        total_price_cents = EXCLUDED.total_price_cents,
        total_duration_minutes = EXCLUDED.total_duration_minutes,
        payment_mode = EXCLUDED.payment_mode,
        deposit_amount_cents = EXCLUDED.deposit_amount_cents,
        status = EXCLUDED.status,
        notes = EXCLUDED.notes,
        pix_code = EXCLUDED.pix_code
    `

    await this.postgresService.query(query, [
      raw.id,
      raw.tenant_id,
      raw.customer_name,
      raw.customer_phone,
      JSON.stringify(raw.services),
      raw.professional_id,
      raw.professional_name,
      raw.booking_date,
      raw.booking_time,
      raw.total_price_cents,
      raw.total_duration_minutes,
      raw.payment_mode,
      raw.deposit_amount_cents,
      raw.status,
      raw.notes,
      raw.pix_code,
      raw.created_at
    ])
  }

  async findById(id: string): Promise<Booking | null> {
    const result = await this.postgresService.query(
      'SELECT * FROM bookings WHERE id = $1',
      [id]
    )
    if (result.rows.length === 0) return null
    return BookingMapper.toDomain(result.rows[0])
  }

  async listByTenantAndDate(tenantId: string, date: string): Promise<Booking[]> {
    const result = await this.postgresService.query(
      'SELECT * FROM bookings WHERE tenant_id = $1 AND booking_date = $2 ORDER BY booking_time ASC',
      [tenantId, date]
    )
    return result.rows.map(row => BookingMapper.toDomain(row))
  }
}
