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
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
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

  it('deve alternar disponibilidade de produto passando apenas o ID e status atual (assinatura da UI)', async () => {
    const admin = useMerchantAdmin(slug)
    // Inicializa produto como ativo
    await admin.toggleProductAvailability('prod-1', true)
    let overrides = admin.getOverrides()
    expect(overrides.products?.['prod-1']?.isAvailable).toBe(false)

    // Reativa o produto
    await admin.toggleProductAvailability('prod-1', false)
    overrides = admin.getOverrides()
    expect(overrides.products?.['prod-1']?.isAvailable).toBe(true)
  })

  it('deve salvar configurações de delivery e taxas com assinatura posicional da UI', () => {
    const admin = useMerchantAdmin(slug)
    admin.updateDelivery(7.5, 150, '30-55 min')
    const overrides = admin.getOverrides()
    expect(overrides.delivery?.deliveryFee).toBe(7.5)
    expect(overrides.delivery?.minOrderValue).toBe(150)
    expect(overrides.delivery?.estimatedTime).toBe('30-55 min')
  })

  it('deve salvar comunicado no topo com assinatura posicional da UI', () => {
    const admin = useMerchantAdmin(slug)
    admin.updateAnnouncement(true, 'Entregas atrasadas devido à chuva')
    const overrides = admin.getOverrides()
    expect(overrides.announcement?.enabled).toBe(true)
    expect(overrides.announcement?.message).toBe('Entregas atrasadas devido à chuva')
  })

  describe('Fase 4: Validação de Hydration e Resiliência Zod Fail-Safe no LocalStorage', () => {
    it('deve descartar dados corrompidos ou tipos inválidos no localStorage e retornar objeto vazio são', () => {
      const admin = useMerchantAdmin(slug)
      const key = `alaska_overrides_${slug}`

      if (typeof localStorage !== 'undefined') {
        // String inválida (JSON quebrado)
        localStorage.setItem(key, '{ invalid json "')
        expect(admin.getOverrides()).toEqual({})

        // Tipo primitivo (número em vez de objeto)
        localStorage.setItem(key, '12345')
        expect(admin.getOverrides()).toEqual({})

        // Array em vez de objeto
        localStorage.setItem(key, '["item1", "item2"]')
        expect(admin.getOverrides()).toEqual({})
      }
    })

    it('deve validar e persistir overrides via TenantOverridesSchema', () => {
      const admin = useMerchantAdmin(slug)
      admin.saveOverrides({
        customPin: '9999',
        isEmergencyClosed: true,
        closedEmergencyMessage: 'Pausa técnica para manutenção',
      })

      const overrides = admin.getOverrides()
      expect(overrides.customPin).toBe('9999')
      expect(overrides.isEmergencyClosed).toBe(true)
      expect(overrides.closedEmergencyMessage).toBe('Pausa técnica para manutenção')
    })
  })

  describe('ADR 017: Autenticação Corporativa do Lojista (E-mail e Senha)', () => {
    it('deve realizar login corporativo com e-mail e senha válidos', async () => {
      const admin = useMerchantAdmin(slug)
      const success = await admin.login({
        email: 'dono@hamburgueria.com.br',
        password: 'minhasenhasegura',
      })

      expect(success).toBe(true)
      expect(admin.isAuthenticated.value).toBe(true)
      expect(admin.merchantUser.value).toBeDefined()
      expect(admin.merchantUser.value?.email).toBe('dono@hamburgueria.com.br')
      expect(admin.merchantToken.value).toBeDefined()
    })

    it('deve rejeitar e-mail inválido no login corporativo', async () => {
      const admin = useMerchantAdmin(slug)
      const success = await admin.login({
        email: 'email-invalido',
        password: 'minhasenhasegura',
      })

      expect(success).toBe(false)
      expect(admin.isAuthenticated.value).toBe(false)
      expect(admin.errorMessage.value).toContain('E-mail corporativo inválido')
    })

    it('deve rejeitar senha curta no login corporativo', async () => {
      const admin = useMerchantAdmin(slug)
      const success = await admin.login({
        email: 'dono@hamburgueria.com.br',
        password: '123',
      })

      expect(success).toBe(false)
      expect(admin.isAuthenticated.value).toBe(false)
      expect(admin.errorMessage.value).toContain('mínimo 6 caracteres')
    })

    it('deve realizar logout limpando sessão corporativa e token', async () => {
      const admin = useMerchantAdmin(slug)
      await admin.login({
        email: 'dono@hamburgueria.com.br',
        password: 'minhasenhasegura',
      })
      expect(admin.isAuthenticated.value).toBe(true)

      admin.logout()
      expect(admin.isAuthenticated.value).toBe(false)
      expect(admin.merchantUser.value).toBeNull()
      expect(admin.merchantToken.value).toBeNull()
    })

    it('deve alterar senha corporativa com sucesso quando dados são válidos', async () => {
      const admin = useMerchantAdmin(slug)
      await admin.login({
        email: 'dono@hamburgueria.com.br',
        password: 'minhasenhasegura',
      })

      const res = await admin.changePassword({
        currentPassword: 'minhasenhasegura',
        newPassword: 'NovaSenhaForte2026!',
        confirmPassword: 'NovaSenhaForte2026!',
      })

      expect(res.success).toBe(true)
    })

    it('deve rejeitar troca de senha se confirmação for divergente', async () => {
      const admin = useMerchantAdmin(slug)
      const res = await admin.changePassword({
        currentPassword: 'minhasenhasegura',
        newPassword: 'NovaSenhaForte2026!',
        confirmPassword: 'SenhaCompletamenteDiferente',
      })

      expect(res.success).toBe(false)
      expect(res.message).toContain('não coincidem')
    })

    it('deve rejeitar troca de senha se nova senha tiver menos de 8 caracteres', async () => {
      const admin = useMerchantAdmin(slug)
      const res = await admin.changePassword({
        currentPassword: 'minhasenhasegura',
        newPassword: '12345',
        confirmPassword: '12345',
      })

      expect(res.success).toBe(false)
      expect(res.message).toContain('mínimo 8 caracteres')
    })
  })
})
