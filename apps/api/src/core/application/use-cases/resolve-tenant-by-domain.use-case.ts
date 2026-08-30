import { ITenantRepository } from '../ports/tenant.repository.port'
import { Tenant } from '../../domain/entities/tenant.entity'
import { EntityNotFoundError } from '../../domain/errors/domain.error'

export interface ResolveTenantByDomainInput {
  host: string
}

export class ResolveTenantByDomainUseCase {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(input: ResolveTenantByDomainInput): Promise<Tenant> {
    const cleanHost = input.host.replace(/^www\./, '').split(':')[0].toLowerCase()

    // 1. Tenta buscar por domínio próprio customizado
    let tenant = await this.tenantRepository.findByCustomDomain(cleanHost)

    // 2. Se não encontrar, tenta resolver pelo subdomínio (ex: slug.alaska.app)
    if (!tenant) {
      const subdomain = cleanHost.split('.')[0]
      tenant = await this.tenantRepository.findBySlug(subdomain)
    }

    if (!tenant || !tenant.isActive) {
      throw new EntityNotFoundError('Tenant', cleanHost)
    }

    return tenant
  }
}
