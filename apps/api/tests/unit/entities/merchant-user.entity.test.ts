import { describe, it, expect } from 'vitest';
import { MerchantUser } from '@core/domain/entities/merchant-user.entity';
import { SimplePasswordHasher } from '@infra/security/simple-hasher';
import { ValidationError } from '@core/domain/errors/domain.error';

describe('Unit: MerchantUser Entity (ADR 017)', () => {
  const hasher = new SimplePasswordHasher();

  it('deve instanciar um lojista válido com props corretas e sanitizadas', async () => {
    const hash = await hasher.hash('minhasenhasegura');
    const user = new MerchantUser({
      id: 'usr-1',
      tenantId: 'ten-hamburgueria-x',
      tenantSlug: '  HAMBURGUERIA-X  ',
      email: '  DONO@HAMBURGUERIA.COM.BR  ',
      passwordHash: hash,
      name: 'Carlos Alberto',
    });

    expect(user.id).toBe('usr-1');
    expect(user.tenantSlug).toBe('hamburgueria-x');
    expect(user.email).toBe('dono@hamburgueria.com.br');
    expect(user.role).toBe('merchant');
    expect(user.isActive).toBe(true);
  });

  it('deve validar e comparar senha com sucesso usando hasher', async () => {
    const hash = await hasher.hash('minhasenhasegura');
    const user = new MerchantUser({
      id: 'usr-1',
      tenantId: 'ten-hamburgueria-x',
      tenantSlug: 'hamburgueria-x',
      email: 'dono@hamburgueria.com.br',
      passwordHash: hash,
    });

    expect(await user.verifyPassword('minhasenhasegura', hasher)).toBe(true);
    expect(await user.verifyPassword('senhaerrada123', hasher)).toBe(false);
  });

  it('deve atualizar senha gerando novo hash seguro', async () => {
    const oldHash = await hasher.hash('minhasenhasegura');
    const user = new MerchantUser({
      id: 'usr-1',
      tenantId: 'ten-hamburgueria-x',
      tenantSlug: 'hamburgueria-x',
      email: 'dono@hamburgueria.com.br',
      passwordHash: oldHash,
    });

    await user.updatePassword('novasenhamaisforte2026', hasher);
    expect(await user.verifyPassword('novasenhamaisforte2026', hasher)).toBe(true);
    expect(await user.verifyPassword('minhasenhasegura', hasher)).toBe(false);
  });

  it('deve rejeitar nova senha curta com menos de 8 caracteres', async () => {
    const hash = await hasher.hash('minhasenhasegura');
    const user = new MerchantUser({
      id: 'usr-1',
      tenantId: 'ten-hamburgueria-x',
      tenantSlug: 'hamburgueria-x',
      email: 'dono@hamburgueria.com.br',
      passwordHash: hash,
    });

    await expect(user.updatePassword('1234567', hasher)).rejects.toThrow(ValidationError);
  });

  it('deve omitir passwordHash no toJSON por segurança', async () => {
    const hash = await hasher.hash('minhasenhasegura');
    const user = new MerchantUser({
      id: 'usr-1',
      tenantId: 'ten-hamburgueria-x',
      tenantSlug: 'hamburgueria-x',
      email: 'dono@hamburgueria.com.br',
      passwordHash: hash,
      name: 'Carlos',
    });

    const json: any = user.toJSON();
    expect(json.passwordHash).toBeUndefined();
    expect(json.email).toBe('dono@hamburgueria.com.br');
    expect(json.name).toBe('Carlos');
  });

  it('deve desativar e reativar usuário', async () => {
    const hash = await hasher.hash('minhasenhasegura');
    const user = new MerchantUser({
      id: 'usr-1',
      tenantId: 'ten-hamburgueria-x',
      tenantSlug: 'hamburgueria-x',
      email: 'dono@hamburgueria.com.br',
      passwordHash: hash,
    });

    user.deactivate();
    expect(user.isActive).toBe(false);
    expect(await user.verifyPassword('minhasenhasegura', hasher)).toBe(false);

    user.activate();
    expect(user.isActive).toBe(true);
    expect(await user.verifyPassword('minhasenhasegura', hasher)).toBe(true);
  });
});
