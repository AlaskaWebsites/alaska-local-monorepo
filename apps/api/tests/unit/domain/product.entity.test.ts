import { describe, it, expect } from 'vitest';
import { Product } from '../../../../src/core/domain/entities/product.entity';
import { ValidationError } from '../../../../src/core/domain/errors/domain.error';

describe('Product Entity', () => {
  it('deve instanciar um produto com valores válidos', () => {
    const product = new Product({
      id: 'prod-smash',
      tenantId: 'ten-hamburgueria-x',
      categoryId: 'cat-burgers',
      name: 'Smash Duplo',
      description: 'Dois smash burgers de 90g',
      priceCents: 3200,
    });

    expect(product.id).toBe('prod-smash');
    expect(product.name).toBe('Smash Duplo');
    expect(product.price.cents).toBe(3200);
    expect(product.price.amount).toBe(32.0);
    expect(product.isAvailable).toBe(true);
    expect(product.optionGroups).toEqual([]);
  });

  it('deve calcular o valor total de item com opcionais e quantidade', () => {
    const product = new Product({
      id: 'prod-burger',
      tenantId: 'ten-1',
      categoryId: 'cat-1',
      name: 'Burger Especial',
      priceCents: 3000,
      optionGroups: [
        {
          id: 'grp-1',
          title: 'Adicionais',
          required: false,
          min: 0,
          max: 2,
          options: [
            { id: 'opt-bacon', name: 'Bacon', priceCents: 500 },
            { id: 'opt-queijo', name: 'Queijo', priceCents: 400 },
          ],
        },
      ],
    });

    // 1 burger (3000) + bacon (500) = 3500 * 2 = 7000 cents
    const total = product.calculateItemTotal(['opt-bacon'], 2);
    expect(total.cents).toBe(7000);
    expect(total.amount).toBe(70.0);
  });

  it('deve rejeitar nome de produto vazio com ValidationError', () => {
    expect(
      () =>
        new Product({
          id: 'prod-invalido',
          tenantId: 'ten-1',
          categoryId: 'cat-1',
          name: '',
          priceCents: 1000,
        }),
    ).toThrow(ValidationError);
  });

  it('deve rejeitar preço negativo com ValidationError', () => {
    expect(
      () =>
        new Product({
          id: 'prod-negativo',
          tenantId: 'ten-1',
          categoryId: 'cat-1',
          name: 'Produto Negativo',
          priceCents: -500,
        }),
    ).toThrow(ValidationError);
  });
});
