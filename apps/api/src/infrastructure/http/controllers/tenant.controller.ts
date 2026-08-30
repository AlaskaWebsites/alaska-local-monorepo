import { Controller, Get, Patch, Param, Query, Body, HttpCode, HttpStatus, UsePipes } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger'
import { GetTenantBySlugUseCase } from '@core/application/use-cases/get-tenant-by-slug.use-case'
import { ResolveTenantByDomainUseCase } from '@core/application/use-cases/resolve-tenant-by-domain.use-case'
import { UpdateTenantHoursUseCase } from '@core/application/use-cases/update-tenant-hours.use-case'
import { UpdateTenantHoursSchema, type UpdateTenantHoursDto } from '@alaska/contracts'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'

const ResolveDomainQuerySchema = z.object({
  host: z.string().min(1, 'Host é obrigatório')
})

type ResolveDomainQuery = z.infer<typeof ResolveDomainQuerySchema>

@ApiTags('Tenants')
@Controller('tenants')
export class TenantController {
  constructor(
    private readonly getTenantBySlugUseCase: GetTenantBySlugUseCase,
    private readonly resolveTenantByDomainUseCase: ResolveTenantByDomainUseCase,
    private readonly updateTenantHoursUseCase: UpdateTenantHoursUseCase
  ) {}

  @Get('resolve')
  @UsePipes(new ZodValidationPipe(ResolveDomainQuerySchema))
  async resolveByDomain(@Query() query: ResolveDomainQuery) {
    const tenant = await this.resolveTenantByDomainUseCase.execute({ host: query.host })
    return {
      success: true,
      data: tenant.toJSON(),
      meta: { isOpen: tenant.isOpen() }
    }
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const tenant = await this.getTenantBySlugUseCase.execute({ slug })
    return {
      success: true,
      data: tenant.toJSON(),
      meta: { isOpen: tenant.isOpen() }
    }
  }

  @Patch(':slug/hours')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar horários de funcionamento do tenant (ADR 013)' })
  @ApiParam({ name: 'slug', description: 'Slug do estabelecimento' })
  async updateHours(
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(UpdateTenantHoursSchema)) dto: UpdateTenantHoursDto
  ) {
    const tenant = await this.updateTenantHoursUseCase.execute({
      slug,
      openingHours: dto.openingHours
    })
    return {
      success: true,
      data: tenant.toJSON(),
      meta: { isOpen: tenant.isOpen() }
    }
  }
}
