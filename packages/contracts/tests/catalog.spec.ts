import { describe, it, expect } from 'vitest'
import {
  ProductSchema,
  ToggleProductAvailabilitySchema,
  UpdateProductSchema
} from '../src/catalog'

describe('Catalog Schemas (@alaska/contracts/catalog)', () => {
  it('deve validar um produto com grupos de opcionais', () => {
    const product = {
      id: 'p1',
      name: 'Smash Duplo',
      price: 32.5,
      categoryId: 'cat-burgers',
      options: [
        {
          id: 'opt-g1',
          name: 'Ponto da Carne',
          required: true,
          min: 1,
          max: 1,
          items: [{ id: 'opt-1', name: 'Ao Ponto', price: 0 }]
        }
      ]
    }
    const parsed = ProductSchema.parse(product)
    expect(parsed.name).toBe('Smash Duplo')
    expect(parsed.options).toHaveLength(1)
  })

  describe('Mutations do Painel do Lojista (ADR 013)', () => {
    it('deve validar schema de toggle de disponibilidade', () => {
      expect(ToggleProductAvailabilitySchema.parse({ isAvailable: false })).toEqual({ isAvailable: false })
      expect(ToggleProductAvailabilitySchema.parse({ isAvailable: true })).toEqual({ isAvailable: true })
      expect(() => ToggleProductAvailabilitySchema.parse({ isAvailable: 'true' })).toThrow()
    })

    it('deve validar schema de atualização de produto', () => {
      const updateData = {
        name: 'Smash Duplo Especial',
        price: 35.0,
        priceCents: 3500,
        isAvailable: true
      }
      const parsed = UpdateProductSchema.parse(updateData)
      expect(parsed.price).toBe(35.0)
      expect(parsed.priceCents).toBe(3500)
    })
  })
})
