import { IProfessionalRepository } from '../ports/professional.repository.port'
import { EntityNotFoundError } from '../../domain/errors/domain.error'

export interface DeleteProfessionalInput {
  tenantSlug?: string
  professionalId: string
}

export class DeleteProfessionalUseCase {
  constructor(private readonly professionalRepository: IProfessionalRepository) {}

  async execute(input: DeleteProfessionalInput): Promise<void> {
    const prof = await this.professionalRepository.findById(input.professionalId)
    if (!prof) {
      throw new EntityNotFoundError('Professional', input.professionalId)
    }

    await this.professionalRepository.delete(input.professionalId)
  }
}
