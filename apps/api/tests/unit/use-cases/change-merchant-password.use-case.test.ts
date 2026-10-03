import { describe, it, expect, beforeEach } from 'vitest';
import { ChangeMerchantPasswordUseCase } from '@core/application/use-cases/change-merchant-password.use-case';
import { InMemoryMerchantUserRepository } from '@infra/persistence/in-memory/in-memory-merchant-user.repository';
import { SimplePasswordHasher } from '@infra/security/simple-hasher';
import { MerchantUser } from '@core/domain/entities/merchant-user.entity';
import { ValidationError, EntityNotFoundError } from '@core/domain/errors/domain.error';

describe('Unit: ChangeMerchantPasswordUseCase (ADR 017)', () => {
  let userRepo: InMemoryMerchantUserRepository;
  let hasher: SimplePasswordHasher;
  let useCase: ChangeMerchantPasswordUseCase;

  beforeEach(async () => {
    userRepo = new InMemoryMerchantUserRepository();
    hasher = new SimplePasswordHasher();
    useCase = new ChangeMerchantPasswordUseCase(userRepo, hasher);

    const passwordHash = await hasher.hash('SenhaAtual123');
    await userRepo.save(
      new MerchantUser({
        id: 'usr-danilo',
        tenantId: 'ten-hamburgueria-x',
        tenantSlug: 'hamburgueria-x',
        email: 'danilo@hamburgueria.com.br',
        passwordHash,
      })
    );
  });

  it('deve alterar a senha com sucesso quando a senha atual e confirmação estão corretas', async () => {
    const result = await useCase.execute({
      userId: 'usr-danilo',
      tenantSlug: 'hamburgueria-x',
      currentPassword: 'SenhaAtual123',
      newPassword: 'NovaSenhaForte2026',
      confirmPassword: 'NovaSenhaForte2026',
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain('sucesso');

    const updatedUser = await userRepo.findById('usr-danilo');
    expect(await updatedUser?.verifyPassword('NovaSenhaForte2026', hasher)).toBe(true);
    expect(await updatedUser?.verifyPassword('SenhaAtual123', hasher)).toBe(false);
  });

  it('deve lançar ValidationError se a senha atual estiver incorreta', async () => {
    await expect(
      useCase.execute({
        userId: 'usr-danilo',
        tenantSlug: 'hamburgueria-x',
        currentPassword: 'SenhaErrada123',
        newPassword: 'NovaSenhaForte2026',
        confirmPassword: 'NovaSenhaForte2026',
      })
    ).rejects.toThrow('A senha atual está incorreta.');
  });

  it('deve lançar ValidationError se nova senha e confirmação não coincidirem', async () => {
    await expect(
      useCase.execute({
        userId: 'usr-danilo',
        tenantSlug: 'hamburgueria-x',
        currentPassword: 'SenhaAtual123',
        newPassword: 'NovaSenhaForte2026',
        confirmPassword: 'OutraSenhaCompletamenteDiferente',
      })
    ).rejects.toThrow('A nova senha e a confirmação não coincidem.');
  });

  it('deve lançar EntityNotFoundError se o usuário não for encontrado', async () => {
    await expect(
      useCase.execute({
        userId: 'usr-inexistente',
        tenantSlug: 'hamburgueria-x',
        currentPassword: 'SenhaAtual123',
        newPassword: 'NovaSenhaForte2026',
        confirmPassword: 'NovaSenhaForte2026',
      })
    ).rejects.toThrow(EntityNotFoundError);
  });
});
