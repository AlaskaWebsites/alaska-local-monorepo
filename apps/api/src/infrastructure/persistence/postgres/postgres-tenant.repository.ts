import { Injectable, Inject } from '@nestjs/common';
import { ITenantRepository } from '../../../core/application/ports/tenant.repository.port';
import { Tenant } from '../../../core/domain/entities/tenant.entity';
import { PostgresService } from './postgres.service';
import { TOKENS } from '../../../core/application/tokens';
import { TenantMapper } from './mappers/tenant.mapper';

@Injectable()
export class PostgresTenantRepository implements ITenantRepository {
  constructor(
    @Inject(TOKENS.DATABASE_SERVICE) private readonly db: PostgresService,
  ) {}

  async findById(id: string): Promise<Tenant | null> {
    const result = await this.db.query('SELECT * FROM tenants WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return TenantMapper.toDomain(result.rows[0]);
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const result = await this.db.query('SELECT * FROM tenants WHERE slug = $1', [slug.toLowerCase()]);
    if (result.rows.length === 0) return null;
    return TenantMapper.toDomain(result.rows[0]);
  }

  async findByCustomDomain(domain: string): Promise<Tenant | null> {
    const clean = domain.toLowerCase().replace(/^www\./, '').split(':')[0];
    const result = await this.db.query(
      'SELECT * FROM tenants WHERE custom_domain = $1 OR $1 = ANY(custom_domains)',
      [clean],
    );
    if (result.rows.length === 0) return null;
    return TenantMapper.toDomain(result.rows[0]);
  }

  async findByDomain(domain: string): Promise<Tenant | null> {
    return this.findByCustomDomain(domain);
  }

  async save(tenant: Tenant): Promise<void> {
    const row = TenantMapper.toPersistence(tenant);
    await this.db.query(
      `INSERT INTO tenants (
        id, slug, name, description, logo, banner, phone_whatsapp, address,
        business_category, theme, opening_hours, pix_config, custom_domain,
        custom_domains, delivery_fee_cents, min_order_value_cents, is_active,
        is_closed_emergency, closed_emergency_message, pin_hash, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
      ON CONFLICT (id) DO UPDATE SET
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
        custom_domains = EXCLUDED.custom_domains,
        delivery_fee_cents = EXCLUDED.delivery_fee_cents,
        min_order_value_cents = EXCLUDED.min_order_value_cents,
        is_active = EXCLUDED.is_active,
        is_closed_emergency = EXCLUDED.is_closed_emergency,
        closed_emergency_message = EXCLUDED.closed_emergency_message,
        pin_hash = EXCLUDED.pin_hash,
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
        row.custom_domains,
        row.delivery_fee_cents,
        row.min_order_value_cents,
        row.is_active,
        row.is_closed_emergency,
        row.closed_emergency_message,
        row.pin_hash,
        row.created_at,
        row.updated_at,
      ],
    );
  }

  async update(tenant: Tenant): Promise<void> {
    await this.save(tenant);
  }

  async listAllActive(): Promise<Tenant[]> {
    const result = await this.db.query('SELECT * FROM tenants WHERE is_active = true');
    return result.rows.map((r: any) => TenantMapper.toDomain(r));
  }
}
