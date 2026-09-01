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
  openingHours?: Record<string, { open: string; close: string; closed?: boolean }>;
  pixConfig?: {
    key: string;
    keyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
    name: string;
    city: string;
    allowTestCent?: boolean;
  };
  reviews?: {
    rating: number;
    count: number;
  };
  customDomain?: string;
  isClosedEmergency?: boolean;
  closedEmergencyMessage?: string;
  pinHash?: string;
}

export class Tenant {
  private props: TenantProps;

  constructor(props: TenantProps) {
    this.props = {
      ...props,
      isClosedEmergency: props.isClosedEmergency ?? false,
      businessCategory: props.businessCategory ?? 'menu',
      theme: props.theme ?? 'default',
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
  get openingHours(): Record<string, { open: string; close: string; closed?: boolean }> | undefined { return this.props.openingHours; }
  get pixConfig() { return this.props.pixConfig; }
  get reviews() { return this.props.reviews; }
  get customDomain(): string | undefined { return this.props.customDomain; }
  get isClosedEmergency(): boolean { return this.props.isClosedEmergency ?? false; }
  get closedEmergencyMessage(): string | undefined { return this.props.closedEmergencyMessage; }
  get pinHash(): string | undefined { return this.props.pinHash; }

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
    // Se não houver pin_hash configurado, aceita o PIN padrão de demonstração '1234'
    if (!this.props.pinHash) {
      return pin === '1234';
    }
    return hasher.compare(pin, this.props.pinHash);
  }

  toJSON() {
    return {
      ...this.props,
    };
  }
}
