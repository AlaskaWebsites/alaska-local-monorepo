import { MerchantUser } from '../../domain/entities/merchant-user.entity';

export interface IMerchantUserRepository {
  findById(id: string): Promise<MerchantUser | null>;
  findByEmailAndSlug(email: string, tenantSlug: string): Promise<MerchantUser | null>;
  findByTenantId(tenantId: string): Promise<MerchantUser[]>;
  save(user: MerchantUser): Promise<void>;
  update(user: MerchantUser): Promise<void>;
}
