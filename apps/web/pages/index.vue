<!-- pages/index.vue -->
<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 pb-16">
    <!-- Header e Apresentação -->
    <header class="bg-white border-b border-slate-200/80 py-12 px-4 sm:px-6">
      <div class="max-w-5xl mx-auto text-center space-y-4">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          <Sparkles class="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
          <span>Ecossistema Alaska Local</span>
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
          Vitrines Digitais & Catálogos Online
        </h1>
        <p class="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Demonstrações interativas de alta conversão para comércios, lojas e prestadores de serviços com fechamento direto no WhatsApp.
        </p>

        <!-- Filtros por Categoria de Negócio (Semântica de Tablist W3C - Anti-Layout Shift & Anti-Clipping Desktop) -->
        <div class="flex items-center justify-start sm:justify-center flex-nowrap sm:flex-wrap gap-2 pt-4 overflow-x-auto sm:overflow-x-visible no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0" role="tablist"
          aria-label="Filtrar demonstrações por categoria de negócio">
          <button
            v-for="tab in filterTabs"
            :key="tab.id"
            role="tab"
            :aria-selected="activeCategory === tab.id"
            :aria-controls="'showcase-grid'"
            @click="activeCategory = tab.id"
            class="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 border"
            :class="[
              activeCategory === tab.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-slate-200'
            ]"
          >
            <span>{{ tab.emoji }}</span>
            <span>{{ tab.label }}</span>
            <span class="text-[11px] px-1.5 py-0.5 rounded-full font-medium"
              :class="activeCategory === tab.id ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'">
              {{ tab.count }}
            </span>
          </button>
        </div>
      </div>
    </header>

    <!-- Grid de Demonstrações -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 pt-10 min-h-[50vh]">
      <div id="showcase-grid" role="region" aria-label="Lista de estabelecimentos disponíveis"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <NuxtLink
          v-for="store in filteredTenants"
          :key="store.slug"
          :to="`/${store.slug}`"
          :aria-label="`Acessar demonstração de ${store.name}. ${getStoreCategoryLabel(resolveCategory(store))}${hasStoreReviews(store) ? `. Avaliação ${getStoreScore(store)} de 5 estrelas com ${getStoreReviewCount(store)} avaliações` : ''}`"
          class="group bg-white rounded-2xl border border-slate-200 hover:shadow-md shadow-sm transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer active:scale-[0.99]"
          :class="getStoreBorderHover(store.theme)"
        >
          <!-- Imagem / Banner do Card -->
          <div class="relative h-48 w-full bg-slate-100 overflow-hidden">
            <img
              v-if="store.banner || store.logo"
              :src="store.banner || store.logo"
              :alt="store.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              @error="handleImageError($event, store.theme)"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center font-bold text-3xl bg-slate-100"
              :class="getStoreTextColor(store.theme)"
            >
              {{ store.name.charAt(0) }}
            </div>

            <!-- Badge de Categoria de Negócio -->
            <span class="absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm backdrop-blur-md"
              :class="getCategoryBadgeClass(resolveCategory(store))">
              {{ getStoreCategoryLabel(resolveCategory(store)) }}
            </span>
          </div>

          <!-- Informações e Corpo do Card -->
          <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <div class="flex items-start justify-between gap-2">
                <h2 class="font-bold text-base text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-1"
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
                {{ store.description }}
              </p>
            </div>

            <!-- Botão de Ação -->
            <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold"
              :class="getStoreTextHover(store.theme)">
              <span>{{ getStoreActionText(resolveCategory(store)) }}</span>
              <ChevronRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </div>
          </div>
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { TenantSchema } from '~/types/tenant'
import type { Tenant, BusinessCategory, StoreReviews } from '~/types/tenant'
import { handleImageError } from '~/utils/images'
import { Sparkles, Star, ChevronRight } from 'lucide-vue-next'

type FilterCategory = 'all' | BusinessCategory

const activeCategory = ref<FilterCategory>('all')

const config = useRuntimeConfig()
const apiBaseUrl = config.public?.apiBaseUrl || 'http://localhost:3333/api/v1'

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
      const res = await $fetch<any>(`${apiBaseUrl}/tenants`, { timeout: 4000 })
      const data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : null)
      if (Array.isArray(data) && data.length > 0) {
        const merged: Tenant[] = []
        for (const item of data) {
          const local = localList.find((l) => l.slug?.toLowerCase() === item.slug?.toLowerCase() || l.id === item.id)
          const mergedData = local
            ? { ...local, ...item, reviews: resolveReviews(local.reviews, item.reviews) }
            : item
          const parsed = TenantSchema.safeParse(mergedData)
          if (parsed.success) {
            merged.push(parsed.data)
          }
        }
        if (merged.length > 0) {
          const missingLocals = localList.filter((l) => !merged.some((m) => m.slug?.toLowerCase() === l.slug?.toLowerCase()))
          return [...merged, ...missingLocals]
        }
      }
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
  if (tenant.businessCategory) return tenant.businessCategory
  if (tenant.slug === 'bella-donna' || tenant.slug === 'karine-finardi') return 'shop'
  if (tenant.slug === 'barbearia-style') return 'hub'
  if (tenant.slug === 'clinica-sorriso') return 'pro'
  if (tenant.template === 'hub' || tenant.template === 'booking') return 'hub'
  if (tenant.template === 'pro') return 'pro'
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
  { id: 'shop' as const, label: 'Lojas & Boutiques', emoji: '🛍️', count: tenantsList.value.filter((t) => resolveCategory(t) === 'shop').length },
  { id: 'hub' as const, label: 'Barbearias & Serviços', emoji: '💈', count: tenantsList.value.filter((t) => resolveCategory(t) === 'hub').length },
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
      return 'text-amber-500'
    case 'health':
      return 'text-teal-600'
    case 'drinks':
      return 'text-purple-600'
    default:
      return 'text-red-600'
  }
}

function getStoreCategoryLabel(cat?: string): string {
  switch (cat) {
    case 'shop':
      return '🛍️ Vitrine & Catálogo'
    case 'hub':
      return '💈 Serviços & Agenda'
    case 'pro':
      return '🦷 Consultas & Pro'
    default:
      return '🍔 Cardápio & Delivery'
  }
}

function getCategoryBadgeClass(cat?: string): string {
  switch (cat) {
    case 'shop':
      return 'bg-pink-950/80 text-pink-200 border border-pink-800'
    case 'hub':
      return 'bg-amber-950/80 text-amber-200 border border-amber-800'
    case 'pro':
      return 'bg-teal-950/80 text-teal-200 border border-teal-800'
    default:
      return 'bg-red-950/80 text-red-200 border border-red-800'
  }
}

function getStoreActionText(cat?: string): string {
  switch (cat) {
    case 'shop':
      return 'Ver vitrine e produtos'
    case 'hub':
      return 'Ver serviços e agendar'
    case 'pro':
      return 'Agendar consulta / avaliação'
    default:
      return 'Acessar cardápio completo'
  }
}

function getStoreTitleHover(theme?: string): string {
  switch (theme) {
    case 'barber':
      return 'group-hover:text-amber-600'
    case 'health':
      return 'group-hover:text-teal-600'
    case 'drinks':
      return 'group-hover:text-purple-600'
    default:
      return 'group-hover:text-red-600'
  }
}

function getStoreBorderHover(theme?: string): string {
  switch (theme) {
    case 'barber':
      return 'hover:border-amber-400'
    case 'health':
      return 'hover:border-teal-400'
    case 'drinks':
      return 'hover:border-purple-400'
    default:
      return 'hover:border-red-400'
  }
}

function getStoreTextHover(theme?: string): string {
  switch (theme) {
    case 'barber':
      return 'text-amber-600'
    case 'health':
      return 'text-teal-600'
    case 'drinks':
      return 'text-purple-600'
    default:
      return 'text-red-600'
  }
}
</script>
