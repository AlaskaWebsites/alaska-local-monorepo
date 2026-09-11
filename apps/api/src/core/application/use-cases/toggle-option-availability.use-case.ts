import { IProductRepository } from '../ports/product.repository.port'
import { EntityNotFoundError } from '@core/domain/errors/domain.error'
import { Product } from '@core/domain/entities/product.entity'

export interface ToggleOptionAvailabilityInput {
  productId?: string
  optionId: string
  isAvailable: boolean
  tenantSlug?: string
}

export class ToggleOptionAvailabilityUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: ToggleOptionAvailabilityInput): Promise<Product> {
    let targetProduct: Product | null = null

    if (input.productId && input.productId !== 'options') {
      targetProduct = await this.productRepository.findById(input.productId)
    }

    if (!targetProduct && input.tenantSlug) {
      const products = await this.productRepository.listByTenantSlug(input.tenantSlug)
      for (const p of products) {
        const hasOpt = (p.optionGroups || []).some((g: any) =>
          (g.options || []).some((opt: any) => opt.id === input.optionId)
        )
        if (hasOpt) {
          targetProduct = p
          break
        }
      }
    }

    if (!targetProduct) {
      throw new EntityNotFoundError('ProductOption', input.optionId)
    }

    const optionGroups = JSON.parse(JSON.stringify(targetProduct.optionGroups || []))
    for (const group of optionGroups) {
      if (Array.isArray(group.options)) {
        for (const opt of group.options) {
          if (opt.id === input.optionId) {
            opt.isAvailable = input.isAvailable
            opt.available = input.isAvailable
          }
        }
      }
    }

    return this.productRepository.update(targetProduct.id, {
      optionGroups
    })
  }
}
