import { ITenantRepository } from '../ports/tenant.repository.port';

export interface ResolveTenantByDomainInput {
  host: string;
}

export class ResolveTenantByDomainUseCase {
  constructor(private readonly tenantRepository: ITenantRepository) {}

  async execute(input: string | ResolveTenantByDomainInput) {
    const host = typeof input === 'string' ? input : input?.host;
    if (!host) return null;

    const cleanHost = host.toLowerCase().replace(/^www\./, '').split(':')[0];

    // 1. Tenta buscar por domínio próprio customizado
    let tenant = await this.tenantRepository.findByCustomDomain(cleanHost);

    // 2. Se não encontrar, tenta resolver pelo subdomínio (ex: slug.alaskalocal.com.br)
    if (!tenant) {
      const parts = cleanHost.split('.');
      if (parts.length >= 3) {
        const subdomainSlug = parts[0];
        tenant = await this.tenantRepository.findBySlug(subdomainSlug);
      }
    }

    return tenant;
  }
}
