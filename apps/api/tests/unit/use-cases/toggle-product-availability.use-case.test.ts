import { describe, it, expect, beforeEach } from 'vitest'
import { ToggleProductAvailabilityUseCase } from '@core/application/use-cases/toggle-product-availability.use-case'
import { InMemoryProductRepository } from '@infra/persistence/in-memory/in-memory-product.repository'
import { Product } from '@core/domain/entities/product.entity'
import { EntityNotFoundError } from '@core/domain/errors/domain.error'

describe('Unit: ToggleProductAvailabilityUseCase (ADR 013)', () => {
  let repository: InMemoryProductRepository
  let useCase: ToggleProductAvailabilityUseCase

  beforeEach(async () => {
    repository = new InMemoryProductRepository()
    useCase = new ToggleProductAvailabilityUseCase(repository)

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

  it('deve pausar um produto com sucesso em tempo real', async () => {
    const result = await useCase.execute({
      productId: 'prod-burger-1',
      isAvailable: false
    })

    expect(result.isAvailable).toBe(false)
  })

  it('deve despausar um produto com sucesso', async () => {
    await useCase.execute({ productId: 'prod-burger-1', isAvailable: false })
    const result = await useCase.execute({ productId: 'prod-burger-1', isAvailable: true })

    expect(result.isAvailable).toBe(true)
  })

  it('deve lançar EntityNotFoundError se o produto não existir', async () => {
    await expect(
      useCase.execute({ productId: 'prod-inexistente', isAvailable: false })
    ).rejects.toThrow(EntityNotFoundError)
  })
})
