// composables/useTenant.ts
import { computed, isRef, type Ref } from 'vue'
import { useRoute, useAsyncData, useRuntimeConfig, useState } from '#app'
import { TenantSchema, type Tenant, type StoreReviews } from '~/types/tenant'

/**
 * Mapa em memória de promessas em voo (in-flight) para evitar requisições concorrentes idênticas.
 */
const inFlightRequests = new Map<string, Promise<Tenant | null>>()

/**
 * Helper para resolução e mesclagem de avaliações:
 * Preserva a prova social rica do catálogo local (comentários, distribuição e contagem real)
 * caso o retorno do backend ainda não possua o bloco completo de reviews.
 */
function resolveReviews(localReviews?: StoreReviews, apiReviews?: any): StoreReviews {
    const fallbackReviews: StoreReviews = {
        rating: 4.9,
        totalReviews: 48,
        score: 4.9,
        count: 48,
        badge: 'Top Avaliado na Cidade',
        distribution: { '5': 42, '4': 5, '3': 1, '2': 0, '1': 0 },
        comments: []
    }

    const base = localReviews || fallbackReviews

    if (!apiReviews || typeof apiReviews !== 'object') {
        return base
    }

    const rating = typeof apiReviews.rating === 'number'
        ? apiReviews.rating
        : (typeof apiReviews.score === 'number' ? apiReviews.score : base.rating)

    const totalReviews = typeof apiReviews.totalReviews === 'number'
        ? apiReviews.totalReviews
        : (typeof apiReviews.count === 'number' ? apiReviews.count : base.totalReviews)

    return {
        ...base,
        ...apiReviews,
        rating,
        score: rating,
        totalReviews,
        count: totalReviews,
        badge: apiReviews.badge || base.badge,
        distribution: (apiReviews.distribution && Object.keys(apiReviews.distribution).length > 0)
            ? apiReviews.distribution
            : base.distribution,
        comments: (apiReviews.comments && apiReviews.comments.length > 0)
            ? apiReviews.comments
            : base.comments
    }
}

/**
 * Composable reativo e SSR-safe para resolução de Tenant pelo slug da rota ou customizado.
 * Estratégia API-First com Caching Reativo via useState e Deduplicação em Voo (ADR 013).
 * Elimina disparos redundantes de requisições concorrentes entre componentes da rota admin e storefront.
 */
export function useTenant(customSlug?: string | Ref<string | null | undefined>) {
    const route = useRoute()
    const config = useRuntimeConfig()
    const apiBaseUrl = config.public?.apiBaseUrl

    const slug = computed<string>(() => {
        if (isRef(customSlug)) {
            const val = customSlug.value
            if (val && String(val).toLowerCase() !== 'default') {
                return String(val).toLowerCase()
            }
        }
        if (typeof customSlug === 'string' && customSlug.toLowerCase() !== 'default') {
            return customSlug.toLowerCase()
        }
        const routeSlug = route.params.slug as string
        if (routeSlug && routeSlug.toLowerCase() !== 'default') {
            return routeSlug.toLowerCase()
        }
        return 'hamburgueria-x'
    })

    // Cache reativo global do Nuxt compartilhado por slug
    const tenantState = useState<Tenant | null>(`tenant_cache_${slug.value}`, () => null)

    // Helper defensivo para carregar o catálogo JSON local
    function loadLocalJson(): Tenant | null {
        try {
            const files = import.meta.glob('~/data/*.json', { eager: true }) as Record<
                string,
                { default?: Tenant; [key: string]: unknown }
            >

            for (const path in files) {
                const fileContent = files[path]
                const rawData = (fileContent?.default || fileContent) as Partial<Tenant>
                if (rawData && rawData.slug && rawData.slug.toLowerCase() === slug.value) {
                    return TenantSchema.parse(rawData)
                }
            }

            for (const path in files) {
                const fileName = path.split('/').pop()?.replace('.json', '').toLowerCase()
                if (fileName === slug.value) {
                    const fileContent = files[path]
                    const rawData = (fileContent?.default || fileContent) as Partial<Tenant>
                    return TenantSchema.parse(rawData)
                }
            }
        } catch (e) {
            // Silencioso
        }
        return null
    }

    const fetchTenantData = async (forceRefresh = false): Promise<Tenant | null> => {
        const currentSlug = slug.value
        if (!currentSlug) return null

        // 1. Se já está no cache reativo e não é refresh forçado, retorna imediatamente sem fazer request
        if (!forceRefresh && tenantState.value && tenantState.value.slug?.toLowerCase() === currentSlug) {
            return tenantState.value
        }

        // 2. Se já existe uma requisição em voo para este slug, reutiliza a mesma Promise (deduplicação)
        if (inFlightRequests.has(currentSlug)) {
            return inFlightRequests.get(currentSlug)!
        }

        const requestPromise = (async (): Promise<Tenant | null> => {
            let loadedTenant = loadLocalJson()
            let fromApi = false

            // Busca dados reais diretamente do backend NestJS / Postgres
            if (apiBaseUrl) {
                try {
                    const res = await $fetch<any>(
                        `${apiBaseUrl}/tenants/${currentSlug}`,
                        { timeout: 10000, retry: 1, retryDelay: 500 }
                    )
                    const apiData = (res && typeof res === 'object') ? (res.data || res) : null
                    if (apiData && typeof apiData === 'object' && apiData.slug) {
                        try {
                            const parsedApiTenant = TenantSchema.parse({
                                ...loadedTenant,
                                ...apiData,
                                reviews: resolveReviews(loadedTenant?.reviews, apiData.reviews)
                            })
                            loadedTenant = parsedApiTenant
                        } catch {
                            loadedTenant = {
                                ...(loadedTenant || {}),
                                ...apiData,
                                reviews: resolveReviews(loadedTenant?.reviews, apiData.reviews)
                            } as Tenant
                        }
                        fromApi = true
                    }
                } catch {
                    // Fallback silencioso para o catálogo local em ~/data/*.json caso a API esteja offline
                }
            }

            // Overrides operacionais do localStorage só se aplicam se a API estiver estritamente offline
            if (!fromApi && loadedTenant && typeof window !== 'undefined') {
                try {
                    const rawOverrides = localStorage.getItem(`alaska_overrides_${currentSlug}`)
                    if (rawOverrides) {
                        const overrides = JSON.parse(rawOverrides)
                        if (loadedTenant.categories && Array.isArray(loadedTenant.categories)) {
                            const deletedProductIds: string[] = overrides.deletedProductIds || []
                            const customProducts: any[] = overrides.customProducts || []

                            loadedTenant.categories = loadedTenant.categories.map((cat: any) => {
                                const baseProducts = (cat.products || []).filter(
                                    (p: any) => !deletedProductIds.includes(p.id)
                                )
                                const additionalProducts = customProducts.filter(
                                    (p: any) => p.categoryId === cat.id && !deletedProductIds.includes(p.id)
                                )
                                return {
                                    ...cat,
                                    products: [...baseProducts, ...additionalProducts]
                                }
                            })
                        }
                    }
                } catch (e) {
                    // Silencioso
                }
            }

            if (loadedTenant) {
                tenantState.value = loadedTenant
            }
            return loadedTenant
        })().finally(() => {
            inFlightRequests.delete(currentSlug)
        })

        inFlightRequests.set(currentSlug, requestPromise)
        return requestPromise
    }

    const { data: tenant, pending, error, refresh } = useAsyncData<Tenant | null>(
        `tenant-${slug.value}`,
        () => fetchTenantData(false),
        {
            watch: [slug],
            dedupe: 'defer',
            default: () => tenantState.value || loadLocalJson()
        }
    )

    const forcedRefresh = async () => {
        tenantState.value = null
        inFlightRequests.delete(slug.value)
        return refresh()
    }

    return {
        tenant,
        slug,
        pending,
        error,
        refresh: forcedRefresh
    }
}
