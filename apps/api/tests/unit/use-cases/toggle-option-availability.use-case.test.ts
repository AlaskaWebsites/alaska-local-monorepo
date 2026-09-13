import { describe, it, expect, beforeEach } from 'vitest';
import { ToggleOptionAvailabilityUseCase } from '@core/application/use-cases/toggle-option-availability.use-case';
import { InMemoryProductRepository } from '@infra/persistence/in-memory/in-memory-product.repository';
import { Product } from '@core/domain/entities/product.entity';
import { EntityNotFoundError } from '@core/domain/errors/domain.error';

describe('ToggleOptionAvailabilityUseCase', () => {
  let productRepository: InMemoryProductRepository;
  let useCase: ToggleOptionAvailabilityUseCase;
  let testProduct: Product;

  beforeEach(async () => {
    productRepository = new InMemoryProductRepository();
    useCase = new ToggleOptionAvailabilityUseCase(productRepository);

    testProduct = new Product({
      id: 'prod-burger-x',
      tenantId: 'hamburgueria-x',
      categoryId: 'cat-burgers',
      name: 'Smash Bacon Especial',
      priceCents: 3500,
      isAvailable: true,
      optionGroups: [
        {
          id: 'opt-group-extras',
          name: 'Adicionais Extras',
          options: [
            { id: 'opt-bacon-extra', name: 'Bacon Crocante Extra', price: 5, isAvailable: true },
            { id: 'opt-cheddar-extra', name: 'Cheddar Inglês Extra', price: 4, isAvailable: true },
          ],
        },
      ],
    });

    await productRepository.save(testProduct);
  });

  it('deve pausar um opcional específico do produto passando productId e optionId', async () => {
    const updated = await useCase.execute({
      productId: 'prod-burger-x',
      optionId: 'opt-bacon-extra',
      isAvailable: false,
    });

    expect(updated).toBeDefined();
    const group = updated.optionGroups?.[0] as any;
    const baconOpt = group.options.find((o: any) => o.id === 'opt-bacon-extra');
    const cheddarOpt = group.options.find((o: any) => o.id === 'opt-cheddar-extra');

    expect(baconOpt.isAvailable).toBe(false);
    expect(baconOpt.available).toBe(false);
    expect(cheddarOpt.isAvailable).toBe(true);
  });

  it('deve reativar um opcional previamente pausado', async () => {
    await useCase.execute({
      productId: 'prod-burger-x',
      optionId: 'opt-bacon-extra',
      isAvailable: false,
    });

    const reactivated = await useCase.execute({
      productId: 'prod-burger-x',
      optionId: 'opt-bacon-extra',
      isAvailable: true,
    });

    const group = reactivated.optionGroups?.[0] as any;
    const baconOpt = group.options.find((o: any) => o.id === 'opt-bacon-extra');
    expect(baconOpt.isAvailable).toBe(true);
    expect(baconOpt.available).toBe(true);
  });

  it('deve encontrar o produto pelo tenantSlug quando productId for options ou omitido', async () => {
    const updated = await useCase.execute({
      tenantSlug: 'hamburgueria-x',
      optionId: 'opt-cheddar-extra',
      isAvailable: false,
    });

    const group = updated.optionGroups?.[0] as any;
    const cheddarOpt = group.options.find((o: any) => o.id === 'opt-cheddar-extra');
    expect(cheddarOpt.isAvailable).toBe(false);
  });

  it('deve lançar EntityNotFoundError quando o opcional não existir', async () => {
    await expect(
      useCase.execute({
        productId: 'prod-burger-x',
        optionId: 'opt-fantasma',
        isAvailable: false,
      }),
    ).rejects.toThrow(EntityNotFoundError);
  });
});
