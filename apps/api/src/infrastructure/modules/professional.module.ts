import { Module } from '@nestjs/common'
import { TOKENS } from '@core/application/tokens'
import { ProfessionalController } from '../http/controllers/professional.controller'
import { CreateProfessionalUseCase } from '@core/application/use-cases/create-professional.use-case'
import { DeleteProfessionalUseCase } from '@core/application/use-cases/delete-professional.use-case'
import { UpdateProfessionalUseCase } from '@core/application/use-cases/update-professional.use-case'
import { ToggleProfessionalAvailabilityUseCase } from '@core/application/use-cases/toggle-professional-availability.use-case'
import { ToggleBlockSlotUseCase } from '@core/application/use-cases/toggle-block-slot.use-case'
import { PostgresProfessionalRepository } from '../persistence/postgres/postgres-professional.repository'
import { InMemoryProfessionalRepository } from '../persistence/in-memory/in-memory-professional.repository'
import { IProfessionalRepository } from '@core/application/ports/professional.repository.port'
import { ITenantRepository } from '@core/application/ports/tenant.repository.port'
import { DatabaseModule } from './database.module'
import { TenantModule } from './tenant.module'

@Module({
  imports: [DatabaseModule, TenantModule],
  controllers: [ProfessionalController],
  providers: [
    InMemoryProfessionalRepository,
    PostgresProfessionalRepository,
    {
      provide: TOKENS.PROFESSIONAL_REPOSITORY,
      useExisting: PostgresProfessionalRepository
    },
    {
      provide: CreateProfessionalUseCase,
      useFactory: (profRepo: IProfessionalRepository, tenantRepo: ITenantRepository) =>
        new CreateProfessionalUseCase(profRepo, tenantRepo),
      inject: [TOKENS.PROFESSIONAL_REPOSITORY, TOKENS.TENANT_REPOSITORY]
    },
    {
      provide: DeleteProfessionalUseCase,
      useFactory: (repo: IProfessionalRepository) => new DeleteProfessionalUseCase(repo),
      inject: [TOKENS.PROFESSIONAL_REPOSITORY]
    },
    {
      provide: UpdateProfessionalUseCase,
      useFactory: (repo: IProfessionalRepository) => new UpdateProfessionalUseCase(repo),
      inject: [TOKENS.PROFESSIONAL_REPOSITORY]
    },
    {
      provide: ToggleProfessionalAvailabilityUseCase,
      useFactory: (repo: IProfessionalRepository) => new ToggleProfessionalAvailabilityUseCase(repo),
      inject: [TOKENS.PROFESSIONAL_REPOSITORY]
    },
    {
      provide: ToggleBlockSlotUseCase,
      useFactory: (profRepo: IProfessionalRepository, tenantRepo: ITenantRepository) =>
        new ToggleBlockSlotUseCase(profRepo, tenantRepo),
      inject: [TOKENS.PROFESSIONAL_REPOSITORY, TOKENS.TENANT_REPOSITORY]
    }
  ],
  exports: [
    TOKENS.PROFESSIONAL_REPOSITORY,
    CreateProfessionalUseCase,
    DeleteProfessionalUseCase,
    UpdateProfessionalUseCase,
    ToggleProfessionalAvailabilityUseCase,
    ToggleBlockSlotUseCase
  ]
})
export class ProfessionalModule {}
