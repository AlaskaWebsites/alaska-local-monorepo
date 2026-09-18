import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryTenantRepository } from '@infra/persistence/in-memory/in-memory-tenant.repository'
import { Tenant } from '@core/domain/entities/tenant.entity'
import { UpdateTenantEmergencyUseCase } from '@core/application/use-cases/update-tenant-emergency.use-case'
import { UpdateTenantDeliveryUseCase } from '@core/application/use-cases/update-tenant-delivery.use-case'
import { UpdateTenantPixUseCase } from '@core/application/use-cases/update-tenant-pix.use-case'
import { UpdateTenantContactUseCase } from '@core/application/use-cases/update-tenant-contact.use-case'
import { UpdateTenantAnnouncementUseCase } from '@core/application/use-cases/update-tenant-announcement.use-case'
import { EntityNotFoundError } from '@core/domain/errors/domain.error'

describe('Unit: Tenant Global Settings Use Cases (ADR 012)', () => {
  let repository: InMemoryTenantRepository
  let emergencyUseCase: UpdateTenantEmergencyUseCase
  let deliveryUseCase: UpdateTenantDeliveryUseCase
  let pixUseCase: UpdateTenantPixUseCase
  let contactUseCase: UpdateTenantContactUseCase
  let announcementUseCase: UpdateTenantAnnouncementUseCase

  beforeEach(async () => {
    repository = new InMemoryTenantRepository(false)
    emergencyUseCase = new UpdateTenantEmergencyUseCase(repository)
    deliveryUseCase = new UpdateTenantDeliveryUseCase(repository)
    pixUseCase = new UpdateTenantPixUseCase(repository)
    contactUseCase = new UpdateTenantContactUseCase(repository)
    announcementUseCase = new UpdateTenantAnnouncementUseCase(repository)

    await repository.save(
      new Tenant({
        id: 'ten-settings-test',
        slug: 'loja-teste',
        name: 'Loja Teste Settings',
        phoneWhatsApp: '11999998888',
        businessCategory: 'menu',
        theme: 'food',
        deliveryFeeCents: 500,
        minOrderValueCents: 2000,
        pixConfig: {
          key: 'chave-original@pix.com',
          keyType: 'email',
          city: 'SAO PAULO'
        }
      })
    )
  })

  it('deve pausar e reabrir atendimento de emergência', async () => {
    const closed = await emergencyUseCase.execute({
      slug: 'loja-teste',
      isClosed: true,
      message: 'Falta de energia no bairro'
    })

    expect(closed.isClosedEmergency).toBe(true)
    expect(closed.closedEmergencyMessage).toBe('Falta de energia no bairro')
    expect(closed.isOpen()).toBe(false)

    const reopened = await emergencyUseCase.execute({
      slug: 'loja-teste',
      isClosed: false
    })

    expect(reopened.isClosedEmergency).toBe(false)
  })

  it('deve atualizar taxas e prazos de delivery', async () => {
    const updated = await deliveryUseCase.execute({
      slug: 'loja-teste',
      deliveryFee: 7.5,
      minOrderValue: 30.0,
      estimatedTime: '45-60 min'
    })

    expect(updated.deliveryFeeCents).toBe(750)
    expect(updated.minOrderValueCents).toBe(3000)
    expect(updated.estimatedTime).toBe('45-60 min')
  })

  it('deve atualizar credenciais e chave Pix D+0', async () => {
    const updated = await pixUseCase.execute({
      slug: 'loja-teste',
      key: '11999998888',
      keyType: 'phone',
      beneficiary: 'Loja Teste ME',
      city: 'FRANCISCO MORATO'
    })

    expect(updated.pixConfig?.key).toBe('11999998888')
    expect(updated.pixConfig?.keyType).toBe('phone')
    expect(updated.pixConfig?.beneficiary).toBe('Loja Teste ME')
    expect(updated.pixConfig?.city).toBe('FRANCISCO MORATO')
  })

  it('deve atualizar telefone de WhatsApp e perfil do Instagram', async () => {
    const updated = await contactUseCase.execute({
      slug: 'loja-teste',
      phoneWhatsApp: '11977776666',
      instagram: '@lojateste'
    })

    expect(updated.phoneWhatsApp).toBe('11977776666')
    expect(updated.instagram).toBe('@lojateste')
  })

  it('deve atualizar comunicado no topo da vitrine', async () => {
    const updated = await announcementUseCase.execute({
      slug: 'loja-teste',
      enabled: true,
      message: 'Hoje tem promoção compre 1 leve 2!'
    })

    expect(updated.announcement?.enabled).toBe(true)
    expect(updated.announcement?.message).toBe('Hoje tem promoção compre 1 leve 2!')
  })

  it('deve lançar EntityNotFoundError ao tentar configurar tenant inexistente', async () => {
    await expect(
      emergencyUseCase.execute({ slug: 'nao-existe', isClosed: true })
    ).rejects.toThrow(EntityNotFoundError)
  })
})
