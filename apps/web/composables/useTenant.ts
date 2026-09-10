// composables/useTenant.ts
import { computed, isRef, type Ref } from 'vue'
import { useRoute, useAsyncData, useRuntimeConfig } from '#app'
import { TenantSchema, type Tenant } from '~/types/tenant'

/**
 * Composable reativo e SSR-safe para resolução de Tenant pelo slug da rota ou customizado.
 * Estratégia API-First: consome os dados reais e completos do backend NestJS / PostgreSQL.
 * Mantém fallback local apenas para resiliência e modo offline de demonstração.
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

    const { data: tenant, pending, error, refresh } = useAsyncData<Tenant | null>(
        `tenant-${slug.value}`,
        async () => {
            // 1. Estratégia API-First: Busca dados reais diretamente do backend NestJS / Postgres
            if (apiBaseUrl) {
                try {
                    const res = await $fetch<any>(
                        `${apiBaseUrl}/tenants/${slug.value}`,
                        { timeout: 4000 }
                    )
                    const apiData = (res && typeof res === 'object') ? (res.data || res) : null

                    if (apiData && (apiData.slug || apiData.id)) {
                        // Se o backend retornou com categorias e produtos populados do banco, usa 100% API
                        if (Array.isArray(apiData.categories) && apiData.categories.length > 0) {
                            return TenantSchema.parse(apiData)
                        }

                        // Se o banco foi conectado mas ainda não recebeu o seed de categorias, tenta o fallback local temporário
                        const local = loadLocalJson()
                        if (local) {
                            return TenantSchema.parse({
                                ...local,
                                ...apiData,
                                categories: (apiData.categories && apiData.categories.length > 0)
                                    ? apiData.categories
                                    : (local.categories || []),
                                professionals: (apiData.professionals && apiData.professionals.length > 0)
                                    ? apiData.professionals
                                    : (local.professionals || []),
                                reviews: apiData.reviews || local.reviews
                            })
                        }

                        return TenantSchema.parse(apiData)
                    }
                } catch (e) {
                    // Falha de conexão: API offline ou em inicialização
                }
            }

            // 2. Fallback de resiliência: catálogo local em ~/data/*.json
            return loadLocalJson()
        },
        {
            watch: [slug]
        }
    )

    // Helper defensivo para carregar o catálogo JSON local caso o backend esteja offline
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

    return {
        tenant,
        slug,
        pending,
        error,
        refresh
    }
}
