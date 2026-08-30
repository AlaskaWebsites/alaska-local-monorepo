import { Controller, Post, Get, Body, Query, UsePipes } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger'
import { CalculatePixPayloadUseCase } from '@core/application/use-cases/calculate-pix-payload.use-case'
import { z } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'

const GeneratePixDtoSchema = z.object({
  tenantSlug: z.string().min(1, 'Slug do tenant é obrigatório'),
  amount: z.number().min(0.01, 'Valor deve ser no mínimo R$ 0,01'),
  txid: z.string().optional(),
  isTestCent: z.boolean().optional()
})

type GeneratePixDto = z.infer<typeof GeneratePixDtoSchema>

const QueryPixQrCodeSchema = z.object({
  tenantSlug: z.string().min(1, 'Slug do tenant é obrigatório'),
  amount: z.coerce.number().min(0.01, 'Valor deve ser no mínimo R$ 0,01'),
  txid: z.string().optional(),
  isTestCent: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional())
})

type QueryPixQrCodeDto = z.infer<typeof QueryPixQrCodeSchema>

@ApiTags('pix')
@Controller('pix')
export class PixController {
  constructor(private readonly calculatePixPayloadUseCase: CalculatePixPayloadUseCase) {}

  @Post('brcode')
  @ApiOperation({
    summary: 'Gera o payload BR Code EMV oficial (Copia e Cola) com CRC-16 CCITT e imagem QR Code em Base64 Data URL',
    description: 'Calcula o payload do Banco Central do Brasil para a chave Pix do estabelecimento e gera o QR Code PNG pronto para exibição no front-end.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        tenantSlug: { type: 'string', example: 'adega-prime', description: 'Slug do estabelecimento cadastrado' },
        amount: { type: 'number', example: 149.90, description: 'Valor total do pedido em reais' },
        txid: { type: 'string', example: 'PEDIDO123', description: 'Identificador único da transação (opcional)' },
        isTestCent: { type: 'boolean', example: false, description: 'Se true, calcula payload com R$ 0,01 para teste real no banco' }
      },
      required: ['tenantSlug', 'amount']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Payload BR Code e imagem QR Code gerados com sucesso',
    schema: {
      example: {
        success: true,
        data: {
          pixKey: '7e3ed5e6-6097-4b15-88a3-221caba64141',
          keyType: 'random',
          beneficiary: 'Adega & Distribuidora Prime',
          amount: 149.90,
          copiaECola: '00020126580014br.gov.bcb.pix01367e3ed5e6-6097-4b15-88a3-221caba641415204000053039865406149.905802BR5927Adega  Distribuidora Prime6009SAO PAULO62130509PEDIDO1236304A1B2',
          qrCodeDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAUAAAAFA...',
          isTestMode: false
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Estabelecimento não encontrado' })
  @UsePipes(new ZodValidationPipe(GeneratePixDtoSchema))
  async generateBrCode(@Body() dto: GeneratePixDto) {
    const result = await this.calculatePixPayloadUseCase.execute(dto)
    return {
      success: true,
      data: result
    }
  }

  @Get('qrcode')
  @ApiOperation({
    summary: 'Consulta dados e imagem do QR Code Pix via parâmetros de URL (GET)',
    description: 'Permite buscar ou renderizar o QR Code Pix dinamicamente a partir de uma requisição GET.'
  })
  @ApiQuery({ name: 'tenantSlug', description: 'Slug do estabelecimento', example: 'karine-finardi', required: true })
  @ApiQuery({ name: 'amount', description: 'Valor em reais (ex: 89.90)', example: 89.90, required: true })
  @ApiQuery({ name: 'txid', description: 'Identificador único da transação', required: false, example: 'PED998' })
  @ApiQuery({ name: 'isTestCent', description: 'Modo teste R$ 0,01', required: false, example: false })
  @ApiResponse({
    status: 200,
    description: 'QR Code retornado com sucesso',
    schema: {
      example: {
        success: true,
        data: {
          pixKey: '7e3ed5e6-6097-4b15-88a3-221caba64141',
          keyType: 'random',
          beneficiary: 'Karine Finardi Semijoias',
          amount: 89.90,
          copiaECola: '00020126580014br.gov.bcb.pix...',
          qrCodeDataUrl: 'data:image/png;base64,...',
          isTestMode: false
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Parâmetros inválidos' })
  @ApiResponse({ status: 404, description: 'Estabelecimento não encontrado' })
  @UsePipes(new ZodValidationPipe(QueryPixQrCodeSchema))
  async getQrCode(@Query() query: QueryPixQrCodeDto) {
    const result = await this.calculatePixPayloadUseCase.execute({
      tenantSlug: query.tenantSlug,
      amount: query.amount,
      txid: query.txid,
      isTestCent: query.isTestCent
    })
    return {
      success: true,
      data: result
    }
  }
}
