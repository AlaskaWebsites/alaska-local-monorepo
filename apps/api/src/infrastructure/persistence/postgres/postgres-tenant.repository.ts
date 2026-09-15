import { Injectable, Logger } from '@nestjs/common';
import { ITenantRepository } from '../../../core/application/ports/tenant.repository.port';
import { Tenant } from '../../../core/domain/entities/tenant.entity';
import { PostgresService } from './postgres.service';
import { TenantMapper } from './mappers/tenant.mapper';
import { SEED_TENANTS } from '../in-memory/seed-data';

@Injectable()
export class PostgresTenantRepository implements ITenantRepository {
  private readonly logger = new Logger(PostgresTenantRepository.name);

  constructor(private readonly db: PostgresService) {}

  async findById(id: string): Promise<Tenant | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM tenants WHERE id = $1',
        [id],
      );
      if (result.rows.length === 0) return null;
      const categories = await this.fetchCategoriesAndProducts(result.rows[0].id);
      return TenantMapper.toDomain(result.rows[0], categories);
    } catch (err) {
      this.logger.warn(`Erro ao buscar tenant por ID ${id}: ${(err as Error).message}`);
      return SEED_TENANTS.find((t) => t.id === id) || null;
    }
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    let cleanSlug = (slug || '').trim().toLowerCase();
    if (cleanSlug === 'adega-e-casa-de-racao-do-rei' || cleanSlug === 'casa-de-racao-do-rei') {
      cleanSlug = 'adega-do-rei';
    }
    try {
      const result = await this.db.query(
        'SELECT * FROM tenants WHERE LOWER(slug) = $1',
        [cleanSlug],
      );
      if (result.rows.length === 0) {
        const seed = SEED_TENANTS.find((t) => t.slug.toLowerCase() === cleanSlug);
        if (seed) {
          try {
            await this.save(seed);
          } catch (saveErr) {
            this.logger.warn(`Seed do tenant ${cleanSlug} retornado sem persistência: ${(saveErr as Error).message}`);
          }
          return seed;
        }
        return null;
      }
      const categories = await this.fetchCategoriesAndProducts(result.rows[0].id);
      return TenantMapper.toDomain(result.rows[0], categories);
    } catch (err) {
      this.logger.warn(`Erro em findBySlug(${slug}): ${(err as Error).message}`);
      const seed = SEED_TENANTS.find((t) => t.slug.toLowerCase() === cleanSlug);
      if (seed) return seed;
      return null;
    }
  }

  async findByCustomDomain(domain: string): Promise<Tenant | null> {
    const clean = (domain || '').trim().toLowerCase().replace(/^www\./, '').split(':')[0];
    try {
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
    } catch (err) {
      this.logger.warn(`Erro em findByCustomDomain(${domain}): ${(err as Error).message}`);
      const seed = SEED_TENANTS.find((t) => t.customDomain && t.customDomain.toLowerCase() === clean);
      if (seed) return seed;
      return null;
    }
  }

  async findByDomain(domain: string): Promise<Tenant | null> {
    return this.findByCustomDomain(domain);
  }

  async save(tenant: Tenant): Promise<void> {
    const row = TenantMapper.toPersistence(tenant) as any;
    await this.db.query(
      `INSERT INTO tenants (
        id, slug, name, description, logo, banner, phone_whatsapp, address,
        business_category, theme, custom_domain, opening_hours, pix_config,
        delivery_fee_cents, min_order_value_cents, is_active, professionals, reviews
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
        row.is_active,
        row.professionals,
        row.reviews,
      ],
    );
  }

  async update(tenant: Tenant): Promise<void> {
    await this.save(tenant);
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

  async listAllActive(): Promise<Tenant[]> {
    try {
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
    } catch (err) {
      this.logger.warn(`Erro em listAllActive: ${(err as Error).message}`);
      return SEED_TENANTS.filter((t) => t.isActive);
    }
  }

  private async fetchCategoriesAndProducts(tenantId: string): Promise<unknown[]> {
    try {
      const catResult = await this.db.query(
        `SELECT * FROM categories
         WHERE tenant_id = $1
         ORDER BY sort_order ASC, created_at ASC;`,
        [tenantId],
      );

      const prodResult = await this.db.query(
        `SELECT * FROM products
         WHERE tenant_id = $1
         ORDER BY created_at ASC;`,
        [tenantId],
      );

      return catResult.rows.map((cat: any) => ({
        ...cat,
        products: prodResult.rows
          .filter((p: any) => p.category_id === cat.id)
          .map((p: any) => ({
            ...p,
            price: Number(p.price_cents || 0) / 100,
            isAvailable: p.available ?? true,
            optionGroups:
              typeof p.option_groups === 'string'
                ? JSON.parse(p.option_groups)
                : (p.option_groups || []),
          })),
      }));
    } catch (err) {
      this.logger.error('Erro ao buscar categorias e produtos:', err);
      return [];
    }
  }
}
