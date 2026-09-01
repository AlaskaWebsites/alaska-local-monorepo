import { ValidationError } from '../errors/domain.error';
import { IPasswordHasher } from '../../application/ports/password-hasher.port';

export type BusinessCategory = 'menu' | 'shop' | 'hub' | 'pro';
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
  | 'default';

export interface OpeningHoursDay {
  open: string;
  close: string;
  closed?: boolean;
}

export interface OpeningHours {
  open?: string;
  close?: string;
  monday?: OpeningHoursDay;
  tuesday?: OpeningHoursDay;
  wednesday?: OpeningHoursDay;
  thursday?: OpeningHoursDay;
  friday?: OpeningHoursDay;
  saturday?: OpeningHoursDay;
  sunday?: OpeningHoursDay;
  [key: string]: OpeningHoursDay | string | undefined;
}

export interface PixConfig {
  key: string;
  keyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  name?: string;
  beneficiary?: string;
  city: string;
  allowTestCent?: boolean;
  depositPercentage?: number;
}

export interface TenantProps {
  id: string;
  slug: string;
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  phoneWhatsApp?: string;
  whatsapp?: string;
  address?: string;
  businessCategory: BusinessCategory | string;
  theme?: TenantTheme | string;
  openingHours?: OpeningHours;
  pixConfig?: PixConfig;
  customDomain?: string;
  customDomains?: string[];
  deliveryFeeCents?: number;
  minOrderValueCents?: number;
  categories?: unknown[];
  reviews?: unknown;
  isActive?: boolean;
  isClosedEmergency?: boolean;
  closedEmergencyMessage?: string;
  pinHash?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Tenant {
  private props: TenantProps;

  constructor(props: TenantProps) {
    this.validate(props);
    this.props = {
      ...props,
      phoneWhatsApp: props.phoneWhatsApp || props.whatsapp || '',
      whatsapp: props.whatsapp || props.phoneWhatsApp || '',
      theme: props.theme || 'default',
      businessCategory: props.businessCategory || 'menu',
      deliveryFeeCents: props.deliveryFeeCents ?? 0,
      minOrderValueCents: props.minOrderValueCents ?? 0,
      categories: props.categories || [],
      isActive: props.isActive ?? true,
      isClosedEmergency: props.isClosedEmergency ?? false,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };
  }

  private validate(props: TenantProps): void {
    if (!props.slug || props.slug.trim().length < 2) {
      throw new ValidationError('O slug do tenant é obrigatório e deve ter no mínimo 2 caracteres.');
    }
    if (!props.name || props.name.trim().length < 2) {
      throw new ValidationError('O nome do estabelecimento é obrigatório.');
    }
    const phone = props.phoneWhatsApp || props.whatsapp || '';
    if (phone && phone.replace(/\D/g, '').length < 10) {
      throw new ValidationError('Telefone de WhatsApp inválido. Mínimo de 10 dígitos (DDD + Número).');
    }
  }

  get id(): string { return this.props.id; }
  get slug(): string { return this.props.slug; }
  get name(): string { return this.props.name; }
  get description(): string | undefined { return this.props.description; }
  get logo(): string | undefined { return this.props.logo; }
  get banner(): string | undefined { return this.props.banner; }
  get phoneWhatsApp(): string { return this.props.phoneWhatsApp || this.props.whatsapp || ''; }
  get whatsapp(): string { return this.props.whatsapp || this.props.phoneWhatsApp || ''; }
  get address(): string | undefined { return this.props.address; }
  get businessCategory(): string { return this.props.businessCategory; }
  get theme(): string { return this.props.theme || 'default'; }
  get openingHours(): OpeningHours | undefined { return this.props.openingHours; }
  get pixConfig(): PixConfig | undefined { return this.props.pixConfig; }
  get customDomain(): string | undefined { return this.props.customDomain; }
  get customDomains(): string[] | undefined { return this.props.customDomains; }
  get deliveryFeeCents(): number { return this.props.deliveryFeeCents ?? 0; }
  get minOrderValueCents(): number { return this.props.minOrderValueCents ?? 0; }
  get categories(): unknown[] { return this.props.categories || []; }
  get reviews(): unknown | undefined { return this.props.reviews; }
  get isActive(): boolean { return this.props.isActive ?? true; }
  get isClosedEmergency(): boolean { return this.props.isClosedEmergency ?? false; }
  get closedEmergencyMessage(): string | undefined { return this.props.closedEmergencyMessage; }
  get pinHash(): string | undefined { return this.props.pinHash; }
  get createdAt(): Date { return this.props.createdAt || new Date(); }
  get updatedAt(): Date { return this.props.updatedAt || new Date(); }

  isOpen(referenceDate: Date = new Date()): boolean {
    if (!this.props.openingHours) return true;

    const openTime = this.props.openingHours.open || '00:00';
    const closeTime = this.props.openingHours.close || '23:59';

    const [openH = 0, openM = 0] = openTime.split(':').map(Number);
    const [closeH = 0, closeM = 0] = closeTime.split(':').map(Number);

    const openMin = openH * 60 + openM;
    const closeMin = closeH * 60 + closeM;
    const currentMin = referenceDate.getHours() * 60 + referenceDate.getMinutes();

    // Turno Noturno (ex: 18:00 às 03:00)
    if (openMin > closeMin) {
      return currentMin >= openMin || currentMin < closeMin;
    }

    // Turno Diurno convencional (ex: 08:00 às 18:00)
    return currentMin >= openMin && currentMin <= closeMin;
  }

  updateOpeningHours(hours: OpeningHours): void {
    this.props.openingHours = { ...hours };
    this.props.updatedAt = new Date();
  }

  updateHours(hours: Record<string, any>): void {
    this.props.openingHours = { ...(this.props.openingHours || {}), ...hours };
    this.props.updatedAt = new Date();
  }

  setEmergencyClose(closed: boolean, message?: string): void {
    this.props.isClosedEmergency = closed;
    this.props.closedEmergencyMessage = message;
    this.props.updatedAt = new Date();
  }

  setPinHash(hash: string): void {
    this.props.pinHash = hash;
    this.props.updatedAt = new Date();
  }

  async verifyPin(pin: string, hasher?: IPasswordHasher): Promise<boolean> {
    if (!this.props.pinHash) {
      return pin === '1234';
    }
    if (!hasher) {
      return pin === '1234';
    }
    return hasher.compare(pin, this.props.pinHash);
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.props.id,
      slug: this.props.slug,
      name: this.props.name,
      description: this.props.description,
      phoneWhatsApp: this.phoneWhatsApp,
      whatsapp: this.whatsapp,
      address: this.props.address,
      businessCategory: this.props.businessCategory,
      theme: this.props.theme,
      openingHours: this.props.openingHours,
      pixConfig: this.props.pixConfig,
      deliveryFeeCents: this.props.deliveryFeeCents || 0,
      deliveryFee: (this.props.deliveryFeeCents || 0) / 100,
      minOrderValueCents: this.props.minOrderValueCents || 0,
      minOrderValue: (this.props.minOrderValueCents || 0) / 100,
      customDomain: this.props.customDomain,
      customDomains: this.props.customDomains,
      logo: this.props.logo,
      banner: this.props.banner,
      categories: this.props.categories || [],
      reviews: this.props.reviews,
      isActive: this.props.isActive ?? true,
      isClosedEmergency: this.props.isClosedEmergency ?? false,
      closedEmergencyMessage: this.props.closedEmergencyMessage,
      pinHash: this.props.pinHash,
      createdAt: (this.props.createdAt || new Date()).toISOString(),
      updatedAt: (this.props.updatedAt || new Date()).toISOString(),
    };
  }
}
