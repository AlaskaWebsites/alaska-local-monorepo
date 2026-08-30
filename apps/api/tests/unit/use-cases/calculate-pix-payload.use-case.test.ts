import { describe, it, expect, beforeEach } from 'vitest'
import { CalculatePixPayloadUseCase } from '@core/application/use-cases/calculate-pix-payload.use-case'
import { InMemoryTenantRepository } from '@infra/persistence/in-memory/in-memory-tenant.repository'
import { LocalPixGateway } from '@infra/gateways/local-pix.gateway'
import { Tenant } from '@core/domain/entities/tenant.entity'
import { EntityNotFoundError, ValidationError } from '@core/domain/errors/domain.error'

describe('Unit: CalculatePixPayloadUseCase & QR Code Generation', () => {
  let tenantRepo: InMemoryTenantRepository
  let pixGateway: LocalPixGateway
  let useCase: CalculatePixPayloadUseCase

  beforeEach(() => {
    tenantRepo = new InMemoryTenantRepository()
    pixGateway = new LocalPixGateway()
    useCase = new CalculatePixPayloadUseCase(tenantRepo, pixGateway)
  })

  it('deve gerar payload BR Code e imagem QR Code Data URL para tenant com chave Pix cadastrada', async () => {
    const tenant = new Tenant({
      id: 'ten-1',
      slug: 'adega-prime',
      name: 'Adega Prime 24h',
      phoneWhatsApp: '11988887777',
      businessCategory: 'menu',
      pixConfig: {
        key: '11988887777',
        keyType: 'phone',
        beneficiary: 'Adega Prime LTDA',
        city: 'SAO PAULO'
      }
    })
    await tenantRepo.save(tenant)

    const result = await useCase.execute({
      tenantSlug: 'adega-prime',
      amount: 150.00
    })

    expect(result.pixKey).toBe('11988887777')
    expect(result.beneficiary).toBe('Adega Prime LTDA')
    expect(result.amount).toBe(150.00)
    expect(result.copiaECola).toContain('br.gov.bcb.pix')
    expect(result.copiaECola.length).toBeGreaterThan(50)
    expect(result.qrCodeDataUrl).toContain('data:image/png;base64,')
    expect(result.isTestMode).toBe(false)
  })

  it('deve gerar payload com R$ 0,01 quando isTestCent for true', async () => {
    const tenant = new Tenant({
      id: 'ten-2',
      slug: 'karine-finardi',
      name: 'Karine Finardi',
      phoneWhatsApp: '11999998888',
      businessCategory: 'shop',
      pixConfig: {
        key: '11999998888',
        keyType: 'phone'
      }
    })
    await tenantRepo.save(tenant)

    const result = await useCase.execute({
      tenantSlug: 'karine-finardi',
      amount: 450.00,
      isTestCent: true
    })

    expect(result.amount).toBe(0.01)
    expect(result.copiaECola).toContain('54040.01')
    expect(result.qrCodeDataUrl).toContain('data:image/png;base64,')
    expect(result.isTestMode).toBe(true)
  })

  it('deve lançar EntityNotFoundError para tenant inexistente', async () => {
    await expect(useCase.execute({
      tenantSlug: 'inexistente',
      amount: 50.00
    })).rejects.toThrow(EntityNotFoundError)
  })

  it('deve lançar ValidationError se o valor for menor ou igual a zero', async () => {
    const tenant = new Tenant({
      id: 'ten-3',
      slug: 'barbearia-style',
      name: 'Barbearia Style',
      phoneWhatsApp: '11977776666',
      businessCategory: 'hub'
    })
    await tenantRepo.save(tenant)

    await expect(useCase.execute({
      tenantSlug: 'barbearia-style',
      amount: 0
    })).rejects.toThrow(ValidationError)
  })
})
