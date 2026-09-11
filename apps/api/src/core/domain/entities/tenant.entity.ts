import { IPasswordHasher } from '../../application/ports/password-hasher.port';
import { ValidationError } from '../errors/domain.error';

export type BusinessCategory = 'menu' | 'shop' | 'hub' | 'pro';
export type TenantTheme = 'food' | 'barber' | 'health' | 'drinks' | 'rose' | 'amber' | 'violet' | 'blue' | 'emerald' | 'slate' | 'default' | string;

export interface OpeningHoursDay {
  open: string;
  close: string;
  closed?: boolean;
}

export interface OpeningHours {
  open?: string;
  close?: string;
  closed?: boolean;
  monday?: OpeningHoursDay | { open: string; close: string; closed?: boolean };
  tuesday?: OpeningHoursDay | { open: string; close: string; closed?: boolean };
  wednesday?: OpeningHoursDay | { open: string; close: string; closed?: boolean };
  thursday?: OpeningHoursDay | { open: string; close: string; closed?: boolean };
  friday?: OpeningHoursDay | { open: string; close: string; closed?: boolean };
  saturday?: OpeningHoursDay | { open: string; close: string; closed?: boolean };
  sunday?: OpeningHoursDay | { open: string; close: string; closed?: boolean };
  [key: string]: any;
}

export interface PixConfig {
  key?: string;
  pixKey?: string;
  keyType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random' | string;
  name?: string;
  beneficiary?: string;
  city?: string;
  allowTestCent?: boolean;
  depositPercentage?: number;
  enabled?: boolean;
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
  businessCategory?: BusinessCategory | string;
  category?: string;
  theme?: TenantTheme | string;
  openingHours?: OpeningHours | Record<string, any>;
  pixConfig?: PixConfig | Record<string, any>;
  customDomain?: string;
  customDomains?: string[];
  deliveryFeeCents?: number;
  minOrderValueCents?: number;
  categories?: any[];
  reviews?: any;
  professionals?: any[];
  isClosedEmergency?: boolean;
  closedEmergencyMessage?: string;
  pinHash?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Tenant {
  private props: TenantProps;

  constructor(props: TenantProps) {
    this.validate(props);
    const phone = props.phoneWhatsApp || props.whatsapp || '11999999999';
    this.props = {
      ...props,
      phoneWhatsApp: phone,
      whatsapp: phone,
      theme: props.theme || 'default',
      businessCategory: (props.businessCategory || 'menu') as BusinessCategory,
      deliveryFeeCents: props.deliveryFeeCents || 0,
      minOrderValueCents: props.minOrderValueCents || 0,
      categories: props.categories || [],
      customDomains: props.customDomains || (props.customDomain ? [props.customDomain] : []),
      isClosedEmergency: props.isClosedEmergency ?? false,
      isActive: props.isActive ?? true,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date()
    };
  }

  private validate(props: TenantProps): void {
    if (!props.slug || props.slug.trim().length < 2) {
      throw new ValidationError('O slug do tenant é obrigatório e deve ter no mínimo 2 caracteres.');
    }
    if (!props.name || props.name.trim().length < 2) {
      throw new ValidationError('O nome do estabelecimento é obrigatório.');
    }
  }

  get id(): string { return this.props.id; }
  get slug(): string { return this.props.slug; }
  get name(): string { return this.props.name; }
  get description(): string | undefined { return this.props.description; }
  get logo(): string | undefined { return this.props.logo; }
  get banner(): string | undefined { return this.props.banner; }
  get phoneWhatsApp(): string { return this.props.phoneWhatsApp || this.props.whatsapp || '11999999999'; }
  get whatsapp(): string { return this.props.whatsapp || this.props.phoneWhatsApp || '11999999999'; }
  get address(): string | undefined { return this.props.address; }
  get businessCategory(): BusinessCategory { return (this.props.businessCategory || 'menu') as BusinessCategory; }
  get category(): string | undefined { return this.props.category; }
  get theme(): string { return this.props.theme || 'default'; }
  get openingHours(): OpeningHours | undefined { return this.props.openingHours; }
  get pixConfig(): PixConfig | undefined { return this.props.pixConfig; }
  get customDomain(): string | undefined { return this.props.customDomain; }
  get customDomains(): string[] { return this.props.customDomains || (this.props.customDomain ? [this.props.customDomain] : []); }
  get deliveryFeeCents(): number { return this.props.deliveryFeeCents || 0; }
  get minOrderValueCents(): number { return this.props.minOrderValueCents || 0; }
  get categories(): any[] { return this.props.categories || []; }
  get reviews(): any { return this.props.reviews; }
  get professionals(): any[] { return this.props.professionals || []; }
  get isClosedEmergency(): boolean { return this.props.isClosedEmergency ?? false; }
  get closedEmergencyMessage(): string | undefined { return this.props.closedEmergencyMessage; }
  get pinHash(): string | undefined { return this.props.pinHash; }
  get isActive(): boolean { return this.props.isActive ?? true; }
  get createdAt(): Date { return this.props.createdAt || new Date(); }
  get updatedAt(): Date { return this.props.updatedAt || new Date(); }

  isOpen(referenceDate: Date = new Date()): boolean {
    if (this.props.isClosedEmergency) return false;
    if (!this.props.openingHours) return true;

    const openTime = (this.props.openingHours as any).open || '00:00';
    const closeTime = (this.props.openingHours as any).close || '23:59';

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

  updateOpeningHours(hours: any): void {
    this.props.openingHours = hours;
    this.props.updatedAt = new Date();
  }

  updateHours(hours: any): void {
    this.updateOpeningHours(hours);
  }

  setEmergencyClose(closed: boolean, message?: string): void {
    this.props.isClosedEmergency = closed;
    this.props.closedEmergencyMessage = message;
  }

  setPinHash(hash: string): void {
    this.props.pinHash = hash;
  }

  async verifyPin(pin: string, hasher: IPasswordHasher): Promise<boolean> {
    if (!this.props.pinHash) {
      return pin === '1234';
    }
    return hasher.compare(pin, this.props.pinHash);
  }

  toJSON() {
    return {
      ...this.props,
      whatsapp: this.phoneWhatsApp,
      phoneWhatsApp: this.phoneWhatsApp,
      categories: this.props.categories || [],
      deliveryFee: (this.props.deliveryFeeCents || 0) / 100,
      minOrderValue: (this.props.minOrderValueCents || 0) / 100,
      isOpen: this.isOpen()
    };
  }
}
