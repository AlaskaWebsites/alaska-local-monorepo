import { ValidationError } from '../errors/domain.error';
import { IPasswordHasher } from '../../application/ports/password-hasher.port';

export type MerchantUserRole = 'merchant' | 'admin';

export interface MerchantUserProps {
  id: string;
  tenantId: string;
  tenantSlug: string;
  email: string;
  passwordHash: string;
  name?: string;
  role?: MerchantUserRole;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class MerchantUser {
  private props: MerchantUserProps;

  constructor(props: MerchantUserProps) {
    this.validate(props);
    this.props = {
      ...props,
      email: props.email.trim().toLowerCase(),
      tenantSlug: props.tenantSlug.trim().toLowerCase(),
      role: props.role ?? 'merchant',
      isActive: props.isActive ?? true,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  private validate(props: MerchantUserProps): void {
    if (!props.id || props.id.trim().length === 0) {
      throw new ValidationError('O id do usuário é obrigatório.');
    }
    if (!props.tenantId || props.tenantId.trim().length === 0) {
      throw new ValidationError('O tenantId é obrigatório.');
    }
    if (!props.tenantSlug || props.tenantSlug.trim().length < 2) {
      throw new ValidationError('O slug do estabelecimento é obrigatório.');
    }
    if (!props.email || !props.email.includes('@')) {
      throw new ValidationError('E-mail corporativo inválido.');
    }
    if (!props.passwordHash || props.passwordHash.length === 0) {
      throw new ValidationError('O hash de senha é obrigatório.');
    }
  }

  get id(): string { return this.props.id; }
  get tenantId(): string { return this.props.tenantId; }
  get tenantSlug(): string { return this.props.tenantSlug; }
  get email(): string { return this.props.email; }
  get passwordHash(): string { return this.props.passwordHash; }
  get name(): string | undefined { return this.props.name; }
  get role(): MerchantUserRole { return this.props.role ?? 'merchant'; }
  get isActive(): boolean { return this.props.isActive ?? true; }
  get createdAt(): Date { return this.props.createdAt ?? new Date(); }
  get updatedAt(): Date { return this.props.updatedAt ?? new Date(); }

  async verifyPassword(plainPassword: string, hasher: IPasswordHasher): Promise<boolean> {
    if (!plainPassword || !this.props.isActive) {
      return false;
    }
    return hasher.compare(plainPassword, this.props.passwordHash);
  }

  async updatePassword(newPassword: string, hasher: IPasswordHasher): Promise<void> {
    if (!newPassword || newPassword.length < 8) {
      throw new ValidationError('A nova senha deve ter no mínimo 8 caracteres.');
    }
    this.props.passwordHash = await hasher.hash(newPassword);
    this.props.updatedAt = new Date();
  }

  updateProfile(name?: string): void {
    if (name) {
      if (name.trim().length < 2) {
        throw new ValidationError('Nome deve ter no mínimo 2 caracteres.');
      }
      this.props.name = name.trim();
    }
    this.props.updatedAt = new Date();
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
      tenantId: this.props.tenantId,
      tenantSlug: this.props.tenantSlug,
      email: this.props.email,
      name: this.props.name,
      role: this.props.role,
      isActive: this.props.isActive,
      createdAt: this.props.createdAt?.toISOString(),
      updatedAt: this.props.updatedAt?.toISOString(),
    };
  }
}
