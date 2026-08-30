import { Module } from '@nestjs/common'
import { TOKENS } from '@core/application/tokens'
import { GetTenantBySlugUseCase } from '@core/application/use-cases/get-tenant-by-slug.use-case'
import { ResolveTenantByDomainUseCase } from '@core/application/use-cases/resolve-tenant-by-domain.use-case'
import { PostgresTenantRepository } from '../persistence/postgres/postgres-tenant.repository'
import { InMemoryTenantRepository } from '../persistence/in-memory/in-memory-tenant.repository'
import { TenantController } from '../http/controllers/tenant.controller'
import { ITenantRepository } from '@core/application/ports/tenant.repository.port'
import { PostgresService } from '../persistence/postgres/postgres.service'
import { validateEnv } from '../../config/env.schema'

@Module({
  controllers: [TenantController],
  providers: [
    PostgresTenantRepository,
    InMemoryTenantRepository,
    {
      provide: TOKENS.TENANT_REPOSITORY,
      useFactory: (postgresService: PostgresService, inMemoryRepo: InMemoryTenantRepository) => {
        const env = validateEnv()
        if (env.NODE_ENV === 'test') {
          return inMemoryRepo
        }
        return new PostgresTenantRepository(postgresService)
      },
      inject: [PostgresService, InMemoryTenantRepository]
    },
    {
      provide: GetTenantBySlugUseCase,
      useFactory: (repo: ITenantRepository) => new GetTenantBySlugUseCase(repo),
      inject: [TOKENS.TENANT_REPOSITORY]
    },
    {
      provide: ResolveTenantByDomainUseCase,
      useFactory: (repo: ITenantRepository) => new ResolveTenantByDomainUseCase(repo),
      inject: [TOKENS.TENANT_REPOSITORY]
    }
  ],
  exports: [TOKENS.TENANT_REPOSITORY, GetTenantBySlugUseCase, ResolveTenantByDomainUseCase]
})
export class TenantModule {}
