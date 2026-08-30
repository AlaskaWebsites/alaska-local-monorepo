import { Module } from '@nestjs/common'
import { HealthController } from '../http/controllers/health.controller'
import { DatabaseModule } from './database.module'
import { TenantModule } from './tenant.module'
import { PixModule } from './pix.module'
import { OrderModule } from './order.module'
import { BookingModule } from './booking.module'
import { ProductModule } from './product.module'

@Module({
  imports: [DatabaseModule, TenantModule, PixModule, OrderModule, BookingModule, ProductModule],
  controllers: [HealthController]
})
export class AppModule {}
