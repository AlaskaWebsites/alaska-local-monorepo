import { IPixGateway, GeneratePixPayloadInput, PixPayloadResult } from '../../core/application/ports/pix-gateway.port';

function crc16(buffer: string): string {
  let crc = 0xffff;
  for (let i = 0; i < buffer.length; i++) {
    crc ^= buffer.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc = crc << 1;
      }
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}

function formatEmv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

export function generatePixEmv(params: {
  key: string;
  name: string;
  city: string;
  amount: number;
  txid?: string;
}): string {
  const cleanKey = params.key.trim();
  const cleanName = params.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 25);
  const cleanCity = params.city.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 15);
  const cleanTxid = (params.txid || '***').slice(0, 25);
  const formattedAmount = params.amount.toFixed(2);

  const merchantAccountInfo =
    formatEmv('00', 'BR.GOV.BCB.PIX') +
    formatEmv('01', cleanKey);

  const additionalDataField = formatEmv('05', cleanTxid);

  const raw =
    formatEmv('00', '01') +
    formatEmv('01', '12') +
    formatEmv('26', merchantAccountInfo) +
    formatEmv('52', '0000') +
    formatEmv('53', '986') +
    formatEmv('54', formattedAmount) +
    formatEmv('58', 'BR') +
    formatEmv('59', cleanName) +
    formatEmv('60', cleanCity) +
    formatEmv('62', additionalDataField) +
    '6304';

  const checksum = crc16(raw);
  return raw + checksum;
}

export class LocalPixGateway implements IPixGateway {
  async generatePayload(params: GeneratePixPayloadInput): Promise<PixPayloadResult> {
    const emv = generatePixEmv({
      key: params.key,
      name: params.beneficiary || params.name,
      city: params.city,
      amount: params.amount,
      txid: params.txid,
    });

    const base64Data = Buffer.from(emv).toString('base64');
    const qrCodeDataUrl = `data:image/png;base64,${base64Data}`;

    return {
      copiaECola: emv,
      brCode: emv,
      payload: emv,
      qrCodeDataUrl,
      amount: params.amount,
      txid: params.txid || '***',
    };
  }

  async generateQrCode(params: GeneratePixPayloadInput): Promise<PixPayloadResult> {
    return this.generatePayload(params);
  }
}
