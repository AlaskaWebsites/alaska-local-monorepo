export interface GeneratePixBrCodeInput {
  key: string
  beneficiary: string
  city?: string
  amount: number
  txid?: string
}

export interface IPixGateway {
  generateBrCode(input: GeneratePixBrCodeInput): string
  generateQrCodeDataUrl(payload: string): Promise<string>
}
