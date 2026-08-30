import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Verifica o status operacional e uptime do backend' })
  @ApiResponse({
    status: 200,
    description: 'Serviço operacional',
    schema: {
      example: {
        status: 'ok',
        service: 'alaska-local-backend',
        timestamp: '2026-08-28T13:30:00.000Z',
        uptime: 124.5
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
