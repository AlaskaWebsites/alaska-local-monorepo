// composables/useTenant.ts
import { ref, computed, type Ref } from 'vue'
import { useRoute } from 'vue-router'
import { TenantSchema, type Tenant } from '~/types/tenant'

function getApiBaseUrl(): string {
  try {
    const config = typeof useRuntimeConfig === 'function' ? useRuntimeConfig() : null
    const url = (config?.public?.apiBaseUrl as string)
    if (url && !url.includes('localhost')) return url
    if (typeof window !== 'undefined') {
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        return 'https://alaska-local-api.onrender.com/api/v1'
      }
    }
    return url || 'https://alaska-local-api.onrender.com/api/v1'
  } catch {
    return 'https://alaska-local-api.onrender.com/api/v1'
  }
}

/**
 * Composable reativo e SSR-safe para resolução de Tenant pelo slug da rota ou customizado.
 * Adota estratégia híbrida e resiliente: busca dados da API se disponível e mescla
 * com os catálogos locais e com os overrides operacionais do Painel do Lojista (ADR 013).
 */
export function useTenant(customSlug?: string | Ref<string | null | undefined>) {
    const route = useRoute()
    const apiBaseUrl = getApiBaseUrl()

    const slug = computed(() => {
        if (customSlug) {
            const val = typeof customSlug === 'string' ? customSlug : customSlug.value
            if (val) return val
        }
        return (route.params.slug as string) || 'default'
    })

    const { data: tenant, pending, error, refresh } = useAsyncData<Tenant | null>(
        `tenant-${slug.value}`,
        async () => {
            // 1. Helper para carregar o catálogo completo do JSON local
            const loadLocalJson = (): Tenant | null => {
                try {
                    const files = import.meta.glob('~/data/*.json', { eager: true }) as Record<
                        string,
                        any
                    >
                    for (const path in files) {
                        const fileSlug = path.split('/').pop()?.replace('.json', '')
                        if (fileSlug === slug.value) {
                            const raw = files[path].default || files[path]
                            const parsed = TenantSchema.safeParse(raw)
                            if (parsed.success) {
                                return parsed.data
                            }
                        }
                    }
                } catch (err) {
                    console.warn(`Erro ao carregar JSON local para ${slug.value}:`, err)
                }
                return null
            }

            let loadedTenant = loadLocalJson()

            // 2. Estratégia API-First Resiliente: Tenta buscar do backend NestJS no Render
            if (apiBaseUrl) {
                try {
                    const res = await $fetch<{ success: boolean; data: any }>(
                        `${apiBaseUrl}/tenants/${slug.value}`,
                        { timeout: 4000 }
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
                } catch (e) {
                    console.warn('Fallback para catálogo local:', e)
                }
            }

            // 3. Aplica overrides operacionais do Painel do Lojista (ADR 013) salvos em tempo real
            if (loadedTenant && typeof window !== 'undefined') {
                try {
                    const rawOverrides = localStorage.getItem(`alaska_overrides_${slug.value}`)
                    if (rawOverrides) {
                        const overrides = JSON.parse(rawOverrides)
                        const prodOverrides = overrides.products || overrides
                        if (loadedTenant.categories && Array.isArray(loadedTenant.categories)) {
                            for (const cat of loadedTenant.categories) {
                                if (cat.products && Array.isArray(cat.products)) {
                                    for (const p of cat.products) {
                                        if (prodOverrides[p.id]) {
                                            if (prodOverrides[p.id].isAvailable !== undefined) {
                                                p.isAvailable = prodOverrides[p.id].isAvailable
                                                ;(p as any).available = prodOverrides[p.id].isAvailable
                                            }
                                            if (prodOverrides[p.id].price !== undefined) {
                                                p.price = prodOverrides[p.id].price
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
