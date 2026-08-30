import { ValidationError } from '../errors/domain.error'
import { Money } from '../value-objects/money.vo'
import { Address } from '../value-objects/address.vo'

export type OrderStatus = 'created' | 'pending_payment' | 'confirmed' | 'preparing' | 'dispatched' | 'completed' | 'cancelled'
export type DeliveryType = 'delivery' | 'pickup'
export type PaymentMethod = 'Pix' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro'

export interface OrderItemOption {
  id: string
  name: string
  priceCents: number
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  unitPriceCents: number
  options?: OrderItemOption[]
  observation?: string
}

export interface OrderProps {
  id: string
  tenantId: string
  customerName: string
  customerPhone: string
  deliveryType: DeliveryType
  address?: Address
  items: OrderItem[]
  paymentMethod: PaymentMethod
  changeForCents?: number
  deliveryFeeCents: number
  status?: OrderStatus
  pixCode?: string
  createdAt?: Date
  updatedAt?: Date
}

export class Order {
  private props: OrderProps

  constructor(props: OrderProps) {
    this.validate(props)
    this.props = {
      ...props,
      status: props.status || (props.paymentMethod === 'Pix' ? 'pending_payment' : 'created'),
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date()
    }
  }

  private validate(props: OrderProps): void {
    if (!props.customerName || props.customerName.trim().length < 2) {
      throw new ValidationError('Nome do cliente é obrigatório.')
    }
    if (!props.customerPhone || props.customerPhone.replace(/\D/g, '').length < 10) {
      throw new ValidationError('Telefone WhatsApp de contato é obrigatório.')
    }
    if (!props.items || props.items.length === 0) {
      throw new ValidationError('A sacola do pedido não pode estar vazia.')
    }
    if (props.deliveryType === 'delivery' && !props.address) {
      throw new ValidationError('Endereço de entrega é obrigatório para modalidade Delivery.')
    }
  }

  get id(): string { return this.props.id }
  get tenantId(): string { return this.props.tenantId }
  get customerName(): string { return this.props.customerName }
  get customerPhone(): string { return this.props.customerPhone }
  get deliveryType(): DeliveryType { return this.props.deliveryType }
  get address(): Address | undefined { return this.props.address }
  get items(): OrderItem[] { return this.props.items }
  get paymentMethod(): PaymentMethod { return this.props.paymentMethod }
  get status(): OrderStatus { return this.props.status || 'created' }
  get pixCode(): string | undefined { return this.props.pixCode }
  get createdAt(): Date { return this.props.createdAt || new Date() }

  calculateSubtotal(): Money {
    let subtotal = Money.zero()
    for (const item of this.props.items) {
      let itemPrice = Money.fromCents(item.unitPriceCents)
      if (item.options) {
        for (const opt of item.options) {
          itemPrice = itemPrice.add(Money.fromCents(opt.priceCents))
        }
      }
      subtotal = subtotal.add(itemPrice.multiply(item.quantity))
    }
    return subtotal
  }

  calculateTotal(): Money {
    const subtotal = this.calculateSubtotal()
    if (this.props.deliveryType === 'pickup') {
      return subtotal
    }
    return subtotal.add(Money.fromCents(this.props.deliveryFeeCents))
  }

  confirmPayment(): void {
    if (this.props.status === 'cancelled') {
      throw new ValidationError('Não é possível confirmar pagamento de um pedido cancelado.')
    }
    this.props.status = 'confirmed'
    this.props.updatedAt = new Date()
  }

  setPixCode(code: string): void {
    this.props.pixCode = code
  }
}
