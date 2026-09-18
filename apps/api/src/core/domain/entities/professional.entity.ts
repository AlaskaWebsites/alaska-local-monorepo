import { ValidationError } from '../errors/domain.error'

export interface WorkHoursProps {
  start: string // HH:mm
  end: string   // HH:mm
}

export interface LunchBreakProps {
  start: string // HH:mm
  end: string   // HH:mm
  enabled?: boolean
}

export interface ProfessionalProps {
  id: string
  tenantId: string
  name: string
  role: string
  avatar?: string
  availableDays: number[] // [0..6] (0 = domingo)
  workHours: WorkHoursProps
  lunchBreak?: LunchBreakProps
  isAvailable: boolean
  createdAt?: Date
  updatedAt?: Date
}

export class Professional {
  private props: ProfessionalProps

  constructor(props: ProfessionalProps) {
    this.validate(props)
    this.props = {
      ...props,
      role: props.role || 'Profissional',
      availableDays: props.availableDays || [1, 2, 3, 4, 5],
      workHours: props.workHours || { start: '08:00', end: '18:00' },
      lunchBreak: props.lunchBreak || { start: '12:00', end: '13:00', enabled: true },
      isAvailable: props.isAvailable ?? true,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date()
    }
  }

  private validate(props: ProfessionalProps): void {
    if (!props.name || props.name.trim().length < 2) {
      throw new ValidationError('O nome do profissional deve ter pelo menos 2 caracteres.')
    }
    if (!props.tenantId) {
      throw new ValidationError('O tenantId é obrigatório.')
    }
  }

  get id(): string { return this.props.id }
  get tenantId(): string { return this.props.tenantId }
  get name(): string { return this.props.name }
  get role(): string { return this.props.role }
  get avatar(): string | undefined { return this.props.avatar }
  get availableDays(): number[] { return this.props.availableDays }
  get workHours(): WorkHoursProps { return this.props.workHours }
  get lunchBreak(): LunchBreakProps | undefined { return this.props.lunchBreak }
  get isAvailable(): boolean { return this.props.isAvailable }
  get createdAt(): Date { return this.props.createdAt || new Date() }
  get updatedAt(): Date { return this.props.updatedAt || new Date() }

  toggleAvailability(isAvailable?: boolean): void {
    this.props.isAvailable = isAvailable !== undefined ? isAvailable : !this.props.isAvailable
    this.props.updatedAt = new Date()
  }

  updateSchedule(availableDays: number[], workHours: WorkHoursProps, lunchBreak?: LunchBreakProps): void {
    this.props.availableDays = availableDays
    this.props.workHours = workHours
    if (lunchBreak) {
      this.props.lunchBreak = lunchBreak
    }
    this.props.updatedAt = new Date()
  }

  updateDetails(data: { name?: string; role?: string; avatar?: string; availableDays?: number[]; workHours?: WorkHoursProps; lunchBreak?: LunchBreakProps; isAvailable?: boolean }): void {
    if (data.name) this.props.name = data.name
    if (data.role) this.props.role = data.role
    if (data.avatar !== undefined) this.props.avatar = data.avatar
    if (data.availableDays) this.props.availableDays = data.availableDays
    if (data.workHours) this.props.workHours = data.workHours
    if (data.lunchBreak !== undefined) this.props.lunchBreak = data.lunchBreak
    if (data.isAvailable !== undefined) this.props.isAvailable = data.isAvailable
    this.props.updatedAt = new Date()
  }

  toJSON() {
    return {
      id: this.props.id,
      tenantId: this.props.tenantId,
      name: this.props.name,
      role: this.props.role,
      avatar: this.props.avatar,
      availableDays: this.props.availableDays,
      workHours: this.props.workHours,
      lunchBreak: this.props.lunchBreak,
      isAvailable: this.props.isAvailable,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt
    }
  }
}
