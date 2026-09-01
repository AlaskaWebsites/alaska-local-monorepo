export interface GeneratePixPayloadInput {
  key: string;
  keyType?: string;
  name: string;
  beneficiary?: string;
  city: string;
  amount: number;
  txid?: string;
}

export interface PixPayloadResult {
  copiaECola?: string;
  brCode?: string;
  payload?: string;
  qrCodeDataUrl: string;
  amount?: number;
  txid?: string;
}

export interface IPixGateway {
  generatePayload(input: GeneratePixPayloadInput): Promise<PixPayloadResult>;
  generateQrCode(input: GeneratePixPayloadInput): Promise<PixPayloadResult>;
}
