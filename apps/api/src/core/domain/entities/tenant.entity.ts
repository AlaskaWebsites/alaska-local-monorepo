import { ValidationError } from '../errors/domain.error'

export type BusinessCategory = 'menu' | 'shop' | 'hub' | 'pro'
export type TenantTheme = 
  | 'food'
  | 'barber'
  | 'health'
  | 'drinks'
  | 'rose'
  | 'amber'
  | 'violet'
  | 'blue'
  | 'emerald'
  | 'slate'
  | 'default'

export interface OpeningHours {
  open: string  // HH:mm
  close: string // HH:mm
}

export interface PixConfig {
  key: string
  keyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'
  beneficiary?: string
  city?: string
  allowTestCent?: boolean
  depositPercentage?: number
}

export interface TenantProps {
  id: string
  slug: string
  name: string
  description?: string
  logo?: string
  banner?: string
  phoneWhatsApp: string
  address?: string
  businessCategory: BusinessCategory
  theme?: TenantTheme
  openingHours?: OpeningHours
  pixConfig?: PixConfig
  customDomain?: string
  deliveryFeeCents?: number
  minOrderValueCents?: number
  categories?: unknown[]
  reviews?: unknown
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Entidade Pura de Domínio Tenant (Zero Decorators / Framework-Agnostic)
 */
export class Tenant {
  private props: TenantProps

  constructor(props: TenantProps) {
    this.validate(props)
    this.props = {
      ...props,
      theme: props.theme || 'food',
      deliveryFeeCents: props.deliveryFeeCents || 0,
      minOrderValueCents: props.minOrderValueCents || 0,
      isActive: props.isActive ?? true,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date()
    }
  }

  private validate(props: TenantProps): void {
    if (!props.slug || props.slug.trim().length < 2) {
      throw new ValidationError('O slug do tenant é obrigatório e deve ter no mínimo 2 caracteres.')
    }
    if (!props.name || props.name.trim().length < 2) {
      throw new ValidationError('O nome do estabelecimento é obrigatório.')
    }
    if (!props.phoneWhatsApp || props.phoneWhatsApp.replace(/\D/g, '').length < 10) {
      throw new ValidationError('Telefone de WhatsApp inválido. Mínimo de 10 dígitos (DDD + Número).')
    }
  }

  get id(): string { return this.props.id }
  get slug(): string { return this.props.slug }
  get name(): string { return this.props.name }
  get description(): string | undefined { return this.props.description }
  get logo(): string | undefined { return this.props.logo }
  get banner(): string | undefined { return this.props.banner }
  get phoneWhatsApp(): string { return this.props.phoneWhatsApp }
  get address(): string | undefined { return this.props.address }
  get businessCategory(): BusinessCategory { return this.props.businessCategory }
  get theme(): TenantTheme { return this.props.theme || 'food' }
  get openingHours(): OpeningHours | undefined { return this.props.openingHours }
  get pixConfig(): PixConfig | undefined { return this.props.pixConfig }
  get customDomain(): string | undefined { return this.props.customDomain }
  get deliveryFeeCents(): number { return this.props.deliveryFeeCents || 0 }
  get minOrderValueCents(): number { return this.props.minOrderValueCents || 0 }
  get categories(): unknown[] { return this.props.categories || [] }
  get reviews(): unknown { return this.props.reviews }
  get isActive(): boolean { return this.props.isActive ?? true }
  get createdAt(): Date { return this.props.createdAt || new Date() }
  get updatedAt(): Date { return this.props.updatedAt || new Date() }

  isOpen(referenceDate: Date = new Date()): boolean {
    if (!this.props.openingHours) return true

    const [openH, openM] = this.props.openingHours.open.split(':').map(Number)
    const [closeH, closeM] = this.props.openingHours.close.split(':').map(Number)

    const openMin = openH * 60 + openM
    const closeMin = closeH * 60 + closeM
    const currentMin = referenceDate.getHours() * 60 + referenceDate.getMinutes()

    // Turno Noturno (ex: 18:00 às 03:00)
    if (openMin > closeMin) {
      return currentMin >= openMin || currentMin < closeMin
    }

    // Turno Diurno convencional (ex: 08:00 às 18:00)
    return currentMin >= openMin && currentMin < closeMin
  }

  updateDetails(name: string, description?: string, address?: string): void {
    if (!name || name.trim().length < 2) {
      throw new ValidationError('Nome inválido.')
    }
    this.props.name = name
    this.props.description = description
    this.props.address = address
    this.props.updatedAt = new Date()
  }

  setPixConfig(config: PixConfig): void {
    if (!config.key || config.key.trim().length === 0) {
      throw new ValidationError('A chave Pix não pode ser vazia.')
    }
    this.props.pixConfig = config
    this.props.updatedAt = new Date()
  }

  toJSON(): TenantProps {
    return { ...this.props }
  }
}
