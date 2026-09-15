import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { ITenantRepository } from '../../../core/application/ports/tenant.repository.port'
import { Tenant } from '../../../core/domain/entities/tenant.entity'
import { PostgresService } from './postgres.service'
import { TenantMapper, TenantRow } from './mappers/tenant.mapper'
import { SEED_TENANTS } from '../in-memory/seed-data'

@Injectable()
export class PostgresTenantRepository implements ITenantRepository {
  constructor(private readonly db: PostgresService) {}

  async findById(id: string): Promise<Tenant | null> {
    const result = await this.db.query(
      'SELECT * FROM tenants WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) return null;
    const categories = await this.fetchCategoriesAndProducts(result.rows[0].id);
    return TenantMapper.toDomain(result.rows[0], categories);
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    let cleanSlug = (slug || '').trim().toLowerCase();
    if (cleanSlug === 'adega-e-casa-de-racao-do-rei' || cleanSlug === 'casa-de-racao-do-rei') {
      cleanSlug = 'adega-do-rei';
    }
    const result = await this.db.query(
      'SELECT * FROM tenants WHERE LOWER(slug) = $1',
      [cleanSlug],
    );
    if (result.rows.length === 0) {
      const seed = SEED_TENANTS.find((t) => t.slug.toLowerCase() === cleanSlug);
      if (seed) {
        try {
          await this.save(seed);
          return seed;
        } catch {}
      }
      return null;
    }
    const categories = await this.fetchCategoriesAndProducts(result.rows[0].id);
    return TenantMapper.toDomain(result.rows[0], categories);
  }

  async findByCustomDomain(domain: string): Promise<Tenant | null> {
    const result = await this.db.query(
      'SELECT * FROM tenants WHERE custom_domain = $1',
      [domain.toLowerCase()],
    );
    if (result.rows.length === 0) return null;
    const categories = await this.fetchCategoriesAndProducts(result.rows[0].id);
    return TenantMapper.toDomain(result.rows[0], categories);
  }

  async save(tenant: Tenant): Promise<void> {
    const row = TenantMapper.toRow(tenant);
    await this.db.query(
      `INSERT INTO tenants (
        id, slug, name, description, logo, banner, phone_whatsapp, address,
        business_category, theme, custom_domain, opening_hours, pix_config,
        delivery_fee_cents, min_order_value_cents, professionals, reviews
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
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
        professionals = EXCLUDED.professionals,
        reviews = EXCLUDED.reviews;`,
      [
        row.id,
        row.slug,
        row.name,
        row.description,
        row.logo,
        row.banner,
        row.phone_whatsapp,
        row.address,
        row.business_category,
        row.theme,
        row.custom_domain,
        row.opening_hours,
        row.pix_config,
        row.delivery_fee_cents,
        row.min_order_value_cents,
        row.professionals,
        row.reviews,
      ],
    );
  }

  async updateHours(
    tenantId: string,
    hours: Record<string, { open: string; close: string; closed?: boolean }>,
  ): Promise<Tenant> {
    const result = await this.db.query(
      `UPDATE tenants
       SET opening_hours = $1
       WHERE id = $2
       RETURNING *;`,
      [JSON.stringify(hours), tenantId],
    );
    const categories = await this.fetchCategoriesAndProducts(tenantId);
    return TenantMapper.toDomain(result.rows[0], categories);
  }

  async setEmergencyClose(
    tenantId: string,
    closed: boolean,
    message?: string,
  ): Promise<Tenant> {
    const result = await this.db.query(
      `UPDATE tenants
       SET is_closed_emergency = $1, closed_emergency_message = $2
       WHERE id = $3
       RETURNING *;`,
      [closed, message || null, tenantId],
    );
    const categories = await this.fetchCategoriesAndProducts(tenantId);
    return TenantMapper.toDomain(result.rows[0], categories);
  }

  private async fetchCategoriesAndProducts(tenantId: string): Promise<any[]> {
    const catResult = await this.db.query(
      `SELECT * FROM categories
       WHERE tenant_id = $1
       ORDER BY sort_order ASC, created_at ASC;`,
      [tenantId],
    );

    const categories = [];
    for (const catRow of catResult.rows) {
      const prodResult = await this.db.query(
        `SELECT * FROM products
         WHERE category_id = $1 AND tenant_id = $2
         ORDER BY created_at ASC;`,
        [catRow.id, tenantId],
      );
      categories.push({
        ...catRow,
        products: prodResult.rows,
      });
    }

    return categories;
  }
}
