import { IBookingRepository } from '@core/application/ports/booking.repository.port'
import { Booking } from '@core/domain/entities/booking.entity'

export class InMemoryBookingRepository implements IBookingRepository {
  private items: Map<string, Booking> = new Map()

  async findById(id: string): Promise<Booking | null> {
    return this.items.get(id) || null
  }

  async listByTenantAndDate(tenantId: string, date: string): Promise<Booking[]> {
    return Array.from(this.items.values()).filter(
      b => b.tenantId === tenantId && b.date === date && b.status !== 'cancelled'
    )
  }

  async save(booking: Booking): Promise<void> {
    this.items.set(booking.id, booking)
  }

  clear(): void {
    this.items.clear()
  }
}
