import { Injectable } from '@nestjs/common'
import { IOrderRepository } from '@core/application/ports/order.repository.port'
import { Order } from '@core/domain/entities/order.entity'
import { PostgresService } from './postgres.service'
import { OrderMapper, OrderRow } from './mappers/order.mapper'

@Injectable()
export class PostgresOrderRepository implements IOrderRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async findById(id: string): Promise<Order | null> {
    const res = await this.postgresService.query<OrderRow>(
      `SELECT * FROM orders WHERE id = $1 LIMIT 1`,
      [id]
    )
    if (res.rowCount === 0 || !res.rows[0]) return null
    return OrderMapper.toDomain(res.rows[0])
  }

  async listByTenant(tenantId: string): Promise<Order[]> {
    const res = await this.postgresService.query<OrderRow>(
      `SELECT * FROM orders WHERE tenant_id = $1 ORDER BY created_at DESC`,
      [tenantId]
    )
    return res.rows.map(row => OrderMapper.toDomain(row))
  }

  async save(order: Order): Promise<void> {
    const p = OrderMapper.toPersistence(order)
    await this.postgresService.query(
      `INSERT INTO orders (
        id, tenant_id, customer_name, customer_phone, delivery_type,
        address, items, subtotal_cents, delivery_fee_cents, total_cents,
        payment_method, change_for_cents, status, pix_code, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        pix_code = EXCLUDED.pix_code`,
      [
        p.id, p.tenant_id, p.customer_name, p.customer_phone, p.delivery_type,
        p.address, p.items, p.subtotal_cents, p.delivery_fee_cents, p.total_cents,
        p.payment_method, p.change_for_cents, p.status, p.pix_code, p.created_at
      ]
    )
  }
}
