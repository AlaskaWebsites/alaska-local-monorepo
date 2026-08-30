import { describe, it, expect, beforeEach } from 'vitest'
import { GetTenantBySlugUseCase } from '@core/application/use-cases/get-tenant-by-slug.use-case'
import { InMemoryTenantRepository } from '@infra/persistence/in-memory/in-memory-tenant.repository'
import { Tenant } from '@core/domain/entities/tenant.entity'
import { EntityNotFoundError } from '@core/domain/errors/domain.error'

describe('Unit: GetTenantBySlugUseCase', () => {
  let repo: InMemoryTenantRepository
  let useCase: GetTenantBySlugUseCase

  beforeEach(() => {
    repo = new InMemoryTenantRepository(false)
    useCase = new GetTenantBySlugUseCase(repo)
  })

  it('deve retornar o tenant correspondente ao slug ativo', async () => {
    const tenant = new Tenant({
      id: '1',
      slug: 'adega-prime',
      name: 'Adega Prime 24h',
      phoneWhatsApp: '11988887777',
      businessCategory: 'menu',
      theme: 'amber'
    })
    await repo.save(tenant)

    const result = await useCase.execute({ slug: 'adega-prime' })
    expect(result.id).toBe('1')
    expect(result.name).toBe('Adega Prime 24h')
  })

  it('deve lançar EntityNotFoundError quando o slug não existir', async () => {
    await expect(useCase.execute({ slug: 'loja-inexistente' })).rejects.toThrow(EntityNotFoundError)
  })
})
