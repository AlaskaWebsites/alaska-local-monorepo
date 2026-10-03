import { IMerchantUserRepository } from '../ports/merchant-user.repository.port';
import { ITenantRepository } from '../ports/tenant.repository.port';
import { IPasswordHasher } from '../ports/password-hasher.port';
import { EntityNotFoundError, ValidationError } from '../../domain/errors/domain.error';
import { MerchantUser } from '../../domain/entities/merchant-user.entity';

export interface CreateMerchantUserInput {
  email: string;
  tenantSlug: string;
  initialPassword?: string;
  name?: string;
}

export class CreateMerchantUserUseCase {
  constructor(
    private readonly merchantUserRepository: IMerchantUserRepository,
    private readonly tenantRepository: ITenantRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: CreateMerchantUserInput): Promise<MerchantUser> {
    const cleanSlug = (input.tenantSlug || '').trim().toLowerCase();
    const cleanEmail = (input.email || '').trim().toLowerCase();

    const tenant = await this.tenantRepository.findBySlug(cleanSlug);
    if (!tenant) {
      throw new EntityNotFoundError('Tenant', cleanSlug);
    }

    const existing = await this.merchantUserRepository.findByEmailAndSlug(cleanEmail, cleanSlug);
    if (existing) {
      throw new ValidationError('Já existe um lojista cadastrado com este e-mail para este estabelecimento.');
    }

    const rawPassword = input.initialPassword || 'Alaska2026!';
    const passwordHash = await this.passwordHasher.hash(rawPassword);

    const user = new MerchantUser({
      id: `usr-${cleanSlug}-${Date.now()}`,
      tenantId: tenant.id,
      tenantSlug: cleanSlug,
      email: cleanEmail,
      passwordHash,
      name: input.name || tenant.name,
      role: 'merchant',
      isActive: true,
    });

    await this.merchantUserRepository.save(user);
    return user;
  }
}
