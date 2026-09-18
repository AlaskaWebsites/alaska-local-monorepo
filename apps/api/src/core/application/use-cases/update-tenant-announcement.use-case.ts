import { ITenantRepository } from '../ports/tenant.repository.port'
import { EntityNotFoundError } from '@core/domain/errors/domain.error'
import { Tenant } from '@core/domain/entities/tenant.entity'

export interface UpdateTenantAnnouncementInput {
  slug: string
  enabled: boolean
  message: string
}

export class UpdateTenantAnnouncementUseCase {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(input: UpdateTenantAnnouncementInput): Promise<Tenant> {
    const tenant = await this.tenantRepository.findBySlug(input.slug)
    if (!tenant) {
      throw new EntityNotFoundError('Tenant', input.slug)
    }

    tenant.setAnnouncement(input.enabled, input.message)
    await this.tenantRepository.save(tenant)
    return tenant
  }
}
