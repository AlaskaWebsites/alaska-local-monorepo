import { ITenantRepository } from '../ports/tenant.repository.port'
import { IPasswordHasher } from '../ports/password-hasher.port'
import { EntityNotFoundError, ValidationError } from '../../domain/errors/domain.error'

export interface ChangeAdminPinInput {
  slug: string
  newPin: string
  currentPin?: string
}

export interface ChangeAdminPinResponse {
  success: boolean
  message: string
}

export class ChangeAdminPinUseCase {
  constructor(
    private readonly tenantRepository: ITenantRepository,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(input: ChangeAdminPinInput): Promise<ChangeAdminPinResponse> {
    const tenant = await this.tenantRepository.findBySlug(input.slug)
    if (!tenant) {
      throw new EntityNotFoundError('Tenant', input.slug)
    }

    if (!input.newPin || input.newPin.length < 4 || input.newPin.length > 8) {
      throw new ValidationError('O novo PIN deve ter entre 4 e 8 dígitos.')
    }

    const isValid = await tenant.verifyPin(input.currentPin || '1234', this.passwordHasher)
    if (!isValid) {
      throw new ValidationError('PIN atual incorreto.')
    }

    const hashed = await this.passwordHasher.hash(input.newPin)
    tenant.setPinHash(hashed)
    await this.tenantRepository.save(tenant)

    return {
      success: true,
      message: 'PIN administrativo alterado com sucesso.'
    }
  }
}
