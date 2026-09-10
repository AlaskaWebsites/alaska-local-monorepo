import { Injectable } from '@nestjs/common';
import { ITenantRepository } from '../../../core/application/ports/tenant.repository.port';
import { Tenant } from '../../../core/domain/entities/tenant.entity';
import { PostgresService } from './postgres.service';
import { TenantMapper, TenantRow } from './mappers/tenant.mapper';
import { SEED_TENANTS } from '../in-memory/seed-data';

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
    const cleanSlug = (slug || '').trim().toLowerCase();
    const result = await this.db.query(
      'SELECT * FROM tenants WHERE LOWER(slug) = $1',
      [cleanSlug],
    );
    if (result.rows.length === 0) {
      const seed = SEED_TENANTS.find((t) => t.slug.toLowerCase() === cleanSlug);
      if (seed) {
        try {
          await this.save(seed);
        } catch {}
        return seed;
      }
      return null;
    }
    const categories = await this.fetchCategoriesAndProducts(result.rows[0].id);
    return TenantMapper.toDomain(result.rows[0], categories);
  }

  async findByCustomDomain(domain: string): Promise<Tenant | null> {
    const clean = domain.toLowerCase().replace(/^www\./, '').split(':')[0];
    const result = await this.db.query(
      'SELECT * FROM tenants WHERE custom_domain = $1',
      [clean],
    );
    if (result.rows.length === 0) {
      const seed = SEED_TENANTS.find((t) => t.customDomain && t.customDomain.toLowerCase() === clean);
      if (seed) {
        try {
          await this.save(seed);
        } catch {}
        return seed;
      }
      return null;
    }
    const categories = await this.fetchCategoriesAndProducts(result.rows[0].id);
    return TenantMapper.toDomain(result.rows[0], categories);
  }

  async findByDomain(domain: string): Promise<Tenant | null> {
    return this.findByCustomDomain(domain);
  }

  async save(tenant: Tenant): Promise<void> {
    const row = TenantMapper.toPersistence(tenant) as unknown as TenantRow;
    await this.db.query(
      `INSERT INTO tenants (
        id, slug, name, description, logo, banner, phone_whatsapp, address,
        business_category, theme, opening_hours, pix_config, custom_domain,
        delivery_fee_cents, min_order_value_cents, is_active, professionals, reviews, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        logo = EXCLUDED.logo,
        banner = EXCLUDED.banner,
        phone_whatsapp = EXCLUDED.phone_whatsapp,
        address = EXCLUDED.address,
        business_category = EXCLUDED.business_category,
        theme = EXCLUDED.theme,
        opening_hours = EXCLUDED.opening_hours,
        pix_config = EXCLUDED.pix_config,
        custom_domain = EXCLUDED.custom_domain,
        delivery_fee_cents = EXCLUDED.delivery_fee_cents,
        min_order_value_cents = EXCLUDED.min_order_value_cents,
        is_active = EXCLUDED.is_active,
        professionals = EXCLUDED.professionals,
        reviews = EXCLUDED.reviews,
        updated_at = EXCLUDED.updated_at`,
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
        row.opening_hours,
        row.pix_config,
        row.custom_domain,
        row.delivery_fee_cents,
        row.min_order_value_cents,
        row.is_active,
        row.professionals,
        row.reviews,
        row.created_at,
        row.updated_at,
      ],
    );
  }

  async update(tenant: Tenant): Promise<void> {
    await this.save(tenant);
  }

  async listAllActive(): Promise<Tenant[]> {
    const result = await this.db.query(
      'SELECT * FROM tenants WHERE is_active = true ORDER BY name ASC',
    );
    if (result.rows.length === 0) {
      return SEED_TENANTS.filter((t) => t.isActive);
    }
    const tenants: Tenant[] = [];
    for (const row of result.rows) {
      const categories = await this.fetchCategoriesAndProducts(row.id);
      tenants.push(TenantMapper.toDomain(row, categories));
    }
    return tenants;
  }

  private async fetchCategoriesAndProducts(tenantId: string): Promise<unknown[]> {
    try {
      const catRes = await this.db.query(
        `SELECT id, name, icon, sort_order FROM categories WHERE tenant_id = $1 ORDER BY sort_order ASC`,
        [tenantId],
      );
      if (catRes.rows.length === 0) return [];

      const prodRes = await this.db.query(
        `SELECT id, category_id, name, description, price_cents, image, available, option_groups, duration_minutes
         FROM products WHERE tenant_id = $1 AND available = true ORDER BY name ASC`,
        [tenantId],
      );

      return catRes.rows.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        products: prodRes.rows
          .filter((p: any) => p.category_id === cat.id)
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price_cents / 100,
            image: p.image,
            isAvailable: p.available,
            available: p.available,
            optionGroups: p.option_groups || [],
            durationMinutes: p.duration_minutes,
          })),
      }));
    } catch (err) {
      console.error('Erro ao buscar categorias e produtos:', err);
      return [];
    }
  }
}
