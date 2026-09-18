import { Controller, Get, Post, Delete, Patch, Body, Param, HttpCode, HttpStatus, Inject } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger'
import {
  CreateProfessionalSchema,
  UpdateProfessionalSchema,
  ToggleProfessionalAvailabilitySchema,
  ToggleSlotSchema,
  type CreateProfessionalDto,
  type UpdateProfessionalDto,
  type ToggleProfessionalAvailabilityDto,
  type ToggleSlotDto
} from '@alaska/contracts'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { CreateProfessionalUseCase } from '@core/application/use-cases/create-professional.use-case'
import { DeleteProfessionalUseCase } from '@core/application/use-cases/delete-professional.use-case'
import { UpdateProfessionalUseCase } from '@core/application/use-cases/update-professional.use-case'
import { ToggleProfessionalAvailabilityUseCase } from '@core/application/use-cases/toggle-professional-availability.use-case'
import { ToggleBlockSlotUseCase } from '@core/application/use-cases/toggle-block-slot.use-case'
import { IProfessionalRepository } from '@core/application/ports/professional.repository.port'
import { TOKENS } from '@core/application/tokens'

@ApiTags('Professionals')
@Controller('tenants/:slug')
export class ProfessionalController {
  constructor(
    private readonly createProfessionalUseCase: CreateProfessionalUseCase,
    private readonly deleteProfessionalUseCase: DeleteProfessionalUseCase,
    private readonly updateProfessionalUseCase: UpdateProfessionalUseCase,
    private readonly toggleAvailabilityUseCase: ToggleProfessionalAvailabilityUseCase,
    private readonly toggleBlockSlotUseCase: ToggleBlockSlotUseCase,
    @Inject(TOKENS.PROFESSIONAL_REPOSITORY)
    private readonly professionalRepository: IProfessionalRepository
  ) {}

  @Get('professionals')
  @ApiOperation({ summary: 'Listar profissionais do estabelecimento' })
  async listProfessionals(@Param('slug') slug: string) {
    const list = await this.professionalRepository.listByTenantSlug(slug)
    return {
      success: true,
      data: list
    }
  }

  @Post('professionals')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastrar novo profissional / especialista' })
  async createProfessional(
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(CreateProfessionalSchema)) dto: CreateProfessionalDto
  ) {
    const prof = await this.createProfessionalUseCase.execute({
      tenantSlug: slug,
      id: dto.id,
      name: dto.name,
      role: dto.role,
      avatar: dto.avatar,
      availableDays: dto.availableDays,
      workHours: dto.workHours,
      lunchBreak: dto.lunchBreak ? {
        start: dto.lunchBreak.start,
        end: dto.lunchBreak.end,
        enabled: dto.lunchBreak.enabled ?? true
      } : undefined,
      isAvailable: dto.isAvailable
    })

    return {
      success: true,
      data: prof
    }
  }

  @Delete('professionals/:profId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Excluir profissional' })
  async deleteProfessional(
    @Param('slug') slug: string,
    @Param('profId') profId: string
  ) {
    await this.deleteProfessionalUseCase.execute({
      tenantSlug: slug,
      professionalId: profId
    })

    return {
      success: true,
      message: 'Profissional removido com sucesso.'
    }
  }

  @Patch('professionals/:profId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar dados de expediente, dias ou cargo do profissional' })
  async updateProfessional(
    @Param('slug') slug: string,
    @Param('profId') profId: string,
    @Body(new ZodValidationPipe(UpdateProfessionalSchema)) dto: UpdateProfessionalDto
  ) {
    const prof = await this.updateProfessionalUseCase.execute({
      tenantSlug: slug,
      professionalId: profId,
      name: dto.name,
      role: dto.role,
      avatar: dto.avatar,
      availableDays: dto.availableDays,
      workHours: dto.workHours,
      lunchBreak: dto.lunchBreak ? {
        start: dto.lunchBreak.start,
        end: dto.lunchBreak.end,
        enabled: dto.lunchBreak.enabled ?? true
      } : undefined,
      isAvailable: dto.isAvailable
    })

    return {
      success: true,
      data: prof
    }
  }

  @Patch('professionals/:profId/availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pausar ou ativar profissional na agenda' })
  async toggleAvailability(
    @Param('slug') slug: string,
    @Param('profId') profId: string,
    @Body(new ZodValidationPipe(ToggleProfessionalAvailabilitySchema)) dto: ToggleProfessionalAvailabilityDto
  ) {
    const prof = await this.toggleAvailabilityUseCase.execute({
      tenantSlug: slug,
      professionalId: profId,
      isAvailable: dto.isAvailable
    })

    return {
      success: true,
      data: prof
    }
  }

  @Get('slots/blocked')
  @ApiOperation({ summary: 'Listar horários bloqueados da agenda' })
  async listBlockedSlots(@Param('slug') slug: string) {
    const slots = await this.professionalRepository.listBlockedSlots(slug)
    return {
      success: true,
      data: slots
    }
  }

  @Post('slots/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Alternar bloqueio de slot na agenda' })
  async toggleSlot(
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(ToggleSlotSchema)) dto: ToggleSlotDto
  ) {
    const result = await this.toggleBlockSlotUseCase.execute({
      tenantSlug: slug,
      date: dto.date,
      time: dto.time,
      reason: dto.reason
    })

    return {
      success: true,
      data: result
    }
  }
}
