import { Controller, Patch, Put, Post, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger'
import {
  ToggleProductAvailabilitySchema,
  ToggleOptionAvailabilitySchema,
  UpdateProductSchema,
  CreateProductSchema,
  type ToggleProductAvailabilityDto,
  type ToggleOptionAvailabilityDto,
  type UpdateProductDto,
  type CreateProductDto,
} from '@alaska/contracts'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { ToggleProductAvailabilityUseCase } from '@core/application/use-cases/toggle-product-availability.use-case'
import { UpdateProductUseCase } from '@core/application/use-cases/update-product.use-case'
import { ToggleOptionAvailabilityUseCase } from '@core/application/use-cases/toggle-option-availability.use-case'
import { CreateProductUseCase } from '@core/application/use-cases/create-product.use-case'
import { DeleteProductUseCase } from '@core/application/use-cases/delete-product.use-case'

@ApiTags('Products')
@Controller('tenants/:slug/products')
export class ProductController {
  constructor(
    private readonly toggleAvailabilityUseCase: ToggleProductAvailabilityUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly toggleOptionUseCase: ToggleOptionAvailabilityUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Cadastrar novo produto no catálogo do estabelecimento',
    description: 'Persiste um novo produto/serviço no banco de dados relacional (PostgreSQL) associado ao tenant.'
  })
  @ApiParam({ name: 'slug', description: 'Slug do estabelecimento', example: 'hamburgueria-x' })
  @ApiResponse({ status: 201, description: 'Produto criado e persistido com sucesso no PostgreSQL' })
  @ApiResponse({ status: 400, description: 'Dados de produto inválidos (RFC 7807)' })
  @ApiResponse({ status: 404, description: 'Estabelecimento não encontrado (RFC 7807)' })
  async createProduct(
    @Param('slug') slug: string,
    @Body(new ZodValidationPipe(CreateProductSchema)) dto: CreateProductDto
  ) {
    const product = await this.createProductUseCase.execute({
      tenantSlug: slug,
      id: dto.id,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      priceCents: dto.priceCents ?? Math.round(dto.price * 100),
      categoryId: dto.categoryId,
      image: dto.image || dto.imageUrl,
      durationMinutes: dto.durationMinutes,
      optionGroups: dto.optionGroups || dto.options
    })

    return {
      success: true,
      data: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price.amount,
        priceCents: product.price.inCents,
        categoryId: product.categoryId,
        image: product.imageUrl,
        imageUrl: product.imageUrl,
        isAvailable: product.isAvailable,
        available: product.isAvailable,
        durationMinutes: dto.durationMinutes || 0,
        optionGroups: product.optionGroups
      }
    }
  }

  @Delete(':productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Excluir produto do catálogo do estabelecimento',
    description: 'Remove o produto do banco de dados relacional (PostgreSQL) do estabelecimento.'
  })
  @ApiParam({ name: 'slug', description: 'Slug do estabelecimento', example: 'hamburgueria-x' })
  @ApiParam({ name: 'productId', description: 'ID do produto a ser removido', example: 'prod-smash-bacon' })
  @ApiResponse({ status: 200, description: 'Produto removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado (RFC 7807)' })
  async deleteProduct(
    @Param('slug') slug: string,
    @Param('productId') productId: string
  ) {
    await this.deleteProductUseCase.execute({
      tenantSlug: slug,
      productId
    })

    return {
      success: true,
      message: 'Produto removido com sucesso.'
    }
  }

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
        detail: "Produto com identificador 'prod-inexistente' não foi encontrado.",
        instance: '/api/v1/tenants/hamburgueria-x/products/prod-inexistente/availability'
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
    description: 'Permite atualizar preço em reais decimais ou centavos, descrição e disponibilidade.'
  })
  @ApiParam({ name: 'slug', description: 'Slug do estabelecimento', example: 'hamburgueria-x' })
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
        detail: "Produto com identificador 'prod-inexistente' não foi encontrado.",
        instance: '/api/v1/tenants/hamburgueria-x/products/prod-inexistente'
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
    description: 'Opcional não encontrado (RFC 7807)',
    schema: {
      example: {
        type: 'https://alaska.app/errors/ENTITY_NOT_FOUND',
        title: 'Recurso Não Encontrado',
        status: 404,
        detail: "Opcional com identificador 'opt-inexistente' não foi encontrado.",
        instance: '/api/v1/tenants/hamburgueria-x/products/prod-smash-bacon/options/opt-inexistente/availability'
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
