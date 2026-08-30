import { Module } from '@nestjs/common'
import { TOKENS } from '@core/application/tokens'
import { CreateOrderUseCase } from '@core/application/use-cases/create-order.use-case'
import { PostgresOrderRepository } from '../persistence/postgres/postgres-order.repository'
import { InMemoryOrderRepository } from '../persistence/in-memory/in-memory-order.repository'
import { OrderController } from '../http/controllers/order.controller'
import { TenantModule } from './tenant.module'
import { PixModule } from './pix.module'
import { ITenantRepository } from '@core/application/ports/tenant.repository.port'
import { IOrderRepository } from '@core/application/ports/order.repository.port'
import { IPixGateway } from '@core/application/ports/pix-gateway.port'
import { PostgresService } from '../persistence/postgres/postgres.service'
import { validateEnv } from '../../config/env.schema'

@Module({
  imports: [TenantModule, PixModule],
  controllers: [OrderController],
  providers: [
    PostgresOrderRepository,
    InMemoryOrderRepository,
    {
      provide: TOKENS.ORDER_REPOSITORY,
      useFactory: (postgresService: PostgresService, inMemoryRepo: InMemoryOrderRepository) => {
        const env = validateEnv()
        if (env.NODE_ENV === 'test') {
          return inMemoryRepo
        }
        return new PostgresOrderRepository(postgresService)
      },
      inject: [PostgresService, InMemoryOrderRepository]
    },
    {
      provide: CreateOrderUseCase,
      useFactory: (tenantRepo: ITenantRepository, orderRepo: IOrderRepository, pixGateway: IPixGateway) =>
        new CreateOrderUseCase(tenantRepo, orderRepo, pixGateway),
      inject: [TOKENS.TENANT_REPOSITORY, TOKENS.ORDER_REPOSITORY, TOKENS.PIX_GATEWAY]
    }
  ],
  exports: [TOKENS.ORDER_REPOSITORY, CreateOrderUseCase]
})
export class OrderModule {}
