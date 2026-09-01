import { ITenantRepository } from '../ports/tenant.repository.port';
import { IPasswordHasher } from '../ports/password-hasher.port';
import { EntityNotFoundError } from '../../domain/errors/domain.error';

export interface AuthenticateMerchantInput {
  slug: string;
  pin: string;
}

export interface AuthenticateMerchantOutput {
  authenticated: boolean;
  token?: string;
  tenantSlug: string;
  message?: string;
}

export class AuthenticateMerchantUseCase {
  constructor(
    private readonly tenantRepository: ITenantRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: AuthenticateMerchantInput): Promise<AuthenticateMerchantOutput> {
    const tenant = await this.tenantRepository.findBySlug(input.slug);
    if (!tenant) {
      throw new EntityNotFoundError('Tenant', input.slug);
    }

    const isValid = await tenant.verifyPin(input.pin, this.passwordHasher);
    if (!isValid) {
      return {
        authenticated: false,
        tenantSlug: input.slug,
        message: 'PIN incorreto. Tente novamente.',
      };
    }

    // Gera um token de sessão determinístico
    const payload = JSON.stringify({
      tenantId: tenant.id,
      slug: tenant.slug,
      role: 'merchant',
      iat: Date.now(),
    });
    const token = Buffer.from(payload).toString('base64');

    return {
      authenticated: true,
      token,
      tenantSlug: tenant.slug,
      message: 'Autenticado com sucesso.',
    };
  }
}
