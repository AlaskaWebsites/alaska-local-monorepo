// composables/useTenant.ts
import { computed, isRef, type Ref } from 'vue'
import { useRoute, useAsyncData, useRuntimeConfig } from '#app'
import { TenantSchema, type Tenant } from '~/types/tenant'

/**
 * Composable reativo e SSR-safe para resolução de Tenant pelo slug da rota ou customizado.
 * Adota estratégia híbrida e resiliente: busca dados da API se disponível, mas NUNCA perde
 * as categorias, produtos e reviews presentes nos catálogos locais em ~/data/*.json.
 */
export function useTenant(customSlug?: string | Ref<string | null | undefined>) {
    const route = useRoute()
    const config = useRuntimeConfig()
    const apiBaseUrl = config.public?.apiBaseUrl

    const slug = computed(() => {
        if (customSlug !== undefined && customSlug !== null) {
            const val = isRef(customSlug) ? customSlug.value : customSlug
            if (val) return String(val).toLowerCase()
        }
        return String(route.params.slug || 'hamburgueria-x').toLowerCase()
    })

    const { data: tenant, pending, error, refresh } = useAsyncData<Tenant | null>(
        `tenant-${slug.value}`,
        async () => {
            // Helper para carregar o catálogo completo do JSON local
            const loadLocalJson = (): Tenant | null => {
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
                    console.error('Erro ao carregar catálogo local JSON:', e)
                }
                return null
            }

            const localTenant = loadLocalJson()

            // 1. Estratégia API-First Resiliente: Tenta buscar do backend NestJS se houver baseURL
            if (apiBaseUrl) {
                try {
                    const res = await $fetch<{ success: boolean; data: any }>(
                        `${apiBaseUrl}/tenants/${slug.value}`,
                        { timeout: 2500 }
                    )
                    if (res && res.success && res.data) {
                        const apiData = res.data
                        // Se a API retornou categorias preenchidas, usa direto
                        if (Array.isArray(apiData.categories) && apiData.categories.length > 0) {
                            return TenantSchema.parse(apiData)
                        }

                        // Se a API retornou o tenant mas sem categorias (ex: seed de metadata),
                        // faz o merge preservando os produtos, categorias e reviews do catálogo local!
                        if (localTenant) {
                            return TenantSchema.parse({
                                ...localTenant,
                                ...apiData,
                                categories: (localTenant.categories && localTenant.categories.length > 0)
                                    ? localTenant.categories
                                    : (apiData.categories || []),
                                reviews: localTenant.reviews || apiData.reviews
                            })
                        }

                        return TenantSchema.parse(apiData)
                    }
                } catch {
                    // Falha silenciosa na API: prossegue para o catálogo local
                }
            }

            return localTenant
        },
        {
            watch: [slug]
        }
    )

    return {
        tenant,
        slug,
        pending,
        error,
        refresh
    }
}
