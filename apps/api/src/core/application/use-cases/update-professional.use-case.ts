import { IProfessionalRepository } from '../ports/professional.repository.port'
import { EntityNotFoundError } from '../../domain/errors/domain.error'
import { Professional, WorkHoursProps, LunchBreakProps } from '../../domain/entities/professional.entity'

export interface UpdateProfessionalInput {
  tenantSlug?: string
  professionalId: string
  name?: string
  role?: string
  avatar?: string
  availableDays?: number[]
  workHours?: WorkHoursProps
  lunchBreak?: LunchBreakProps
  isAvailable?: boolean
}

export class UpdateProfessionalUseCase {
  constructor(private readonly professionalRepository: IProfessionalRepository) {}

  async execute(input: UpdateProfessionalInput): Promise<Professional> {
    const prof = await this.professionalRepository.findById(input.professionalId)
    if (!prof) {
      throw new EntityNotFoundError('Professional', input.professionalId)
    }

    prof.updateDetails({
      name: input.name,
      role: input.role,
      avatar: input.avatar,
      availableDays: input.availableDays,
      workHours: input.workHours,
      lunchBreak: input.lunchBreak,
      isAvailable: input.isAvailable
    })

    await this.professionalRepository.save(prof)
    return prof
  }
}
