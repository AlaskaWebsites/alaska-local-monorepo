import { ITenantRepository } from '../ports/tenant.repository.port'
import { Tenant } from '../../domain/entities/tenant.entity'
import { EntityNotFoundError } from '../../domain/errors/domain.error'

export interface GetTenantBySlugInput {
  slug: string
}

export class GetTenantBySlugUseCase {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(input: GetTenantBySlugInput): Promise<Tenant> {
    const slug = (input.slug || '').trim().toLowerCase()
    const tenant = await this.tenantRepository.findBySlug(slug)

    if (!tenant || !tenant.isActive) {
      throw new EntityNotFoundError('Tenant', slug)
    }

    return tenant
  }
}
