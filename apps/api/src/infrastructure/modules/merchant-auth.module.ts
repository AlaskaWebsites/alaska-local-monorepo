import { Module } from '@nestjs/common';
import { TOKENS } from '@core/application/tokens';
import { TenantModule } from './tenant.module';
import { MerchantAuthController } from '../http/controllers/merchant-auth.controller';
import { AuthenticateMerchantCredentialsUseCase } from '@core/application/use-cases/authenticate-merchant-credentials.use-case';
import { ChangeMerchantPasswordUseCase } from '@core/application/use-cases/change-merchant-password.use-case';
import { CreateMerchantUserUseCase } from '@core/application/use-cases/create-merchant-user.use-case';
import { IMerchantUserRepository } from '@core/application/ports/merchant-user.repository.port';
import { ITenantRepository } from '@core/application/ports/tenant.repository.port';
import { IPasswordHasher } from '@core/application/ports/password-hasher.port';
import { InMemoryMerchantUserRepository } from '../persistence/in-memory/in-memory-merchant-user.repository';
import { PostgresMerchantUserRepository } from '../persistence/postgres/postgres-merchant-user.repository';
import { PostgresService } from '../persistence/postgres/postgres.service';
import { SimplePasswordHasher } from '../security/simple-hasher';
import { validateEnv } from '../../config/env.schema';

@Module({
  imports: [TenantModule],
  controllers: [MerchantAuthController],
  providers: [
    InMemoryMerchantUserRepository,
    PostgresMerchantUserRepository,
    {
      provide: TOKENS.PASSWORD_HASHER,
      useClass: SimplePasswordHasher,
    },
    {
      provide: TOKENS.MERCHANT_USER_REPOSITORY,
      useFactory: (
        inMemoryRepo: InMemoryMerchantUserRepository,
        postgresService: PostgresService,
      ) => {
        const env = validateEnv();
        if (env.NODE_ENV === 'test') {
          return inMemoryRepo;
        }
        return new PostgresMerchantUserRepository(postgresService);
      },
      inject: [InMemoryMerchantUserRepository, PostgresService],
    },
    {
      provide: AuthenticateMerchantCredentialsUseCase,
      useFactory: (
        userRepo: IMerchantUserRepository,
        tenantRepo: ITenantRepository,
        hasher: IPasswordHasher,
      ) => new AuthenticateMerchantCredentialsUseCase(userRepo, tenantRepo, hasher),
      inject: [TOKENS.MERCHANT_USER_REPOSITORY, TOKENS.TENANT_REPOSITORY, TOKENS.PASSWORD_HASHER],
    },
    {
      provide: ChangeMerchantPasswordUseCase,
      useFactory: (
        userRepo: IMerchantUserRepository,
        hasher: IPasswordHasher,
      ) => new ChangeMerchantPasswordUseCase(userRepo, hasher),
      inject: [TOKENS.MERCHANT_USER_REPOSITORY, TOKENS.PASSWORD_HASHER],
    },
    {
      provide: CreateMerchantUserUseCase,
      useFactory: (
        userRepo: IMerchantUserRepository,
        tenantRepo: ITenantRepository,
        hasher: IPasswordHasher,
      ) => new CreateMerchantUserUseCase(userRepo, tenantRepo, hasher),
      inject: [TOKENS.MERCHANT_USER_REPOSITORY, TOKENS.TENANT_REPOSITORY, TOKENS.PASSWORD_HASHER],
    },
  ],
  exports: [
    TOKENS.MERCHANT_USER_REPOSITORY,
    AuthenticateMerchantCredentialsUseCase,
    ChangeMerchantPasswordUseCase,
    CreateMerchantUserUseCase,
  ],
})
export class MerchantAuthModule {}
