import { IProductRepository } from '../ports/product.repository.port'
import { EntityNotFoundError } from '@core/domain/errors/domain.error'
import { Product } from '@core/domain/entities/product.entity'

export interface UpdateProductInput {
  productId: string
  name?: string
  description?: string
  priceCents?: number
  isAvailable?: boolean
}

export class UpdateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: UpdateProductInput): Promise<Product> {
    const product = await this.productRepository.findById(input.productId)
    if (!product) {
      throw new EntityNotFoundError('Product', input.productId)
    }
    return this.productRepository.update(input.productId, input)
  }
}
