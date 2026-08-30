import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg'
import { validateEnv } from '../../../config/env.schema'

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
    this.pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: connectionString.includes('supabase.co') ? { rejectUnauthorized: false } : undefined
    })

    this.pool.on('error', (err) => {
      this.logger.error('Erro no Pool do PostgreSQL:', err)
    })
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
