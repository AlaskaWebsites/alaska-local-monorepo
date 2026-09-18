import { IProfessionalRepository } from '../ports/professional.repository.port'
import { EntityNotFoundError } from '../../domain/errors/domain.error'
import { Professional } from '../../domain/entities/professional.entity'

export interface ToggleProfessionalAvailabilityInput {
  tenantSlug?: string
  professionalId: string
  isAvailable?: boolean
}

export class ToggleProfessionalAvailabilityUseCase {
  constructor(private readonly professionalRepository: IProfessionalRepository) {}

  async execute(input: ToggleProfessionalAvailabilityInput): Promise<Professional> {
    const prof = await this.professionalRepository.findById(input.professionalId)
    if (!prof) {
      throw new EntityNotFoundError('Professional', input.professionalId)
    }

    prof.toggleAvailability(input.isAvailable)
    await this.professionalRepository.save(prof)
    return prof
  }
}
