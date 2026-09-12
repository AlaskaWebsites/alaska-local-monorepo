import { Tenant } from '../../../core/domain/entities/tenant.entity';
import { ITenantRepository } from '../../../core/application/ports/tenant.repository.port';

export class InMemoryTenantRepository implements ITenantRepository {
  public tenants: Tenant[] = [];

  async findById(id: string): Promise<Tenant | null> {
    const tenant = this.tenants.find((t) => t.id === id);
    return tenant || null;
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const clean = (slug || '').trim().toLowerCase();
    const tenant = this.tenants.find((t) => t.slug.toLowerCase() === clean);
    return tenant || null;
  }

  async findByDomain(domain: string): Promise<Tenant | null> {
    const clean = (domain || '').trim().toLowerCase().replace(/^www\./, '').split(':')[0];
    const tenant = this.tenants.find((t) => {
      const d = (t.customDomain || '').trim().toLowerCase().replace(/^www\./, '').split(':')[0];
      return d === clean;
    });
    return tenant || null;
  }

  async findByCustomDomain(domain: string): Promise<Tenant | null> {
    return this.findByDomain(domain);
  }

  async save(tenant: Tenant): Promise<void> {
    this.tenants.push(tenant);
  }

  async update(tenant: Tenant): Promise<void> {
    const index = this.tenants.findIndex((t) => t.id === tenant.id);
    if (index !== -1) {
      this.tenants[index] = tenant;
    }
  }

  async listAllActive(): Promise<Tenant[]> {
    return this.tenants.filter((t) => t.isActive);
  }
}
