import { Injectable } from '@nestjs/common'
import { IProductRepository } from '../../../core/application/ports/product.repository.port'
import { Product } from '../../../core/domain/entities/product.entity'
import { PostgresService } from './postgres.service'
import { EntityNotFoundError } from '../../../core/domain/errors/domain.error'
import { Money } from '../../../core/domain/value-objects/money.vo'

@Injectable()
export class PostgresProductRepository implements IProductRepository {
  constructor(private readonly db: PostgresService) {}

  private mapRowToProduct(row: any): Product {
    return new Product({
      id: row.id,
      tenantId: row.tenant_id,
      categoryId: row.category_id,
      name: row.name,
      description: row.description || undefined,
      price: Money.fromCents(row.price_cents),
      imageUrl: row.image || undefined,
      isAvailable: row.available ?? true,
      optionGroups: typeof row.option_groups === 'string' ? JSON.parse(row.option_groups) : (row.option_groups || []),
      durationMinutes: row.duration_minutes ?? undefined,
      createdAt: row.created_at ? new Date(row.created_at) : undefined
    })
  }

  async findById(id: string): Promise<Product | null> {
    const res = await this.db.query('SELECT * FROM products WHERE id = $1', [id])
    if (res.rows.length === 0) return null
    return this.mapRowToProduct(res.rows[0])
  }

  async listByTenantSlug(tenantSlug: string): Promise<Product[]> {
    const res = await this.db.query(
      `SELECT p.* FROM products p
       JOIN tenants t ON t.id = p.tenant_id
       WHERE LOWER(t.slug) = $1
       ORDER BY p.name ASC`,
      [tenantSlug.toLowerCase()]
    )
    return res.rows.map(row => this.mapRowToProduct(row))
  }

  async toggleAvailability(productId: string, isAvailable: boolean): Promise<Product> {
    const res = await this.db.query(
      `UPDATE products SET available = $1 WHERE id = $2 RETURNING *`,
      [isAvailable, productId]
    )
    if (res.rows.length === 0) {
      throw new EntityNotFoundError('Product', productId)
    }
    return this.mapRowToProduct(res.rows[0])
  }

  async update(productId: string, data: Partial<Product> & { priceCents?: number; optionGroups?: any }): Promise<Product> {
    const current = await this.findById(productId)
    if (!current) {
      throw new EntityNotFoundError('Product', productId)
    }

    const name = data.name ?? current.name
    const description = data.description !== undefined ? data.description : current.description
    const priceCents = data.priceCents !== undefined ? data.priceCents : current.price.cents
    const isAvailable = data.isAvailable !== undefined ? data.isAvailable : current.isAvailable
    const optionGroups = data.optionGroups !== undefined ? JSON.stringify(data.optionGroups) : JSON.stringify(current.optionGroups || [])

    const res = await this.db.query(
      `UPDATE products SET
        name = $1,
        description = $2,
        price_cents = $3,
        available = $4,
        option_groups = $5
       WHERE id = $6 RETURNING *`,
      [name, description || null, priceCents, isAvailable, optionGroups, productId]
    )

    return this.mapRowToProduct(res.rows[0])
  }

  async save(product: Product): Promise<void> {
    await this.db.query(
      `INSERT INTO products (
        id, tenant_id, category_id, name, description, price_cents, image, available, duration_minutes, option_groups
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        tenant_id = EXCLUDED.tenant_id,
        category_id = EXCLUDED.category_id,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        price_cents = EXCLUDED.price_cents,
        image = EXCLUDED.image,
        available = EXCLUDED.available,
        duration_minutes = EXCLUDED.duration_minutes,
        option_groups = EXCLUDED.option_groups`,
      [
        product.id,
        product.tenantId,
        product.categoryId,
        product.name,
        product.description || null,
        product.price.cents,
        product.imageUrl || null,
        product.isAvailable,
        product.durationMinutes || null,
        JSON.stringify(product.optionGroups || [])
      ]
    )
  }
}
