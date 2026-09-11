import { IPasswordHasher } from '../../application/ports/password-hasher.port';

export interface TenantProps {
  id: string;
  name: string;
  slug: string;
  category?: string;
  businessCategory: 'menu' | 'shop' | 'hub' | 'pro';
  theme: string;
  banner?: string;
  logo?: string;
  whatsapp: string;
  phoneWhatsApp?: string;
  address?: string;
  description?: string;
  openingHours?: Record<string, { open: string; close: string; closed?: boolean }>;
  pixConfig?: {
    key: string;
    keyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
    name?: string;
    beneficiary?: string;
    city: string;
    allowTestCent?: boolean;
    depositPercentage?: number;
  };
  reviews?: {
    rating?: number;
    count?: number;
    score?: number;
    totalReviews?: number;
  };
  customDomain?: string;
  isClosedEmergency?: boolean;
  closedEmergencyMessage?: string;
  pinHash?: string;
  deliveryFeeCents?: number;
  minOrderValueCents?: number;
  categories?: any[];
  professionals?: any[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Tenant {
  private props: TenantProps;

  constructor(props: TenantProps) {
    this.props = {
      ...props,
      whatsapp: props.whatsapp || props.phoneWhatsApp || '11999999999',
      phoneWhatsApp: props.phoneWhatsApp || props.whatsapp || '11999999999',
      isClosedEmergency: props.isClosedEmergency ?? false,
      businessCategory: props.businessCategory ?? 'menu',
      theme: props.theme ?? 'default',
      categories: props.categories || []
    };
  }

  get id(): string { return this.props.id; }
  get name(): string { return this.props.name; }
  get slug(): string { return this.props.slug; }
  get category(): string | undefined { return this.props.category; }
  get businessCategory(): 'menu' | 'shop' | 'hub' | 'pro' { return this.props.businessCategory; }
  get theme(): string { return this.props.theme; }
  get banner(): string | undefined { return this.props.banner; }
  get logo(): string | undefined { return this.props.logo; }
  get whatsapp(): string { return this.props.whatsapp; }
  get phoneWhatsApp(): string { return this.props.phoneWhatsApp || this.props.whatsapp; }
  get address(): string | undefined { return this.props.address; }
  get description(): string | undefined { return this.props.description; }
  get openingHours(): Record<string, { open: string; close: string; closed?: boolean }> | undefined { return this.props.openingHours; }
  get pixConfig() { return this.props.pixConfig; }
  get reviews() { return this.props.reviews; }
  get customDomain(): string | undefined { return this.props.customDomain; }
  get isClosedEmergency(): boolean { return this.props.isClosedEmergency ?? false; }
  get closedEmergencyMessage(): string | undefined { return this.props.closedEmergencyMessage; }
  get pinHash(): string | undefined { return this.props.pinHash; }
  get categories(): any[] { return this.props.categories || []; }
  get professionals(): any[] { return this.props.professionals || []; }
  get deliveryFeeCents(): number { return this.props.deliveryFeeCents || 0; }
  get minOrderValueCents(): number { return this.props.minOrderValueCents || 0; }
  get isActive(): boolean { return this.props.isActive ?? true; }
  get createdAt(): Date { return this.props.createdAt || new Date(); }
  get updatedAt(): Date { return this.props.updatedAt || new Date(); }

  updateHours(hours: Record<string, { open: string; close: string; closed?: boolean }>): void {
    this.props.openingHours = hours;
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
      whatsapp: this.props.whatsapp || this.props.phoneWhatsApp || '11999999999',
      phoneWhatsApp: this.props.phoneWhatsApp || this.props.whatsapp || '11999999999',
      categories: this.props.categories || [],
      deliveryFee: (this.props.deliveryFeeCents || 0) / 100,
      minOrderValue: (this.props.minOrderValueCents || 0) / 100,
    };
  }
}
