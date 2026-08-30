import { IProductRepository } from '../ports/product.repository.port'
import { EntityNotFoundError } from '@core/domain/errors/domain.error'
import { Product } from '@core/domain/entities/product.entity'

export interface ToggleProductAvailabilityInput {
  productId: string
  isAvailable: boolean
}

export class ToggleProductAvailabilityUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: ToggleProductAvailabilityInput): Promise<Product> {
    const product = await this.productRepository.findById(input.productId)
    if (!product) {
      throw new EntityNotFoundError('Product', input.productId)
    }
    return this.productRepository.toggleAvailability(input.productId, input.isAvailable)
  }
}
