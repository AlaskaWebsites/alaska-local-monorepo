// tests/units/tenant-schema.test.ts
import { describe, it, expect } from 'vitest'
import {
  TenantSchema,
  BusinessCategorySchema,
  ProductSchema,
  CategorySchema,
  StoreReviewsSchema,
} from '~/types/tenant'

describe('Unit: Validação de Schemas Zod de Tenants (types/tenant.ts)', () => {
  describe('1. Schema de Categorias de Negócio (BusinessCategorySchema)', () => {
    it('deve aceitar as categorias canônicas: menu, shop, hub e pro', () => {
      expect(BusinessCategorySchema.parse('menu')).toBe('menu')
      expect(BusinessCategorySchema.parse('shop')).toBe('shop')
      expect(BusinessCategorySchema.parse('hub')).toBe('hub')
      expect(BusinessCategorySchema.parse('pro')).toBe('pro')
    })

    it('deve rejeitar categorias desconhecidas', () => {
      expect(() => BusinessCategorySchema.parse('ecommerce')).toThrow()
      expect(() => BusinessCategorySchema.parse('invalid')).toThrow()
    })
  })

  describe('2. Schema Principal de Tenant (TenantSchema)', () => {
    it('deve validar um tenant completo com businessCategory e reviews', () => {
      const mockTenant = {
        slug: 'hamburgueria-x',
        name: 'Hamburgueria X',
        description: 'Os melhores smash burgers',
        phoneWhatsApp: '11999998888',
        businessCategory: 'menu',
        theme: 'food',
        template: 'menu',
        deliveryFee: 5.0,
        currency: 'R$',
        categories: [
          {
            id: 'burgers',
            name: 'Burgers',
            products: [
              {
                id: 'smash-1',
                name: 'Smash Simples',
                price: 20.0,
                available: true,
              },
            ],
          },
        ],
      }

      const parsed = TenantSchema.parse(mockTenant)
      expect(parsed.slug).toBe('hamburgueria-x')
      expect(parsed.businessCategory).toBe('menu')
      expect(parsed.currency).toBe('R$')
      expect(parsed.categories?.length).toBe(1)
    })

    it('deve aplicar defaults para campos opcionais quando omitidos', () => {
      const minimalTenant = {
        slug: 'barbearia-style',
        name: 'Barbearia Style',
        phoneWhatsApp: '11988887777',
      }

      const parsed = TenantSchema.parse(minimalTenant)
      expect(parsed.currency).toBe('R$')
      expect(parsed.deliveryFee).toBe(0)
      expect(parsed.minOrderValue).toBe(0)
      expect(parsed.template).toBe('menu')
      expect(parsed.businessCategory).toBeUndefined()
      expect(parsed.theme).toBe('food')
    })
  })

  describe('3. Validação de Sanidade de Todos os Catálogos JSON (data/*.json)', () => {
    it('todos os arquivos JSON em data/ devem ser válidos pelo TenantSchema', () => {
      const jsonFiles = import.meta.glob('~/data/*.json', { eager: true }) as Record<
        string,
        { default: unknown }
      >

      const entries = Object.entries(jsonFiles)
      expect(entries.length).toBeGreaterThanOrEqual(9)

      entries.forEach(([filePath, content]) => {
        const raw = content.default || content
        expect(
          () => TenantSchema.parse(raw),
          `Arquivo ${filePath} deve seguir estritamente o TenantSchema`
        ).not.toThrow()
      })
    })
  })
})
