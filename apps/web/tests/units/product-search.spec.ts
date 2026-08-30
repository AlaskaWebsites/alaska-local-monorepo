// tests/units/product-search.spec.ts
import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import {
    normalizeSearchText,
    isProductMatchingQuery,
    filterCategoriesByQuery,
    countTotalProducts,
    useProductSearch,
} from '~/composables/useProductSearch'
import { CategorySchema, ProductSchema, type Category, type Product } from '~/types'

// Mock de Categorias e Produtos para Testes
const mockCategories: Category[] = [
    CategorySchema.parse({
        id: 'cat-lanches',
        name: 'Hambúrgueres Artesanais',
        icon: 'burger',
        products: [
            {
                id: 'prod-smash-bacon',
                name: 'Smash Duplo com Bacon',
                description: 'Dois burgers angus com queijo cheddar e bacon crocante.',
                price: 28.0,
                available: true,
                optionGroups: [
                    {
                        id: 'opt-ponto',
                        title: 'Ponto da Carne',
                        required: true,
                        min: 1,
                        max: 1,
                        options: [{ id: 'opt-bem-passado', name: 'Bem Passado', price: 0, maxQuantity: 1 }],
                    },
                ],
            },
            {
                id: 'prod-cheese-salada',
                name: 'Classic Cheese Salada',
                description: 'Burger 160g com alface americana fresca, tomate e maionese artesanal.',
                price: 24.0,
                available: true,
                optionGroups: [],
            },
        ],
    }),
    CategorySchema.parse({
        id: 'cat-bebidas',
        name: 'Bebidas Geladas',
        icon: 'drink',
        products: [
            {
                id: 'prod-coca-cola',
                name: 'Refrigerante Coca-Cola 350ml',
                description: 'Lata gelada trincando.',
                price: 6.5,
                available: true,
                optionGroups: [],
            },
            {
                id: 'prod-suco-laranja',
                name: 'Suco Natural de Laranja',
                description: 'Feito na hora sem adição de açúcar.',
                price: 8.0,
                available: true,
                optionGroups: [],
            },
        ],
    }),
]

describe('Unit: Composable e Regras de Busca de Produtos (useProductSearch.ts)', () => {
    describe('1. Normalização de Texto (normalizeSearchText)', () => {
        it('deve remover acentos e converter para minúsculas', () => {
            expect(normalizeSearchText('Pão de Queijo')).toBe('pao de queijo')
            expect(normalizeSearchText('Degradê')).toBe('degrade')
            expect(normalizeSearchText('Café Especial')).toBe('cafe especial')
            expect(normalizeSearchText('Açúcar Mascavo')).toBe('acucar mascavo')
        })

        it('deve tratar espaços extras e caracteres vazios/indefinidos', () => {
            expect(normalizeSearchText('   Hamburgueria   ')).toBe('hamburgueria')
            expect(normalizeSearchText('')).toBe('')
            expect(normalizeSearchText(undefined)).toBe('')
        })
    })

    describe('2. Verificação de Correspondência de Produto (isProductMatchingQuery)', () => {
        const product = mockCategories[0].products[0] // Smash Duplo com Bacon

        it('deve corresponder por parte do nome (case/accent insensitive)', () => {
            expect(isProductMatchingQuery(product, 'bacon')).toBe(true)
            expect(isProductMatchingQuery(product, 'SMASH')).toBe(true)
            expect(isProductMatchingQuery(product, 'duplo')).toBe(true)
        })

        it('deve corresponder por palavras na descrição do produto', () => {
            expect(isProductMatchingQuery(product, 'angus')).toBe(true)
            expect(isProductMatchingQuery(product, 'cheddar')).toBe(true)
            expect(isProductMatchingQuery(product, 'crocante')).toBe(true)
        })

        it('deve corresponder por opcionais do produto', () => {
            expect(isProductMatchingQuery(product, 'ponto da carne')).toBe(true)
            expect(isProductMatchingQuery(product, 'bem passado')).toBe(true)
        })

        it('deve retornar false quando não houver correspondência', () => {
            expect(isProductMatchingQuery(product, 'pizza')).toBe(false)
            expect(isProductMatchingQuery(product, 'suco')).toBe(false)
        })

        it('deve retornar true quando a query for vazia', () => {
            expect(isProductMatchingQuery(product, '')).toBe(true)
        })
    })

    describe('3. Filtragem de Categorias (filterCategoriesByQuery)', () => {
        it('deve retornar todas as categorias e produtos quando a busca for vazia', () => {
            const result = filterCategoriesByQuery(mockCategories, '')
            expect(result).toHaveLength(2)
            expect(countTotalProducts(result)).toBe(4)
        })

        it('deve filtrar produtos e excluir categorias que não possuem correspondências', () => {
            // Busca por "bacon" -> apenas categoria de lanches, apenas 1 produto
            const result = filterCategoriesByQuery(mockCategories, 'bacon')
            expect(result).toHaveLength(1)
            expect(result[0].id).toBe('cat-lanches')
            expect(result[0].products).toHaveLength(1)
            expect(result[0].products[0].id).toBe('prod-smash-bacon')
        })

        it('deve encontrar produtos buscando sem acento (ex: "acucar" encontra "açúcar")', () => {
            const result = filterCategoriesByQuery(mockCategories, 'acucar')
            expect(result).toHaveLength(1)
            expect(result[0].id).toBe('cat-bebidas')
            expect(result[0].products[0].id).toBe('prod-suco-laranja')
        })

        it('deve retornar array vazio quando nenhum produto for encontrado', () => {
            const result = filterCategoriesByQuery(mockCategories, 'termo_inexistente_123')
            expect(result).toHaveLength(0)
            expect(countTotalProducts(result)).toBe(0)
        })
    })

    describe('4. Estado Reativo do Composable (useProductSearch)', () => {
        it('deve inicializar com busca vazia e categorias completas', () => {
            const categoriesRef = ref(mockCategories)
            const { searchQuery, isSearching, filteredCategories, totalResultsCount, hasResults } =
                useProductSearch(categoriesRef)

            expect(searchQuery.value).toBe('')
            expect(isSearching.value).toBe(false)
            expect(filteredCategories.value).toHaveLength(2)
            expect(totalResultsCount.value).toBe(4)
            expect(hasResults.value).toBe(true)
        })

        it('deve atualizar reativamente ao alterar searchQuery', () => {
            const categoriesRef = ref(mockCategories)
            const { searchQuery, isSearching, filteredCategories, totalResultsCount, hasResults, clearSearch } =
                useProductSearch(categoriesRef)

            searchQuery.value = 'coca'

            expect(isSearching.value).toBe(true)
            expect(filteredCategories.value).toHaveLength(1)
            expect(totalResultsCount.value).toBe(1)
            expect(hasResults.value).toBe(true)

            // Limpa a busca
            clearSearch()
            expect(searchQuery.value).toBe('')
            expect(isSearching.value).toBe(false)
            expect(totalResultsCount.value).toBe(4)
        })

        it('deve reportar hasResults como false quando a busca não encontrar nada', () => {
            const categoriesRef = ref(mockCategories)
            const { searchQuery, isSearching, filteredCategories, totalResultsCount, hasResults } =
                useProductSearch(categoriesRef)

            searchQuery.value = 'palavra_aleatoria'

            expect(isSearching.value).toBe(true)
            expect(filteredCategories.value).toHaveLength(0)
            expect(totalResultsCount.value).toBe(0)
            expect(hasResults.value).toBe(false)
        })
    })
})
