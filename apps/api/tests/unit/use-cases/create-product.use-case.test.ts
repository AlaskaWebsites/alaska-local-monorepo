import { describe, it, expect, beforeEach } from 'vitest'
import { CreateProductUseCase } from '@core/application/use-cases/create-product.use-case'
import { InMemoryProductRepository } from '@infra/persistence/in-memory/in-memory-product.repository'
import { InMemoryTenantRepository } from '@infra/persistence/in-memory/in-memory-tenant.repository'
import { Tenant } from '@core/domain/entities/tenant.entity'
import { EntityNotFoundError } from '@core/domain/errors/domain.error'

describe('Unit: CreateProductUseCase (Persistência Real no Banco de Dados - ADR 010)', () => {
  let productRepo: InMemoryProductRepository
  let tenantRepo: InMemoryTenantRepository
  let useCase: CreateProductUseCase

  beforeEach(async () => {
    productRepo = new InMemoryProductRepository()
    tenantRepo = new InMemoryTenantRepository()
    useCase = new CreateProductUseCase(productRepo, tenantRepo)

    await tenantRepo.save(
      new Tenant({
        id: 'ten-hamburgueria-x',
        slug: 'hamburgueria-x',
        name: 'Hamburgueria X',
        phoneWhatsApp: '11999999999',
        businessCategory: 'menu',
        openingHours: { open: '18:00', close: '23:00' }
      })
    )
  })

  it('deve criar e persistir produto no repositório com cálculo monetário em centavos inteiros', async () => {
    const result = await useCase.execute({
      tenantSlug: 'hamburgueria-x',
      name: 'Combo Smash Especial',
      description: 'Dois burgers, queijo e batata',
      price: 34.5,
      categoryId: 'cat-burgers',
      image: 'https://res.cloudinary.com/demo/image/upload/sample.webp'
    })

    expect(result.id).toBeDefined()
    expect(result.name).toBe('Combo Smash Especial')
    expect(result.price.inCents).toBe(3450)
    expect(result.price.amount).toBe(34.5)
    expect(result.imageUrl).toBe('https://res.cloudinary.com/demo/image/upload/sample.webp')

    const saved = await productRepo.findById(result.id)
    expect(saved).not.toBeNull()
    expect(saved?.name).toBe('Combo Smash Especial')
    expect(saved?.tenantId).toBe('ten-hamburgueria-x')
  })

  it('deve lançar EntityNotFoundError se o tenant não existir', async () => {
    await expect(
      useCase.execute({
        tenantSlug: 'slug-inexistente',
        name: 'Produto Teste',
        price: 10,
        categoryId: 'cat-1'
      })
    ).rejects.toThrow(EntityNotFoundError)
  })
})
