import { Module } from '@nestjs/common';
import { TenantController } from '../http/controllers/tenant.controller';
import { GetTenantBySlugUseCase } from '../../core/application/use-cases/get-tenant-by-slug.use-case';
import { ResolveTenantByDomainUseCase } from '../../core/application/use-cases/resolve-tenant-by-domain.use-case';
import { UpdateTenantHoursUseCase } from '../../core/application/use-cases/update-tenant-hours.use-case';
import { AuthenticateMerchantUseCase } from '../../core/application/use-cases/authenticate-merchant.use-case';
import { TOKENS } from '../../core/application/tokens';
import { PostgresTenantRepository } from '../persistence/postgres/postgres-tenant.repository';
import { InMemoryTenantRepository } from '../persistence/in-memory/in-memory-tenant.repository';
import { SimplePasswordHasher } from '../security/simple-hasher';
import { DatabaseModule } from './database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [TenantController],
  providers: [
    {
      provide: TOKENS.PASSWORD_HASHER,
      useClass: SimplePasswordHasher,
    },
    {
      provide: TOKENS.TENANT_REPOSITORY,
      useClass: process.env.NODE_ENV === 'test' ? InMemoryTenantRepository : PostgresTenantRepository,
    },
    {
      provide: GetTenantBySlugUseCase,
      useFactory: (repo) => new GetTenantBySlugUseCase(repo),
      inject: [TOKENS.TENANT_REPOSITORY],
    },
    {
      provide: ResolveTenantByDomainUseCase,
      useFactory: (repo) => new ResolveTenantByDomainUseCase(repo),
      inject: [TOKENS.TENANT_REPOSITORY],
    },
    {
      provide: UpdateTenantHoursUseCase,
      useFactory: (repo) => new UpdateTenantHoursUseCase(repo),
      inject: [TOKENS.TENANT_REPOSITORY],
    },
    {
      provide: AuthenticateMerchantUseCase,
      useFactory: (repo, hasher) => new AuthenticateMerchantUseCase(repo, hasher),
      inject: [TOKENS.TENANT_REPOSITORY, TOKENS.PASSWORD_HASHER],
    },
  ],
  exports: [
    TOKENS.TENANT_REPOSITORY,
    TOKENS.PASSWORD_HASHER,
    GetTenantBySlugUseCase,
    ResolveTenantByDomainUseCase,
    UpdateTenantHoursUseCase,
    AuthenticateMerchantUseCase,
  ],
})
export class TenantModule {}
