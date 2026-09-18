export interface WorkHoursProps {
  start: string
  end: string
}

export interface LunchBreakProps {
  start: string
  end: string
  enabled: boolean
}

export interface ProfessionalProps {
  id: string
  tenantId: string
  name: string
  role?: string
  avatar?: string
  availableDays?: number[]
  workHours?: WorkHoursProps
  lunchBreak?: LunchBreakProps
  isAvailable?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export class Professional {
  readonly id: string
  readonly tenantId: string
  name: string
  role: string
  avatar?: string
  availableDays: number[]
  workHours: WorkHoursProps
  lunchBreak: LunchBreakProps
  isAvailable: boolean
  readonly createdAt: Date
  updatedAt: Date

  constructor(props: ProfessionalProps) {
    this.id = props.id
    this.tenantId = props.tenantId
    this.name = props.name
    this.role = props.role || 'Profissional'
    this.avatar = props.avatar
    this.availableDays = props.availableDays && props.availableDays.length > 0 ? props.availableDays : [1, 2, 3, 4, 5]
    this.workHours = props.workHours || { start: '08:00', end: '18:00' }
    this.lunchBreak = props.lunchBreak || { start: '12:00', end: '13:00', enabled: true }
    this.isAvailable = props.isAvailable !== undefined ? props.isAvailable : true
    this.createdAt = props.createdAt || new Date()
    this.updatedAt = props.updatedAt || new Date()
  }

  toggleAvailability(isAvailable?: boolean): void {
    this.isAvailable = isAvailable !== undefined ? isAvailable : !this.isAvailable
    this.updatedAt = new Date()
  }

  updateDetails(data: {
    name?: string
    role?: string
    avatar?: string
    availableDays?: number[]
    workHours?: WorkHoursProps
    lunchBreak?: LunchBreakProps
    isAvailable?: boolean
  }): void {
    if (data.name !== undefined) this.name = data.name.trim()
    if (data.role !== undefined) this.role = data.role.trim()
    if (data.avatar !== undefined) this.avatar = data.avatar
    if (data.availableDays !== undefined) this.availableDays = data.availableDays
    if (data.workHours !== undefined) this.workHours = data.workHours
    if (data.lunchBreak !== undefined) this.lunchBreak = data.lunchBreak
    if (data.isAvailable !== undefined) this.isAvailable = data.isAvailable
    this.updatedAt = new Date()
  }
}
