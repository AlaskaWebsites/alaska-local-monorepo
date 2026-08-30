import { PipeTransform, BadRequestException, ArgumentMetadata } from '@nestjs/common'
import { ZodSchema } from 'zod'

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata?: ArgumentMetadata) {
    // Se o pipe for executado em parâmetros de URL (@Param), não valida contra o schema do Body
    if (metadata && (metadata.type === 'param' || metadata.type === 'custom')) {
      return value
    }

    const result = this.schema.safeParse(value)
    if (!result.success) {
      throw new BadRequestException({
        message: 'Dados de entrada inválidos.',
        errors: result.error.format()
      })
    }
    return result.data
  }
}
