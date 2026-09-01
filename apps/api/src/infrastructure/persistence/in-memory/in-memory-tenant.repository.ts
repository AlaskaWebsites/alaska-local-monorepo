import { Tenant } from '../../../core/domain/entities/tenant.entity';
import { ITenantRepository } from '../../../core/application/ports/tenant.repository.port';

export class InMemoryTenantRepository implements ITenantRepository {
  public tenants: Tenant[] = [];

  async findById(id: string): Promise<Tenant | null> {
    const tenant = this.tenants.find((t) => t.id === id);
    return tenant || null;
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const tenant = this.tenants.find((t) => t.slug === slug);
    return tenant || null;
  }

  async findByDomain(domain: string): Promise<Tenant | null> {
    const tenant = this.tenants.find((t) => t.customDomain === domain);
    return tenant || null;
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
}
