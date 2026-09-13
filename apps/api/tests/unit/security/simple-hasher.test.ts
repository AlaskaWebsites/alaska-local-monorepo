import { describe, it, expect } from 'vitest';
import { SimplePasswordHasher } from '../../../../src/infrastructure/security/simple-hasher';

describe('SimplePasswordHasher', () => {
  const hasher = new SimplePasswordHasher();

  it('deve gerar hash SHA-256 determinístico com salt seguro', async () => {
    const hash1 = await hasher.hash('1234');
    const hash2 = await hasher.hash('1234');

    expect(hash1).toBeDefined();
    expect(hash1.length).toBe(64); // SHA-256 hex possui 64 caracteres
    expect(hash1).toBe(hash2);
  });

  it('deve validar positivamente o PIN correto com hash armazenado', async () => {
    const hash = await hasher.hash('4321');
    const isMatch = await hasher.compare('4321', hash);
    expect(isMatch).toBe(true);
  });

  it('deve rejeitar PIN incorreto na comparação', async () => {
    const hash = await hasher.hash('4321');
    const isMatch = await hasher.compare('9999', hash);
    expect(isMatch).toBe(false);
  });
});
