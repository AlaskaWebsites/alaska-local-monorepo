import { Injectable } from '@nestjs/common';
import { IMerchantUserRepository } from '@core/application/ports/merchant-user.repository.port';
import { MerchantUser } from '@core/domain/entities/merchant-user.entity';

@Injectable()
export class InMemoryMerchantUserRepository implements IMerchantUserRepository {
  public users: MerchantUser[] = [];

  constructor() {
    this.seed();
  }

  private seed(): void {
    const defaultHash = '8541a4a6e38b30d35091720875ea0d9c02506b3e64f7cbe5fecff8110b98eb79';

    this.users.push(
      new MerchantUser({
        id: 'usr-hamburgueria-x-1',
        tenantId: 'ten-hamburgueria-x',
        tenantSlug: 'hamburgueria-x',
        email: 'dono@hamburgueria.com.br',
        passwordHash: defaultHash,
        name: 'Dono Hamburgueria X',
        role: 'merchant',
        isActive: true,
      }),
      new MerchantUser({
        id: 'usr-bamatec-1',
        tenantId: 'ten-bamatec',
        tenantSlug: 'bamatec',
        email: 'bamatec22@gmail.com',
        passwordHash: defaultHash,
        name: 'Carlos Bama',
        role: 'merchant',
        isActive: true,
      })
    );
  }

  async findById(id: string): Promise<MerchantUser | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  async findByEmailAndSlug(email: string, tenantSlug: string): Promise<MerchantUser | null> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanSlug = tenantSlug.trim().toLowerCase();
    return this.users.find((u) => u.email === cleanEmail && u.tenantSlug === cleanSlug) || null;
  }

  async findByTenantId(tenantId: string): Promise<MerchantUser[]> {
    return this.users.filter((u) => u.tenantId === tenantId);
  }

  async save(user: MerchantUser): Promise<void> {
    const existingIndex = this.users.findIndex((u) => u.id === user.id);
    if (existingIndex >= 0) {
      this.users[existingIndex] = user;
    } else {
      this.users.push(user);
    }
  }

  async update(user: MerchantUser): Promise<void> {
    await this.save(user);
  }

  clear(): void {
    this.users = [];
  }
}
