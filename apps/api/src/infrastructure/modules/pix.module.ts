import { Module } from '@nestjs/common'
import { TOKENS } from '@core/application/tokens'
import { CalculatePixPayloadUseCase } from '@core/application/use-cases/calculate-pix-payload.use-case'
import { LocalPixGateway } from '../gateways/local-pix.gateway'
import { PixController } from '../http/controllers/pix.controller'
import { TenantModule } from './tenant.module'
import { ITenantRepository } from '@core/application/ports/tenant.repository.port'
import { IPixGateway } from '@core/application/ports/pix-gateway.port'

@Module({
  imports: [TenantModule],
  controllers: [PixController],
  providers: [
    { provide: TOKENS.PIX_GATEWAY, useClass: LocalPixGateway },
    {
      provide: CalculatePixPayloadUseCase,
      useFactory: (repo: ITenantRepository, gateway: IPixGateway) =>
        new CalculatePixPayloadUseCase(repo, gateway),
      inject: [TOKENS.TENANT_REPOSITORY, TOKENS.PIX_GATEWAY]
    }
  ],
  exports: [TOKENS.PIX_GATEWAY, CalculatePixPayloadUseCase]
})
export class PixModule {}
