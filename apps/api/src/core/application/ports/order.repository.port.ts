import { Order } from '../../domain/entities/order.entity'

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>
  listByTenant(tenantId: string): Promise<Order[]>
  save(order: Order): Promise<void>
}
