// composables/useTenant.ts
import { computed, isRef, type Ref } from 'vue'
import { useRoute, useAsyncData, useRuntimeConfig } from '#app'
import { TenantSchema, type Tenant } from '~/types/tenant'

/**
 * Composable reativo e SSR-safe para resolução de Tenant pelo slug da rota ou customizado.
 * Adota estratégia híbrida e resiliente: busca dados da API se disponível e mescla
 * com os catálogos locais e com os overrides operacionais do Painel do Lojista (ADR 013).
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
            // 1. Helper para carregar o catálogo completo do JSON local
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

            let loadedTenant = loadLocalJson()

            // 2. Estratégia API-First Resiliente: Tenta buscar do backend NestJS se houver baseURL
            if (apiBaseUrl) {
                try {
                    const res = await $fetch<{ success: boolean; data: any }>(
                        `${apiBaseUrl}/tenants/${slug.value}`,
                        { timeout: 2500 }
                    )
                    if (res && res.success && res.data) {
                        const apiData = res.data
                        if (Array.isArray(apiData.categories) && apiData.categories.length > 0) {
                            loadedTenant = TenantSchema.parse(apiData)
                        } else if (loadedTenant) {
                            loadedTenant = TenantSchema.parse({
                                ...loadedTenant,
                                ...apiData,
                                categories: (loadedTenant.categories && loadedTenant.categories.length > 0)
                                    ? loadedTenant.categories
                                    : (apiData.categories || []),
                                reviews: loadedTenant.reviews || apiData.reviews
                            })
                        }
                    }
                } catch {
                    // Fallback silencioso para o catálogo local
                }
            }

            // 3. Aplica overrides operacionais do Painel do Lojista (ADR 013) salvos em tempo real
            if (loadedTenant && typeof window !== 'undefined') {
                try {
                    const rawOverrides = localStorage.getItem(`alaska_overrides_${slug.value}`)
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

            return loadedTenant
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
