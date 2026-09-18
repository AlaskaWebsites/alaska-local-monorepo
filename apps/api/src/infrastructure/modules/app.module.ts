import { Module } from '@nestjs/common'
import { DatabaseModule } from './database.module'
import { TenantModule } from './tenant.module'
import { PixModule } from './pix.module'
import { OrderModule } from './order.module'
import { BookingModule } from './booking.module'
import { ProductModule } from './product.module'
import { ProfessionalModule } from './professional.module'
import { HealthController } from '../http/controllers/health.controller'

@Module({
  imports: [
    DatabaseModule,
    TenantModule,
    PixModule,
    OrderModule,
    BookingModule,
    ProductModule,
    ProfessionalModule
  ],
  controllers: [HealthController]
})
export class AppModule {}
