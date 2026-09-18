import { describe, it, expect, beforeEach } from 'vitest'
import { CreateProfessionalUseCase } from '@core/application/use-cases/create-professional.use-case'
import { InMemoryProfessionalRepository } from '@infra/persistence/in-memory/in-memory-professional.repository'
import { InMemoryTenantRepository } from '@infra/persistence/in-memory/in-memory-tenant.repository'
import { Tenant } from '@core/domain/entities/tenant.entity'
import { EntityNotFoundError } from '@core/domain/errors/domain.error'

describe('Unit: CreateProfessionalUseCase (ADR 011)', () => {
  let profRepo: InMemoryProfessionalRepository
  let tenantRepo: InMemoryTenantRepository
  let useCase: CreateProfessionalUseCase

  beforeEach(async () => {
    profRepo = new InMemoryProfessionalRepository()
    tenantRepo = new InMemoryTenantRepository()
    useCase = new CreateProfessionalUseCase(profRepo, tenantRepo)

    await tenantRepo.save(
      new Tenant({
        id: 'ten-barbearia-style',
        slug: 'barbearia-style',
        name: 'Barbearia Style',
        phoneWhatsApp: '11999999999',
        businessCategory: 'hub',
        openingHours: { open: '09:00', close: '20:00' }
      })
    )
  })

  it('deve criar e persistir profissional no repositório associado ao tenant', async () => {
    const result = await useCase.execute({
      tenantSlug: 'barbearia-style',
      name: 'Mestre Navalha',
      role: 'Barbeiro Sênior',
      availableDays: [1, 2, 3, 4, 5, 6],
      workHours: { start: '09:00', end: '19:00' },
      lunchBreak: { start: '12:00', end: '13:00', enabled: true }
    })

    expect(result.id).toBeDefined()
    expect(result.name).toBe('Mestre Navalha')
    expect(result.role).toBe('Barbeiro Sênior')
    expect(result.tenantId).toBe('ten-barbearia-style')
    expect(result.isAvailable).toBe(true)

    const saved = await profRepo.findById(result.id)
    expect(saved).not.toBeNull()
    expect(saved?.name).toBe('Mestre Navalha')
  })

  it('deve lançar EntityNotFoundError se o tenant não existir', async () => {
    await expect(
      useCase.execute({
        tenantSlug: 'inexistente',
        name: 'Carlos'
      })
    ).rejects.toThrow(EntityNotFoundError)
  })
})
