import { IProductRepository } from '../ports/product.repository.port'
import { ITenantRepository } from '../ports/tenant.repository.port'
import { EntityNotFoundError } from '@core/domain/errors/domain.error'
import { Product } from '@core/domain/entities/product.entity'
import { Money } from '@core/domain/value-objects/money.vo'

export interface CreateProductInput {
  tenantSlug: string
  id?: string
  name: string
  description?: string
  price: number
  priceCents?: number
  categoryId: string
  image?: string
  imageUrl?: string
  durationMinutes?: number
  optionGroups?: any[]
}

export class CreateProductUseCase {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly tenantRepository: ITenantRepository
  ) {}

  async execute(input: CreateProductInput): Promise<Product> {
    const cleanSlug = input.tenantSlug.trim().toLowerCase()
    const tenant = await this.tenantRepository.findBySlug(cleanSlug)
    if (!tenant) {
      throw new EntityNotFoundError('Tenant', input.tenantSlug)
    }

    const priceCents =
      input.priceCents !== undefined
        ? input.priceCents
        : Math.round(Number(input.price || 0) * 100)

    const productId =
      input.id && input.id.trim().length > 0
        ? input.id.trim()
        : `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

    const imageUrl = (input.image || input.imageUrl || '').trim()

    const product = new Product({
      id: productId,
      tenantId: tenant.id,
      categoryId: input.categoryId,
      name: input.name.trim(),
      description: input.description || '',
      price: Money.fromCents(priceCents),
      imageUrl: imageUrl || undefined,
      isAvailable: true,
      durationMinutes: input.durationMinutes || 0,
      optionGroups: input.optionGroups || [],
      createdAt: new Date()
    })

    await this.productRepository.save(product)
    return product
  }
}
