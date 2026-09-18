import { ITenantRepository } from '../ports/tenant.repository.port'
import { EntityNotFoundError } from '@core/domain/errors/domain.error'
import { Tenant } from '@core/domain/entities/tenant.entity'

export interface UpdateTenantEmergencyInput {
  slug: string
  isClosed: boolean
  message?: string
}

export class UpdateTenantEmergencyUseCase {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(input: UpdateTenantEmergencyInput): Promise<Tenant> {
    const tenant = await this.tenantRepository.findBySlug(input.slug)
    if (!tenant) {
      throw new EntityNotFoundError('Tenant', input.slug)
    }

    tenant.setEmergencyClose(input.isClosed, input.message)
    await this.tenantRepository.save(tenant)
    return tenant
  }
}
