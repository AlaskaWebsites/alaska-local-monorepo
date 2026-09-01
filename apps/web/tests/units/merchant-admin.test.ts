import { describe, it, expect, beforeEach } from 'vitest'
import { useMerchantAdmin } from '~/composables/useMerchantAdmin'
import type { Product } from '@alaska/contracts'

describe('Unit: useMerchantAdmin Composable (ADR 013 & Novas Funcionalidades)', () => {
  const slug = 'hamburgueria-x'

  let mockProducts: Product[] = []

  beforeEach(() => {
    mockProducts = [
      {
        id: 'prod-1',
        name: 'Smash Duplo',
        description: 'Burger artesanal',
        price: 32.0,
        isAvailable: true,
        categoryId: 'cat-1'
      },
      {
        id: 'prod-2',
        name: 'Coca-Cola 350ml',
        description: 'Lata gelada',
        price: 6.0,
        isAvailable: true,
        categoryId: 'cat-2'
      }
    ]
  })

  it('deve realizar login com PIN válido de 4 dígitos', () => {
    const admin = useMerchantAdmin(slug)
    const success = admin.login('1234')
    expect(success).toBe(true)
    expect(admin.isAuthenticated.value).toBe(true)
  })

  it('deve rejeitar PIN com menos de 4 dígitos', () => {
    const admin = useMerchantAdmin(slug)
    const success = admin.login('12')
    expect(success).toBe(false)
    expect(admin.errorMessage.value).toContain('PIN incorreto')
  })

  it('deve pausar produto otimisticamente em tempo real', async () => {
    const admin = useMerchantAdmin(slug)
    await admin.toggleProductAvailability(mockProducts, 'prod-1', true)

    const product = mockProducts.find(p => p.id === 'prod-1')
    expect(product?.isAvailable).toBe(false)
  })

  it('deve reativar produto pausado com sucesso', async () => {
    const admin = useMerchantAdmin(slug)
    await admin.toggleProductAvailability(mockProducts, 'prod-1', true)
    await admin.toggleProductAvailability(mockProducts, 'prod-1', false)

    const product = mockProducts.find(p => p.id === 'prod-1')
    expect(product?.isAvailable).toBe(true)
  })

  it('deve atualizar o preço do produto otimisticamente', async () => {
    const admin = useMerchantAdmin(slug)
    await admin.updateProductPrice(mockProducts, 'prod-1', 35.5)

    const product = mockProducts.find(p => p.id === 'prod-1')
    expect(product?.price).toBe(35.5)
  })

  it('deve criar um novo produto no catálogo e persistir nos overrides', () => {
    const admin = useMerchantAdmin(slug)
    const newProd = admin.createProduct({
      name: 'Combo Especial Smash',
      description: 'Burger + Fritas + Refri',
      price: 42.0,
      categoryId: 'cat-1'
    })

    expect(newProd.name).toBe('Combo Especial Smash')
    expect(newProd.price).toBe(42.0)

    const overrides = admin.getOverrides()
    expect(overrides.customProducts?.length).toBeGreaterThan(0)
    expect(overrides.customProducts?.some(p => p.name === 'Combo Especial Smash')).toBe(true)
  })

  it('deve excluir produto do catálogo registrando no deletedProductIds', () => {
    const admin = useMerchantAdmin(slug)
    admin.deleteProduct('prod-1')

    const overrides = admin.getOverrides()
    expect(overrides.deletedProductIds).toContain('prod-1')
  })

  it('deve pausar e despausar adicionais/opcionais no estoque em tempo real', () => {
    const admin = useMerchantAdmin(slug)
    // Pausar Bacon Extra
    admin.toggleOptionAvailability('opt-bacon', false)
    let overrides = admin.getOverrides()
    expect(overrides.pausedOptionIds).toContain('opt-bacon')

    // Reativar Bacon Extra
    admin.toggleOptionAvailability('opt-bacon', true)
    overrides = admin.getOverrides()
    expect(overrides.pausedOptionIds).not.toContain('opt-bacon')
  })

  it('deve salvar configurações Pix em tempo real', () => {
    const admin = useMerchantAdmin(slug)
    admin.updatePixConfig({
      keyType: 'cnpj',
      pixKey: '12345678000199',
      beneficiary: 'Hamburgueria X Gourmet LTDA',
      city: 'SAO PAULO'
    })

    const overrides = admin.getOverrides()
    expect(overrides.pix?.pixKey).toBe('12345678000199')
    expect(overrides.pix?.keyType).toBe('cnpj')
    expect(overrides.pix?.beneficiary).toBe('Hamburgueria X Gourmet LTDA')
  })

  it('deve salvar contatos de WhatsApp e Instagram da loja', () => {
    const admin = useMerchantAdmin(slug)
    admin.updateContact({
      whatsapp: '11988887777',
      instagram: '@hamburgueriax'
    })

    const overrides = admin.getOverrides()
    expect(overrides.contact?.whatsapp).toBe('11988887777')
    expect(overrides.contact?.instagram).toBe('@hamburgueriax')
  })

  it('deve criar e excluir especialista/profissional para lojas de serviços', () => {
    const admin = useMerchantAdmin('clinica-sorriso')
    const prof = admin.createProfessional({
      name: 'Dr. Lucas Silveira',
      role: 'Implantodontista',
      availableDays: [1, 2, 3, 4, 5],
      workHours: { start: '08:00', end: '17:00' },
      lunchBreak: { start: '12:00', end: '13:00', enabled: true }
    })

    expect(prof.name).toBe('Dr. Lucas Silveira')
    let overrides = admin.getOverrides()
    expect(overrides.customProfessionals?.some(p => p.id === prof.id)).toBe(true)

    // Excluir profissional
    admin.deleteProfessional(prof.id)
    overrides = admin.getOverrides()
    expect(overrides.deletedProfessionalIds).toContain(prof.id)
    expect(overrides.customProfessionals?.some(p => p.id === prof.id)).toBe(false)
  })

  it('deve pausar e reabrir atendimento de emergência com sucesso', () => {
    const admin = useMerchantAdmin(slug)
    admin.updateEmergency(true, 'Cozinha lotada')
    let overrides = admin.getOverrides()
    expect(overrides.emergency?.isClosed).toBe(true)
    expect(overrides.emergency?.message).toBe('Cozinha lotada')

    admin.updateEmergency(false)
    overrides = admin.getOverrides()
    expect(overrides.emergency?.isClosed).toBe(false)
  })
})
