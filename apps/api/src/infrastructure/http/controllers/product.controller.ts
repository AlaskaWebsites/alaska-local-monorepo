import { Controller, Patch, Put, Body, Param, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import {
  ToggleProductAvailabilitySchema,
  ToggleOptionAvailabilitySchema,
  UpdateProductSchema,
  type ToggleProductAvailabilityDto,
  type ToggleOptionAvailabilityDto,
  type UpdateProductDto
} from '@alaska/contracts'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { ToggleProductAvailabilityUseCase } from '@core/application/use-cases/toggle-product-availability.use-case'
import { UpdateProductUseCase } from '@core/application/use-cases/update-product.use-case'
import { ToggleOptionAvailabilityUseCase } from '@core/application/use-cases/toggle-option-availability.use-case'

@ApiTags('products')
@ApiBearerAuth('merchant-token')
@Controller('tenants/:slug/products')
export class ProductController {
  constructor(
    private readonly toggleAvailabilityUseCase: ToggleProductAvailabilityUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly toggleOptionUseCase: ToggleOptionAvailabilityUseCase
  ) {}

  @Patch(':productId/availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ligar/desligar disponibilidade de produto em tempo real (< 3s)',
    description: 'Permite ao lojista pausar temporariamente as vendas de um item sem deletá-lo do catálogo.'
  })
  @ApiParam({ name: 'slug', description: 'Slug do estabelecimento', example: 'hamburgueria-x' })
  @ApiParam({ name: 'productId', description: 'ID do produto', example: 'prod-smash-bacon' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isAvailable: { type: 'boolean', example: false, description: 'Estado desejado do produto' },
        available: { type: 'boolean', example: false, description: 'Alias compatível com frontend legado' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Disponibilidade alterada com sucesso' })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado (RFC 7807)',
    schema: {
      example: {
        type: 'https://alaska.app/errors/ENTITY_NOT_FOUND',
        title: 'Recurso Não Encontrado',
        status: 404,
        detail: "Produto com identificador 'prod-smash-bacon' não foi encontrado.",
        instance: '/api/v1/tenants/hamburgueria-x/products/prod-smash-bacon/availability'
      }
    }
  })
  async toggleAvailability(
    @Param('slug') slug: string,
    @Param('productId') productId: string,
    @Body(new ZodValidationPipe(ToggleProductAvailabilitySchema)) dto: ToggleProductAvailabilityDto
  ) {
    const product = await this.toggleAvailabilityUseCase.execute({
      productId,
      isAvailable: dto.isAvailable
    })
    return {
      success: true,
      data: product
    }
  }

  @Put(':productId')
  @Patch(':productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Atualizar informações de produto (preço, opcionais, descrição)',
    description: 'Permite editar preço (em centavos ou reais), nome, descrição e disponibilidade do produto. Suporta os métodos HTTP PUT e PATCH.'
  })
  @ApiParam({ name: 'slug', description: 'Slug único do estabelecimento', example: 'hamburgueria-x' })
  @ApiParam({ name: 'productId', description: 'ID do produto', example: 'prod-smash-bacon' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Smash Burger Bacon Prime' },
        description: { type: 'string', example: 'Pão brioche, 2x smash 90g e cheddar derretido' },
        price: { type: 'number', example: 34.90, description: 'Preço em reais (convertido para centavos no backend)' },
        priceCents: { type: 'integer', example: 3490, description: 'Preço diretamente em centavos' },
        isAvailable: { type: 'boolean', example: true }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Produto atualizado com sucesso' })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado (RFC 7807)',
    schema: {
      example: {
        type: 'https://alaska.app/errors/ENTITY_NOT_FOUND',
        title: 'Recurso Não Encontrado',
        status: 404,
        detail: "Produto com identificador 'prod-smash-bacon' não foi encontrado.",
        instance: '/api/v1/tenants/hamburgueria-x/products/prod-smash-bacon'
      }
    }
  })
  async updateProduct(
    @Param('slug') slug: string,
    @Param('productId') productId: string,
    @Body(new ZodValidationPipe(UpdateProductSchema)) dto: UpdateProductDto
  ) {
    const product = await this.updateProductUseCase.execute({
      productId,
      name: dto.name,
      description: dto.description,
      priceCents: dto.priceCents ?? (dto.price ? Math.round(dto.price * 100) : undefined),
      isAvailable: dto.isAvailable
    })
    return {
      success: true,
      data: product
    }
  }

  @Patch(':productId/options/:optionId/availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ligar/desligar disponibilidade de opcional específico de um produto',
    description: 'Pausa ou ativa itens opcionais (ex: bacon extra, borda recheada) de um produto.'
  })
  @ApiParam({ name: 'slug', description: 'Slug do estabelecimento', example: 'hamburgueria-x' })
  @ApiParam({ name: 'productId', description: 'ID do produto', example: 'prod-smash-bacon' })
  @ApiParam({ name: 'optionId', description: 'ID da opção/adicional', example: 'opt-bacon-extra' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isAvailable: { type: 'boolean', example: false },
        available: { type: 'boolean', example: false }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Disponibilidade do opcional alterada com sucesso' })
  @ApiResponse({
    status: 404,
    description: 'Produto ou opção não encontrado (RFC 7807)',
    schema: {
      example: {
        type: 'https://alaska.app/errors/ENTITY_NOT_FOUND',
        title: 'Recurso Não Encontrado',
        status: 404,
        detail: "Opção com identificador 'opt-bacon-extra' não foi encontrada.",
        instance: '/api/v1/tenants/hamburgueria-x/products/prod-smash-bacon/options/opt-bacon-extra/availability'
      }
    }
  })
  async toggleOptionAvailability(
    @Param('slug') slug: string,
    @Param('productId') productId: string,
    @Param('optionId') optionId: string,
    @Body(new ZodValidationPipe(ToggleOptionAvailabilitySchema)) dto: ToggleOptionAvailabilityDto
  ) {
    const product = await this.toggleOptionUseCase.execute({
      productId,
      optionId,
      isAvailable: dto.isAvailable
    })
    return {
      success: true,
      data: product
    }
  }

  @Patch('options/:optionId/availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ligar/desligar disponibilidade de opcional diretamente pelo optionId',
    description: 'Varre o catálogo do tenant para localizar e atualizar a disponibilidade da opção.'
  })
  @ApiParam({ name: 'slug', description: 'Slug do estabelecimento', example: 'hamburgueria-x' })
  @ApiParam({ name: 'optionId', description: 'ID da opção/adicional', example: 'opt-bacon-extra' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isAvailable: { type: 'boolean', example: false },
        available: { type: 'boolean', example: false },
        productId: { type: 'string', example: 'prod-smash-bacon', description: 'Opcional se fornecido' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Disponibilidade do opcional alterada com sucesso' })
  @ApiResponse({
    status: 404,
    description: 'Opção não encontrada (RFC 7807)',
    schema: {
      example: {
        type: 'https://alaska.app/errors/ENTITY_NOT_FOUND',
        title: 'Recurso Não Encontrado',
        status: 404,
        detail: "Opção com identificador 'opt-bacon-extra' não foi encontrada.",
        instance: '/api/v1/tenants/hamburgueria-x/products/options/opt-bacon-extra/availability'
      }
    }
  })
  async toggleOptionDirect(
    @Param('slug') slug: string,
    @Param('optionId') optionId: string,
    @Body(new ZodValidationPipe(ToggleOptionAvailabilitySchema)) dto: ToggleOptionAvailabilityDto
  ) {
    const product = await this.toggleOptionUseCase.execute({
      productId: dto.productId,
      optionId,
      isAvailable: dto.isAvailable
    })
    return {
      success: true,
      data: product
    }
  }
}
