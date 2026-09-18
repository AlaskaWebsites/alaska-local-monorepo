import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Header,
  Inject,
  Optional
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { GetTenantBySlugUseCase } from '../../../core/application/use-cases/get-tenant-by-slug.use-case';
import { ResolveTenantByDomainUseCase } from '../../../core/application/use-cases/resolve-tenant-by-domain.use-case';
import { AuthenticateMerchantUseCase } from '../../../core/application/use-cases/authenticate-merchant.use-case';
import { UpdateTenantHoursUseCase } from '../../../core/application/use-cases/update-tenant-hours.use-case';
import { UpdateTenantEmergencyUseCase } from '../../../core/application/use-cases/update-tenant-emergency.use-case';
import { UpdateTenantDeliveryUseCase } from '../../../core/application/use-cases/update-tenant-delivery.use-case';
import { UpdateTenantPixUseCase } from '../../../core/application/use-cases/update-tenant-pix.use-case';
import { UpdateTenantContactUseCase } from '../../../core/application/use-cases/update-tenant-contact.use-case';
import { UpdateTenantAnnouncementUseCase } from '../../../core/application/use-cases/update-tenant-announcement.use-case';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import {
  MerchantLoginSchema,
  MerchantLoginInput,
  UpdateTenantHoursSchema,
  type UpdateTenantHoursDto,
  UpdateEmergencySchema,
  type UpdateEmergencyDto,
  UpdateDeliveryConfigSchema,
  type UpdateDeliveryConfigDto,
  UpdatePixConfigSchema,
  type UpdatePixConfigDto,
  UpdateContactSchema,
  type UpdateContactDto,
  UpdateAnnouncementSchema,
  type UpdateAnnouncementDto,
} from '@alaska/contracts';
import { ITenantRepository } from '../../../core/application/ports/tenant.repository.port';
import { IPasswordHasher } from '../../../core/application/ports/password-hasher.port';
import { EntityNotFoundError } from '../../../core/domain/errors/domain.error';
import { TOKENS } from '../../../core/application/tokens';

@ApiTags('tenants')
@Controller('tenants')
export class TenantController {
  constructor(
    private readonly getTenantBySlugUseCase: GetTenantBySlugUseCase,
    private readonly resolveTenantByDomainUseCase: ResolveTenantByDomainUseCase,
    private readonly authenticateMerchantUseCase: AuthenticateMerchantUseCase,
    private readonly updateTenantHoursUseCase: UpdateTenantHoursUseCase,
    @Optional() private readonly updateTenantEmergencyUseCase?: UpdateTenantEmergencyUseCase,
    @Optional() private readonly updateTenantDeliveryUseCase?: UpdateTenantDeliveryUseCase,
    @Optional() private readonly updateTenantPixUseCase?: UpdateTenantPixUseCase,
    @Optional() private readonly updateTenantContactUseCase?: UpdateTenantContactUseCase,
    @Optional() private readonly updateTenantAnnouncementUseCase?: UpdateTenantAnnouncementUseCase,
    @Optional() @Inject(TOKENS.TENANT_REPOSITORY) private readonly tenantRepository?: ITenantRepository,
    @Optional() @Inject(TOKENS.PASSWORD_HASHER) private readonly passwordHasher?: IPasswordHasher,
  ) {}

  @Get('resolve/domain')
  @Get('resolve')
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  @ApiOperation({
    summary: 'Resolve estabelecimento por domínio ou subdomínio (Host Header)',
    description: 'Permite identificar o tenant com base no host da requisição (ex: adegaprime.com.br, slug.alaska.app).'
  })
  @ApiQuery({
    name: 'host',
    description: 'Host ou domínio completo vindo dos headers da requisição',
    example: 'adegaprime.com.br',
    required: true
  })
  async resolveByDomain(@Query('host') host: string) {
    const tenant = await this.resolveTenantByDomainUseCase.execute({ host });
    if (!tenant) {
      throw new EntityNotFoundError('Tenant', host);
    }
    return {
      success: true,
      data: tenant,
      meta: { isOpen: tenant.isOpen() },
    };
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Busca os dados operacionais, tema, configuração Pix e catálogo de um estabelecimento por slug',
    description: 'Retorna os metadados do tenant, horários de atendimento, cálculo se a loja está aberta e configurações de Pix D+0.'
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug único do estabelecimento',
    example: 'adega-prime',
    required: true
  })
  async getBySlug(@Param('slug') slug: string) {
    const tenant = await this.getTenantBySlugUseCase.execute({ slug });
    if (!tenant) {
      throw new EntityNotFoundError('Tenant', slug);
    }
    return {
      success: true,
      data: tenant,
      meta: { isOpen: tenant.isOpen() },
    };
  }

  @Post(':slug/admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Autentica o lojista via PIN de 4 a 8 dígitos para acesso ao painel de controle (ADR 013)',
    description: 'Valida a senha/PIN em hash BCrypt do lojista e emite o token de sessão administrativa.'
  })
  async login(
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(MerchantLoginSchema)) body: MerchantLoginInput,
  ) {
    return this.authenticateMerchantUseCase.execute(slug, body.pin);
  }

  @Post(':slug/hours')
  @Patch(':slug/hours')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Atualiza o horário de funcionamento semanal do lojista em tempo real',
    description: 'Atualiza a grade semanal de funcionamento do estabelecimento no banco relacional.'
  })
  async updateHours(
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(UpdateTenantHoursSchema)) dto: UpdateTenantHoursDto,
  ) {
    const hours = (dto as any).hours || (dto as any).openingHours || dto;
    const tenant = await this.updateTenantHoursUseCase.execute({ slug, hours });
    return {
      success: true,
      data: tenant
    };
  }

  @Patch(':slug/emergency')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Pausar ou reabrir loja por motivo emergencial (ADR 012)' })
  async updateEmergency(
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(UpdateEmergencySchema)) dto: UpdateEmergencyDto
  ) {
    if (!this.updateTenantEmergencyUseCase) {
      return { success: true }
    }
    const tenant = await this.updateTenantEmergencyUseCase.execute({
      slug,
      isClosed: dto.isClosed,
      message: dto.message
    })
    return {
      success: true,
      data: tenant
    }
  }

  @Patch(':slug/delivery')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar taxas, pedido mínimo e tempo de delivery (ADR 012)' })
  async updateDelivery(
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(UpdateDeliveryConfigSchema)) dto: UpdateDeliveryConfigDto
  ) {
    if (!this.updateTenantDeliveryUseCase) {
      return { success: true }
    }
    const tenant = await this.updateTenantDeliveryUseCase.execute({
      slug,
      deliveryFee: dto.deliveryFee,
      deliveryFeeCents: dto.deliveryFeeCents,
      minOrderValue: dto.minOrderValue,
      minOrderValueCents: dto.minOrderValueCents,
      estimatedTime: dto.estimatedTime
    })
    return {
      success: true,
      data: tenant
    }
  }

  @Patch(':slug/pix')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar configurações de Pix D+0 do estabelecimento (ADR 012)' })
  async updatePix(
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(UpdatePixConfigSchema)) dto: UpdatePixConfigDto
  ) {
    if (!this.updateTenantPixUseCase) {
      return { success: true }
    }
    const tenant = await this.updateTenantPixUseCase.execute({
      slug,
      key: dto.key || dto.pixKey,
      pixKey: dto.pixKey || dto.key,
      keyType: dto.keyType,
      beneficiary: dto.beneficiary,
      city: dto.city,
      allowTestCent: dto.allowTestCent,
      depositPercentage: dto.depositPercentage
    })
    return {
      success: true,
      data: tenant
    }
  }

  @Patch(':slug/contact')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar canais de contato e redes sociais (ADR 012)' })
  async updateContact(
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(UpdateContactSchema)) dto: UpdateContactDto
  ) {
    if (!this.updateTenantContactUseCase) {
      return { success: true }
    }
    const tenant = await this.updateTenantContactUseCase.execute({
      slug,
      phoneWhatsApp: dto.phoneWhatsApp || dto.whatsapp || dto.phone,
      whatsapp: dto.whatsapp || dto.phoneWhatsApp || dto.phone,
      phone: dto.phone,
      instagram: dto.instagram
    })
    return {
      success: true,
      data: tenant
    }
  }

  @Patch(':slug/announcement')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar comunicado no topo da vitrine (ADR 012)' })
  async updateAnnouncement(
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(UpdateAnnouncementSchema)) dto: UpdateAnnouncementDto
  ) {
    if (!this.updateTenantAnnouncementUseCase) {
      return { success: true }
    }
    const tenant = await this.updateTenantAnnouncementUseCase.execute({
      slug,
      enabled: dto.enabled,
      message: dto.message
    })
    return {
      success: true,
      data: tenant
    }
  }
}
