// tests/units/images.test.ts
import { describe, it, expect } from 'vitest'
import {
  normalizeImageCategory,
  getFallbackSvgDataUri,
  getFallbackImageUrl,
  handleImageError,
  THEME_SVG_CONFIGS,
} from '~/utils/images'

describe('🖼️ Fallback Universal de Imagens Anti-404 (utils/images.ts)', () => {
  describe('1. Normalização de Categorias e Temas', () => {
    it('deve mapear temas e sinônimos canônicos de alimentação para "food"', () => {
      expect(normalizeImageCategory('food')).toBe('food')
      expect(normalizeImageCategory('menu')).toBe('food')
      expect(normalizeImageCategory('restaurant')).toBe('food')
      expect(normalizeImageCategory('lanches')).toBe('food')
      expect(normalizeImageCategory('pizzaria')).toBe('food')
      expect(normalizeImageCategory('delivery')).toBe('food')
      expect(normalizeImageCategory('burger')).toBe('food')
    })

    it('deve mapear temas e sinônimos de barbearias e serviços para "barber"', () => {
      expect(normalizeImageCategory('barber')).toBe('barber')
      expect(normalizeImageCategory('hub')).toBe('barber')
      expect(normalizeImageCategory('salao')).toBe('barber')
      expect(normalizeImageCategory('cabelo')).toBe('barber')
      expect(normalizeImageCategory('barbearia')).toBe('barber')
      expect(normalizeImageCategory('servico')).toBe('barber')
      expect(normalizeImageCategory('servicos')).toBe('barber')
    })

    it('deve mapear temas e sinônimos de saúde e clínicas para "health"', () => {
      expect(normalizeImageCategory('health')).toBe('health')
      expect(normalizeImageCategory('pro')).toBe('health')
      expect(normalizeImageCategory('odonto')).toBe('health')
      expect(normalizeImageCategory('clinica')).toBe('health')
      expect(normalizeImageCategory('medico')).toBe('health')
      expect(normalizeImageCategory('saude')).toBe('health')
      expect(normalizeImageCategory('dentista')).toBe('health')
    })

    it('deve mapear temas e sinônimos de bebidas e adegas para "drinks"', () => {
      expect(normalizeImageCategory('drinks')).toBe('drinks')
      expect(normalizeImageCategory('adega')).toBe('drinks')
      expect(normalizeImageCategory('vinho')).toBe('drinks')
      expect(normalizeImageCategory('cerveja')).toBe('drinks')
      expect(normalizeImageCategory('bebidas')).toBe('drinks')
      expect(normalizeImageCategory('distribuidora')).toBe('drinks')
    })

    it('deve mapear temas e sinônimos de boutiques e moda para "shop"', () => {
      expect(normalizeImageCategory('shop')).toBe('shop')
      expect(normalizeImageCategory('loja')).toBe('shop')
      expect(normalizeImageCategory('moda')).toBe('shop')
      expect(normalizeImageCategory('boutique')).toBe('shop')
      expect(normalizeImageCategory('semijoias')).toBe('shop')
      expect(normalizeImageCategory('calcados')).toBe('shop')
    })

    it('deve retornar "general" para entradas nulas, indefinidas ou não mapeadas', () => {
      expect(normalizeImageCategory(null)).toBe('general')
      expect(normalizeImageCategory(undefined)).toBe('general')
      expect(normalizeImageCategory('')).toBe('general')
      expect(normalizeImageCategory('desconhecido')).toBe('general')
    })
  })

  describe('2. Geração de Placeholders SVG Vetoriais', () => {
    it('deve gerar SVG Data URI válido contendo cabeçalho seguro e codificação', () => {
      const dataUri = getFallbackSvgDataUri('food')
      expect(dataUri.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true)

      const decoded = decodeURIComponent(dataUri.replace('data:image/svg+xml;charset=utf-8,', ''))
      expect(decoded).toContain('<svg')
      expect(decoded).toContain('</svg>')
      expect(decoded).toContain('Alaska Local')
      expect(decoded).toContain('Gastronomia & Delivery')
      expect(decoded).toContain(THEME_SVG_CONFIGS.food.accentColor)
    })

    it('deve conter paletas e rótulos específicos para cada tema', () => {
      const themes = ['food', 'barber', 'health', 'drinks', 'shop', 'general'] as const
      themes.forEach((theme) => {
        const dataUri = getFallbackSvgDataUri(theme)
        const decoded = decodeURIComponent(dataUri.replace('data:image/svg+xml;charset=utf-8,', ''))
        expect(decoded).toContain(THEME_SVG_CONFIGS[theme].label)
        expect(decoded).toContain(THEME_SVG_CONFIGS[theme].accentColor)
      })
    })

    it('getFallbackImageUrl deve invocar getFallbackSvgDataUri retornando data URI', () => {
      const imgUrl = getFallbackImageUrl('barber')
      expect(imgUrl.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true)
      expect(imgUrl).toBe(getFallbackSvgDataUri('barber'))
    })
  })

  describe('3. Manipulador handleImageError (@error)', () => {
    it('deve substituir o src da imagem com erro pelo SVG temático correspondente', () => {
      const mockElement = {
        src: 'https://images.unsplash.com/foto-quebrada-404.jpg',
        dataset: {} as Record<string, string>,
      } as unknown as HTMLImageElement

      const event = { target: mockElement } as unknown as Event

      handleImageError(event, 'food')

      expect(mockElement.src.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true)
      expect(mockElement.dataset.hasFallbackError).toBe('true')
    })

    it('deve prevenir loop infinito quando o elemento já foi marcado com fallback', () => {
      const fallbackUrl = getFallbackImageUrl('drinks')
      const mockElement = {
        src: fallbackUrl,
        dataset: { hasFallbackError: 'true' } as Record<string, string>,
      } as unknown as HTMLImageElement

      const event = { target: mockElement } as unknown as Event

      mockElement.src = 'https://tentativa-de-loop.jpg'
      handleImageError(event, 'drinks')

      // Não altera src pois já possui hasFallbackError = 'true'
      expect(mockElement.src).toBe('https://tentativa-de-loop.jpg')
    })

    it('deve permitir customFallbackUrl se fornecido explicitamente', () => {
      const customUrl = 'https://cdn.exemplo.com/custom-placeholder.png'
      const mockElement = {
        src: 'https://images.unsplash.com/foto-quebrada-404.jpg',
        dataset: {} as Record<string, string>,
      } as unknown as HTMLImageElement

      const event = { target: mockElement } as unknown as Event

      handleImageError(event, 'shop', customUrl)

      expect(mockElement.src).toBe(customUrl)
      expect(mockElement.dataset.hasFallbackError).toBe('true')
    })

    it('deve tratar graciosamente eventos sem target válido', () => {
      expect(() => handleImageError({} as Event)).not.toThrow()
      expect(() => handleImageError({ target: null } as unknown as Event)).not.toThrow()
    })
  })
})
