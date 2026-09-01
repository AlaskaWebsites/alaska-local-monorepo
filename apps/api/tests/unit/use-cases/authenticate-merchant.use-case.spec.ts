import { describe, it, expect, beforeEach } from 'vitest';
import { AuthenticateMerchantUseCase } from '../../../../src/core/application/use-cases/authenticate-merchant.use-case';
import { InMemoryTenantRepository } from '../../../../src/infrastructure/persistence/in-memory/in-memory-tenant.repository';
import { SimplePasswordHasher } from '../../../../src/infrastructure/security/simple-hasher';
import { Tenant } from '../../../../src/core/domain/entities/tenant.entity';
import { EntityNotFoundError } from '../../../../src/core/domain/errors/entity-not-found.error';

describe('AuthenticateMerchantUseCase', () => {
  let tenantRepository: InMemoryTenantRepository;
  let passwordHasher: SimplePasswordHasher;
  let useCase: AuthenticateMerchantUseCase;

  beforeEach(() => {
    tenantRepository = new InMemoryTenantRepository();
    passwordHasher = new SimplePasswordHasher();
    useCase = new AuthenticateMerchantUseCase(tenantRepository, passwordHasher);
  });

  it('deve autenticar com sucesso usando o PIN padrão 1234 quando não houver pinHash', async () => {
    const tenant = new Tenant({
      id: 'tenant-1',
      name: 'Pizzaria do Zé',
      slug: 'pizzaria-do-ze',
      whatsapp: '5511999998888',
      businessCategory: 'menu',
      theme: 'food',
    });
    await tenantRepository.save(tenant);

    const result = await useCase.execute({
      slug: 'pizzaria-do-ze',
      pin: '1234',
    });

    expect(result.authenticated).toBe(true);
    expect(result.token).toBeDefined();
    expect(result.tenantSlug).toBe('pizzaria-do-ze');
  });

  it('deve rejeitar PIN incorreto para tenant sem pinHash', async () => {
    const tenant = new Tenant({
      id: 'tenant-1',
      name: 'Pizzaria do Zé',
      slug: 'pizzaria-do-ze',
      whatsapp: '5511999998888',
      businessCategory: 'menu',
      theme: 'food',
    });
    await tenantRepository.save(tenant);

    const result = await useCase.execute({
      slug: 'pizzaria-do-ze',
      pin: '0000',
    });

    expect(result.authenticated).toBe(false);
    expect(result.token).toBeUndefined();
    expect(result.message).toContain('PIN incorreto');
  });

  it('deve autenticar com sucesso comparando hash configurado', async () => {
    const hashedPin = await passwordHasher.hash('9876');
    const tenant = new Tenant({
      id: 'tenant-2',
      name: 'Barbearia Style',
      slug: 'barbearia-style',
      whatsapp: '5511988887777',
      businessCategory: 'hub',
      theme: 'barber',
      pinHash: hashedPin,
    });
    await tenantRepository.save(tenant);

    const result = await useCase.execute({
      slug: 'barbearia-style',
      pin: '9876',
    });

    expect(result.authenticated).toBe(true);
    expect(result.token).toBeDefined();
  });

  it('deve lançar EntityNotFoundError quando o tenant não existir', async () => {
    await expect(
      useCase.execute({
        slug: 'nao-existe',
        pin: '1234',
      }),
    ).rejects.toThrow(EntityNotFoundError);
  });
});
