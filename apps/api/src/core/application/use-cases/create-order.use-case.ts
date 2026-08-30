import { ITenantRepository } from '../ports/tenant.repository.port'
import { IOrderRepository } from '../ports/order.repository.port'
import { IPixGateway } from '../ports/pix-gateway.port'
import { Order, DeliveryType, PaymentMethod, OrderItem } from '../../domain/entities/order.entity'
import { Address } from '../../domain/value-objects/address.vo'
import { EntityNotFoundError, ValidationError } from '../../domain/errors/domain.error'

export interface CreateOrderInput {
  tenantSlug: string
  customerName: string
  customerPhone: string
  deliveryType: DeliveryType
  address?: {
    cep?: string
    street: string
    number: string
    neighborhood: string
    city?: string
    state?: string
    complement?: string
    reference?: string
  }
  items: OrderItem[]
  paymentMethod: PaymentMethod
  changeForCents?: number
  isTestCent?: boolean
}

export class CreateOrderUseCase {
  constructor(
    private readonly tenantRepository: ITenantRepository,
    private readonly orderRepository: IOrderRepository,
    private readonly pixGateway: IPixGateway
  ) {}

  async execute(input: CreateOrderInput): Promise<Order> {
    const tenant = await this.tenantRepository.findBySlug(input.tenantSlug)
    if (!tenant || !tenant.isActive) {
      throw new EntityNotFoundError('Tenant', input.tenantSlug)
    }

    let addressVo: Address | undefined
    if (input.deliveryType === 'delivery') {
      if (!input.address) {
        throw new ValidationError('Endereço é obrigatório para entregas.')
      }
      addressVo = new Address(input.address)
    }

    const orderId = `ord-${Date.now()}`
    const order = new Order({
      id: orderId,
      tenantId: tenant.id,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      deliveryType: input.deliveryType,
      address: addressVo,
      items: input.items,
      paymentMethod: input.paymentMethod,
      changeForCents: input.changeForCents,
      deliveryFeeCents: tenant.deliveryFeeCents
    })

    // Se a forma de pagamento for Pix, gera o payload BR Code
    if (input.paymentMethod === 'Pix') {
      const pixKey = tenant.pixConfig?.key || tenant.phoneWhatsApp.replace(/\D/g, '')
      const beneficiary = tenant.pixConfig?.beneficiary || tenant.name
      const city = tenant.pixConfig?.city || 'SAO PAULO'
      const amount = input.isTestCent ? 0.01 : order.calculateTotal().amount

      const brCode = this.pixGateway.generateBrCode({
        key: pixKey,
        beneficiary,
        city,
        amount,
        txid: orderId
      })
      order.setPixCode(brCode)
    }

    await this.orderRepository.save(order)
    return order
  }
}
