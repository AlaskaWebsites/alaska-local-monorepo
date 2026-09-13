import { Controller, Post, Body, Get, Param, Query, UsePipes } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { TOKENS } from '@core/application/tokens'
import { Inject } from '@nestjs/common'
import { IBookingRepository } from '@core/application/ports/booking.repository.port'
import { Booking } from '@core/domain/entities/booking.entity'

const CreateBookingDtoSchema = z.object({
  tenantId: z.string().min(1, 'ID do tenant é obrigatório'),
  customerName: z.string().min(2, 'Nome do cliente é obrigatório'),
  customerPhone: z.string().min(10, 'WhatsApp é obrigatório'),
  services: z.array(z.object({
    id: z.string(),
    name: z.string(),
    priceCents: z.number().int().min(0),
    durationMinutes: z.number().int().min(5)
  })).min(1, 'Ao menos um serviço deve ser selecionado'),
  professionalId: z.string().optional(),
  professionalName: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data deve ser YYYY-MM-DD'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de horário deve ser HH:mm'),
  notes: z.string().optional(),
  paymentMode: z.enum(['on_service', 'pix_deposit', 'pix_full']).optional().default('on_service')
})

type CreateBookingDto = z.infer<typeof CreateBookingDtoSchema>

@ApiTags('bookings')
@Controller('bookings')
export class BookingController {
  constructor(
    @Inject(TOKENS.BOOKING_REPOSITORY) private readonly bookingRepository: IBookingRepository
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Registra um novo agendamento de serviços com profissional e horário (Alaska Hub & Alaska Pro)',
    description: 'Calcula o tempo total somando a duração dos serviços selecionados, define a modalidade de pagamento (no local ou sinal Pix) e persiste na agenda.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tenantId: { type: 'string', example: 'ten-barbearia-style', description: 'ID do estabelecimento' },
        customerName: { type: 'string', example: 'André Silva', description: 'Nome do cliente' },
        customerPhone: { type: 'string', example: '11977778888', description: 'WhatsApp de contato com DDD' },
        services: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'prod-corte-degrade' },
              name: { type: 'string', example: 'Corte Degradê / Fade Navalhado' },
              priceCents: { type: 'integer', example: 4500, description: 'Preço do serviço em centavos inteiros (4500 = R$ 45,00)' },
              durationMinutes: { type: 'integer', example: 35, description: 'Duração estimada em minutos' }
            }
          }
        },
        professionalId: { type: 'string', example: 'prof-lucas', description: 'ID do profissional escolhido' },
        professionalName: { type: 'string', example: 'Lucas Silva (Master Barber)', description: 'Nome do profissional' },
        date: { type: 'string', example: '2026-08-30', description: 'Data do agendamento (YYYY-MM-DD)' },
        time: { type: 'string', example: '14:30', description: 'Horário de início (HH:mm)' },
        notes: { type: 'string', example: 'Primeira vez no estabelecimento' },
        paymentMode: { type: 'string', enum: ['on_service', 'pix_deposit', 'pix_full'], example: 'pix_deposit', description: 'Modalidade de pagamento' }
      },
      required: ['tenantId', 'customerName', 'customerPhone', 'services', 'date', 'time']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Agendamento registrado com sucesso',
    schema: {
      example: {
        success: true,
        data: {
          id: 'bk-1724935200000',
          tenantId: 'ten-barbearia-style',
          customerName: 'André Silva',
          customerPhone: '11977778888',
          date: '2026-08-30',
          time: '14:30',
          totalPrice: 45.00,
          totalDurationMinutes: 35,
          status: 'scheduled'
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Dados de agendamento inválidos (RFC 7807)',
    schema: {
      example: {
        type: 'https://alaska.app/errors/VALIDATION_ERROR',
        title: 'Erro de Validação',
        status: 400,
        detail: 'Ao menos um serviço deve ser selecionado.',
        instance: '/api/v1/bookings'
      }
    }
  })
  @UsePipes(new ZodValidationPipe(CreateBookingDtoSchema))
  async create(@Body() dto: CreateBookingDto) {
    const booking = new Booking({
      id: `bk-${Date.now()}`,
      tenantId: dto.tenantId,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      services: dto.services,
      professionalId: dto.professionalId,
      professionalName: dto.professionalName,
      date: dto.date,
      time: dto.time,
      notes: dto.notes,
      paymentMode: dto.paymentMode
    })

    await this.bookingRepository.save(booking)

    return {
      success: true,
      data: {
        id: booking.id,
        tenantId: booking.tenantId,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        date: booking.date,
        time: booking.time,
        totalPrice: booking.calculateTotalPrice().amount,
        totalDurationMinutes: booking.calculateTotalDurationMinutes(),
        status: booking.status
      }
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Busca os detalhes de um agendamento por ID',
    description: 'Retorna os dados cadastrais da reserva, profissional alocado, serviços e horário.'
  })
  @ApiParam({ name: 'id', description: 'ID do agendamento', example: 'bk-1724935200000' })
  @ApiResponse({
    status: 200,
    description: 'Agendamento encontrado com sucesso',
    schema: {
      example: {
        success: true,
        data: {
          id: 'bk-1724935200000',
          tenantId: 'ten-barbearia-style',
          customerName: 'André Silva',
          customerPhone: '11977778888',
          date: '2026-08-30',
          time: '14:30',
          totalPrice: 45.00,
          totalDurationMinutes: 35,
          status: 'scheduled'
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Agendamento não encontrado (RFC 7807)',
    schema: {
      example: {
        type: 'https://alaska.app/errors/ENTITY_NOT_FOUND',
        title: 'Recurso Não Encontrado',
        status: 404,
        detail: "Agendamento com identificador 'bk-1724935200000' não foi encontrado.",
        instance: '/api/v1/bookings/bk-1724935200000'
      }
    }
  })
  async getById(@Param('id') id: string) {
    const booking = await this.bookingRepository.findById(id)
    if (!booking) {
      return { success: false, message: 'Agendamento não encontrado.' }
    }
    return {
      success: true,
      data: {
        id: booking.id,
        tenantId: booking.tenantId,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone,
        professionalName: booking.professionalName,
        date: booking.date,
        time: booking.time,
        totalPrice: booking.calculateTotalPrice().amount,
        totalDurationMinutes: booking.calculateTotalDurationMinutes(),
        status: booking.status
      }
    }
  }

  @Get('tenant/:tenantId')
  @ApiOperation({
    summary: 'Lista agendamentos por tenant e data para controle de disponibilidade e grade da agenda',
    description: 'Permite que a interface bloqueie horários já ocupados e evite sobreposição de atendimentos no mesmo profissional.'
  })
  @ApiParam({ name: 'tenantId', description: 'ID do estabelecimento', example: 'ten-barbearia-style' })
  @ApiQuery({ name: 'date', description: 'Data para filtro (YYYY-MM-DD)', example: '2026-08-30', required: false })
  @ApiResponse({
    status: 200,
    description: 'Lista de agendamentos retornada com sucesso',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'bk-1',
            customerName: 'André Silva',
            customerPhone: '11977778888',
            professionalName: 'Lucas Silva',
            date: '2026-08-30',
            time: '14:30',
            totalPrice: 45.00,
            totalDurationMinutes: 35,
            status: 'scheduled'
          }
        ]
      }
    }
  })
  async listByTenantAndDate(
    @Param('tenantId') tenantId: string,
    @Query('date') date: string
  ) {
    const bookings = await this.bookingRepository.listByTenantAndDate(tenantId, date || new Date().toISOString().split('T')[0])
    return {
      success: true,
      data: bookings.map(b => ({
        id: b.id,
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        professionalName: b.professionalName,
        date: b.date,
        time: b.time,
        totalPrice: b.calculateTotalPrice().amount,
        totalDurationMinutes: b.calculateTotalDurationMinutes(),
        status: b.status
      }))
    }
  }
}
