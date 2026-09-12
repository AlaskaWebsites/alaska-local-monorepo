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
 * caso a resposta do banco venha com o mock genérico plano de 42 avaliações.
 */
function resolveReviews(localReviews?: StoreReviews, apiReviews?: any): StoreReviews | undefined {
    if (!localReviews && !apiReviews) return undefined
    if (!localReviews) return apiReviews
    if (!apiReviews) return localReviews

    const hasLocalComments = Array.isArray(localReviews.comments) && localReviews.comments.length > 0
    const hasApiComments = Array.isArray(apiReviews.comments) && apiReviews.comments.length > 0

    const isApiGenericMock =
        (apiReviews.count === 42 || apiReviews.totalReviews === 42) &&
        (!hasApiComments || apiReviews.comments.length === 0)

    if (isApiGenericMock && localReviews.totalReviews && localReviews.totalReviews !== 42) {
        return {
            ...localReviews,
            score: localReviews.score ?? localReviews.rating ?? 4.9,
            rating: localReviews.rating ?? localReviews.score ?? 4.9,
            totalReviews: localReviews.totalReviews,
            count: localReviews.count ?? localReviews.totalReviews,
        }
    }

    return {
        ...localReviews,
        ...apiReviews,
        score: apiReviews.score ?? apiReviews.rating ?? localReviews.score ?? 5.0,
        rating: apiReviews.rating ?? apiReviews.score ?? localReviews.rating ?? 5.0,
        totalReviews: apiReviews.totalReviews ?? apiReviews.count ?? localReviews.totalReviews ?? 0,
        count: apiReviews.count ?? apiReviews.totalReviews ?? localReviews.count ?? 0,
        distribution: (apiReviews.distribution && Object.keys(apiReviews.distribution).length > 0)
            ? apiReviews.distribution
            : localReviews.distribution,
        comments: hasApiComments ? apiReviews.comments : (localReviews.comments || []),
        serviceQuality: apiReviews.serviceQuality || localReviews.serviceQuality,
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
    const apiBaseUrl = config.public?.apiBaseUrl || 'http://localhost:3333/api/v1'

    const slug = computed(() => {
        if (customSlug !== undefined && customSlug !== null) {
            const val = isRef(customSlug) ? customSlug.value : customSlug
            if (val) return String(val).toLowerCase()
        }
        return String(route.params.slug || 'hamburgueria-x').toLowerCase()
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
            console.warn('Erro ao carregar catálogo local JSON:', e)
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
                        { timeout: 4000 }
                    )
                    const apiData = (res && typeof res === 'object') ? (res.data || res) : null
                    if (apiData && (apiData.slug || apiData.id)) {
                        apiData.whatsapp = apiData.whatsapp || apiData.phoneWhatsApp || '11999999999'
                        apiData.phoneWhatsApp = apiData.phoneWhatsApp || apiData.whatsapp || '11999999999'

                        const local = loadedTenant || loadLocalJson()

                        loadedTenant = {
                            ...(local || {}),
                            ...apiData,
                            categories: (apiData.categories && apiData.categories.length > 0)
                                ? apiData.categories
                                : (local?.categories || []),
                            professionals: (apiData.professionals && apiData.professionals.length > 0)
                                ? apiData.professionals
                                : (local?.professionals || []),
                            reviews: resolveReviews(local?.reviews, apiData.reviews)
                        } as Tenant
                        fromApi = true
                    }
                } catch (e) {
                    console.warn('[useTenant] Backend offline ou inacessível, utilizando catálogo local:', e)
                }
            }

            // Overrides operacionais do localStorage só se aplicam se a API estiver estritamente offline
            if (!fromApi && loadedTenant && typeof window !== 'undefined') {
                try {
                    const rawOverrides = localStorage.getItem(`alaska_overrides_${currentSlug}`)
                    if (rawOverrides) {
                        const overrides = JSON.parse(rawOverrides)
                        if (loadedTenant.categories && Array.isArray(loadedTenant.categories)) {
                            for (const cat of loadedTenant.categories) {
                                if (cat.products && Array.isArray(cat.products)) {
                                    for (const p of cat.products) {
                                        if (overrides[p.id]) {
                                            if (overrides[p.id].isAvailable !== undefined) {
                                                p.isAvailable = overrides[p.id].isAvailable
                                                ;(p as any).available = overrides[p.id].isAvailable
                                            }
                                            if (overrides[p.id].price !== undefined) {
                                                p.price = overrides[p.id].price
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.warn('Erro ao mesclar overrides operacionais:', e)
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
