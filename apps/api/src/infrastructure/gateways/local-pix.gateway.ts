import { IPixGateway, GeneratePixBrCodeInput } from '@core/application/ports/pix-gateway.port'
import * as QRCode from 'qrcode'

export class LocalPixGateway implements IPixGateway {
  generateBrCode(input: GeneratePixBrCodeInput): string {
    const key = (input.key || '').trim()
    const name = this.sanitize(input.beneficiary || 'Alaska Local', 25) || 'Alaska Local'
    const city = this.sanitize(input.city || 'SAO PAULO', 15) || 'SAO PAULO'
    const txid = this.sanitize(input.txid || '***', 25) || '***'

    const tag00 = this.formatTlv(0, '01')
    const gui = this.formatTlv(0, 'br.gov.bcb.pix')
    const keyTag = this.formatTlv(1, key)
    const tag26 = this.formatTlv(26, `${gui}${keyTag}`)
    const tag52 = this.formatTlv(52, '0000')
    const tag53 = this.formatTlv(53, '986')

    let tag54 = ''
    if (typeof input.amount === 'number' && input.amount > 0) {
      tag54 = this.formatTlv(54, input.amount.toFixed(2))
    }

    const tag58 = this.formatTlv(58, 'BR')
    const tag59 = this.formatTlv(59, name)
    const tag60 = this.formatTlv(60, city)
    const tag62 = this.formatTlv(62, this.formatTlv(5, txid))

    const raw = `${tag00}${tag26}${tag52}${tag53}${tag54}${tag58}${tag59}${tag60}${tag62}6304`
    const crc = this.crc16(raw)
    return `${raw}${crc}`
  }

  async generateQrCodeDataUrl(payload: string): Promise<string> {
    try {
      return await QRCode.toDataURL(payload, {
        margin: 1,
        width: 320,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      })
    } catch {
      return ''
    }
  }

  private sanitize(text: string, maxLen: number): string {
    return (text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .slice(0, maxLen)
      .trim()
  }

  private formatTlv(tag: number, val: string): string {
    const t = tag.toString().padStart(2, '0')
    const len = new TextEncoder().encode(val).length.toString().padStart(2, '0')
    return `${t}${len}${val}`
  }

  private crc16(payload: string): string {
    let crc = 0xffff
    const bytes = new TextEncoder().encode(payload)
    for (let i = 0; i < bytes.length; i++) {
      crc ^= bytes[i] << 8
      for (let j = 0; j < 8; j++) {
        if ((crc & 0x8000) !== 0) {
          crc = ((crc << 1) ^ 0x1021) & 0xffff
        } else {
          crc = (crc << 1) & 0xffff
        }
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0')
  }
}
