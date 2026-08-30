import { Controller, Patch, Put, Body, Param, UsePipes, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger'
import {
  ToggleProductAvailabilitySchema,
  UpdateProductSchema,
  type ToggleProductAvailabilityDto,
  type UpdateProductDto
} from '@alaska/contracts'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'
import { ToggleProductAvailabilityUseCase } from '@core/application/use-cases/toggle-product-availability.use-case'
import { UpdateProductUseCase } from '@core/application/use-cases/update-product.use-case'

@ApiTags('Products')
@Controller('tenants/:slug/products')
export class ProductController {
  constructor(
    private readonly toggleAvailabilityUseCase: ToggleProductAvailabilityUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase
  ) {}

  @Patch(':productId/availability')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ligar/desligar disponibilidade de produto em tempo real (< 3s)' })
  @ApiParam({ name: 'slug', description: 'Slug do estabelecimento' })
  @ApiParam({ name: 'productId', description: 'ID do produto' })
  @UsePipes(new ZodValidationPipe(ToggleProductAvailabilitySchema))
  async toggleAvailability(
    @Param('productId') productId: string,
    @Body() dto: ToggleProductAvailabilityDto
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
  @UsePipes(new ZodValidationPipe(UpdateProductSchema))
  async updateProduct(
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto
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
}
