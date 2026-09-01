import { ITenantRepository } from '../ports/tenant.repository.port';
import { IPixGateway } from '../ports/pix-gateway.port';
import { EntityNotFoundError, ValidationError } from '../../domain/errors/domain.error';

export interface CalculatePixPayloadInput {
  tenantSlug: string;
  amount: number;
  isTestCent?: boolean;
  testCent?: boolean;
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

    const isTestMode = Boolean(input.isTestCent || input.testCent);
    const finalAmount = isTestMode ? 0.01 : input.amount;

    const payloadInput = {
      key: tenant.pixConfig.key,
      keyType: tenant.pixConfig.keyType,
      name: tenant.pixConfig.name || tenant.name,
      beneficiary: tenant.pixConfig.beneficiary || tenant.pixConfig.name || tenant.name,
      city: tenant.pixConfig.city || 'São Paulo',
      amount: finalAmount,
      txid: input.txid,
    };

    let gatewayResult: any = null;
    const gw = this.pixGateway as any;

    if (typeof gw.generatePayload === 'function') {
      gatewayResult = await gw.generatePayload(payloadInput);
    } else if (typeof gw.generateQrCode === 'function') {
      gatewayResult = await gw.generateQrCode(payloadInput);
    }

    const copiaECola = gatewayResult?.copiaECola || gatewayResult?.brCode || gatewayResult?.payload || '';
    const qrCodeDataUrl = gatewayResult?.qrCodeDataUrl || gatewayResult?.qrCode || '';

    return {
      pixKey: tenant.pixConfig.key,
      keyType: tenant.pixConfig.keyType,
      beneficiary: tenant.pixConfig.beneficiary || tenant.pixConfig.name || tenant.name,
      city: tenant.pixConfig.city || 'São Paulo',
      amount: finalAmount,
      isTestMode,
      copiaECola,
      brCode: copiaECola,
      qrCodeDataUrl,
      txid: gatewayResult?.txid || input.txid || '***',
    };
  }
}
