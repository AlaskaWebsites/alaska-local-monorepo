import { IOrderRepository } from '@core/application/ports/order.repository.port'
import { Order } from '@core/domain/entities/order.entity'
import { PostgresService } from './postgres.service'
import { OrderMapper } from './mappers/order.mapper'

export class PostgresOrderRepository implements IOrderRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async save(order: Order): Promise<void> {
    const raw = OrderMapper.toPersistence(order)
    const tenantId = String(raw.tenant_id || '')

    // 1. Assegura que o tenant existe na tabela tenants antes de inserir para evitar violação de FK
    const tenantCheck = await this.postgresService.query(
      'SELECT id FROM tenants WHERE id = $1',
      [tenantId]
    )

    if (tenantCheck.rows.length === 0) {
      const slug = tenantId.replace(/^ten-/, '')
      await this.postgresService.query(
        `INSERT INTO tenants (id, slug, name, phone_whatsapp, business_category, is_active)
         VALUES ($1, $2, $3, $4, $5, true)
         ON CONFLICT (id) DO NOTHING`,
        [tenantId, slug, slug, '11999999999', 'menu']
      )
    }

    const query = `
      INSERT INTO orders (
        id, tenant_id, customer_name, customer_phone,
        delivery_type, address, items, subtotal_cents,
        delivery_fee_cents, total_cents, payment_method,
        change_for_cents, status, pix_code, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      )
      ON CONFLICT (id) DO UPDATE SET
        customer_name = EXCLUDED.customer_name,
        customer_phone = EXCLUDED.customer_phone,
        delivery_type = EXCLUDED.delivery_type,
        address = EXCLUDED.address,
        items = EXCLUDED.items,
        subtotal_cents = EXCLUDED.subtotal_cents,
        delivery_fee_cents = EXCLUDED.delivery_fee_cents,
        total_cents = EXCLUDED.total_cents,
        payment_method = EXCLUDED.payment_method,
        change_for_cents = EXCLUDED.change_for_cents,
        status = EXCLUDED.status,
        pix_code = EXCLUDED.pix_code,
        updated_at = EXCLUDED.updated_at
    `

    await this.postgresService.query(query, [
      raw.id,
      tenantId,
      raw.customer_name,
      raw.customer_phone,
      raw.delivery_type,
      raw.address ? JSON.stringify(raw.address) : null,
      JSON.stringify(raw.items),
      raw.subtotal_cents,
      raw.delivery_fee_cents,
      raw.total_cents,
      raw.payment_method,
      raw.change_for_cents,
      raw.status,
      raw.pix_code,
      raw.created_at,
      raw.updated_at
    ])
  }

  async findById(id: string): Promise<Order | null> {
    const result = await this.postgresService.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    )
    if (result.rows.length === 0) return null
    return OrderMapper.toDomain(result.rows[0])
  }

  async listByTenant(tenantId: string, limit = 50, offset = 0): Promise<Order[]> {
    const result = await this.postgresService.query(
      'SELECT * FROM orders WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [tenantId, limit, offset]
    )
    return result.rows.map(row => OrderMapper.toDomain(row))
  }
}
