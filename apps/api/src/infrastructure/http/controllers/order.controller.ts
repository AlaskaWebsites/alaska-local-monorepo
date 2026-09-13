import { Controller, Post, Body, Get, Patch, Param, UsePipes } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger'
import { CreateOrderUseCase } from '@core/application/use-cases/create-order.use-case'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { TOKENS } from '@core/application/tokens'
import { Inject } from '@nestjs/common'
import { IOrderRepository } from '@core/application/ports/order.repository.port'

const CreateOrderDtoSchema = z.object({
  tenantSlug: z.string().min(1, 'Slug do tenant é obrigatório'),
  customerName: z.string().min(2, 'Nome do cliente é obrigatório'),
  customerPhone: z.string().min(10, 'WhatsApp é obrigatório'),
  deliveryType: z.enum(['delivery', 'pickup']),
  address: z.object({
    street: z.string().min(1),
    number: z.string().min(1),
    neighborhood: z.string().min(1),
    cep: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    complement: z.string().optional(),
    reference: z.string().optional()
  }).optional(),
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    quantity: z.number().int().min(1),
    unitPriceCents: z.number().int().min(0),
    options: z.array(z.object({
      id: z.string(),
      name: z.string(),
      priceCents: z.number().int()
    })).optional(),
    observation: z.string().optional()
  })).min(1, 'A sacola não pode ser vazia'),
  paymentMethod: z.enum(['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro']),
  changeForCents: z.number().int().optional(),
  isTestCent: z.boolean().optional().default(false)
})

type CreateOrderDto = z.infer<typeof CreateOrderDtoSchema>

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    @Inject(TOKENS.ORDER_REPOSITORY) private readonly orderRepository: IOrderRepository
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Cria um novo pedido para delivery ou retirada com validação Zod, cálculo monetário e suporte a Pix EMV',
    description: 'Processa a sacola de compras, valida itens e adicionais, calcula subtotal e total com taxa de entrega e gera o payload Pix se selecionado.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tenantSlug: { type: 'string', example: 'hamburgueria-x', description: 'Slug do estabelecimento' },
        customerName: { type: 'string', example: 'Danilo Gozzi', description: 'Nome do cliente' },
        customerPhone: { type: 'string', example: '11999998888', description: 'WhatsApp com DDD' },
        deliveryType: { type: 'string', enum: ['delivery', 'pickup'], example: 'delivery' },
        address: {
          type: 'object',
          properties: {
            street: { type: 'string', example: 'Av. Paulista' },
            number: { type: 'string', example: '1000' },
            neighborhood: { type: 'string', example: 'Bela Vista' },
            cep: { type: 'string', example: '01310-100' },
            complement: { type: 'string', example: 'Apto 42' }
          }
        },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string', example: 'prod-x-burger' },
              productName: { type: 'string', example: 'X-Burger Clássico Monster' },
              quantity: { type: 'integer', example: 2 },
              unitPriceCents: { type: 'integer', example: 2890, description: 'Preço unitário em centavos inteiros (2890 = R$ 28,90)' },
              options: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', example: 'add-bacon' },
                    name: { type: 'string', example: 'Bacon Crocante Extra' },
                    priceCents: { type: 'integer', example: 500, description: 'Preço do opcional em centavos inteiros (500 = R$ 5,00)' }
                  }
                }
              },
              observation: { type: 'string', example: 'Sem cebola, por favor' }
            }
          }
        },
        paymentMethod: { type: 'string', enum: ['Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'], example: 'Pix' },
        isTestCent: { type: 'boolean', example: false, description: 'Modo teste R$ 0,01' }
      },
      required: ['tenantSlug', 'customerName', 'customerPhone', 'deliveryType', 'items', 'paymentMethod']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Pedido registrado com sucesso',
    schema: {
      example: {
        success: true,
        data: {
          id: 'ord-1724935200000',
          tenantId: 'ten-hamburgueria-x',
          customerName: 'Danilo Gozzi',
          customerPhone: '11999998888',
          deliveryType: 'delivery',
          paymentMethod: 'Pix',
          subtotal: 67.80,
          total: 72.80,
          status: 'created',
          pixCode: '00020126580014br.gov.bcb.pix...',
          createdAt: '2026-08-29T14:45:00.000Z'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de validação incorretos (RFC 7807)',
    schema: {
      example: {
        type: 'https://alaska.app/errors/VALIDATION_ERROR',
        title: 'Erro de Validação',
        status: 400,
        detail: 'Endereço é obrigatório para entregas.',
        instance: '/api/v1/orders'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Estabelecimento não encontrado (RFC 7807)',
    schema: {
      example: {
        type: 'https://alaska.app/errors/ENTITY_NOT_FOUND',
        title: 'Recurso Não Encontrado',
        status: 404,
        detail: "Tenant com identificador 'hamburgueria-x' não foi encontrado.",
        instance: '/api/v1/orders'
      }
    }
  })
  @UsePipes(new ZodValidationPipe(CreateOrderDtoSchema))
  async create(@Body() dto: CreateOrderDto) {
    const order = await this.createOrderUseCase.execute(dto)
    return {
      success: true,
      data: {
        id: order.id,
        tenantId: order.tenantId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryType: order.deliveryType,
        paymentMethod: order.paymentMethod,
        subtotal: order.calculateSubtotal().amount,
        total: order.calculateTotal().amount,
        status: order.status,
        pixCode: order.pixCode,
        createdAt: order.createdAt
      }
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Busca os detalhes de um pedido por ID',
    description: 'Retorna as informações completas do pedido registrado para consulta e acompanhamento.'
  })
  @ApiParam({ name: 'id', description: 'ID do pedido gerado', example: 'ord-1724935200000' })
  @ApiResponse({
    status: 200,
    description: 'Pedido encontrado',
    schema: {
      example: {
        success: true,
        data: {
          id: 'ord-1724935200000',
          tenantId: 'ten-hamburgueria-x',
          customerName: 'Danilo Gozzi',
          customerPhone: '11999998888',
          deliveryType: 'delivery',
          paymentMethod: 'Pix',
          subtotal: 67.80,
          total: 72.80,
          status: 'created',
          pixCode: '000201...',
          createdAt: '2026-08-29T14:45:00.000Z'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido não encontrado (RFC 7807)',
    schema: {
      example: {
        type: 'https://alaska.app/errors/ENTITY_NOT_FOUND',
        title: 'Recurso Não Encontrado',
        status: 404,
        detail: "Pedido com identificador 'ord-1724935200000' não foi encontrado.",
        instance: '/api/v1/orders/ord-1724935200000'
      }
    }
  })
  async getById(@Param('id') id: string) {
    const order = await this.orderRepository.findById(id)
    if (!order) {
      return { success: false, message: 'Pedido não encontrado.' }
    }
    return {
      success: true,
      data: {
        id: order.id,
        tenantId: order.tenantId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryType: order.deliveryType,
        paymentMethod: order.paymentMethod,
        subtotal: order.calculateSubtotal().amount,
        total: order.calculateTotal().amount,
        status: order.status,
        pixCode: order.pixCode,
        createdAt: order.createdAt
      }
    }
  }

  @Get('tenant/:tenantId')
  @ApiOperation({
    summary: 'Lista pedidos de um estabelecimento específico',
    description: 'Retorna todos os pedidos registrados para o tenant informado para acompanhamento operacional do lojista.'
  })
  @ApiParam({ name: 'tenantId', description: 'ID do estabelecimento', example: 'ten-hamburgueria-x' })
  @ApiResponse({
    status: 200,
    description: 'Lista de pedidos retornada com sucesso',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'ord-1724935200000',
            tenantId: 'ten-hamburgueria-x',
            customerName: 'Danilo Gozzi',
            customerPhone: '11999998888',
            deliveryType: 'delivery',
            paymentMethod: 'Pix',
            subtotal: 67.80,
            total: 72.80,
            status: 'created',
            createdAt: '2026-08-29T14:45:00.000Z'
          }
        ]
      }
    }
  })
  async listByTenant(@Param('tenantId') tenantId: string) {
    const orders = await this.orderRepository.listByTenant(tenantId)
    return {
      success: true,
      data: orders.map(order => ({
        id: order.id,
        tenantId: order.tenantId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        deliveryType: order.deliveryType,
        paymentMethod: order.paymentMethod,
        subtotal: order.calculateSubtotal().amount,
        total: order.calculateTotal().amount,
        status: order.status,
        pixCode: order.pixCode,
        createdAt: order.createdAt
      }))
    }
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Atualiza o status operacional do pedido (confirmed, preparing, dispatched, completed, cancelled)',
    description: 'Permite alterar o status do pedido na esteira de preparação e entrega da loja.'
  })
  @ApiParam({ name: 'id', description: 'ID do pedido', example: 'ord-1724935200000' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['created', 'pending_payment', 'confirmed', 'preparing', 'dispatched', 'completed', 'cancelled'],
          example: 'confirmed',
          description: 'Novo status do pedido'
        }
      },
      required: ['status']
    }
  })
  @ApiResponse({ status: 200, description: 'Status do pedido atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado (RFC 7807)' })
  async updateStatus(@Param('id') id: string, @Body('status') status: any) {
    const order = await this.orderRepository.findById(id)
    if (!order) {
      return { success: false, message: 'Pedido não encontrado.' }
    }
    (order as any).props.status = status
    (order as any).props.updatedAt = new Date()
    await this.orderRepository.save(order)
    return {
      success: true,
      data: {
        id: order.id,
        status: order.status
      }
    }
  }
}
