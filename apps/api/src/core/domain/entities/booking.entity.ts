import { ValidationError } from '../errors/domain.error'
import { Money } from '../value-objects/money.vo'

export type BookingStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type BookingPaymentMode = 'on_service' | 'pix_deposit' | 'pix_full'

export interface BookingServiceItem {
  id: string
  name: string
  priceCents: number
  durationMinutes: number
}

export interface BookingProps {
  id: string
  tenantId: string
  customerName: string
  customerPhone: string
  services: BookingServiceItem[]
  professionalId?: string
  professionalName?: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  notes?: string
  paymentMode?: BookingPaymentMode
  depositAmountCents?: number
  status?: BookingStatus
  pixCode?: string
  createdAt?: Date
  updatedAt?: Date
}

export class Booking {
  private props: BookingProps

  constructor(props: BookingProps) {
    this.validate(props)
    this.props = {
      ...props,
      paymentMode: props.paymentMode || 'on_service',
      depositAmountCents: props.depositAmountCents || 0,
      status: props.status || (props.paymentMode === 'pix_deposit' ? 'scheduled' : 'confirmed'),
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date()
    }
  }

  private validate(props: BookingProps): void {
    if (!props.customerName || props.customerName.trim().length < 2) {
      throw new ValidationError('Nome do cliente é obrigatório para agendamento.')
    }
    if (!props.customerPhone || props.customerPhone.replace(/\D/g, '').length < 10) {
      throw new ValidationError('WhatsApp de contato é obrigatório.')
    }
    if (!props.services || props.services.length === 0) {
      throw new ValidationError('Ao menos um serviço deve ser selecionado.')
    }
    if (!props.date || !props.time) {
      throw new ValidationError('Data e horário de agendamento são obrigatórios.')
    }
  }

  get id(): string { return this.props.id }
  get tenantId(): string { return this.props.tenantId }
  get customerName(): string { return this.props.customerName }
  get customerPhone(): string { return this.props.customerPhone }
  get services(): BookingServiceItem[] { return this.props.services }
  get professionalName(): string { return this.props.professionalName || 'Qualquer profissional' }
  get date(): string { return this.props.date }
  get time(): string { return this.props.time }
  get status(): BookingStatus { return this.props.status || 'scheduled' }
  get paymentMode(): BookingPaymentMode { return this.props.paymentMode || 'on_service' }
  get pixCode(): string | undefined { return this.props.pixCode }

  calculateTotalPrice(): Money {
    let total = Money.zero()
    for (const s of this.props.services) {
      total = total.add(Money.fromCents(s.priceCents))
    }
    return total
  }

  calculateTotalDurationMinutes(): number {
    return this.props.services.reduce((acc, s) => acc + (s.durationMinutes || 30), 0)
  }

  confirmDeposit(): void {
    this.props.status = 'confirmed'
    this.props.updatedAt = new Date()
  }

  setPixCode(code: string): void {
    this.props.pixCode = code
  }
}
