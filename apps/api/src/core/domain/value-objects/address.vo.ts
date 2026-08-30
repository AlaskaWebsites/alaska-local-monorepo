import { ValidationError } from '../errors/domain.error'

export interface AddressProps {
  cep?: string
  street: string
  number: string
  neighborhood: string
  city?: string
  state?: string
  complement?: string
  reference?: string
}

export class Address {
  private readonly props: AddressProps

  constructor(props: AddressProps) {
    if (!props.street || props.street.trim().length === 0) {
      throw new ValidationError('A rua/avenida é obrigatória.')
    }
    if (!props.number || props.number.trim().length === 0) {
      throw new ValidationError('O número do endereço é obrigatório.')
    }
    if (!props.neighborhood || props.neighborhood.trim().length === 0) {
      throw new ValidationError('O bairro é obrigatório.')
    }
    this.props = { ...props }
  }

  get cep(): string | undefined { return this.props.cep }
  get street(): string { return this.props.street }
  get number(): string { return this.props.number }
  get neighborhood(): string { return this.props.neighborhood }
  get city(): string | undefined { return this.props.city }
  get state(): string | undefined { return this.props.state }
  get complement(): string | undefined { return this.props.complement }
  get reference(): string | undefined { return this.props.reference }

  formatFull(): string {
    const comp = this.props.complement ? ` (${this.props.complement})` : ''
    const cityState = this.props.city ? ` - ${this.props.city}/${this.props.state || 'SP'}` : ''
    return `${this.props.street}, ${this.props.number}${comp} - ${this.props.neighborhood}${cityState}`
  }
}
