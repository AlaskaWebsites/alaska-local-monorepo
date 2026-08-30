import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './infrastructure/modules/app.module'
import { DomainExceptionFilter } from './infrastructure/http/filters/domain-exception.filter'
import { validateEnv } from './config/env.schema'

async function bootstrap() {
  const env = validateEnv()
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api/v1')
  app.enableCors({
    origin: env.CORS_ORIGINS === '*' ? true : env.CORS_ORIGINS.split(','),
    credentials: true
  })
  app.useGlobalFilters(new DomainExceptionFilter())

  // Configuração Detalhada do Swagger / OpenAPI na rota /docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('🏔️ Alaska Local — API & AI Agent Engine')
    .setDescription(
      'Documentação OpenAPI dos endpoints da API REST do ecossistema Alaska Local (Alaska Menu, Alaska Shop, Alaska Hub, Alaska Pro).\n\n' +
      '### Módulos e Recursos Disponíveis:\n' +
      '* **🏢 Tenants & Multi-Tenancy**: Resolução de estabelecimentos por slug (`/tenants/:slug`) ou domínio próprio (`/tenants/resolve?host=...`).\n' +
      '* **💠 Pagamentos Pix D+0**: Geração de BR Code EMV (BACEN), CRC-16 CCITT, QR Code em Base64 Data URL e teste de 1 centavo (R$ 0,01).\n' +
      '* **🛍️ Pedidos (Orders)**: Criação de pedidos para delivery e retirada, cálculo financeiro em centavos (`Money` VO) e geração de código Pix.\n' +
      '* **📅 Agendamentos (Bookings)**: Gestão de agenda para serviços (barbearias, clínicas), cálculo de tempo estimado e sinal via Pix.\n' +
      '* **🩺 Health & Integridade**: Monitoramento de uptime e status da aplicação.'
    )
    .setVersion('1.2.0')
    .addTag('health', 'Verificação de integridade e uptime do serviço')
    .addTag('tenants', 'Resolução de estabelecimentos, domínios próprios, horários e status')
    .addTag('pix', 'Geração de BR Code EMV oficial, Copia e Cola, QR Code e testes de R$ 0,01')
    .addTag('orders', 'Gestão e criação de pedidos de delivery / retirada')
    .addTag('bookings', 'Agendamento de horários para prestadores de serviços (Alaska Hub & Pro)')
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Alaska Local API Docs | Swagger UI',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin-bottom: 24px }
      .swagger-ui .info .title { font-size: 28px; font-weight: 800; color: #0f172a }
      .swagger-ui .scheme-container { background: #f8fafc; padding: 12px 0; margin-bottom: 20px }
      .swagger-ui .btn.authorize { border-color: #059669; color: #059669 }
      .swagger-ui .btn.authorize svg { fill: #059669 }
    `
  })

  await app.listen(env.PORT)
  console.log(`🚀 Alaska Local Backend rodando na porta ${env.PORT} (Ambiente: ${env.NODE_ENV})`)
  console.log(`📑 Swagger UI Interativo: http://localhost:${env.PORT}/docs`)
  console.log(`📡 Health Check: http://localhost:${env.PORT}/api/v1/health`)
}

bootstrap()
