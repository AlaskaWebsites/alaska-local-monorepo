// tests/units/ssr-safety.test.ts
import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import {
    useProductSearch,
    countTotalProducts,
    filterCategoriesByQuery,
    isProductMatchingQuery,
    normalizeSearchText
} from '~/composables/useProductSearch'
import { useCart } from '~/composables/useCart'
import type { Category, Product } from '~/types'

describe('SSR Safety & Defensive Guardrails against undefined / null', () => {
    describe('useProductSearch & Helpers', () => {
        it('normalizeSearchText handles undefined, null, empty and accented strings', () => {
            expect(normalizeSearchText(undefined)).toBe('')
            expect(normalizeSearchText(null)).toBe('')
            expect(normalizeSearchText('')).toBe('')
            expect(normalizeSearchText('  Degradê & Pão  ')).toBe('degrade & pao')
        })

        it('countTotalProducts safely handles null, undefined and malformed categories', () => {
            expect(countTotalProducts(null)).toBe(0)
            expect(countTotalProducts(undefined)).toBe(0)
            expect(countTotalProducts([])).toBe(0)
            expect(countTotalProducts([
                { id: '1', name: 'Cat 1', products: [] } as any,
                { id: '2', name: 'Cat 2', products: undefined } as any,
                { id: '3', name: 'Cat 3' } as any,
                null as any,
            ])).toBe(0)
        })

        it('countTotalProducts correctly sums products when valid', () => {
            const categories: Category[] = [
                {
                    id: 'c1',
                    name: 'Bebidas',
                    products: [
                        { id: 'p1', name: 'Vinho', description: 'Tinto', price: 50, available: true, image: '', optionGroups: [] },
                        { id: 'p2', name: 'Cerveja', description: 'Lager', price: 10, available: true, image: '', optionGroups: [] }
                    ]
                },
                {
                    id: 'c2',
                    name: 'Destilados',
                    products: [
                        { id: 'p3', name: 'Gin', description: 'London Dry', price: 80, available: true, image: '', optionGroups: [] }
                    ]
                }
            ]
            expect(countTotalProducts(categories)).toBe(3)
        })

        it('filterCategoriesByQuery safely returns empty array or filtered results without throwing', () => {
            expect(filterCategoriesByQuery(null, 'vinho')).toEqual([])
            expect(filterCategoriesByQuery(undefined, 'vinho')).toEqual([])
            expect(filterCategoriesByQuery([], 'vinho')).toEqual([])

            const categories: Category[] = [
                {
                    id: 'c1',
                    name: 'Vinhos',
                    products: [
                        { id: 'p1', name: 'Cabernet Sauvignon', description: 'Vinho Tinto Seco', price: 89.9, available: true, image: '', optionGroups: [] },
                        { id: 'p2', name: 'Heineken 350ml', description: 'Cerveja Puro Malte', price: 6.5, available: true, image: '', optionGroups: [] }
                    ]
                }
            ]

            const filtered = filterCategoriesByQuery(categories, 'cabernet')
            expect(filtered.length).toBe(1)
            expect(filtered[0]?.products?.length).toBe(1)
            expect(filtered[0]?.products?.[0]?.name).toBe('Cabernet Sauvignon')
        })

        it('isProductMatchingQuery handles products with and without optionGroups', () => {
            expect(isProductMatchingQuery(null, 'test')).toBe(false)
            expect(isProductMatchingQuery(undefined, 'test')).toBe(false)

            const productWithoutOptions: Product = {
                id: 'p1',
                name: 'Cerveja Corona',
                description: '330ml gelada',
                price: 9.9,
                available: true,
                image: '',
                optionGroups: [],
            }
            expect(isProductMatchingQuery(productWithoutOptions, 'corona')).toBe(true)
            expect(isProductMatchingQuery(productWithoutOptions, 'whisky')).toBe(false)

            const productWithOptions: Product = {
                id: 'p2',
                name: 'Combo Vodka',
                description: 'Garrafa 1L',
                price: 120,
                available: true,
                image: '',
                optionGroups: [
                    {
                        id: 'g1',
                        title: 'Acompanhamento de Energético',
                        required: false,
                        min: 0,
                        max: 2,
                        options: [
                            { id: 'o1', name: 'Red Bull Melancia', price: 15, maxQuantity: 1 },
                            { id: 'o2', name: 'Monster Tropical', price: 12, maxQuantity: 1 }
                        ]
                    }
                ]
            }
            expect(isProductMatchingQuery(productWithOptions, 'melancia')).toBe(true)
            expect(isProductMatchingQuery(productWithOptions, 'energetico')).toBe(true)
        })

        it('useProductSearch works seamlessly when initialized with undefined or reactive null source', () => {
            const categoriesRef = ref<Category[] | null>(null)
            const { isSearching, filteredCategories, totalResultsCount, hasResults } = useProductSearch(categoriesRef)

            expect(isSearching.value).toBe(false)
            expect(filteredCategories.value).toEqual([])
            expect(totalResultsCount.value).toBe(0)
            expect(hasResults.value).toBe(false)
        })
    })

    describe('useCart SSR Compatibility & Aliases', () => {
        it('provides both standard names and aliases (cartItems, addToCart, removeCartItem)', () => {
            const cart = useCart('tenant-test')

            expect(cart.items).toBeDefined()
            expect(cart.cartItems).toBeDefined()
            expect(cart.cartItems).toBe(cart.items)

            expect(typeof cart.addItem).toBe('function')
            expect(typeof cart.addToCart).toBe('function')
            expect(typeof cart.removeItem).toBe('function')
            expect(typeof cart.removeCartItem).toBe('function')
            expect(typeof cart.clearCart).toBe('function')

            expect(cart.totalItemsCount.value).toBe(0)
            expect(cart.cartSubtotal.value).toBe(0)
            expect(cart.isEmpty.value).toBe(true)
        })
    })
})
