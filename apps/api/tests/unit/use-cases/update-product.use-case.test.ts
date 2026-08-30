import { describe, it, expect, beforeEach } from 'vitest'
import { UpdateProductUseCase } from '@core/application/use-cases/update-product.use-case'
import { InMemoryProductRepository } from '@infra/persistence/in-memory/in-memory-product.repository'
import { Product } from '@core/domain/entities/product.entity'

describe('Unit: UpdateProductUseCase (ADR 013)', () => {
  let repository: InMemoryProductRepository
  let useCase: UpdateProductUseCase

  beforeEach(async () => {
    repository = new InMemoryProductRepository()
    useCase = new UpdateProductUseCase(repository)

    await repository.save(
      new Product({
        id: 'prod-burger-1',
        tenantId: 'ten-hamburgueria-x',
        categoryId: 'cat-burgers',
        name: 'Smash Bacon Duplo',
        priceCents: 3200,
        isAvailable: true
      })
    )
  })

  it('deve atualizar o preço do produto em centavos inteiros', async () => {
    const result = await useCase.execute({
      productId: 'prod-burger-1',
      priceCents: 3500
    })

    expect(result.price.inCents).toBe(3500)
    expect(result.price.amount).toBe(35)
  })
})
