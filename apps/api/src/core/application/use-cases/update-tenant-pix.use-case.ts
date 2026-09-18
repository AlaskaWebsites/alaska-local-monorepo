import { ITenantRepository } from '../ports/tenant.repository.port'
import { EntityNotFoundError } from '@core/domain/errors/domain.error'
import { Tenant, PixConfig } from '@core/domain/entities/tenant.entity'

export interface UpdateTenantPixInput {
  slug: string
  key?: string
  pixKey?: string
  keyType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'
  beneficiary?: string
  city?: string
  allowTestCent?: boolean
  depositPercentage?: number
}

export class UpdateTenantPixUseCase {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(input: UpdateTenantPixInput): Promise<Tenant> {
    const tenant = await this.tenantRepository.findBySlug(input.slug)
    if (!tenant) {
      throw new EntityNotFoundError('Tenant', input.slug)
    }

    const currentPix = tenant.pixConfig || { key: '', keyType: 'random', city: 'SAO PAULO' }
    const updatedPix: PixConfig = {
      ...currentPix,
      key: input.key || input.pixKey || currentPix.key,
      keyType: input.keyType || currentPix.keyType,
      beneficiary: input.beneficiary !== undefined ? input.beneficiary : currentPix.beneficiary,
      city: input.city !== undefined ? input.city : currentPix.city,
      allowTestCent: input.allowTestCent !== undefined ? input.allowTestCent : currentPix.allowTestCent,
      depositPercentage: input.depositPercentage !== undefined ? input.depositPercentage : currentPix.depositPercentage
    }

    tenant.setPixConfig(updatedPix)
    await this.tenantRepository.save(tenant)
    return tenant
  }
}
