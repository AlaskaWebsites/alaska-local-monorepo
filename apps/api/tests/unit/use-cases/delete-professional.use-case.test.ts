import { describe, it, expect, beforeEach } from 'vitest'
import { DeleteProfessionalUseCase } from '@core/application/use-cases/delete-professional.use-case'
import { InMemoryProfessionalRepository } from '@infra/persistence/in-memory/in-memory-professional.repository'
import { Professional } from '@core/domain/entities/professional.entity'
import { EntityNotFoundError } from '@core/domain/errors/domain.error'

describe('Unit: DeleteProfessionalUseCase (ADR 011)', () => {
  let profRepo: InMemoryProfessionalRepository
  let useCase: DeleteProfessionalUseCase

  beforeEach(async () => {
    profRepo = new InMemoryProfessionalRepository()
    useCase = new DeleteProfessionalUseCase(profRepo)

    await profRepo.save(
      new Professional({
        id: 'prof-teste-1',
        tenantId: 'ten-barbearia-style',
        name: 'Barbeiro Antigo',
        role: 'Barbeiro',
        isAvailable: true
      })
    )
  })

  it('deve remover o profissional com sucesso', async () => {
    await useCase.execute({ professionalId: 'prof-teste-1' })
    const found = await profRepo.findById('prof-teste-1')
    expect(found).toBeNull()
  })

  it('deve lançar EntityNotFoundError se o profissional não existir', async () => {
    await expect(
      useCase.execute({ professionalId: 'prof-inexistente' })
    ).rejects.toThrow(EntityNotFoundError)
  })
})
