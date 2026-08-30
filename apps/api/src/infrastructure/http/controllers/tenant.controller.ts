import { Controller, Get, Param, Query, UsePipes } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger'
import { GetTenantBySlugUseCase } from '@core/application/use-cases/get-tenant-by-slug.use-case'
import { ResolveTenantByDomainUseCase } from '@core/application/use-cases/resolve-tenant-by-domain.use-case'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'

const ResolveDomainQuerySchema = z.object({
  host: z.string().min(1, 'Host é obrigatório')
})

type ResolveDomainQuery = z.infer<typeof ResolveDomainQuerySchema>

@ApiTags('tenants')
@Controller('tenants')
export class TenantController {
  constructor(
    private readonly getTenantBySlugUseCase: GetTenantBySlugUseCase,
    private readonly resolveTenantByDomainUseCase: ResolveTenantByDomainUseCase
  ) {}

  @Get('resolve')
  @ApiOperation({
    summary: 'Resolve o estabelecimento a partir do domínio próprio ou subdomínio (Host Header)',
    description: 'Permite que domínios customizados (ex: karinefinardi.com.br) ou subdomínios (adega-prime.alaska.app) identifiquem o tenant correspondente.'
  })
  @ApiQuery({
    name: 'host',
    description: 'Host ou domínio acessado no navegador',
    example: 'karinefinardi.com.br',
    required: true
  })
  @ApiResponse({
    status: 200,
    description: 'Estabelecimento resolvido com sucesso',
    schema: {
      example: {
        success: true,
        data: {
          id: 'ten-karine-finardi',
          slug: 'karine-finardi',
          name: 'Karine Finardi | Semijoias & Revenda',
          phoneWhatsApp: '11999998888',
          businessCategory: 'shop',
          theme: 'barber',
          pixConfig: {
            key: '7e3ed5e6-6097-4b15-88a3-221caba64141',
            keyType: 'random',
            beneficiary: 'Karine Finardi Semijoias',
            city: 'FRANCISCO MORATO'
          }
        },
        meta: { isOpen: true }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Estabelecimento não encontrado para o domínio informado' })
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
          phoneWhatsApp: '11988889999',
          businessCategory: 'menu',
          theme: 'amber',
          openingHours: { open: '14:00', close: '03:00' },
          pixConfig: {
            key: '7e3ed5e6-6097-4b15-88a3-221caba64141',
            keyType: 'random',
            beneficiary: 'Adega & Distribuidora Prime',
            city: 'SAO PAULO',
            allowTestCent: true,
            depositPercentage: 30
          },
          deliveryFeeCents: 600,
          minOrderValueCents: 2000
        },
        meta: { isOpen: true }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Estabelecimento não encontrado ou inativo' })
  async getBySlug(@Param('slug') slug: string) {
    const tenant = await this.getTenantBySlugUseCase.execute({ slug })
    return {
      success: true,
      data: tenant.toJSON(),
      meta: { isOpen: tenant.isOpen() }
    }
  }
}
