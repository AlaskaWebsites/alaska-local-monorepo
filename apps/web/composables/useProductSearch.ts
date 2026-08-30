// composables/useProductSearch.ts
import { ref, computed, isRef, type Ref } from 'vue'
import type { Category, Product } from '~/types'

/**
 * Remove acentos, diacríticos e converte para minúsculas para busca insensível a caracteres especiais.
 * Ex: "Degradê / Pão" -> "degrade / pao"
 */
export function normalizeSearchText(text?: string | null): string {
    if (!text) return ''
    return String(text)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
}

/**
 * Verifica se um produto corresponde ao termo de busca no nome, descrição ou opcionais.
 * Normaliza internamente o termo de busca para garantir case/accent insensitivity.
 */
export function isProductMatchingQuery(product: Product | null | undefined, rawQuery: string): boolean {
    const queryNorm = normalizeSearchText(rawQuery)
    if (!queryNorm) return true
    if (!product) return false

    const nameNorm = normalizeSearchText(product.name)
    const descNorm = normalizeSearchText(product.description)

    if (nameNorm.includes(queryNorm) || descNorm.includes(queryNorm)) {
        return true
    }

    // Busca também nos grupos e nomes dos opcionais com checagem defensiva
    if (product.optionGroups && Array.isArray(product.optionGroups) && product.optionGroups.length > 0) {
        for (const group of product.optionGroups) {
            if (group && group.title && normalizeSearchText(group.title).includes(queryNorm)) {
                return true
            }
            if (group && Array.isArray(group.options)) {
                for (const option of group.options) {
                    if (option && option.name && normalizeSearchText(option.name).includes(queryNorm)) {
                        return true
                    }
                }
            }
        }
    }

    return false
}

/**
 * Filtra categorias e produtos preservando a estrutura apenas para os itens correspondentes.
 */
export function filterCategoriesByQuery(categories?: Category[] | null, query?: string | null): Category[] {
    if (!categories || !Array.isArray(categories)) return []
    const normalizedQuery = normalizeSearchText(query)
    if (!normalizedQuery) return categories

    const result: Category[] = []

    for (const category of categories) {
        if (!category) continue
        const catProducts = Array.isArray(category.products) ? category.products : []
        const matchingProducts = catProducts.filter((product) =>
            isProductMatchingQuery(product, normalizedQuery)
        )

        if (matchingProducts.length > 0) {
            result.push({
                ...category,
                products: matchingProducts,
            })
        }
    }

    return result
}

/**
 * Conta o total de produtos em uma lista de categorias de forma defensiva contra nulos/indefinidos.
 */
export function countTotalProducts(categories?: Category[] | null): number {
    if (!categories || !Array.isArray(categories)) return 0
    return categories.reduce((total, category) => {
        const catProducts = category && Array.isArray(category.products) ? category.products : []
        return total + catProducts.length
    }, 0)
}

/**
 * Composable Reativo para Busca de Produtos em Tempo Real
 */
export function useProductSearch(
    categoriesSource?: Ref<Category[] | undefined | null> | Category[] | null
) {
    const searchQuery = ref('')

    const isSearching = computed(() => (searchQuery.value?.trim().length || 0) > 0)

    const filteredCategories = computed<Category[]>(() => {
        const raw = isRef(categoriesSource) ? categoriesSource.value : categoriesSource
        if (!raw || !Array.isArray(raw) || raw.length === 0) return []

        if (!isSearching.value) return raw

        return filterCategoriesByQuery(raw, searchQuery.value)
    })

    const totalResultsCount = computed(() => {
        return countTotalProducts(filteredCategories.value)
    })

    const hasResults = computed(() => {
        return (totalResultsCount.value || 0) > 0
    })

    function clearSearch() {
        searchQuery.value = ''
    }

    return {
        searchQuery,
        isSearching,
        filteredCategories,
        totalResultsCount,
        hasResults,
        clearSearch,
        normalizeSearchText,
        filterCategoriesByQuery,
        isProductMatchingQuery,
        countTotalProducts,
    }
}
