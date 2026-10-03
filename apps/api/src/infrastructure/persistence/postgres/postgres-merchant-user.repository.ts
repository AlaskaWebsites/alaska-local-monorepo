import { Injectable, Inject } from '@nestjs/common';
import { IMerchantUserRepository } from '@core/application/ports/merchant-user.repository.port';
import { MerchantUser } from '@core/domain/entities/merchant-user.entity';
import { PostgresService } from './postgres.service';
import { TOKENS } from '@core/application/tokens';

export interface MerchantUserRow {
  id: string;
  tenant_id: string;
  tenant_slug: string;
  email: string;
  password_hash: string;
  name?: string | null;
  role?: string | null;
  is_active?: boolean | null;
  created_at?: Date | string | null;
  updated_at?: Date | string | null;
}

@Injectable()
export class PostgresMerchantUserRepository implements IMerchantUserRepository {
  private schemaEnsured = false;

  constructor(
    @Inject(TOKENS.DATABASE_SERVICE) private readonly db: PostgresService,
  ) {}

  private async ensureSchema(): Promise<void> {
    if (this.schemaEnsured) return;
    try {
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS merchant_users (
          id VARCHAR(100) PRIMARY KEY,
          tenant_id VARCHAR(100) NOT NULL,
          tenant_slug VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          role VARCHAR(50) DEFAULT 'merchant',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          CONSTRAINT uq_merchant_user_tenant_email UNIQUE(tenant_slug, email)
        );
        CREATE INDEX IF NOT EXISTS idx_merchant_users_slug_email ON merchant_users(tenant_slug, email);
      `);
      this.schemaEnsured = true;
    } catch {
      // Ignora erro caso a tabela já exista
    }
  }

  private toDomain(row: MerchantUserRow): MerchantUser {
    return new MerchantUser({
      id: row.id,
      tenantId: row.tenant_id,
      tenantSlug: row.tenant_slug,
      email: row.email,
      passwordHash: row.password_hash,
      name: row.name || undefined,
      role: (row.role || 'merchant') as any,
      isActive: row.is_active ?? true,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    });
  }

  async findById(id: string): Promise<MerchantUser | null> {
    await this.ensureSchema();
    const result = await this.db.query<MerchantUserRow>(
      'SELECT * FROM merchant_users WHERE id = $1 LIMIT 1',
      [id],
    );
    if (result.rows.length === 0) return null;
    return this.toDomain(result.rows[0]);
  }

  async findByEmailAndSlug(email: string, tenantSlug: string): Promise<MerchantUser | null> {
    await this.ensureSchema();
    const result = await this.db.query<MerchantUserRow>(
      'SELECT * FROM merchant_users WHERE LOWER(email) = $1 AND LOWER(tenant_slug) = $2 LIMIT 1',
      [email.toLowerCase().trim(), tenantSlug.toLowerCase().trim()],
    );
    if (result.rows.length === 0) return null;
    return this.toDomain(result.rows[0]);
  }

  async findByTenantId(tenantId: string): Promise<MerchantUser[]> {
    await this.ensureSchema();
    const result = await this.db.query<MerchantUserRow>(
      'SELECT * FROM merchant_users WHERE tenant_id = $1 ORDER BY created_at ASC',
      [tenantId],
    );
    return result.rows.map((row) => this.toDomain(row));
  }

  async save(user: MerchantUser): Promise<void> {
    await this.ensureSchema();
    await this.db.query(
      `INSERT INTO merchant_users (
        id, tenant_id, tenant_slug, email, password_hash, name, role, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        tenant_slug = EXCLUDED.tenant_slug,
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()`,
      [
        user.id,
        user.tenantId,
        user.tenantSlug,
        user.email,
        user.passwordHash,
        user.name || null,
        user.role,
        user.isActive,
        user.createdAt,
        user.updatedAt,
      ],
    );
  }

  async update(user: MerchantUser): Promise<void> {
    await this.save(user);
  }
}
