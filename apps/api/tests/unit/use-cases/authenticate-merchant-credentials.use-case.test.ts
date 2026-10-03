import { describe, it, expect, beforeEach } from 'vitest';
import { AuthenticateMerchantCredentialsUseCase } from '@core/application/use-cases/authenticate-merchant-credentials.use-case';
import { InMemoryMerchantUserRepository } from '@infra/persistence/in-memory/in-memory-merchant-user.repository';
import { InMemoryTenantRepository } from '@infra/persistence/in-memory/in-memory-tenant.repository';
import { SimplePasswordHasher } from '@infra/security/simple-hasher';
import { MerchantUser } from '@core/domain/entities/merchant-user.entity';
import { Tenant } from '@core/domain/entities/tenant.entity';
import { EntityNotFoundError } from '@core/domain/errors/domain.error';

describe('Unit: AuthenticateMerchantCredentialsUseCase (ADR 017)', () => {
  let userRepo: InMemoryMerchantUserRepository;
  let tenantRepo: InMemoryTenantRepository;
  let hasher: SimplePasswordHasher;
  let useCase: AuthenticateMerchantCredentialsUseCase;

  beforeEach(async () => {
    userRepo = new InMemoryMerchantUserRepository();
    tenantRepo = new InMemoryTenantRepository();
    hasher = new SimplePasswordHasher();
    useCase = new AuthenticateMerchantCredentialsUseCase(userRepo, tenantRepo, hasher);

    await tenantRepo.save(
      new Tenant({
        id: 'ten-hamburgueria-x',
        slug: 'hamburgueria-x',
        name: 'Hamburgueria X',
        phoneWhatsApp: '11999999999',
        businessCategory: 'menu',
        theme: 'food',
      })
    );
  });

  it('deve autenticar com sucesso lojista com e-mail e senha corretos', async () => {
    const passwordHash = await hasher.hash('SenhaForte123');
    await userRepo.save(
      new MerchantUser({
        id: 'usr-10',
        tenantId: 'ten-hamburgueria-x',
        tenantSlug: 'hamburgueria-x',
        email: 'contato@hamburgueria.com.br',
        passwordHash,
        name: 'Danilo Hamburguer',
      })
    );

    const result = await useCase.execute({
      email: 'contato@hamburgueria.com.br',
      password: 'SenhaForte123',
      tenantSlug: 'hamburgueria-x',
    });

    expect(result.authenticated).toBe(true);
    expect(result.token).toBeDefined();
    expect(result.user?.email).toBe('contato@hamburgueria.com.br');
    expect(result.user?.role).toBe('merchant');
  });

  it('deve rejeitar senha incorreta retornando authenticated false', async () => {
    const passwordHash = await hasher.hash('SenhaForte123');
    await userRepo.save(
      new MerchantUser({
        id: 'usr-10',
        tenantId: 'ten-hamburgueria-x',
        tenantSlug: 'hamburgueria-x',
        email: 'contato@hamburgueria.com.br',
        passwordHash,
      })
    );

    const result = await useCase.execute({
      email: 'contato@hamburgueria.com.br',
      password: 'SenhaTotalmenteErrada',
      tenantSlug: 'hamburgueria-x',
    });

    expect(result.authenticated).toBe(false);
    expect(result.token).toBeUndefined();
    expect(result.message).toContain('Credenciais inválidas');
  });

  it('deve rejeitar autenticação se a conta do lojista estiver inativa', async () => {
    const passwordHash = await hasher.hash('SenhaForte123');
    const user = new MerchantUser({
      id: 'usr-10',
      tenantId: 'ten-hamburgueria-x',
      tenantSlug: 'hamburgueria-x',
      email: 'contato@hamburgueria.com.br',
      passwordHash,
      isActive: false,
    });
    await userRepo.save(user);

    const result = await useCase.execute({
      email: 'contato@hamburgueria.com.br',
      password: 'SenhaForte123',
      tenantSlug: 'hamburgueria-x',
    });

    expect(result.authenticated).toBe(false);
    expect(result.message).toContain('desativada');
  });

  it('deve auto-provisionar e autenticar loja demo conhecida no primeiro login', async () => {
    const result = await useCase.execute({
      email: 'dono@hamburgueria.com.br',
      password: 'minhasenhasegura',
      tenantSlug: 'hamburgueria-x',
    });

    expect(result.authenticated).toBe(true);
    expect(result.token).toBeDefined();
  });

  it('deve lançar EntityNotFoundError se o tenant não existir', async () => {
    await expect(
      useCase.execute({
        email: 'dono@fantasma.com.br',
        password: 'minhasenhasegura',
        tenantSlug: 'tenant-que-nao-existe',
      })
    ).rejects.toThrow(EntityNotFoundError);
  });
});
