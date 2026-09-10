import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg'
import { validateEnv } from '../../../config/env.schema'
import { seedAllStores } from './seed-catalog'

export interface IDatabaseService {
  query<T extends QueryResultRow = any>(text: string, params?: unknown[]): Promise<QueryResult<T>>
  getClient(): Promise<PoolClient>
  withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T>
  withTenantContext<T>(tenantId: string, fn: (client: PoolClient) => Promise<T>): Promise<T>
  isHealthy(): Promise<boolean>
}

@Injectable()
export class PostgresService implements IDatabaseService, OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PostgresService.name)
  private pool: Pool | null = null

  async onModuleInit() {
    const env = validateEnv()
    const connectionString = env.DATABASE_URL || 'postgres://alaska:alaskapassword@localhost:5432/alaska_local'

    this.logger.log('Inicializando Pool de conexões PostgreSQL...')
    const requiresSsl =
      connectionString.includes('supabase.co') ||
      connectionString.includes('render.com') ||
      connectionString.includes('dpg-') ||
      connectionString.includes('oregon-postgres') ||
      connectionString.includes('sslmode=require') ||
      connectionString.includes('ssl=true')

    this.pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: requiresSsl ? { rejectUnauthorized: false } : undefined
    })

    this.pool.on('error', (err) => {
      this.logger.error('Erro no Pool do PostgreSQL:', err)
    })

    await this.initSchema()
  }

  private async initSchema(): Promise<void> {
    if (!this.pool) return
    try {
      this.logger.log('Verificando e inicializando schema do banco de dados (auto-migration)...')

      await this.pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS tenants (
          id VARCHAR(100) PRIMARY KEY,
          slug VARCHAR(100) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          logo TEXT,
          banner TEXT,
          phone_whatsapp VARCHAR(20) NOT NULL,
          address TEXT,
          business_category VARCHAR(20) NOT NULL CHECK (business_category IN ('menu', 'shop', 'hub', 'pro')),
          theme VARCHAR(30) DEFAULT 'food',
          custom_domain VARCHAR(100) UNIQUE,
          opening_hours JSONB,
          pix_config JSONB,
          delivery_fee_cents INT DEFAULT 0,
          min_order_value_cents INT DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          professionals JSONB DEFAULT '[]'::jsonb,
          reviews JSONB,
          pin_hash VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)

      await this.pool.query(`
        ALTER TABLE tenants ADD COLUMN IF NOT EXISTS professionals JSONB DEFAULT '[]'::jsonb;
        ALTER TABLE tenants ADD COLUMN IF NOT EXISTS reviews JSONB;
        ALTER TABLE tenants ADD COLUMN IF NOT EXISTS pin_hash VARCHAR(255);
      `)

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id VARCHAR(100) PRIMARY KEY,
          tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          name VARCHAR(100) NOT NULL,
          icon VARCHAR(50),
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(100) PRIMARY KEY,
          tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          category_id VARCHAR(100) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price_cents INT NOT NULL CHECK (price_cents >= 0),
          image TEXT,
          available BOOLEAN DEFAULT true,
          duration_minutes INT,
          option_groups JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(100) PRIMARY KEY,
          tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          customer_name VARCHAR(255) NOT NULL,
          customer_phone VARCHAR(20) NOT NULL,
          delivery_type VARCHAR(20) NOT NULL CHECK (delivery_type IN ('delivery', 'pickup')),
          address JSONB,
          items JSONB NOT NULL,
          subtotal_cents INT NOT NULL,
          delivery_fee_cents INT NOT NULL DEFAULT 0,
          total_cents INT NOT NULL,
          payment_method VARCHAR(50) NOT NULL,
          change_for_cents INT,
          status VARCHAR(30) DEFAULT 'created',
          pix_code TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)

      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS bookings (
          id VARCHAR(100) PRIMARY KEY,
          tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          customer_name VARCHAR(255) NOT NULL,
          customer_phone VARCHAR(20) NOT NULL,
          services JSONB NOT NULL,
          professional_id VARCHAR(100),
          professional_name VARCHAR(255),
          booking_date DATE NOT NULL,
          booking_time VARCHAR(10) NOT NULL,
          total_price_cents INT NOT NULL,
          total_duration_minutes INT NOT NULL,
          payment_mode VARCHAR(30) NOT NULL,
          deposit_amount_cents INT DEFAULT 0,
          status VARCHAR(30) DEFAULT 'scheduled',
          notes TEXT,
          pix_code TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `)

      this.logger.log('✅ Schema do PostgreSQL verificado e sincronizado com sucesso.')

      const catCountRes = await this.pool.query('SELECT COUNT(*) as count FROM categories')
      const catCount = parseInt(catCountRes.rows[0]?.count || '0', 10)

      if (catCount === 0) {
        this.logger.log('🌱 Categorias vazias detectadas. Executando auto-seed inicial dos 10 estabelecimentos...')
        const stats = await seedAllStores(this)
        this.logger.log(`🎉 Auto-seed concluído com sucesso: ${stats.totalTenants} lojas, ${stats.totalCats} categorias e ${stats.totalProds} produtos cadastrados no PostgreSQL.`)
      }
    } catch (err) {
      this.logger.error('Aviso na auto-inicialização do schema PostgreSQL:', (err as Error).message)
    }
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end()
      this.logger.log('Pool do PostgreSQL desconectado.')
    }
  }

  async query<T extends QueryResultRow = any>(text: string, params?: unknown[]): Promise<QueryResult<T>> {
    if (!this.pool) throw new Error('PostgresService não inicializado.')
    return this.pool.query<T>(text, params)
  }

  async getClient(): Promise<PoolClient> {
    if (!this.pool) throw new Error('PostgresService não inicializado.')
    return this.pool.connect()
  }

  async withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient()
    try {
      await client.query('BEGIN')
      const result = await fn(client)
      await client.query('COMMIT')
      return result
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }

  async withTenantContext<T>(tenantId: string, fn: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient()
    try {
      await client.query('BEGIN')
      await client.query(`SELECT set_config('app.current_tenant_id', $1, true)`, [tenantId])
      const result = await fn(client)
      await client.query('COMMIT')
      return result
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.pool) return false
      const res = await this.pool.query('SELECT 1 as healthy')
      return res.rows[0]?.healthy === 1
    } catch (err) {
      this.logger.warn(`Health check do PostgreSQL falhou: ${(err as Error).message}`)
      return false
    }
  }
}