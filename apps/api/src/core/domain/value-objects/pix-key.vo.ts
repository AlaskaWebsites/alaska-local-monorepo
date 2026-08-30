import { ValidationError } from '../errors/domain.error'

export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'

export class PixKey {
  private readonly key: string
  private readonly type: PixKeyType

  constructor(key: string, type: PixKeyType = 'phone') {
    const cleanKey = (key || '').trim()
    if (!cleanKey) {
      throw new ValidationError('A chave Pix não pode ser vazia.')
    }

    this.type = type
    this.key = type === 'phone' ? cleanKey.replace(/\D/g, '') : cleanKey
  }

  get value(): string { return this.key }
  get keyType(): PixKeyType { return this.type }

  formatDisplay(): string {
    if (this.type === 'phone' && this.key.length === 11) {
      return `(${this.key.slice(0, 2)}) ${this.key.slice(2, 7)}-${this.key.slice(7)}`
    }
    return this.key
  }
}
