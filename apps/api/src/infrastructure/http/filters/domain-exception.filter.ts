import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common'
import { Response } from 'express'
import { DomainError, EntityNotFoundError, ValidationError } from '@core/domain/errors/domain.error'

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR

    if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND
    } else if (exception instanceof ValidationError) {
      status = HttpStatus.BAD_REQUEST
    }

    response.status(status).json({
      statusCode: status,
      error: exception.code,
      message: exception.message,
      timestamp: new Date().toISOString()
    })
  }
}
