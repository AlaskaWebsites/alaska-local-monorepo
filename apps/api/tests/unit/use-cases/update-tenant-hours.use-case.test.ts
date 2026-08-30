import { describe, it, expect, beforeEach } from 'vitest'
import { UpdateTenantHoursUseCase } from '@core/application/use-cases/update-tenant-hours.use-case'
import { InMemoryTenantRepository } from '@infra/persistence/in-memory/in-memory-tenant.repository'
import { Tenant } from '@core/domain/entities/tenant.entity'

describe('Unit: UpdateTenantHoursUseCase (ADR 013)', () => {
  let repository: InMemoryTenantRepository
  let useCase: UpdateTenantHoursUseCase

  beforeEach(async () => {
    repository = new InMemoryTenantRepository()
    useCase = new UpdateTenantHoursUseCase(repository)

    await repository.save(
      new Tenant({
        id: 'ten-123',
        slug: 'hamburgueria-x',
        name: 'Hamburgueria X',
        phoneWhatsApp: '11999999999',
        businessCategory: 'menu',
        openingHours: { open: '18:00', close: '23:00' }
      })
    )
  })

  it('deve atualizar o horário de funcionamento do lojista', async () => {
    const updated = await useCase.execute({
      slug: 'hamburgueria-x',
      openingHours: { open: '17:00', close: '02:00' }
    })

    expect(updated.openingHours?.open).toBe('17:00')
    expect(updated.openingHours?.close).toBe('02:00')
  })
})
