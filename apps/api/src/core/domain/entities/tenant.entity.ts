import { PixKey } from '../value-objects/pix-key.vo'
import { Money } from '../value-objects/money.vo'

export interface OpeningHoursDay {
  open: string
  close: string
  closed?: boolean
}

export interface OpeningHours {
  open?: string  // HH:mm
  close?: string // HH:mm
  monday?: OpeningHoursDay
  tuesday?: OpeningHoursDay
  wednesday?: OpeningHoursDay
  thursday?: OpeningHoursDay
  friday?: OpeningHoursDay
  saturday?: OpeningHoursDay
  sunday?: OpeningHoursDay
}

export interface TenantProps {
  id: string
  slug: string
  name: string
  description?: string
  phoneWhatsApp?: string
  address?: string
  businessCategory: string
  theme: string
  openingHours?: OpeningHours
  pixKey?: PixKey
  isActive: boolean
  deliveryFee: Money
  minOrderValue: Money
  customDomain?: string
  logo?: string
  banner?: string
  categories?: unknown[]
  reviews?: unknown
  createdAt: Date
  updatedAt: Date
}

export class Tenant {
  private props: TenantProps

  constructor(props: TenantProps) {
    this.props = { ...props }
  }

  get id(): string { return this.props.id }
  get slug(): string { return this.props.slug }
  get name(): string { return this.props.name }
  get description(): string | undefined { return this.props.description }
  get phoneWhatsApp(): string | undefined { return this.props.phoneWhatsApp }
  get address(): string | undefined { return this.props.address }
  get businessCategory(): string { return this.props.businessCategory }
  get theme(): string { return this.props.theme }
  get openingHours(): OpeningHours | undefined { return this.props.openingHours }
  get pixKey(): PixKey | undefined { return this.props.pixKey }
  get isActive(): boolean { return this.props.isActive }
  get deliveryFee(): Money { return this.props.deliveryFee }
  get minOrderValue(): Money { return this.props.minOrderValue }
  get customDomain(): string | undefined { return this.props.customDomain }
  get logo(): string | undefined { return this.props.logo }
  get banner(): string | undefined { return this.props.banner }
  get categories(): unknown[] | undefined { return this.props.categories }
  get reviews(): unknown | undefined { return this.props.reviews }
  get createdAt(): Date { return this.props.createdAt }
  get updatedAt(): Date { return this.props.updatedAt }

  isOpen(referenceDate: Date = new Date()): boolean {
    if (!this.props.openingHours) return true

    const openTime = this.props.openingHours.open || '00:00'
    const closeTime = this.props.openingHours.close || '23:59'

    const [openH = 0, openM = 0] = openTime.split(':').map(Number)
    const [closeH = 0, closeM = 0] = closeTime.split(':').map(Number)

    const openMin = openH * 60 + openM
    const closeMin = closeH * 60 + closeM
    const currentMin = referenceDate.getHours() * 60 + referenceDate.getMinutes()

    // Turno Noturno (ex: 18:00 às 03:00)
    if (openMin > closeMin) {
      return currentMin >= openMin || currentMin < closeMin
    }

    // Turno Diurno convencional (ex: 08:00 às 18:00)
    return currentMin >= openMin && currentMin <= closeMin
  }

  updateOpeningHours(hours: OpeningHours): void {
    this.props.openingHours = { ...hours }
    this.props.updatedAt = new Date()
  }

  updateDetails(details: {
    name?: string
    description?: string
    phoneWhatsApp?: string
    address?: string
    logo?: string
    banner?: string
    deliveryFee?: Money
    minOrderValue?: Money
  }): void {
    if (details.name !== undefined) this.props.name = details.name
    if (details.description !== undefined) this.props.description = details.description
    if (details.phoneWhatsApp !== undefined) this.props.phoneWhatsApp = details.phoneWhatsApp
    if (details.address !== undefined) this.props.address = details.address
    if (details.logo !== undefined) this.props.logo = details.logo
    if (details.banner !== undefined) this.props.banner = details.banner
    if (details.deliveryFee !== undefined) this.props.deliveryFee = details.deliveryFee
    if (details.minOrderValue !== undefined) this.props.minOrderValue = details.minOrderValue
    this.props.updatedAt = new Date()
  }

  deactivate(): void {
    this.props.isActive = false
    this.props.updatedAt = new Date()
  }

  activate(): void {
    this.props.isActive = true
    this.props.updatedAt = new Date()
  }

  toJSON() {
    return {
      id: this.props.id,
      slug: this.props.slug,
      name: this.props.name,
      description: this.props.description,
      phoneWhatsApp: this.props.phoneWhatsApp,
      address: this.props.address,
      businessCategory: this.props.businessCategory,
      theme: this.props.theme,
      openingHours: this.props.openingHours,
      pixConfig: this.props.pixKey ? {
        key: this.props.pixKey.value,
        keyType: this.props.pixKey.type,
        name: this.props.pixKey.beneficiaryName,
        beneficiary: this.props.pixKey.beneficiaryName,
        city: this.props.pixKey.city,
      } : undefined,
      deliveryFee: this.props.deliveryFee.amount,
      deliveryFeeCents: this.props.deliveryFee.inCents,
      minOrderValue: this.props.minOrderValue.amount,
      minOrderValueCents: this.props.minOrderValue.inCents,
      customDomain: this.props.customDomain,
      logo: this.props.logo,
      banner: this.props.banner,
      categories: this.props.categories || [],
      reviews: this.props.reviews,
      isActive: this.props.isActive,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    }
  }
}
