import { Tenant } from '../../domain/entities/tenant.entity'

export interface ITenantRepository {
  findById(id: string): Promise<Tenant | null>
  findBySlug(slug: string): Promise<Tenant | null>
  findByCustomDomain(domain: string): Promise<Tenant | null>
  save(tenant: Tenant): Promise<void>
  listAllActive(): Promise<Tenant[]>
}
