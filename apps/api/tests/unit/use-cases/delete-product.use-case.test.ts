import { describe, it, expect, beforeEach } from 'vitest'
import { DeleteProductUseCase } from '@core/application/use-cases/delete-product.use-case'
import { InMemoryProductRepository } from '@infra/persistence/in-memory/in-memory-product.repository'
import { Product } from '@core/domain/entities/product.entity'
import { Money } from '@core/domain/value-objects/money.vo'
import { EntityNotFoundError } from '@core/domain/errors/domain.error'

describe('Unit: DeleteProductUseCase (ADR 010)', () => {
  let productRepo: InMemoryProductRepository
  let useCase: DeleteProductUseCase

  beforeEach(async () => {
    productRepo = new InMemoryProductRepository()
    useCase = new DeleteProductUseCase(productRepo)

    await productRepo.save(
      new Product({
        id: 'prod-para-deletar',
        tenantId: 'ten-hamburgueria-x',
        categoryId: 'cat-burgers',
        name: 'Burger Antigo',
        price: Money.fromCents(2500),
        isAvailable: true
      })
    )
  })

  it('deve remover o produto do repositório com sucesso', async () => {
    await useCase.execute({ productId: 'prod-para-deletar' })
    const found = await productRepo.findById('prod-para-deletar')
    expect(found).toBeNull()
  })

  it('deve lançar EntityNotFoundError se o produto não existir', async () => {
    await expect(
      useCase.execute({ productId: 'prod-inexistente' })
    ).rejects.toThrow(EntityNotFoundError)
  })
})
