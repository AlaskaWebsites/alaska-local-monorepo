import { Controller, Get, Post, Patch, Body, Param, Query, Inject, UsePipes, HttpCode, HttpStatus, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TOKENS } from '../../../core/application/tokens';
import { GetTenantBySlugUseCase } from '../../../core/application/use-cases/get-tenant-by-slug.use-case';
import { ResolveTenantByDomainUseCase } from '../../../core/application/use-cases/resolve-tenant-by-domain.use-case';
import { AuthenticateMerchantUseCase } from '../../../core/application/use-cases/authenticate-merchant.use-case';
import { UpdateTenantHoursUseCase } from '../../../core/application/use-cases/update-tenant-hours.use-case';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import {
  MerchantLoginSchema,
  MerchantLoginInput,
  UpdateTenantHoursSchema,
  type UpdateTenantHoursDto,
} from '@alaska/contracts/tenant';
import { ITenantRepository } from '../../../core/application/ports/tenant.repository.port';
import { IPasswordHasher } from '../../../core/application/ports/password-hasher.port';
import { EntityNotFoundError } from '../../../core/domain/errors/domain.error';

@ApiTags('tenants')
@Controller('tenants')
export class TenantController {
  private authenticateMerchantUseCase: AuthenticateMerchantUseCase;
  private updateTenantHoursUseCase: UpdateTenantHoursUseCase;

  constructor(
    private readonly getTenantBySlugUseCase: GetTenantBySlugUseCase,
    private readonly resolveTenantByDomainUseCase: ResolveTenantByDomainUseCase,
    @Inject(TOKENS.TENANT_REPOSITORY) private readonly tenantRepository: ITenantRepository,
    @Inject(TOKENS.PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
  ) {
    this.authenticateMerchantUseCase = new AuthenticateMerchantUseCase(
      this.tenantRepository,
      this.passwordHasher
    );
    this.updateTenantHoursUseCase = new UpdateTenantHoursUseCase(
      this.tenantRepository
    );
  }

  @Get('resolve/domain')
  @Get('resolve')
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  @ApiOperation({
    summary: 'Resolve o estabelecimento a partir do domínio próprio ou subdomínio (header Host)',
    description: 'Permite que domínios customizados (ex: www.cliente.com.br) ou subdomínios (adega-prime.alaska.app) identifiquem o tenant correspondente. Suporta as rotas GET /tenants/resolve/domain e GET /tenants/resolve.'
  })
  @ApiQuery({
    name: 'host',
    description: 'Host ou domínio completo vindo dos headers da requisição (ex: adegaprime.com.br, adega-prime.alaska.app)',
    example: 'adegaprime.com.br',
    required: true
  })
  @ApiResponse({
    status: 200,
    description: 'Estabelecimento resolvido com sucesso',
    schema: {
      example: {
        success: true,
        data: {
          id: 'ten-adega-prime',
          slug: 'adega-prime',
          name: 'Adega & Distribuidora Prime',
          phoneWhatsApp: '11988887777',
          businessCategory: 'menu',
          theme: 'amber',
          customDomain: 'adegaprime.com.br'
        },
        meta: { isOpen: true }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Estabelecimento não encontrado para o domínio informado (RFC 7807)',
    schema: {
      example: {
        type: 'https://alaska.app/errors/ENTITY_NOT_FOUND',
        title: 'Recurso Não Encontrado',
        status: 404,
        detail: "Tenant com identificador 'desconhecido.com.br' não foi encontrado.",
        instance: '/api/v1/tenants/resolve?host=desconhecido.com.br'
      }
    }
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
    description: 'Slug único do estabelecimento (ex: adega-prime, hamburgueria-x, karine-finardi, barbearia-style, clinica-sorriso)',
    example: 'adega-prime',
    required: true
  })
  @ApiResponse({
    status: 200,
    description: 'Dados do tenant retornados com sucesso',
    schema: {
      example: {
        success: true,
        data: {
          id: 'ten-adega-prime',
          slug: 'adega-prime',
          name: 'Adega & Distribuidora Prime',
          description: 'Cervejas trincando, combos de destilados, gelos de sabor e conveniência 24h.',
          phoneWhatsApp: '11988887777',
          businessCategory: 'menu',
          theme: 'amber',
          openingHours: { open: '00:00', close: '23:59' },
          pixConfig: {
            key: '7e3ed5e6-6097-4b15-88a3-221caba64141',
            keyType: 'random',
            beneficiary: 'Adega Prime LTDA',
            city: 'SAO PAULO',
            allowTestCent: true,
            depositPercentage: 30
          },
          deliveryFeeCents: 700,
          minOrderValueCents: 3000
        },
        meta: { isOpen: true }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Estabelecimento não encontrado ou inativo (RFC 7807)',
    schema: {
      example: {
        type: 'https://alaska.app/errors/ENTITY_NOT_FOUND',
        title: 'Recurso Não Encontrado',
        status: 404,
        detail: "Tenant com identificador 'slug-inexistente' não foi encontrado.",
        instance: '/api/v1/tenants/slug-inexistente'
      }
    }
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
    description: 'Valida a senha/PIN em hash BCrypt do lojista e emite o token de sessão administrativa para gestão do cardápio e horários.'
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug único do estabelecimento',
    example: 'hamburgueria-x'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pin: {
          type: 'string',
          example: '1234',
          description: 'PIN numérico de 4 a 8 dígitos cadastrado pelo lojista'
        }
      },
      required: ['pin']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Autenticação realizada com sucesso',
    schema: {
      example: {
        success: true,
        token: 'adm_sec_1724935200000_abc123',
        slug: 'hamburgueria-x',
        message: 'Acesso liberado ao painel do lojista.'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'PIN incorreto ou não autorizado (RFC 7807)',
    schema: {
      example: {
        type: 'https://alaska.app/errors/UNAUTHORIZED',
        title: 'Não Autorizado',
        status: 401,
        detail: 'PIN administrativo incorreto.',
        instance: '/api/v1/tenants/hamburgueria-x/admin/login'
      }
    }
  })
  @UsePipes(new ZodValidationPipe(MerchantLoginSchema))
  async login(
    @Param('slug') slug: string,
    @Body() body: MerchantLoginInput,
  ) {
    return this.authenticateMerchantUseCase.execute({ slug, pin: body.pin });
  }

  @Post(':slug/hours')
  @Patch(':slug/hours')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('merchant-token')
  @ApiOperation({
    summary: 'Atualiza grade de horários de funcionamento e status de atendimento da loja',
    description: 'Permite alterar horários de abertura/fechamento diários e acionar a pausa emergencial da loja. Suporta os métodos HTTP POST e PATCH, aceitando { hours } ou { openingHours }.'
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug único do estabelecimento',
    example: 'hamburgueria-x'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        hours: {
          type: 'object',
          description: 'Grade de horários por dia da semana',
          example: {
            monday: { open: '18:00', close: '23:00', closed: false },
            tuesday: { open: '18:00', close: '23:00', closed: false },
            wednesday: { open: '18:00', close: '23:00', closed: false },
            thursday: { open: '18:00', close: '23:00', closed: false },
            friday: { open: '18:00', close: '01:00', closed: false },
            saturday: { open: '18:00', close: '01:00', closed: false },
            sunday: { open: '18:00', close: '23:00', closed: false }
          }
        },
        openingHours: {
          type: 'object',
          description: 'Alias compatível com @alaska/contracts (UpdateTenantHoursSchema)'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Horários atualizados com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Formato de horário inválido (RFC 7807)',
    schema: {
      example: {
        type: 'https://alaska.app/errors/VALIDATION_ERROR',
        title: 'Erro de Validação',
        status: 400,
        detail: 'Formato de horário deve ser HH:mm.',
        instance: '/api/v1/tenants/hamburgueria-x/hours'
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
        instance: '/api/v1/tenants/hamburgueria-x/hours'
      }
    }
  })
  async updateHours(
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(UpdateTenantHoursSchema)) dto: UpdateTenantHoursDto,
  ) {
    const hours = (dto as any).hours || (dto as any).openingHours || dto;
    return this.updateTenantHoursUseCase.execute({ slug, hours });
  }
}
