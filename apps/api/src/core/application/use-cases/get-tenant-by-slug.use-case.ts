import { ITenantRepository } from '../ports/tenant.repository.port';
import { EntityNotFoundError } from '../../domain/errors/domain.error';

export interface GetTenantBySlugInput {
  slug: string;
}

export class GetTenantBySlugUseCase {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(input: string | GetTenantBySlugInput) {
    const slug = typeof input === 'string' ? input : input?.slug;
    const tenant = await this.tenantRepository.findBySlug(slug);

    if (!tenant || !tenant.isActive) {
      throw new EntityNotFoundError('Tenant', slug);
    }

    return tenant;
  }
}
