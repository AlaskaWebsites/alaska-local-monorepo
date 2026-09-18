import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryTenantRepository } from '@infra/persistence/in-memory/in-memory-tenant.repository'
import { SimplePasswordHasher } from '@infra/security/simple-hasher'
import { Tenant } from '@core/domain/entities/tenant.entity'
import { ChangeAdminPinUseCase } from '@core/application/use-cases/change-admin-pin.use-case'
import { EntityNotFoundError, ValidationError } from '@core/domain/errors/domain.error'

describe('Unit: ChangeAdminPinUseCase (ADR 007 / Ponto C)', () => {
  let repository: InMemoryTenantRepository
  let hasher: SimplePasswordHasher
  let useCase: ChangeAdminPinUseCase

  beforeEach(async () => {
    repository = new InMemoryTenantRepository(false)
    hasher = new SimplePasswordHasher()
    useCase = new ChangeAdminPinUseCase(repository, hasher)

    await repository.save(
      new Tenant({
        id: 'ten-pin-test',
        slug: 'barbearia-pin',
        name: 'Barbearia Pin Test',
        phoneWhatsApp: '11999998888',
        businessCategory: 'hub',
        theme: 'barber'
      })
    )
  })

  it('deve alterar PIN com sucesso partindo do PIN default (1234)', async () => {
    const res = await useCase.execute({
      slug: 'barbearia-pin',
      currentPin: '1234',
      newPin: '5678'
    })

    expect(res.success).toBe(true)
    expect(res.message).toBe('PIN administrativo alterado com sucesso.')

    const updated = await repository.findBySlug('barbearia-pin')
    expect(updated?.pinHash).toBeDefined()
    expect(await updated?.verifyPin('5678', hasher)).toBe(true)
    expect(await updated?.verifyPin('1234', hasher)).toBe(false)
  })

  it('deve alterar PIN com sucesso partindo de um hash já existente', async () => {
    const initialHash = await hasher.hash('4321')
    const tenant = await repository.findBySlug('barbearia-pin')
    tenant?.setPinHash(initialHash)
    await repository.save(tenant!)

    const res = await useCase.execute({
      slug: 'barbearia-pin',
      currentPin: '4321',
      newPin: '9999'
    })

    expect(res.success).toBe(true)
    const updated = await repository.findBySlug('barbearia-pin')
    expect(await updated?.verifyPin('9999', hasher)).toBe(true)
  })

  it('deve rejeitar alteração se o PIN atual estiver incorreto', async () => {
    await expect(
      useCase.execute({
        slug: 'barbearia-pin',
        currentPin: '0000',
        newPin: '5678'
      })
    ).rejects.toThrow(ValidationError)
  })

  it('deve rejeitar PIN com tamanho inválido (< 4 ou > 8 dígitos)', async () => {
    await expect(
      useCase.execute({
        slug: 'barbearia-pin',
        currentPin: '1234',
        newPin: '12'
      })
    ).rejects.toThrow(ValidationError)

    await expect(
      useCase.execute({
        slug: 'barbearia-pin',
        currentPin: '1234',
        newPin: '123456789'
      })
    ).rejects.toThrow(ValidationError)
  })

  it('deve lançar EntityNotFoundError para tenant inexistente', async () => {
    await expect(
      useCase.execute({
        slug: 'loja-fantasma',
        currentPin: '1234',
        newPin: '5678'
      })
    ).rejects.toThrow(EntityNotFoundError)
  })
})
