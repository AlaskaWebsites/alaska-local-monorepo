import { Module } from '@nestjs/common'
import { TOKENS } from '@core/application/tokens'
import { GetTenantBySlugUseCase } from '@core/application/use-cases/get-tenant-by-slug.use-case'
import { ResolveTenantByDomainUseCase } from '@core/application/use-cases/resolve-tenant-by-domain.use-case'
import { AuthenticateMerchantUseCase } from '@core/application/use-cases/authenticate-merchant.use-case'
import { UpdateTenantHoursUseCase } from '@core/application/use-cases/update-tenant-hours.use-case'
import { UpdateTenantEmergencyUseCase } from '@core/application/use-cases/update-tenant-emergency.use-case'
import { UpdateTenantDeliveryUseCase } from '@core/application/use-cases/update-tenant-delivery.use-case'
import { UpdateTenantPixUseCase } from '@core/application/use-cases/update-tenant-pix.use-case'
import { UpdateTenantContactUseCase } from '@core/application/use-cases/update-tenant-contact.use-case'
import { UpdateTenantAnnouncementUseCase } from '@core/application/use-cases/update-tenant-announcement.use-case'
import { PostgresTenantRepository } from '../persistence/postgres/postgres-tenant.repository'
import { InMemoryTenantRepository } from '../persistence/in-memory/in-memory-tenant.repository'
import { TenantController } from '../http/controllers/tenant.controller'
import { ITenantRepository } from '@core/application/ports/tenant.repository.port'
import { IPasswordHasher } from '@core/application/ports/password-hasher.port'
import { SimplePasswordHasher } from '../security/simple-hasher'
import { PostgresService } from '../persistence/postgres/postgres.service'
import { validateEnv } from '../../config/env.schema'

@Module({
  controllers: [TenantController],
  providers: [
    PostgresTenantRepository,
    InMemoryTenantRepository,
    SimplePasswordHasher,
    {
      provide: TOKENS.PASSWORD_HASHER,
      useExisting: SimplePasswordHasher
    },
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
    },
    {
      provide: AuthenticateMerchantUseCase,
      useFactory: (repo: ITenantRepository, hasher: IPasswordHasher) => new AuthenticateMerchantUseCase(repo, hasher),
      inject: [TOKENS.TENANT_REPOSITORY, TOKENS.PASSWORD_HASHER]
    },
    {
      provide: UpdateTenantHoursUseCase,
      useFactory: (repo: ITenantRepository) => new UpdateTenantHoursUseCase(repo),
      inject: [TOKENS.TENANT_REPOSITORY]
    },
    {
      provide: UpdateTenantEmergencyUseCase,
      useFactory: (repo: ITenantRepository) => new UpdateTenantEmergencyUseCase(repo),
      inject: [TOKENS.TENANT_REPOSITORY]
    },
    {
      provide: UpdateTenantDeliveryUseCase,
      useFactory: (repo: ITenantRepository) => new UpdateTenantDeliveryUseCase(repo),
      inject: [TOKENS.TENANT_REPOSITORY]
    },
    {
      provide: UpdateTenantPixUseCase,
      useFactory: (repo: ITenantRepository) => new UpdateTenantPixUseCase(repo),
      inject: [TOKENS.TENANT_REPOSITORY]
    },
    {
      provide: UpdateTenantContactUseCase,
      useFactory: (repo: ITenantRepository) => new UpdateTenantContactUseCase(repo),
      inject: [TOKENS.TENANT_REPOSITORY]
    },
    {
      provide: UpdateTenantAnnouncementUseCase,
      useFactory: (repo: ITenantRepository) => new UpdateTenantAnnouncementUseCase(repo),
      inject: [TOKENS.TENANT_REPOSITORY]
    }
  ],
  exports: [
    TOKENS.TENANT_REPOSITORY,
    TOKENS.PASSWORD_HASHER,
    GetTenantBySlugUseCase,
    ResolveTenantByDomainUseCase,
    AuthenticateMerchantUseCase,
    UpdateTenantHoursUseCase,
    UpdateTenantEmergencyUseCase,
    UpdateTenantDeliveryUseCase,
    UpdateTenantPixUseCase,
    UpdateTenantContactUseCase,
    UpdateTenantAnnouncementUseCase
  ]
})
export class TenantModule {}
