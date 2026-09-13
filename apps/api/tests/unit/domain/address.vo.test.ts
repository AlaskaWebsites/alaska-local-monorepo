import { describe, it, expect } from 'vitest';
import { Address } from '@core/domain/value-objects/address.vo';
import { ValidationError } from '@core/domain/errors/domain.error';

describe('Address Value Object', () => {
  it('deve instanciar um endereço válido e formatar texto completo', () => {
    const address = new Address({
      street: 'Avenida Paulista',
      number: '1578',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      complement: 'Masp',
      cep: '01310-200',
    });

    expect(address.street).toBe('Avenida Paulista');
    expect(address.number).toBe('1578');
    expect(address.neighborhood).toBe('Bela Vista');
    expect(address.cep).toBe('01310-200');
    expect(address.formatFull()).toBe('Avenida Paulista, 1578 (Masp) - Bela Vista - São Paulo/SP');
  });

  it('deve formatar corretamente endereço sem complemento ou cidade', () => {
    const address = new Address({
      street: 'Rua Principal',
      number: '42',
      neighborhood: 'Centro',
    });

    expect(address.formatFull()).toBe('Rua Principal, 42 - Centro');
  });

  it('deve rejeitar endereço sem rua, número ou bairro com ValidationError', () => {
    expect(
      () =>
        new Address({
          street: '',
          number: '10',
          neighborhood: 'Bairro',
        }),
    ).toThrow(ValidationError);

    expect(
      () =>
        new Address({
          street: 'Rua',
          number: '',
          neighborhood: 'Bairro',
        }),
    ).toThrow(ValidationError);

    expect(
      () =>
        new Address({
          street: 'Rua',
          number: '10',
          neighborhood: '',
        }),
    ).toThrow(ValidationError);
  });
});
