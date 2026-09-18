import { ITenantRepository } from '../ports/tenant.repository.port'
import { EntityNotFoundError } from '@core/domain/errors/domain.error'
import { Tenant } from '@core/domain/entities/tenant.entity'

export interface UpdateTenantContactInput {
  slug: string
  phoneWhatsApp?: string
  whatsapp?: string
  phone?: string
  instagram?: string
}

export class UpdateTenantContactUseCase {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(input: UpdateTenantContactInput): Promise<Tenant> {
    const tenant = await this.tenantRepository.findBySlug(input.slug)
    if (!tenant) {
      throw new EntityNotFoundError('Tenant', input.slug)
    }

    const whatsappPhone = input.phoneWhatsApp || input.whatsapp || input.phone
    tenant.updateContactSettings({
      phoneWhatsApp: whatsappPhone,
      instagram: input.instagram
    })

    await this.tenantRepository.save(tenant)
    return tenant
  }
}
