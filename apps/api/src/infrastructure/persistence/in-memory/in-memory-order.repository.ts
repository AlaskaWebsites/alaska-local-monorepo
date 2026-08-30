import { IOrderRepository } from '@core/application/ports/order.repository.port'
import { Order } from '@core/domain/entities/order.entity'

export class InMemoryOrderRepository implements IOrderRepository {
  private items: Map<string, Order> = new Map()

  async findById(id: string): Promise<Order | null> {
    return this.items.get(id) || null
  }

  async listByTenant(tenantId: string): Promise<Order[]> {
    return Array.from(this.items.values()).filter(o => o.tenantId === tenantId)
  }

  async save(order: Order): Promise<void> {
    this.items.set(order.id, order)
  }

  clear(): void {
    this.items.clear()
  }
}
