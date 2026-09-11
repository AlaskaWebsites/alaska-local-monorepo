import { Module } from '@nestjs/common'
import { TOKENS } from '@core/application/tokens'
import { ProductController } from '../http/controllers/product.controller'
import { ToggleProductAvailabilityUseCase } from '@core/application/use-cases/toggle-product-availability.use-case'
import { UpdateProductUseCase } from '@core/application/use-cases/update-product.use-case'
import { ToggleOptionAvailabilityUseCase } from '@core/application/use-cases/toggle-option-availability.use-case'
import { InMemoryProductRepository } from '../persistence/in-memory/in-memory-product.repository'
import { PostgresProductRepository } from '../persistence/postgres/postgres-product.repository'
import { IProductRepository } from '@core/application/ports/product.repository.port'
import { DatabaseModule } from './database.module'

@Module({
  imports: [DatabaseModule],
  controllers: [ProductController],
  providers: [
    InMemoryProductRepository,
    PostgresProductRepository,
    {
      provide: TOKENS.PRODUCT_REPOSITORY,
      useClass: process.env.NODE_ENV === 'test' ? InMemoryProductRepository : PostgresProductRepository
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
    },
    {
      provide: ToggleOptionAvailabilityUseCase,
      useFactory: (repo: IProductRepository) => new ToggleOptionAvailabilityUseCase(repo),
      inject: [TOKENS.PRODUCT_REPOSITORY]
    }
  ],
  exports: [
    TOKENS.PRODUCT_REPOSITORY,
    ToggleProductAvailabilityUseCase,
    UpdateProductUseCase,
    ToggleOptionAvailabilityUseCase
  ]
})
export class ProductModule {}
