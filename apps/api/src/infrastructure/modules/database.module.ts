import { Global, Module } from '@nestjs/common'
import { PostgresService } from '../persistence/postgres/postgres.service'
import { TOKENS } from '@core/application/tokens'

@Global()
@Module({
  providers: [
    PostgresService,
    {
      provide: TOKENS.DATABASE_SERVICE,
      useExisting: PostgresService
    }
  ],
  exports: [PostgresService, TOKENS.DATABASE_SERVICE]
})
export class DatabaseModule {}
