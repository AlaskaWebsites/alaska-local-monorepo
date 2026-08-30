import { describe, it, expect, beforeEach } from 'vitest'
import { useMerchantAdmin } from '~/composables/useMerchantAdmin'
import type { Product } from '@alaska/contracts'

describe('Unit: useMerchantAdmin Composable (ADR 013)', () => {
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
})
