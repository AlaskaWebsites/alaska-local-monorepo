import { Injectable } from '@nestjs/common'
import { ITenantRepository } from '@core/application/ports/tenant.repository.port'
import { Tenant } from '@core/domain/entities/tenant.entity'
import { PostgresService } from './postgres.service'
import { TenantMapper, TenantRow } from './mappers/tenant.mapper'
import { SEED_TENANTS } from '../in-memory/seed-data'

@Injectable()
export class PostgresTenantRepository implements ITenantRepository {
  constructor(private readonly postgresService: PostgresService) {}

  async findById(id: string): Promise<Tenant | null> {
    const res = await this.postgresService.query<TenantRow>(
      `SELECT * FROM tenants WHERE id = $1 LIMIT 1`,
      [id]
    )
    if (res.rowCount === 0 || !res.rows[0]) return null

    const categories = await this.fetchCategoriesAndProducts(res.rows[0].id)
    return TenantMapper.toDomain(res.rows[0], categories)
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const cleanSlug = (slug || '').trim().toLowerCase()
    const res = await this.postgresService.query<TenantRow>(
      `SELECT * FROM tenants WHERE LOWER(slug) = $1 LIMIT 1`,
      [cleanSlug]
    )
    if (res.rowCount === 0 || !res.rows[0]) {
      const seed = SEED_TENANTS.find(t => t.slug.toLowerCase() === cleanSlug)
      if (seed) {
        try {
          await this.save(seed)
        } catch {}
        return seed
      }
      return null
    }

    const categories = await this.fetchCategoriesAndProducts(res.rows[0].id)
    return TenantMapper.toDomain(res.rows[0], categories)
  }

  async findByCustomDomain(domain: string): Promise<Tenant | null> {
    const cleanDomain = (domain || '').trim().toLowerCase().replace(/^www\./, '').split(':')[0]
    const res = await this.postgresService.query<TenantRow>(
      `SELECT * FROM tenants WHERE LOWER(custom_domain) = $1 LIMIT 1`,
      [cleanDomain]
    )
    if (res.rowCount === 0 || !res.rows[0]) {
      const seed = SEED_TENANTS.find(t => t.customDomain && t.customDomain.toLowerCase() === cleanDomain)
      if (seed) {
        try {
          await this.save(seed)
        } catch {}
        return seed
      }
      return null
    }

    const categories = await this.fetchCategoriesAndProducts(res.rows[0].id)
    return TenantMapper.toDomain(res.rows[0], categories)
  }

  async save(tenant: Tenant): Promise<void> {
    const p = TenantMapper.toPersistence(tenant)
    await this.postgresService.query(
      `INSERT INTO tenants (
        id, slug, name, description, logo, banner, phone_whatsapp, address,
        business_category, theme, custom_domain, opening_hours, pix_config,
        delivery_fee_cents, min_order_value_cents, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        logo = EXCLUDED.logo,
        banner = EXCLUDED.banner,
        phone_whatsapp = EXCLUDED.phone_whatsapp,
        address = EXCLUDED.address,
        business_category = EXCLUDED.business_category,
        theme = EXCLUDED.theme,
        custom_domain = EXCLUDED.custom_domain,
        opening_hours = EXCLUDED.opening_hours,
        pix_config = EXCLUDED.pix_config,
        delivery_fee_cents = EXCLUDED.delivery_fee_cents,
        min_order_value_cents = EXCLUDED.min_order_value_cents,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()`,
      [
        p.id, p.slug, p.name, p.description, p.logo, p.banner, p.phone_whatsapp, p.address,
        p.business_category, p.theme, p.custom_domain, p.opening_hours, p.pix_config,
        p.delivery_fee_cents, p.min_order_value_cents, p.is_active, p.created_at, p.updated_at
      ]
    )
  }

  async listAllActive(): Promise<Tenant[]> {
    const res = await this.postgresService.query<TenantRow>(
      `SELECT * FROM tenants WHERE is_active = true ORDER BY name ASC`
    )
    if (res.rowCount === 0) {
      return SEED_TENANTS
    }
    return res.rows.map(row => TenantMapper.toDomain(row))
  }

  private async fetchCategoriesAndProducts(tenantId: string): Promise<unknown[]> {
    try {
      const catRes = await this.postgresService.query(
        `SELECT id, name, icon, sort_order FROM categories WHERE tenant_id = $1 ORDER BY sort_order ASC`,
        [tenantId]
      )
      if (catRes.rowCount === 0) return []

      const prodRes = await this.postgresService.query(
        `SELECT id, category_id, name, description, price_cents, image_url, is_available, option_groups, duration_minutes
         FROM products WHERE tenant_id = $1 AND is_available = true ORDER BY name ASC`,
        [tenantId]
      )

      return catRes.rows.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        items: prodRes.rows
          .filter(p => p.category_id === cat.id)
          .map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price_cents / 100,
            image: p.image_url,
            isAvailable: p.is_available,
            optionGroups: p.option_groups || [],
            durationMinutes: p.duration_minutes
          }))
      }))
    } catch {
      return []
    }
  }
}
