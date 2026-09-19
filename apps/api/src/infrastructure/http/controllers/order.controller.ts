import { Controller, Post, Get, Patch, Param, Body, UsePipes } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger'
import { CreateOrderUseCase } from '@core/application/use-cases/create-order.use-case'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { TOKENS } from '@core/application/tokens'
import { Inject } from '@nestjs/common'
import { IOrderRepository } from '@core/application/ports/order.repository.port'
import { EntityNotFoundError } from '@core/domain/errors/domain.error'
import { UpdateOrderStatusSchema, type UpdateOrderStatusDto } from '@alaska/contracts'

const CreateOrderDtoSchema = z.object({
  tenantSlug: z.string().min(1, 'Slug do tenant é obrigatório'),
  customerName: z.string().min(1, 'Nome do cliente é obrigatório'),
  customerPhone: z.string().min(10, 'WhatsApp deve conter DDD e número'),
  deliveryType: z.enum(['delivery', 'pickup']),
  address: z
    .object({
      street: z.string(),
      number: z.string(),
      neighborhood: z.string(),
      city: z.string(),
      state: z.string(),
      complement: z.string().optional(),
      reference: z.string().optional(),
      cep: z.string().optional(),
    })
    .optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        productName: z.string(),
        quantity: z.number().int().positive(),
        unitPriceCents: z.number().int().nonnegative(),
        options: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              priceCents: z.number().int().nonnegative(),
            }),
          )
          .optional()
          .default([]),
        notes: z.string().optional(),
      }),
    )
    .min(1, 'Ao menos um item deve ser adicionado ao pedido'),
  paymentMethod: z.enum(['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro']),
  changeForCents: z.number().int().positive().optional(),
  notes: z.string().optional(),
  isTestCent: z.boolean().optional(),
})

type CreateOrderDto = z.infer<typeof CreateOrderDtoSchema>

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    @Inject(TOKENS.ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Cria novo pedido de delivery ou retirada',
    description: 'Processa o pedido, valida os itens, calcula taxas e retorna os dados da comanda gerada.',
  })
  @UsePipes(new ZodValidationPipe(CreateOrderDtoSchema))
  async create(@Body() dto: CreateOrderDto) {
    const order = await this.createOrderUseCase.execute(dto as any)
    return {
      success: true,
      data: {
        id: order.id,
        tenantId: order.tenantId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryType: order.deliveryType,
        total: order.calculateTotal().amount,
        status: order.status,
        pixCode: order.pixCode,
        createdAt: order.createdAt,
      },
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Busca os detalhes de um pedido por ID',
    description: 'Retorna a comanda completa com itens, dados de entrega e status.',
  })
  @ApiParam({ name: 'id', description: 'ID do pedido', example: 'ord-1724935200000' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado com sucesso' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado (RFC 7807)' })
  async getById(@Param('id') id: string) {
    const order = await this.orderRepository.findById(id)
    if (!order) {
      throw new EntityNotFoundError('Order', id)
    }
    return {
      success: true,
      data: {
        id: order.id,
        tenantId: order.tenantId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryType: order.deliveryType,
        address: order.address
          ? {
              street: order.address.street,
              number: order.address.number,
              neighborhood: order.address.neighborhood,
              city: order.address.city,
              state: order.address.state,
              complement: order.address.complement,
              reference: order.address.reference,
              cep: order.address.cep,
            }
          : null,
        items: (order.items || []).map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          unitPriceCents: i.unitPrice?.cents ?? 0,
          unitPrice: i.unitPrice?.amount ?? 0,
          options: (i.options || []).map((o) => ({
            id: o.id,
            name: o.name,
            priceCents: o.price?.cents ?? 0,
            price: o.price?.amount ?? 0,
          })),
          notes: i.notes,
        })),
        paymentMethod: order.paymentMethod,
        subtotal: order.calculateSubtotal().amount,
        deliveryFee: order.deliveryFee?.amount ?? 0,
        total: order.calculateTotal().amount,
        status: order.status,
        pixCode: order.pixCode,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    }
  }

  @Get('tenant/:tenantId')
  @ApiOperation({
    summary: 'Lista pedidos de um estabelecimento específico para o Mural de Pedidos',
    description: 'Retorna todos os pedidos registrados com itens, endereços e valores para acompanhamento operacional do lojista (ADR 024).',
  })
  @ApiParam({ name: 'tenantId', description: 'ID ou slug do estabelecimento', example: 'hamburgueria-x' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos retornada com sucesso' })
  async listByTenant(@Param('tenantId') tenantId: string) {
    const orders = await this.orderRepository.listByTenant(tenantId)
    return {
      success: true,
      data: orders.map((order) => ({
        id: order.id,
        tenantId: order.tenantId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryType: order.deliveryType,
        address: order.address
          ? {
              street: order.address.street,
              number: order.address.number,
              neighborhood: order.address.neighborhood,
              city: order.address.city,
              state: order.address.state,
              complement: order.address.complement,
              reference: order.address.reference,
              cep: order.address.cep,
            }
          : null,
        items: (order.items || []).map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
          unitPriceCents: i.unitPrice?.cents ?? 0,
          unitPrice: i.unitPrice?.amount ?? 0,
          options: (i.options || []).map((o) => ({
            id: o.id,
            name: o.name,
            priceCents: o.price?.cents ?? 0,
            price: o.price?.amount ?? 0,
          })),
          notes: i.notes,
        })),
        paymentMethod: order.paymentMethod,
        subtotal: order.calculateSubtotal().amount,
        deliveryFee: order.deliveryFee?.amount ?? 0,
        total: order.calculateTotal().amount,
        status: order.status,
        pixCode: order.pixCode,
        notes: order.notes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
    }
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Atualiza o status operacional do pedido em tempo real',
    description: 'Avança o pedido na esteira de produção (created -> pending_payment -> confirmed -> preparing -> dispatched -> completed / cancelled).',
  })
  @ApiParam({ name: 'id', description: 'ID único do pedido', example: 'ord-1724935200000' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['created', 'pending_payment', 'confirmed', 'preparing', 'dispatched', 'completed', 'cancelled'],
          example: 'preparing',
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({ status: 200, description: 'Status do pedido atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado (RFC 7807)' })
  async updateStatus(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateOrderStatusSchema)) dto: UpdateOrderStatusDto,
  ) {
    const order = await this.orderRepository.findById(id)
    if (!order) {
      throw new EntityNotFoundError('Order', id)
    }
    order.updateStatus(dto.status)
    await this.orderRepository.save(order)
    return {
      success: true,
      message: `Status do pedido ${id} atualizado para ${dto.status}.`,
      data: {
        id: order.id,
        status: order.status,
        updatedAt: order.updatedAt,
      },
    }
  }
}
