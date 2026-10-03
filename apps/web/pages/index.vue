<!-- apps/web/pages/index.vue -->
<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-rose-500 selection:text-white pb-20">
    <!-- Hero / Header da Vitrine Multi-Lojas -->
    <header class="bg-white border-b border-slate-200/80 py-10 px-4 sm:px-6">
      <div class="max-w-5xl mx-auto text-center space-y-3">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold border border-rose-100">
          <span>🚀</span>
          <span>Plataforma White-Label para Lojas Locais</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Alaska Local • Vitrines & Cardápios Digitais
        </h1>
        <p class="text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
          Demonstração de vitrines comerciais personalizadas com pedidos via WhatsApp, catálogo dinâmico, pagamentos Pix integrados e painel de controle para lojistas.
        </p>
      </div>
    </header>

    <!-- Barra de Filtros por Categoria -->
    <div class="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
      <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          v-for="tab in filterTabs"
          :key="tab.id"
          @click="activeCategory = tab.id"
          class="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border"
          :class="activeCategory === tab.id
            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'"
        >
          <span>{{ tab.emoji }}</span>
          <span>{{ tab.label }}</span>
          <span class="text-[11px] px-1.5 py-0.2 rounded-full font-mono" :class="activeCategory === tab.id ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'">
            {{ tab.count }}
          </span>
        </button>
      </div>
    </div>

    <!-- Grid de Lojas Disponíveis -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 mt-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <NuxtLink
          v-for="store in filteredTenants"
          :key="store.slug"
          :to="`/${store.slug}`"
          :aria-label="`Acessar demonstração de ${store.name}. ${getStoreCategoryLabel(resolveCategory(store))}${hasStoreReviews(store) ? `. Avaliação ${getStoreScore(store)} de 5 estrelas com ${getStoreReviewCount(store)} avaliações` : ''}`"
          class="group bg-white rounded-2xl border border-slate-200 hover:shadow-md shadow-sm transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer active:scale-[0.99]"
          :class="getStoreBorderHover(store.theme)"
        >
          <div>
            <!-- Banner Superior ou Cor do Tema -->
            <div class="h-28 w-full bg-slate-100 relative overflow-hidden">
              <img
                v-if="store.banner"
                :src="store.banner"
                :alt="`Banner de ${store.name}`"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                @error="handleImageError($event, store.theme)"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center font-bold text-slate-300 text-xl"
                :class="getStoreHeroFallbackBg(store.theme)"
              >
                {{ store.name }}
              </div>

              <!-- Pílula de Categoria -->
              <span
                class="absolute top-3 right-3 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-xs tracking-wider backdrop-blur-xs border"
                :class="getStoreCategoryBadge(resolveCategory(store))"
              >
                {{ getStoreCategoryLabel(resolveCategory(store)) }}
              </span>
            </div>

            <!-- Corpo do Card -->
            <div class="p-5">
              <div class="flex items-center justify-between gap-2">
                <h2
                  class="font-black text-slate-800 text-sm tracking-tight transition-colors line-clamp-1"
                  :class="getStoreTitleHover(store.theme)">
                  {{ store.name }}
                </h2>
                <!-- Avaliações Dinâmicas Reais (Score + Contagem de Avaliações) -->
                <div v-if="hasStoreReviews(store)" class="flex items-center gap-1 text-xs font-bold text-amber-500 shrink-0">
                  <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                  <span>{{ getStoreScore(store) }}</span>
                  <span v-if="getStoreReviewCount(store)" class="text-[11px] font-medium text-slate-400">
                    ({{ getStoreReviewCount(store) }})
                  </span>
                </div>
              </div>
              <p class="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                {{ store.description || 'Vitrines online, pedidos rápidos no WhatsApp e pagamento transparente.' }}
              </p>
            </div>
          </div>

          <!-- Rodapé do Card -->
          <div class="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
            <span class="text-slate-400 font-medium truncate max-w-[170px]">
              {{ store.address ? store.address.split('-')[0] : 'Francisco Morato - SP' }}
            </span>
            <span
              class="font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              :class="getStoreTextColor(store.theme)"
            >
              Ver vitrine
              <span>→</span>
            </span>
          </div>
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Star } from 'lucide-vue-next'
import { handleImageError } from '~/utils/images'
import { TenantSchema, type Tenant, type BusinessCategory } from '~/types'

type FilterCategory = 'all' | BusinessCategory

const activeCategory = ref<FilterCategory>('all')

const config = useRuntimeConfig()
const apiBaseUrl = config.public?.apiBaseUrl || 'http://localhost:3333/api/v1'

// 1. Carregamento resiliente dos arquivos JSON locais como baseline
function loadLocalTenants(): Tenant[] {
  const files = import.meta.glob('~/data/*.json', { eager: true }) as Record<string, { default: any }>
  const list: Tenant[] = []
  for (const path in files) {
    const raw = files[path].default || files[path]
    const parsed = TenantSchema.safeParse(raw)
    if (parsed.success) {
      list.push(parsed.data)
    }
  }
  return list
}

// 2. Estratégia API-First: Busca tenants e avaliações reais do banco de dados (NestJS API)
const { data: remoteTenants } = await useAsyncData<Tenant[]>('showcase-tenants-list', async () => {
  const localList = loadLocalTenants()
  if (apiBaseUrl) {
    try {
      // Busca atualizações para cada tenant conhecido de forma concorrente evitando 404
      const results = await Promise.allSettled(
        localList.map((t) => $fetch<any>(`${apiBaseUrl}/tenants/${t.slug}`, { timeout: 4000 }))
      )
      const merged: Tenant[] = []
      for (let i = 0; i < localList.length; i++) {
        const local = localList[i]
        const res = results[i]
        if (res.status === 'fulfilled' && res.value) {
          const item = (res.value && typeof res.value === 'object') ? (res.value.data || res.value) : null
          if (item && item.slug) {
            const mergedData = { ...local, ...item, reviews: item.reviews || local.reviews }
            const parsed = TenantSchema.safeParse(mergedData)
            if (parsed.success) {
              merged.push(parsed.data)
              continue
            }
          }
        }
        merged.push(local)
      }
      return merged
    } catch {
      // Fallback gracioso para os JSONs locais caso a API esteja offline
    }
  }
  return localList
}, { default: () => loadLocalTenants() })

const tenantsList = computed<Tenant[]>(() => {
  return (remoteTenants.value && remoteTenants.value.length > 0)
    ? remoteTenants.value
    : loadLocalTenants()
})

function resolveCategory(tenant: Tenant): BusinessCategory {
  if (tenant.businessCategory) {
    return tenant.businessCategory
  }
  if (tenant.theme === 'barber' || tenant.professionals?.length) {
    return 'hub'
  }
  return 'menu'
}

// Helpers de avaliações reais com resolução defensiva de score/rating e count/totalReviews
function getStoreScore(store: Tenant): string {
  const r = (store.reviews || {}) as any
  const val = r.score ?? r.rating ?? r.average ?? 5.0
  return Number(val).toFixed(1)
}

function getStoreReviewCount(store: Tenant): number {
  const r = (store.reviews || {}) as any
  return Number(r.totalReviews ?? r.count ?? r.total ?? 0)
}

function hasStoreReviews(store: Tenant): boolean {
  return !!store.reviews
}

// 3. Abas Dinâmicas de Filtro com Contagens Reais
const filterTabs = computed(() => [
  { id: 'all' as const, label: 'Todas as Lojas', emoji: '🌟', count: tenantsList.value.length },
  { id: 'menu' as const, label: 'Food & Delivery', emoji: '🍔', count: tenantsList.value.filter((t) => resolveCategory(t) === 'menu').length },
  { id: 'hub' as const, label: 'Serviços & Hub', emoji: '💈', count: tenantsList.value.filter((t) => resolveCategory(t) === 'hub').length },
  { id: 'shop' as const, label: 'Moda & Vitrine', emoji: '🛍️', count: tenantsList.value.filter((t) => resolveCategory(t) === 'shop').length },
  { id: 'pro' as const, label: 'Clínicas & Profissionais', emoji: '🦷', count: tenantsList.value.filter((t) => resolveCategory(t) === 'pro').length },
])

// 4. Estabelecimentos Filtrados pela Categoria Selecionada
const filteredTenants = computed(() => {
  if (activeCategory.value === 'all') {
    return tenantsList.value
  }
  return tenantsList.value.filter((tenant) => resolveCategory(tenant) === activeCategory.value)
})

// 5. Helpers de Estilização por Tema e Categoria
function getStoreTextColor(theme?: string): string {
  switch (theme) {
    case 'barber':
      return 'text-amber-600'
    case 'health':
      return 'text-cyan-600'
    case 'drinks':
      return 'text-purple-600'
    case 'rose':
      return 'text-rose-600'
    default:
      return 'text-emerald-600'
  }
}

function getStoreTitleHover(theme?: string): string {
  switch (theme) {
    case 'barber':
      return 'group-hover:text-amber-600'
    case 'health':
      return 'group-hover:text-cyan-600'
    case 'drinks':
      return 'group-hover:text-purple-600'
    case 'rose':
      return 'group-hover:text-rose-600'
    default:
      return 'group-hover:text-emerald-600'
  }
}

function getStoreBorderHover(theme?: string): string {
  switch (theme) {
    case 'barber':
      return 'hover:border-amber-300'
    case 'health':
      return 'hover:border-cyan-300'
    case 'drinks':
      return 'hover:border-purple-300'
    case 'rose':
      return 'hover:border-rose-300'
    default:
      return 'hover:border-emerald-300'
  }
}

function getStoreHeroFallbackBg(theme?: string): string {
  switch (theme) {
    case 'barber':
      return 'bg-amber-950 text-amber-500/40'
    case 'health':
      return 'bg-cyan-950 text-cyan-500/40'
    case 'drinks':
      return 'bg-purple-950 text-purple-500/40'
    case 'rose':
      return 'bg-rose-950 text-rose-500/40'
    default:
      return 'bg-slate-900 text-slate-500/40'
  }
}

function getStoreCategoryLabel(category: BusinessCategory): string {
  switch (category) {
    case 'menu':
      return 'Cardápio Digital'
    case 'hub':
      return 'Agendamento & Hub'
    case 'shop':
      return 'Vitrine & Moda'
    case 'pro':
      return 'Clínica & Consultório'
    default:
      return 'Loja Oficial'
  }
}

function getStoreCategoryBadge(category: BusinessCategory): string {
  switch (category) {
    case 'menu':
      return 'bg-amber-500/90 text-white border-amber-400/50'
    case 'hub':
      return 'bg-slate-900/90 text-amber-400 border-slate-700/50'
    case 'shop':
      return 'bg-rose-500/90 text-white border-rose-400/50'
    case 'pro':
      return 'bg-cyan-600/90 text-white border-cyan-500/50'
    default:
      return 'bg-emerald-600/90 text-white border-emerald-500/50'
  }
}
</script>
