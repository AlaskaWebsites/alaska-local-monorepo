import { Injectable, OnModuleInit } from '@nestjs/common'
import { IProfessionalRepository, BlockedSlotRecord } from '../../../core/application/ports/professional.repository.port'
import { Professional } from '../../../core/domain/entities/professional.entity'
import { PostgresService } from './postgres.service'
import { EntityNotFoundError } from '../../../core/domain/errors/domain.error'

@Injectable()
export class PostgresProfessionalRepository implements IProfessionalRepository, OnModuleInit {
  constructor(private readonly db: PostgresService) {}

  async onModuleInit() {
    await this.ensureTablesExist()
  }

  private async ensureTablesExist(): Promise<void> {
    try {
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS professionals (
          id VARCHAR(100) PRIMARY KEY,
          tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(100) DEFAULT 'Profissional',
          avatar TEXT,
          available_days JSONB DEFAULT '[1, 2, 3, 4, 5]',
          work_hours JSONB DEFAULT '{"start": "08:00", "end": "18:00"}',
          lunch_break JSONB DEFAULT '{"start": "12:00", "end": "13:00", "enabled": true}',
          is_available BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS blocked_slots (
          id SERIAL PRIMARY KEY,
          tenant_id VARCHAR(100) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
          slot_date DATE NOT NULL,
          slot_time VARCHAR(10) NOT NULL,
          reason TEXT DEFAULT 'Horário Bloqueado pelo Lojista',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(tenant_id, slot_date, slot_time)
        );
      `)
    } catch (err) {
      console.warn('[PostgresProfessionalRepository] Aviso ao verificar tabelas professionals/blocked_slots:', err)
    }
  }

  private mapRowToEntity(row: any): Professional {
    const days = typeof row.available_days === 'string'
      ? JSON.parse(row.available_days)
      : (row.available_days || [1, 2, 3, 4, 5])

    const workHours = typeof row.work_hours === 'string'
      ? JSON.parse(row.work_hours)
      : (row.work_hours || { start: '08:00', end: '18:00' })

    const lunchBreak = typeof row.lunch_break === 'string'
      ? JSON.parse(row.lunch_break)
      : (row.lunch_break || { start: '12:00', end: '13:00', enabled: true })

    return new Professional({
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      role: row.role || 'Profissional',
      avatar: row.avatar || undefined,
      availableDays: days,
      workHours,
      lunchBreak,
      isAvailable: row.is_available ?? true,
      createdAt: row.created_at ? new Date(row.created_at) : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined
    })
  }

  async findById(id: string): Promise<Professional | null> {
    const res = await this.db.query('SELECT * FROM professionals WHERE id = $1 LIMIT 1', [id])
    if (res.rows.length === 0) return null
    return this.mapRowToEntity(res.rows[0])
  }

  async listByTenantSlug(tenantSlug: string): Promise<Professional[]> {
    const cleanSlug = (tenantSlug || '').trim().toLowerCase()
    const res = await this.db.query(`
      SELECT p.* FROM professionals p
      JOIN tenants t ON t.id = p.tenant_id
      WHERE LOWER(t.slug) = $1
      ORDER BY p.name ASC
    `, [cleanSlug])

    return res.rows.map(row => this.mapRowToEntity(row))
  }

  async listByTenantId(tenantId: string): Promise<Professional[]> {
    const res = await this.db.query(
      'SELECT * FROM professionals WHERE tenant_id = $1 ORDER BY name ASC',
      [tenantId]
    )
    return res.rows.map(row => this.mapRowToEntity(row))
  }

  async save(professional: Professional): Promise<void> {
    await this.db.query(`
      INSERT INTO professionals (
        id, tenant_id, name, role, avatar, available_days, work_hours, lunch_break, is_available, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (id) DO UPDATE SET
        tenant_id = EXCLUDED.tenant_id,
        name = EXCLUDED.name,
        role = EXCLUDED.role,
        avatar = EXCLUDED.avatar,
        available_days = EXCLUDED.available_days,
        work_hours = EXCLUDED.work_hours,
        lunch_break = EXCLUDED.lunch_break,
        is_available = EXCLUDED.is_available,
        updated_at = NOW()
    `, [
      professional.id,
      professional.tenantId,
      professional.name,
      professional.role,
      professional.avatar || null,
      JSON.stringify(professional.availableDays),
      JSON.stringify(professional.workHours),
      JSON.stringify(professional.lunchBreak),
      professional.isAvailable
    ])
  }

  async delete(id: string): Promise<void> {
    await this.db.query('DELETE FROM professionals WHERE id = $1', [id])
  }

  async listBlockedSlots(tenantSlug: string): Promise<BlockedSlotRecord[]> {
    const cleanSlug = (tenantSlug || '').trim().toLowerCase()
    const res = await this.db.query(`
      SELECT TO_CHAR(bs.slot_date, 'YYYY-MM-DD') as date, bs.slot_time as time, bs.reason
      FROM blocked_slots bs
      JOIN tenants t ON t.id = bs.tenant_id
      WHERE LOWER(t.slug) = $1
      ORDER BY bs.slot_date ASC, bs.slot_time ASC
    `, [cleanSlug])

    return res.rows.map((row: any) => ({
      date: row.date,
      time: row.time,
      reason: row.reason || 'Horário Bloqueado pelo Lojista'
    }))
  }

  async toggleBlockSlot(
    tenantSlug: string,
    date: string,
    time: string,
    reason = 'Horário Bloqueado pelo Lojista'
  ): Promise<{ blocked: boolean; date: string; time: string }> {
    const cleanSlug = (tenantSlug || '').trim().toLowerCase()
    const tenantRes = await this.db.query('SELECT id FROM tenants WHERE LOWER(slug) = $1 LIMIT 1', [cleanSlug])
    if (tenantRes.rows.length === 0) {
      throw new EntityNotFoundError('Tenant', tenantSlug)
    }
    const tenantId = tenantRes.rows[0].id

    const checkRes = await this.db.query(
      'SELECT id FROM blocked_slots WHERE tenant_id = $1 AND slot_date = $2 AND slot_time = $3',
      [tenantId, date, time]
    )

    if (checkRes.rows.length > 0) {
      await this.db.query('DELETE FROM blocked_slots WHERE id = $1', [checkRes.rows[0].id])
      return { blocked: false, date, time }
    } else {
      await this.db.query(
        'INSERT INTO blocked_slots (tenant_id, slot_date, slot_time, reason) VALUES ($1, $2, $3, $4)',
        [tenantId, date, time, reason]
      )
      return { blocked: true, date, time }
    }
  }
}
