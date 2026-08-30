import { Module } from '@nestjs/common'
import { TOKENS } from '@core/application/tokens'
import { TenantController } from '../http/controllers/tenant.controller'
import { GetTenantBySlugUseCase } from '@core/application/use-cases/get-tenant-by-slug.use-case'
import { ResolveTenantByDomainUseCase } from '@core/application/use-cases/resolve-tenant-by-domain.use-case'
import { UpdateTenantHoursUseCase } from '@core/application/use-cases/update-tenant-hours.use-case'
import { InMemoryTenantRepository } from '../persistence/in-memory/in-memory-tenant.repository'

@Module({
  controllers: [TenantController],
  providers: [
    InMemoryTenantRepository,
    {
      provide: TOKENS.TENANT_REPOSITORY,
      useExisting: InMemoryTenantRepository
    },
    {
      provide: GetTenantBySlugUseCase,
      useFactory: (repo) => new GetTenantBySlugUseCase(repo),
      inject: [TOKENS.TENANT_REPOSITORY]
    },
    {
      provide: ResolveTenantByDomainUseCase,
      useFactory: (repo) => new ResolveTenantByDomainUseCase(repo),
      inject: [TOKENS.TENANT_REPOSITORY]
    },
    {
      provide: UpdateTenantHoursUseCase,
      useFactory: (repo) => new UpdateTenantHoursUseCase(repo),
      inject: [TOKENS.TENANT_REPOSITORY]
    }
  ],
  exports: [TOKENS.TENANT_REPOSITORY]
})
export class TenantModule {}
