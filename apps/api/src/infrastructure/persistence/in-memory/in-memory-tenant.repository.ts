import { ITenantRepository } from '@core/application/ports/tenant.repository.port'
import { Tenant } from '@core/domain/entities/tenant.entity'
import { SEED_TENANTS } from './seed-data'

export class InMemoryTenantRepository implements ITenantRepository {
  private items: Map<string, Tenant> = new Map()

  constructor(autoSeed: boolean = true) {
    if (autoSeed) {
      this.seed()
    }
  }

  private seed(): void {
    for (const tenant of SEED_TENANTS) {
      this.items.set(tenant.id, tenant)
    }
  }

  async findById(id: string): Promise<Tenant | null> {
    return this.items.get(id) || null
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const clean = slug.toLowerCase()
    for (const tenant of this.items.values()) {
      if (tenant.slug.toLowerCase() === clean) {
        return tenant
      }
    }
    return null
  }

  async findByCustomDomain(domain: string): Promise<Tenant | null> {
    const clean = domain.toLowerCase().replace(/^www\./, '').split(':')[0]
    for (const tenant of this.items.values()) {
      if (tenant.customDomain && tenant.customDomain.toLowerCase() === clean) {
        return tenant
      }
    }
    return null
  }

  async save(tenant: Tenant): Promise<void> {
    // Remove qualquer registro prévio com o mesmo slug para evitar duplicatas
    for (const [id, existing] of this.items.entries()) {
      if (existing.slug.toLowerCase() === tenant.slug.toLowerCase()) {
        this.items.delete(id)
      }
    }
    this.items.set(tenant.id, tenant)
  }

  async listAllActive(): Promise<Tenant[]> {
    return Array.from(this.items.values()).filter(t => t.isActive)
  }

  clear(): void {
    this.items.clear()
  }
}
