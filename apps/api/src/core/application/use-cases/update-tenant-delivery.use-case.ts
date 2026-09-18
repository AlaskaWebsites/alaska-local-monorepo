import { ITenantRepository } from '../ports/tenant.repository.port'
import { EntityNotFoundError } from '@core/domain/errors/domain.error'
import { Tenant } from '@core/domain/entities/tenant.entity'

export interface UpdateTenantDeliveryInput {
  slug: string
  deliveryFee?: number
  deliveryFeeCents?: number
  minOrderValue?: number
  minOrderValueCents?: number
  estimatedTime?: string
}

export class UpdateTenantDeliveryUseCase {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(input: UpdateTenantDeliveryInput): Promise<Tenant> {
    const tenant = await this.tenantRepository.findBySlug(input.slug)
    if (!tenant) {
      throw new EntityNotFoundError('Tenant', input.slug)
    }

    const feeCents = input.deliveryFeeCents !== undefined
      ? input.deliveryFeeCents
      : (input.deliveryFee !== undefined ? Math.round(input.deliveryFee * 100) : undefined)

    const minCents = input.minOrderValueCents !== undefined
      ? input.minOrderValueCents
      : (input.minOrderValue !== undefined ? Math.round(input.minOrderValue * 100) : undefined)

    tenant.updateDeliverySettings({
      deliveryFeeCents: feeCents,
      minOrderValueCents: minCents,
      estimatedTime: input.estimatedTime
    })

    await this.tenantRepository.save(tenant)
    return tenant
  }
}
