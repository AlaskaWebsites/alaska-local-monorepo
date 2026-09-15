import { describe, it, expect } from 'vitest'
import {
  ProductSchema,
  OptionGroupSchema,
  ToggleProductAvailabilitySchema,
  ToggleOptionAvailabilitySchema,
  UpdateProductSchema,
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
          items: [{ id: 'opt-1', name: 'Ao Ponto', price: 0 }],
        },
      ],
    }
    const parsed = ProductSchema.parse(product)
    expect(parsed.name).toBe('Smash Duplo')
    expect(parsed.options).toHaveLength(1)
  })

  it('deve validar compatibilidade com campo optionGroups e options legado', () => {
    const group = {
      id: 'opt-g2',
      title: 'Bebida',
      required: false,
      min: 0,
      max: 2,
      options: [{ id: 'opt-2', name: 'Coca Cola', price: 6 }],
    }
    const parsed = OptionGroupSchema.parse(group)
    expect(parsed.id).toBe('opt-g2')
    expect(parsed.options).toHaveLength(1)
  })
})

describe('Mutations Schemas', () => {
  it('deve validar ToggleProductAvailabilitySchema', () => {
    expect(ToggleProductAvailabilitySchema.parse({ isAvailable: false })).toEqual({ isAvailable: false })
    expect(ToggleProductAvailabilitySchema.parse({ isAvailable: true })).toEqual({ isAvailable: true })
    expect(() => ToggleProductAvailabilitySchema.parse({ isAvailable: 'true' })).toThrow()
  })

  it('deve suportar alias available no ToggleProductAvailabilitySchema', () => {
    expect(ToggleProductAvailabilitySchema.parse({ available: false })).toEqual({ isAvailable: false })
    expect(ToggleProductAvailabilitySchema.parse({ available: true })).toEqual({ isAvailable: true })
  })

  it('deve validar ToggleOptionAvailabilitySchema com isAvailable e available', () => {
    expect(ToggleOptionAvailabilitySchema.parse({ isAvailable: false })).toEqual({
      isAvailable: false,
      productId: undefined,
    })
    expect(ToggleOptionAvailabilitySchema.parse({ available: true, productId: 'prod-1' })).toEqual({
      isAvailable: true,
      productId: 'prod-1',
    })
  })

  it('deve validar UpdateProductSchema', () => {
    const updateData = {
      name: 'Smash Triplo',
      price: 39.9,
      isAvailable: false,
    }
    const parsed = UpdateProductSchema.parse(updateData)
    expect(parsed.name).toBe('Smash Triplo')
    expect(parsed.isAvailable).toBe(false)
  })
})
