import { IProfessionalRepository, BlockedSlotRecord } from '../ports/professional.repository.port'
import { ITenantRepository } from '../ports/tenant.repository.port'
import { EntityNotFoundError } from '../../domain/errors/domain.error'

export interface ToggleBlockSlotInput {
  tenantSlug: string
  date: string
  time: string
  reason?: string
}

export class ToggleBlockSlotUseCase {
  constructor(
    private readonly professionalRepository: IProfessionalRepository,
    private readonly tenantRepository: ITenantRepository
  ) {}

  async execute(input: ToggleBlockSlotInput): Promise<{ blocked: boolean; date: string; time: string }> {
    const cleanSlug = (input.tenantSlug || '').trim().toLowerCase()
    const tenant = await this.tenantRepository.findBySlug(cleanSlug)
    if (!tenant) {
      throw new EntityNotFoundError('Tenant', input.tenantSlug)
    }

    return this.professionalRepository.toggleBlockSlot(cleanSlug, input.date, input.time, input.reason)
  }
}
