import { ITenantRepository } from '../ports/tenant.repository.port';
import { EntityNotFoundError } from '../../domain/errors/domain.error';

export interface UpdateTenantHoursInput {
  slug: string;
  openingHours?: any;
  hours?: any;
}

export class UpdateTenantHoursUseCase {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(input: UpdateTenantHoursInput) {
    const tenant = await this.tenantRepository.findBySlug(input.slug);
    if (!tenant) {
      throw new EntityNotFoundError('Tenant', input.slug);
    }

    const hours = input.openingHours || input.hours;
    if (hours) {
      tenant.updateOpeningHours(hours);
    }

    await this.tenantRepository.save(tenant);
    return tenant;
  }
}
