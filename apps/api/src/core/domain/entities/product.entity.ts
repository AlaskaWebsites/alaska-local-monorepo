import { ValidationError } from '../errors/domain.error'
import { Money } from '../value-objects/money.vo'

export interface Option {
  id: string
  name: string
  priceCents: number
}

export interface OptionGroup {
  id: string
  title: string
  required: boolean
  min: number
  max: number
  options: Option[]
}

export interface ProductProps {
  id: string
  tenantId: string
  categoryId: string
  name: string
  description?: string
  priceCents: number
  imageUrl?: string
  isAvailable?: boolean
  optionGroups?: OptionGroup[]
  createdAt?: Date
}

export class Product {
  private props: ProductProps

  constructor(props: ProductProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new ValidationError('O nome do produto é obrigatório.')
    }
    if (props.priceCents < 0) {
      throw new ValidationError('O preço do produto não pode ser negativo.')
    }
    this.props = {
      ...props,
      isAvailable: props.isAvailable ?? true,
      optionGroups: props.optionGroups || [],
      createdAt: props.createdAt || new Date()
    }
  }

  get id(): string { return this.props.id }
  get tenantId(): string { return this.props.tenantId }
  get categoryId(): string { return this.props.categoryId }
  get name(): string { return this.props.name }
  get description(): string | undefined { return this.props.description }
  get price(): Money { return Money.fromCents(this.props.priceCents) }
  get imageUrl(): string | undefined { return this.props.imageUrl }
  get isAvailable(): boolean { return this.props.isAvailable ?? true }
  get optionGroups(): OptionGroup[] { return this.props.optionGroups || [] }
  get createdAt(): Date | undefined { return this.props.createdAt }

  calculateItemTotal(selectedOptionIds: string[], quantity: number = 1): Money {
    if (quantity < 1) throw new ValidationError('A quantidade mínima é 1.')

    let total = this.price
    for (const group of this.optionGroups) {
      for (const opt of group.options) {
        if (selectedOptionIds.includes(opt.id)) {
          total = total.add(Money.fromCents(opt.priceCents))
        }
      }
    }
    return total.multiply(quantity)
  }
}
