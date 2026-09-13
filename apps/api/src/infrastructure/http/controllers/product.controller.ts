import { Controller, Patch, Put, Body, Param, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger'
import { ToggleProductAvailabilityUseCase } from '@core/application/use-cases/toggle-product-availability.use-case'
import { UpdateProductUseCase } from '@core/application/use-cases/update-product.use-case'
import { ToggleOptionAvailabilityUseCase } from '@core/application/use-cases/toggle-option-availability.use-case'

@ApiTags('products')
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
    description: 'Altera o status de disponibilidade do produto no catálogo. Reflete instantaneamente na vitrine sem necessidade de recarregar.'
  })
  @ApiParam({ name: 'slug', description: 'Slug único do estabelecimento', example: 'hamburgueria-x' })
  @ApiParam({ name: 'productId', description: 'ID do produto', example: 'prod-smash-bacon' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isAvailable: { type: 'boolean', example: false, description: 'Status de disponibilidade do produto' },
        available: { type: 'boolean', example: false, description: 'Alias aceito para isAvailable' }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Disponibilidade do produto alterada com sucesso',
    schema: {
      example: {
        success: true,
        data: {
          id: 'prod-smash-bacon',
          name: 'Smash Bacon Duplo',
          isAvailable: false
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async toggleAvailability(
    @Param('slug') slug: string,
    @Param('productId') productId: string,
    @Body() body: any
  ) {
    const isAvailable = body.isAvailable ?? body.available ?? false
    const product = await this.toggleAvailabilityUseCase.execute({
      productId,
      isAvailable
    })
    return {
      success: true,
      data: {
        id: product.id,
        name: product.name,
        isAvailable: product.isAvailable
      }
    }
  }

  @Put(':productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Atualizar informações de produto (preço, opcionais, descrição)',
    description: 'Permite editar preço (em centavos ou reais), nome, descrição e disponibilidade do produto.'
  })
  @ApiParam({ name: 'slug', description: 'Slug único do estabelecimento', example: 'hamburgueria-x' })
  @ApiParam({ name: 'productId', description: 'ID do produto', example: 'prod-smash-bacon' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Smash Bacon Monster Duplo', description: 'Nome atualizado do produto' },
        description: { type: 'string', example: 'Dois burgers de 90g, cheddar duplo e bacon crocante', description: 'Descrição do produto' },
        priceCents: { type: 'integer', example: 3800, description: 'Preço em centavos inteiros (ex: 3800 = R$ 38,00)' },
        price: { type: 'number', example: 38.00, description: 'Preço em reais decimais (convertido automaticamente para centavos)' },
        isAvailable: { type: 'boolean', example: true, description: 'Status de disponibilidade' }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Produto atualizado com sucesso',
    schema: {
      example: {
        success: true,
        data: {
          id: 'prod-smash-bacon',
          name: 'Smash Bacon Monster Duplo',
          priceCents: 3800,
          isAvailable: true
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Produto não encontrado' })
  async updateProduct(
    @Param('slug') slug: string,
    @Param('productId') productId: string,
    @Body() body: any
  ) {
    const product = await this.updateProductUseCase.execute({
      productId,
      name: body.name,
      description: body.description,
      priceCents: body.priceCents ?? (body.price ? Math.round(body.price * 100) : undefined),
      isAvailable: body.isAvailable ?? body.available
    })
    return {
      success: true,
      data: {
        id: product.id,
        name: product.name,
        priceCents: product.price.inCents,
        isAvailable: product.isAvailable
      }
    }
  }

  @Patch(':productId/options/:optionId/availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ligar/desligar disponibilidade de opcional/adicional por produto em tempo real',
    description: 'Permite pausar um opcional específico de um produto (ex: acabou bacon ou catupiry) sem pausar o produto inteiro.'
  })
  @ApiParam({ name: 'slug', description: 'Slug do estabelecimento', example: 'hamburgueria-x' })
  @ApiParam({ name: 'productId', description: 'ID do produto pai', example: 'prod-smash-bacon' })
  @ApiParam({ name: 'optionId', description: 'ID da opção/adicional', example: 'opt-bacon-extra' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isAvailable: { type: 'boolean', example: false, description: 'Disponibilidade do opcional' },
        available: { type: 'boolean', example: false, description: 'Alias aceito para isAvailable' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Disponibilidade do opcional alterada com sucesso' })
  @ApiResponse({ status: 404, description: 'Produto ou opção não encontrado' })
  async toggleOptionAvailability(
    @Param('slug') slug: string,
    @Param('productId') productId: string,
    @Param('optionId') optionId: string,
    @Body() body: any
  ) {
    const isAvailable = body.isAvailable ?? body.available ?? true
    const product = await this.toggleOptionUseCase.execute({
      productId,
      optionId,
      isAvailable,
      tenantSlug: slug
    })
    return {
      success: true,
      data: {
        id: product.id,
        name: product.name,
        optionGroups: product.optionGroups
      }
    }
  }

  @Patch('options/:optionId/availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ligar/desligar disponibilidade de opcional diretamente pelo slug da loja',
    description: 'Localiza o opcional em qualquer produto do estabelecimento e atualiza sua disponibilidade.'
  })
  @ApiParam({ name: 'slug', description: 'Slug do estabelecimento', example: 'hamburgueria-x' })
  @ApiParam({ name: 'optionId', description: 'ID da opção/adicional', example: 'opt-bacon-extra' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        isAvailable: { type: 'boolean', example: false, description: 'Disponibilidade do opcional' },
        available: { type: 'boolean', example: false, description: 'Alias aceito para isAvailable' },
        productId: { type: 'string', example: 'prod-smash-bacon', description: 'ID do produto (opcional para busca direta)' }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Disponibilidade do opcional alterada com sucesso' })
  @ApiResponse({ status: 404, description: 'Opção não encontrada' })
  async toggleOptionDirect(
    @Param('slug') slug: string,
    @Param('optionId') optionId: string,
    @Body() body: any
  ) {
    const isAvailable = body.isAvailable ?? body.available ?? true
    const product = await this.toggleOptionUseCase.execute({
      productId: body.productId,
      optionId,
      isAvailable,
      tenantSlug: slug
    })
    return {
      success: true,
      data: {
        id: product.id,
        name: product.name,
        optionGroups: product.optionGroups
      }
    }
  }
}
