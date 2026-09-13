import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Verifica o status operacional e uptime do backend',
    description: 'Retorna o status operacional, identificador do serviço, timestamp ISO atual e uptime em segundos do container.'
  })
  @ApiResponse({
    status: 200,
    description: 'Serviço operacional e saudável',
    schema: {
      example: {
        status: 'ok',
        service: 'alaska-local-backend',
        timestamp: '2026-09-13T19:00:00.000Z',
        uptime: 124.5
      }
    }
  })
  @ApiResponse({
    status: 503,
    description: 'Serviço indisponível ou em falha crítica (RFC 7807)',
    schema: {
      example: {
        type: 'https://alaska.app/errors/SERVICE_UNAVAILABLE',
        title: 'Serviço Indisponível',
        status: 503,
        detail: 'O serviço de backend está temporariamente indisponível.',
        instance: '/api/v1/health'
      }
    }
  })
  check() {
    return {
      status: 'ok',
      service: 'alaska-local-backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  }
}
