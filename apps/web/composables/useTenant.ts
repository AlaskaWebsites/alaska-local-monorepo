// composables/useTenant.ts
import { ref, computed, onMounted, type Ref } from 'vue'
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
 * Conecta diretamente ao PostgreSQL via API NestJS no Render (Fonte Única da Verdade).
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
            // 1. Helper para carregar o catálogo local de contingência (offline fallback)
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
            let fromApi = false

            // 2. Estratégia API-First: Busca dados reais diretamente do PostgreSQL no Render
            if (apiBaseUrl) {
                try {
                    const res = await $fetch<any>(
                        `${apiBaseUrl}/tenants/${slug.value}`,
                        {
                            timeout: 5000,
                            headers: {
                                'Cache-Control': 'no-cache',
                                'Pragma': 'no-cache'
                            },
                            query: {
                                _t: Date.now()
                            }
                        }
                    )
                    const apiData = (res && typeof res === 'object') ? (res.data || res) : null
                    if (apiData && (apiData.slug || apiData.id)) {
                        apiData.whatsapp = apiData.whatsapp || apiData.phoneWhatsApp || '11999999999'
                        apiData.phoneWhatsApp = apiData.phoneWhatsApp || apiData.whatsapp || '11999999999'

                        if (Array.isArray(apiData.categories) && apiData.categories.length > 0) {
                            loadedTenant = apiData as Tenant
                            fromApi = true
                        } else if (loadedTenant) {
                            loadedTenant = {
                                ...loadedTenant,
                                ...apiData,
                                categories: (loadedTenant.categories && loadedTenant.categories.length > 0)
                                    ? loadedTenant.categories
                                    : (apiData.categories || []),
                                reviews: loadedTenant.reviews || apiData.reviews
                            } as Tenant
                            fromApi = true
                        }
                    }
                } catch (e) {
                    console.warn('[useTenant] Backend offline ou inacessível, utilizando catálogo local:', e)
                }
            }

            // 3. Overrides operacionais do localStorage só se aplicam se a API estiver estritamente offline
            if (!fromApi && loadedTenant && typeof window !== 'undefined') {
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
                    console.warn('Erro ao mesclar overrides locais:', e)
                }
            }

            return loadedTenant
        },
        {
            watch: [slug]
        }
    )

    // Auto-refresh inteligente quando o usuário volta para a aba no celular ou desktop
    if (typeof window !== 'undefined') {
        onMounted(() => {
            const handleVisibility = () => {
                if (document.visibilityState === 'visible') {
                    refresh()
                }
            }
            window.addEventListener('visibilitychange', handleVisibility)
            window.addEventListener('focus', () => refresh())
        })
    }

    return {
        tenant,
        slug,
        pending,
        error,
        refresh
    }
}
