import { IMerchantUserRepository } from '../ports/merchant-user.repository.port';
import { IPasswordHasher } from '../ports/password-hasher.port';
import { EntityNotFoundError, ValidationError } from '../../domain/errors/domain.error';

export interface ChangeMerchantPasswordInput {
  userId: string;
  tenantSlug: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangeMerchantPasswordOutput {
  success: boolean;
  message: string;
}

export class ChangeMerchantPasswordUseCase {
  constructor(
    private readonly merchantUserRepository: IMerchantUserRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: ChangeMerchantPasswordInput): Promise<ChangeMerchantPasswordOutput> {
    if (input.newPassword !== input.confirmPassword) {
      throw new ValidationError('A nova senha e a confirmação não coincidem.');
    }
    if (input.newPassword.length < 8) {
      throw new ValidationError('A nova senha deve ter no mínimo 8 caracteres.');
    }

    const user = await this.merchantUserRepository.findById(input.userId);
    if (!user) {
      throw new EntityNotFoundError('MerchantUser', input.userId);
    }

    const isCurrentValid = await user.verifyPassword(input.currentPassword, this.passwordHasher);
    if (!isCurrentValid) {
      throw new ValidationError('A senha atual está incorreta.');
    }

    await user.updatePassword(input.newPassword, this.passwordHasher);
    await this.merchantUserRepository.update(user);

    return {
      success: true,
      message: 'Senha alterada com sucesso.',
    };
  }
}
