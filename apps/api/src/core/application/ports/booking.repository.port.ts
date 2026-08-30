import { Booking } from '../../domain/entities/booking.entity'

export interface IBookingRepository {
  findById(id: string): Promise<Booking | null>
  listByTenantAndDate(tenantId: string, date: string): Promise<Booking[]>
  save(booking: Booking): Promise<void>
}
