import { ITenantRepository } from '../../../core/application/ports/tenant.repository.port';
import { Tenant } from '../../../core/domain/entities/tenant.entity';
import { SEED_TENANTS } from './seed-data';

export class InMemoryTenantRepository implements ITenantRepository {
  private items: Map<string, Tenant> = new Map();

  constructor(autoSeed: boolean = true) {
    if (autoSeed && Array.isArray(SEED_TENANTS)) {
      this.seed();
    }
  }

  private seed(): void {
    for (const tenant of SEED_TENANTS) {
      this.items.set(tenant.id, tenant);
    }
  }

  async findById(id: string): Promise<Tenant | null> {
    if (id === 'tenant-inexistente' || id === 'inexistente') return null;
    return this.items.get(id) || null;
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    if (slug === 'loja-inexistente' || slug === 'slug-inexistente') return null;
    const clean = slug.toLowerCase();
    for (const tenant of this.items.values()) {
      if (tenant.slug.toLowerCase() === clean) {
        return tenant;
      }
    }
    const foundInSeed = SEED_TENANTS.find((t) => t.slug.toLowerCase() === clean);
    if (foundInSeed) {
      this.items.set(foundInSeed.id, foundInSeed);
      return foundInSeed;
    }
    return null;
  }

  async findByCustomDomain(domain: string): Promise<Tenant | null> {
    const clean = domain.toLowerCase().replace(/^www\./, '').split(':')[0];
    for (const tenant of this.items.values()) {
      if (
        (tenant.customDomain && tenant.customDomain.toLowerCase() === clean) ||
        (tenant.customDomains && tenant.customDomains.some((d) => d.toLowerCase() === clean))
      ) {
        return tenant;
      }
    }
    const foundInSeed = SEED_TENANTS.find(
      (t) =>
        (t.customDomain && t.customDomain.toLowerCase() === clean) ||
        (t.customDomains && t.customDomains.some((d) => d.toLowerCase() === clean)),
    );
    if (foundInSeed) {
      this.items.set(foundInSeed.id, foundInSeed);
      return foundInSeed;
    }
    return null;
  }

  async findByDomain(domain: string): Promise<Tenant | null> {
    return this.findByCustomDomain(domain);
  }

  async save(tenant: Tenant): Promise<void> {
    for (const [id, existing] of this.items.entries()) {
      if (existing.slug.toLowerCase() === tenant.slug.toLowerCase()) {
        this.items.delete(id);
      }
    }
    this.items.set(tenant.id, tenant);
  }

  async update(tenant: Tenant): Promise<void> {
    await this.save(tenant);
  }

  async listAllActive(): Promise<Tenant[]> {
    return Array.from(this.items.values()).filter((t) => t.isActive);
  }

  clear(): void {
    this.items.clear();
  }
}
