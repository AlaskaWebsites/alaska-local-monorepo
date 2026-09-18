import { Professional } from '../../domain/entities/professional.entity'

export interface BlockedSlotRecord {
  date: string
  time: string
  reason?: string
}

export interface IProfessionalRepository {
  findById(id: string): Promise<Professional | null>
  listByTenantSlug(tenantSlug: string): Promise<Professional[]>
  listByTenantId(tenantId: string): Promise<Professional[]>
  save(professional: Professional): Promise<void>
  delete(id: string): Promise<void>
  listBlockedSlots(tenantSlug: string): Promise<BlockedSlotRecord[]>
  toggleBlockSlot(tenantSlug: string, date: string, time: string, reason?: string): Promise<{ blocked: boolean; date: string; time: string }>
}
