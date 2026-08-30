import { Module } from '@nestjs/common'
import { TOKENS } from '@core/application/tokens'
import { ProductController } from '../http/controllers/product.controller'
import { ToggleProductAvailabilityUseCase } from '@core/application/use-cases/toggle-product-availability.use-case'
import { UpdateProductUseCase } from '@core/application/use-cases/update-product.use-case'
import { InMemoryProductRepository } from '../persistence/in-memory/in-memory-product.repository'
import { IProductRepository } from '@core/application/ports/product.repository.port'

@Module({
  controllers: [ProductController],
  providers: [
    InMemoryProductRepository,
    {
      provide: TOKENS.PRODUCT_REPOSITORY,
      useExisting: InMemoryProductRepository
    },
    {
      provide: ToggleProductAvailabilityUseCase,
      useFactory: (repo: IProductRepository) => new ToggleProductAvailabilityUseCase(repo),
      inject: [TOKENS.PRODUCT_REPOSITORY]
    },
    {
      provide: UpdateProductUseCase,
      useFactory: (repo: IProductRepository) => new UpdateProductUseCase(repo),
      inject: [TOKENS.PRODUCT_REPOSITORY]
    }
  ],
  exports: [TOKENS.PRODUCT_REPOSITORY, ToggleProductAvailabilityUseCase, UpdateProductUseCase]
})
export class ProductModule {}
