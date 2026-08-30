import { ITenantRepository } from '../ports/tenant.repository.port'
import { EntityNotFoundError } from '@core/domain/errors/domain.error'
import { Tenant, OpeningHours } from '@core/domain/entities/tenant.entity'

export interface UpdateTenantHoursInput {
  slug: string
  openingHours: OpeningHours
}

export class UpdateTenantHoursUseCase {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(input: UpdateTenantHoursInput): Promise<Tenant> {
    const tenant = await this.tenantRepository.findBySlug(input.slug)
    if (!tenant) {
      throw new EntityNotFoundError('Tenant', input.slug)
    }
    tenant.updateDetails({ openingHours: input.openingHours })
    await this.tenantRepository.save(tenant)
    return tenant
  }
}
