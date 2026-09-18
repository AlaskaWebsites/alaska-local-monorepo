import { IProfessionalRepository } from '../ports/professional.repository.port'
import { ITenantRepository } from '../ports/tenant.repository.port'
import { EntityNotFoundError } from '../../domain/errors/domain.error'
import { Professional, WorkHoursProps, LunchBreakProps } from '../../domain/entities/professional.entity'

export interface CreateProfessionalInput {
  tenantSlug: string
  id?: string
  name: string
  role?: string
  avatar?: string
  availableDays?: number[]
  workHours?: WorkHoursProps
  lunchBreak?: LunchBreakProps
  isAvailable?: boolean
}

export class CreateProfessionalUseCase {
  constructor(
    private readonly professionalRepository: IProfessionalRepository,
    private readonly tenantRepository: ITenantRepository
  ) {}

  async execute(input: CreateProfessionalInput): Promise<Professional> {
    const cleanSlug = (input.tenantSlug || '').trim().toLowerCase()
    const tenant = await this.tenantRepository.findBySlug(cleanSlug)
    if (!tenant) {
      throw new EntityNotFoundError('Tenant', input.tenantSlug)
    }

    const profId = input.id && input.id.trim().length > 0
      ? input.id.trim()
      : `prof-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

    const professional = new Professional({
      id: profId,
      tenantId: tenant.id,
      name: input.name.trim(),
      role: input.role || 'Profissional',
      avatar: input.avatar,
      availableDays: input.availableDays && input.availableDays.length > 0 ? input.availableDays : [1, 2, 3, 4, 5],
      workHours: input.workHours || { start: '08:00', end: '18:00' },
      lunchBreak: input.lunchBreak || { start: '12:00', end: '13:00', enabled: true },
      isAvailable: input.isAvailable !== undefined ? input.isAvailable : true,
      createdAt: new Date()
    })

    await this.professionalRepository.save(professional)
    return professional
  }
}
