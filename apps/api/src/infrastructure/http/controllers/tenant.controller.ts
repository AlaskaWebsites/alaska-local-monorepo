import { Controller, Get, Post, Body, Param, Query, Inject, UsePipes, HttpCode, HttpStatus, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiResponse } from '@nestjs/swagger';
import { TOKENS } from '../../../core/application/tokens';
import { GetTenantBySlugUseCase } from '../../../core/application/use-cases/get-tenant-by-slug.use-case';
import { ResolveTenantByDomainUseCase } from '../../../core/application/use-cases/resolve-tenant-by-domain.use-case';
import { UpdateTenantHoursUseCase } from '../../../core/application/use-cases/update-tenant-hours.use-case';
import { AuthenticateMerchantUseCase } from '../../../core/application/use-cases/authenticate-merchant.use-case';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { MerchantLoginSchema, MerchantLoginInput } from '@alaska/contracts/tenant';
import { ITenantRepository } from '../../../core/application/ports/tenant.repository.port';
import { IPasswordHasher } from '../../../core/application/ports/password-hasher.port';

@ApiTags('tenants')
@Controller('tenants')
export class TenantController {
  private authenticateMerchantUseCase: AuthenticateMerchantUseCase;

  constructor(
    private readonly getTenantBySlugUseCase: GetTenantBySlugUseCase,
    private readonly resolveTenantByDomainUseCase: ResolveTenantByDomainUseCase,
    private readonly updateTenantHoursUseCase: UpdateTenantHoursUseCase,
    @Inject(TOKENS.TENANT_REPOSITORY) private readonly tenantRepository: ITenantRepository,
    @Inject(TOKENS.PASSWORD_HASHER) private readonly passwordHasher: IPasswordHasher,
  ) {
    this.authenticateMerchantUseCase = new AuthenticateMerchantUseCase(
      this.tenantRepository,
      this.passwordHasher,
    );
  }

  @Get(':slug')
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  @Header('Pragma', 'no-cache')
  @Header('Expires', '0')
  @ApiOperation({
    summary: 'Busca dados operacionais, tema, configuração Pix e catálogo de um estabelecimento por slug',
    description: 'Retorna metadados do tenant, horários de atendimento, cálculo se a loja está aberta, prova social e catálogo de categorias/produtos.'
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug único do estabelecimento (ex: hamburgueria-x, adega-prime, barbearia-style)',
    example: 'hamburgueria-x',
    required: true
  })
  @ApiResponse({ status: 200, description: 'Dados do tenant retornados com sucesso' })
  @ApiResponse({ status: 404, description: 'Estabelecimento não encontrado ou inativo' })
  async getBySlug(@Param('slug') slug: string) {
    const tenant = await this.getTenantBySlugUseCase.execute(slug);
    if (!tenant) return null;
    return tenant.toJSON();
  }

  @Get('resolve/domain')
  @Header('Cache-Control', 'no-store, no-cache, must-revalidate')
  @ApiOperation({
    summary: 'Resolve o estabelecimento a partir do domínio próprio ou subdomínio (header Host)',
    description: 'Permite que domínios customizados (ex: www.cliente.com.br) ou subdomínios (adega-prime.alaska.app) identifiquem o tenant correspondente.'
  })
  @ApiQuery({
    name: 'host',
    description: 'Host ou domínio acessado no navegador',
    example: 'adega-prime.alaska.app',
    required: true
  })
  @ApiResponse({ status: 200, description: 'Estabelecimento resolvido com sucesso' })
  @ApiResponse({ status: 404, description: 'Estabelecimento não encontrado para o domínio informado' })
  async resolveByDomain(@Query('host') host: string) {
    const tenant = await this.resolveTenantByDomainUseCase.execute(host);
    return tenant ? tenant.toJSON() : null;
  }

  @Post(':slug/admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Autentica o lojista via PIN de 4 a 8 dígitos gerando token de sessão (ADR 007)',
    description: 'Compara o PIN com o hash SHA-256 no banco (ou PIN padrão de teste "1234") e retorna o token de sessão do lojista.'
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug único do estabelecimento',
    example: 'hamburgueria-x',
    required: true
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        pin: {
          type: 'string',
          example: '1234',
          description: 'PIN de 4 a 8 dígitos do lojista (padrão de demonstração: 1234)'
        }
      },
      required: ['pin']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Lojista autenticado com sucesso',
    schema: {
      example: {
        authenticated: true,
        token: 'eyJhbGciOi...',
        tenantSlug: 'hamburgueria-x'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'PIN incorreto ou inválido' })
  @ApiResponse({ status: 404, description: 'Estabelecimento não encontrado' })
  @UsePipes(new ZodValidationPipe(MerchantLoginSchema))
  async login(
    @Param('slug') slug: string,
    @Body() body: MerchantLoginInput,
  ) {
    return this.authenticateMerchantUseCase.execute({
      slug,
      pin: body.pin,
    });
  }

  @Post(':slug/hours')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Atualiza grade de horários de funcionamento e status de atendimento da loja',
    description: 'Permite alterar horários de abertura/fechamento diários e acionar a pausa emergencial da loja.'
  })
  @ApiParam({
    name: 'slug',
    description: 'Slug único do estabelecimento',
    example: 'hamburgueria-x',
    required: true
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        hours: {
          type: 'object',
          description: 'Grade de horários por dia da semana ou horários gerais',
          example: {
            open: '18:00',
            close: '23:30',
            monday: { open: '18:00', close: '23:30', closed: false },
            tuesday: { open: '18:00', close: '23:30', closed: false },
            wednesday: { open: '18:00', close: '23:30', closed: false },
            thursday: { open: '18:00', close: '23:30', closed: false },
            friday: { open: '18:00', close: '00:00', closed: false },
            saturday: { open: '18:00', close: '01:00', closed: false },
            sunday: { open: '18:00', close: '23:00', closed: false }
          }
        }
      },
      required: ['hours']
    }
  })
  @ApiResponse({ status: 200, description: 'Horários atualizados com sucesso' })
  @ApiResponse({ status: 404, description: 'Estabelecimento não encontrado' })
  async updateHours(
    @Param('slug') slug: string,
    @Body('hours') hours: Record<string, { open: string; close: string; closed?: boolean }>,
  ) {
    return this.updateTenantHoursUseCase.execute({ slug, hours });
  }
}
