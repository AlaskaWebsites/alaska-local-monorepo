import { ITenantRepository } from '../ports/tenant.repository.port';
import { IPixGateway } from '../ports/pix-gateway.port';
import { EntityNotFoundError, ValidationError } from '../../domain/errors/domain.error';

export interface CalculatePixPayloadInput {
  tenantSlug: string;
  amount: number;
  isTestCent?: boolean;
  txid?: string;
}

export class CalculatePixPayloadUseCase {
  constructor(
    private readonly tenantRepository: ITenantRepository,
    private readonly pixGateway: IPixGateway,
  ) {}

  async execute(input: CalculatePixPayloadInput) {
    if (input.amount <= 0) {
      throw new ValidationError('O valor para geração do Pix deve ser maior que zero.');
    }

    const tenant = await this.tenantRepository.findBySlug(input.tenantSlug);
    if (!tenant) {
      throw new EntityNotFoundError('Tenant', input.tenantSlug);
    }

    if (!tenant.pixConfig || !tenant.pixConfig.key) {
      throw new ValidationError(`O estabelecimento ${tenant.name} não possui chave Pix configurada.`);
    }

    const finalAmount = input.isTestCent && tenant.pixConfig.allowTestCent ? 0.01 : input.amount;

    const payloadInput = {
      key: tenant.pixConfig.key,
      keyType: tenant.pixConfig.keyType,
      name: tenant.pixConfig.name || tenant.name,
      city: tenant.pixConfig.city || 'São Paulo',
      amount: finalAmount,
      txid: input.txid,
    };

    if (typeof (this.pixGateway as any).generatePayload === 'function') {
      return (this.pixGateway as any).generatePayload(payloadInput);
    }

    if (typeof (this.pixGateway as any).generateQrCode === 'function') {
      return (this.pixGateway as any).generateQrCode(payloadInput);
    }

    if (typeof (this.pixGateway as any).createQrCode === 'function') {
      return (this.pixGateway as any).createQrCode(payloadInput);
    }

    return null;
  }
}
