import { Module } from '@nestjs/common'
import { TOKENS } from '@core/application/tokens'
import { PostgresBookingRepository } from '../persistence/postgres/postgres-booking.repository'
import { InMemoryBookingRepository } from '../persistence/in-memory/in-memory-booking.repository'
import { BookingController } from '../http/controllers/booking.controller'
import { TenantModule } from './tenant.module'
import { PixModule } from './pix.module'
import { PostgresService } from '../persistence/postgres/postgres.service'
import { validateEnv } from '../../config/env.schema'

@Module({
  imports: [TenantModule, PixModule],
  controllers: [BookingController],
  providers: [
    PostgresBookingRepository,
    InMemoryBookingRepository,
    {
      provide: TOKENS.BOOKING_REPOSITORY,
      useFactory: (postgresService: PostgresService, inMemoryRepo: InMemoryBookingRepository) => {
        const env = validateEnv()
        if (env.NODE_ENV === 'test') {
          return inMemoryRepo
        }
        return new PostgresBookingRepository(postgresService)
      },
      inject: [PostgresService, InMemoryBookingRepository]
    }
  ],
  exports: [TOKENS.BOOKING_REPOSITORY]
})
export class BookingModule {}
