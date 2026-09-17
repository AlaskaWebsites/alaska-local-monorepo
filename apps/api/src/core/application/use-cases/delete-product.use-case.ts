import { IProductRepository } from '../ports/product.repository.port'
import { EntityNotFoundError } from '@core/domain/errors/domain.error'

export interface DeleteProductInput {
  tenantSlug?: string
  productId: string
}

export class DeleteProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: DeleteProductInput): Promise<void> {
    const product = await this.productRepository.findById(input.productId)
    if (!product) {
      throw new EntityNotFoundError('Product', input.productId)
    }

    await this.productRepository.delete(input.productId)
  }
}
