import { IProfessionalRepository, BlockedSlotRecord } from '@core/application/ports/professional.repository.port'
import { Professional } from '@core/domain/entities/professional.entity'

export class InMemoryProfessionalRepository implements IProfessionalRepository {
  private professionals: Map<string, Professional> = new Map()
  private blockedSlots: Map<string, BlockedSlotRecord[]> = new Map()

  async findById(id: string): Promise<Professional | null> {
    return this.professionals.get(id) || null
  }

  async listByTenantSlug(tenantSlug: string): Promise<Professional[]> {
    return Array.from(this.professionals.values())
  }

  async listByTenantId(tenantId: string): Promise<Professional[]> {
    return Array.from(this.professionals.values()).filter(p => p.tenantId === tenantId)
  }

  async save(professional: Professional): Promise<void> {
    this.professionals.set(professional.id, professional)
  }

  async delete(id: string): Promise<void> {
    this.professionals.delete(id)
  }

  async listBlockedSlots(tenantSlug: string): Promise<BlockedSlotRecord[]> {
    return this.blockedSlots.get(tenantSlug) || []
  }

  async toggleBlockSlot(
    tenantSlug: string,
    date: string,
    time: string,
    reason = 'Horário Bloqueado pelo Lojista'
  ): Promise<{ blocked: boolean; date: string; time: string }> {
    const list = this.blockedSlots.get(tenantSlug) || []
    const idx = list.findIndex(s => s.date === date && s.time === time)

    if (idx >= 0) {
      list.splice(idx, 1)
      this.blockedSlots.set(tenantSlug, [...list])
      return { blocked: false, date, time }
    } else {
      list.push({ date, time, reason })
      this.blockedSlots.set(tenantSlug, [...list])
      return { blocked: true, date, time }
    }
  }
}
