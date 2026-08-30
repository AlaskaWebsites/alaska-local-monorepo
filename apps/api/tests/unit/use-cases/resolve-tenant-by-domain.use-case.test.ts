import { describe, it, expect, beforeEach } from 'vitest'
import { ResolveTenantByDomainUseCase } from '@core/application/use-cases/resolve-tenant-by-domain.use-case'
import { InMemoryTenantRepository } from '@infra/persistence/in-memory/in-memory-tenant.repository'
import { Tenant } from '@core/domain/entities/tenant.entity'
import { EntityNotFoundError } from '@core/domain/errors/domain.error'

describe('Unit: ResolveTenantByDomainUseCase', () => {
  let repo: InMemoryTenantRepository
  let useCase: ResolveTenantByDomainUseCase

  beforeEach(() => {
    repo = new InMemoryTenantRepository(false)
    useCase = new ResolveTenantByDomainUseCase(repo)
  })

  it('deve resolver tenant por domínio customizado próprio', async () => {
    const tenant = new Tenant({
      id: '1',
      slug: 'barbearia-style',
      name: 'Barbearia Style Club',
      phoneWhatsApp: '11977776666',
      businessCategory: 'hub',
      customDomain: 'barbeariastyle.com.br'
    })
    await repo.save(tenant)

    const result = await useCase.execute({ host: 'www.barbeariastyle.com.br' })
    expect(result.id).toBe('1')
    expect(result.slug).toBe('barbearia-style')
  })

  it('deve resolver tenant por subdomínio wildcard', async () => {
    const tenant = new Tenant({
      id: '2',
      slug: 'clinica-sorriso',
      name: 'Clínica Sorriso',
      phoneWhatsApp: '11966665555',
      businessCategory: 'pro'
    })
    await repo.save(tenant)

    const result = await useCase.execute({ host: 'clinica-sorriso.alaska.app' })
    expect(result.id).toBe('2')
  })
})
