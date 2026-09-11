import { Controller, Patch, Put, Body, Param, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger'
import {
  ToggleProductAvailabilitySchema,
  UpdateProductSchema,
  type ToggleProductAvailabilityDto,
  type UpdateProductDto
} from '@alaska/contracts'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { ToggleProductAvailabilityUseCase } from '@core/application/use-cases/toggle-product-availability.use-case'
import { UpdateProductUseCase } from '@core/application/use-cases/update-product.use-case'
import { ToggleOptionAvailabilityUseCase } from '@core/application/use-cases/toggle-option-availability.use-case'

@ApiTags('Products')
@Controller('tenants/:slug/products')
export class ProductController {
  constructor(
    private readonly toggleAvailabilityUseCase: ToggleProductAvailabilityUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly toggleOptionUseCase: ToggleOptionAvailabilityUseCase
  ) {}

  @Patch(':productId/availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ligar/desligar disponibilidade de produto em tempo real (< 3s)' })
  @ApiParam({ name: 'slug', description: 'Slug do estabelecimento' })
  @ApiParam({ name: 'productId', description: 'ID do produto' })
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
      data: {
        id: product.id,
        name: product.name,
        isAvailable: product.isAvailable
      }
    }
  }

  @Put(':productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar informações de produto (preço, opcionais, descrição)' })
  @ApiParam({ name: 'slug', description: 'Slug do estabelecimento' })
  @ApiParam({ name: 'productId', description: 'ID do produto' })
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
  @ApiOperation({ summary: 'Ligar/desligar disponibilidade de opcional/adicional em tempo real' })
  @ApiParam({ name: 'slug', description: 'Slug do estabelecimento' })
  @ApiParam({ name: 'productId', description: 'ID do produto' })
  @ApiParam({ name: 'optionId', description: 'ID da opção' })
  async toggleOptionAvailability(
    @Param('slug') slug: string,
    @Param('productId') productId: string,
    @Param('optionId') optionId: string,
    @Body() body: { isAvailable?: boolean; available?: boolean }
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
  @ApiOperation({ summary: 'Ligar/desligar disponibilidade de opcional pelo slug da loja' })
  @ApiParam({ name: 'slug', description: 'Slug do estabelecimento' })
  @ApiParam({ name: 'optionId', description: 'ID da opção' })
  async toggleOptionDirect(
    @Param('slug') slug: string,
    @Param('optionId') optionId: string,
    @Body() body: { isAvailable?: boolean; available?: boolean; productId?: string }
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
