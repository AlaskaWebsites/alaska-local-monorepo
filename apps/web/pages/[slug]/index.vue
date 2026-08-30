<!-- pages/[slug]/index.vue -->
<template>
  <div v-if="tenant" class="min-h-screen bg-slate-50 text-slate-900 pb-32">
    <!-- 1. Banner de Capa Hero -->
    <div class="relative h-48 sm:h-64 w-full bg-slate-900 overflow-hidden">
      <img
        v-if="tenant.banner"
        :src="tenant.banner"
        :alt="`Banner de ${tenant.name}`"
        class="w-full h-full object-cover opacity-80"
        @error="handleImageError($event, tenant.theme)"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

      <!-- Botão Voltar ao Topo / Início -->
      <NuxtLink
        to="/"
        class="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-semibold hover:bg-black/60 transition-colors border border-white/10"
      >
        <ChevronLeft class="w-4 h-4" />
        <span>Início</span>
      </NuxtLink>

      <!-- Botão de Compartilhar -->
      <button
        @click="shareStore"
        class="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-xs font-semibold hover:bg-black/60 transition-colors border border-white/10 cursor-pointer"
        aria-label="Compartilhar vitrine"
      >
        <Share2 class="w-4 h-4" />
        <span class="hidden sm:inline">Compartilhar</span>
      </button>
    </div>

    <!-- 2. Header & Card de Identidade da Loja -->
    <header class="max-w-4xl mx-auto px-4 -mt-16 sm:-mt-20 relative z-10">
      <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 flex flex-col items-center text-center">
        <!-- Logo Flutuante -->
        <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-white shadow-lg border-4 border-white -mt-16 sm:-mt-20 mb-4 shrink-0">
          <img
            v-if="tenant.logo"
            :src="tenant.logo"
            :alt="`Logo de ${tenant.name}`"
            class="w-full h-full object-cover"
            @error="handleImageError($event, tenant.theme)"
          />
        </div>

        <div class="flex items-center gap-2 flex-wrap justify-center mb-1">
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {{ tenant.name }}
          </h1>
          <span
            v-if="tenant.badge"
            class="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border shadow-2xs"
            :class="[themeClasses.badgeBg, themeClasses.badgeText, themeClasses.badgeBorder]"
          >
            {{ tenant.badge }}
          </span>
        </div>

        <p v-if="tenant.description" class="text-sm text-slate-600 max-w-lg mb-4 leading-relaxed">
          {{ tenant.description }}
        </p>

        <!-- Avaliações, Status de Abertura & Ações Rápidas -->
        <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-semibold mb-6">
          <button
            v-if="tenant.reviews"
            @click="isReviewsOpen = true"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 hover:bg-amber-100 transition-colors cursor-pointer"
            aria-label="Ver avaliações do estabelecimento"
          >
            <Star class="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{{ Number(tenant.reviews?.rating || 5).toFixed(1) }}</span>
            <span class="text-slate-500">({{ tenant.reviews?.totalReviews || 0 }})</span>
          </button>

          <!-- Badge Dinâmico de Aberto / Fechado com Horários -->
          <div
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border"
            :class="isOpen ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' : 'bg-rose-50 text-rose-700 border-rose-200/80'"
            :aria-label="openingAriaLabel"
          >
            <span class="w-2 h-2 rounded-full" :class="isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'"></span>
            <span>{{ statusText }}</span>
          </div>

          <!-- Botão Agendar Horário em Destaque (Alaska Hub & Pro) -->
          <button
            v-if="isServiceStore"
            @click="openBookingModal"
            class="flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            :class="themeClasses.buttonPrimary"
            aria-label="Abrir agendamento de horários"
          >
            <Calendar class="w-3.5 h-3.5" />
            <span>Agendar Horário</span>
          </button>
        </div>

        <!-- Meta Informações Rápidas -->
        <div class="w-full pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs text-slate-600">
          <div v-if="tenant.address" class="flex items-center justify-center gap-1.5">
            <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span class="truncate">{{ tenant.address }}</span>
          </div>
          <div v-if="tenant.deliveryType" class="flex items-center justify-center gap-1.5">
            <Truck class="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{{ tenant.deliveryType }}</span>
          </div>
          <div v-if="tenant.openingHours" class="flex items-center justify-center gap-1.5">
            <Clock class="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{{ tenant.openingHours.open }} às {{ tenant.openingHours.close }}</span>
          </div>
          <div class="flex items-center justify-center gap-1.5">
            <a
              :href="`https://wa.me/${tenant.phoneWhatsApp}`"
              target="_blank"
              rel="noopener noreferrer"
              class="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
            >
              <Phone class="w-3.5 h-3.5" />
              <span>WhatsApp Direto</span>
            </a>
          </div>
        </div>
      </div>
    </header>

    <!-- 3. Campo de Busca em Tempo Real (Zero Latência) -->
    <div class="max-w-4xl mx-auto px-4 mt-6">
      <ProductSearchInput
        v-model="searchQuery"
        placeholder="Buscar no cardápio / catálogo..."
        :total-results="totalResultsCount"
        :is-searching="isSearching"
        @clear="clearSearch"
      />
    </div>

    <!-- 4. Carrossel de Destaques (Se não houver busca ativa) -->
    <section v-if="!isSearching && (featuredProducts || []).length > 0" class="max-w-4xl mx-auto px-4 mt-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles class="w-4 h-4" :class="themeClasses.primaryText" />
          <span>{{ isServiceStore ? 'Serviços Mais Procurados' : 'Mais Pedidos' }}</span>
        </h2>
        <div class="flex gap-2">
          <button
            @click="scrollCarousel('left')"
            class="p-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            aria-label="Rolar destaques para esquerda"
          >
            <ChevronLeft class="w-4 h-4" />
          </button>
          <button
            @click="scrollCarousel('right')"
            class="p-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            aria-label="Rolar destaques para direita"
          >
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        ref="carouselRef"
        class="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        <div
          v-for="product in (featuredProducts || [])"
          :key="product.id"
          @click="handleProductClick(product)"
          class="shrink-0 w-64 sm:w-68 md:w-72 bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer group active:scale-[0.99]"
        >
          <div class="relative h-32 w-full bg-slate-100 overflow-hidden">
            <img
              v-if="product.image"
              :src="product.image"
              :alt="product.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              @error="handleImageError($event, tenant?.theme)"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-slate-400 text-2xl font-bold bg-slate-100">
              {{ product.name.charAt(0) }}
            </div>
            <span
              v-if="product.originalPrice"
              class="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-extrabold shadow-sm"
            >
              OFERTA
            </span>
          </div>

          <div class="p-3.5 flex-1 flex flex-col justify-between">
            <div>
              <h3 class="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors line-clamp-1">
                {{ product.name }}
              </h3>
              <p v-if="product.description" class="text-xs text-slate-500 line-clamp-2 mt-1">
                {{ product.description }}
              </p>
            </div>

            <div class="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span v-if="product.originalPrice" class="text-[10px] text-slate-400 line-through mr-1 font-mono">
                  {{ formatCurrency(product.originalPrice) }}
                </span>
                <span class="text-sm font-extrabold text-slate-900 font-mono" :class="themeClasses.primaryText">
                  {{ formatCurrency(product.price) }}
                </span>
              </div>
              <button
                class="px-2.5 py-1 rounded-lg text-xs font-bold shadow-2xs hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                :class="themeClasses.buttonPrimary"
              >
                {{ isServiceStore ? 'Agendar' : 'Adicionar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. Abas Fixas de Navegação por Categoria -->
    <div v-if="!isSearching && (tenant.categories || []).length > 0" class="mt-8">
      <CategoryTabs :categories="tenant.categories" :theme="tenant.theme" />
    </div>

    <!-- 6. Catálogo Principal / Grid de Produtos -->
    <main class="max-w-4xl mx-auto px-4 mt-6">
      <!-- Estado de Busca Vazia -->
      <div
        v-if="isSearching && !hasResults"
        class="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-md mx-auto my-8"
      >
        <div class="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-2xl mx-auto mb-4">
          🔍
        </div>
        <h3 class="text-base font-bold text-slate-900 mb-1">Nenhum item encontrado</h3>
        <p class="text-xs text-slate-500 mb-6">
          Não encontramos nenhum item com o termo "<span class="font-semibold text-slate-700">{{ searchQuery }}</span>".
        </p>
        <button
          @click="clearSearch"
          class="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-sm"
        >
          Limpar busca
        </button>
      </div>

      <!-- Listagem Agrupada por Categoria -->
      <div v-else class="space-y-10">
        <section
          v-for="category in filteredCategories"
          :key="category.id"
          :id="category.id"
          class="scroll-mt-20"
        >
          <h2 class="text-lg font-extrabold text-slate-900 mb-4 pb-2 border-b border-slate-200 flex items-center gap-2">
            <span class="w-2 h-5 rounded-full" :class="themeClasses.categoryIndicator"></span>
            <span>{{ category.name }}</span>
            <span class="text-xs font-normal text-slate-400">({{ (category.products || []).length }})</span>
          </h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="product in (category.products || [])"
              :key="product.id"
              @click="handleProductClick(product)"
              class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex gap-4 cursor-pointer group active:scale-[0.99] justify-between"
            >
              <div class="flex-1 flex flex-col justify-between">
                <div>
                  <h3 class="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
                    {{ product.name }}
                  </h3>
                  <p v-if="product.description" class="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {{ product.description }}
                  </p>
                </div>

                <div class="mt-3 flex items-center gap-2">
                  <span v-if="product.originalPrice" class="text-xs text-slate-400 line-through font-mono">
                    {{ formatCurrency(product.originalPrice) }}
                  </span>
                  <span class="text-sm font-extrabold text-slate-900 font-mono" :class="themeClasses.primaryText">
                    {{ formatCurrency(product.price) }}
                  </span>
                  <span v-if="product.durationMinutes" class="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    ⏱️ {{ product.durationMinutes }}min
                  </span>
                </div>
              </div>

              <!-- Thumbnail com Fallback Resiliente -->
              <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative">
                <img
                  v-if="product.image"
                  :src="product.image"
                  :alt="product.name"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  @error="handleImageError($event, tenant?.theme)"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-slate-400 text-2xl font-bold bg-slate-100">
                  {{ product.name.charAt(0) }}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- 7. Barra Fixa Flutuante Inferior (Bottom Bar / Cart CTA) -->
    <footer
      v-if="totalItemsCount > 0 && !isBookingOpen"
      class="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40 animate-fade-in-up"
    >
      <button
        @click="isCartDrawerOpen = true"
        class="w-full bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-700/50 cursor-pointer active:scale-[0.98] transition-all"
      >
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-full bg-amber-500 text-slate-900 text-xs font-black flex items-center justify-center">
            {{ totalItemsCount }}
          </span>
          <span class="text-sm font-bold">Ver Sacola</span>
        </div>
        <span class="text-sm font-extrabold font-mono text-amber-400">
          {{ formatCurrency(cartSubtotal) }}
        </span>
      </button>
    </footer>

    <!-- 8. Modais do Sistema -->
    <ProductCustomizerModal
      v-if="selectedProduct"
      :is-open="!!selectedProduct"
      :product="selectedProduct"
      :theme="tenant?.theme"
      @close="closeProductModal"
      @add-to-cart="handleAddProductToCart"
    />

    <CartDrawerModal
      v-if="tenant"
      :is-open="isCartDrawerOpen"
      :tenant="tenant"
      :items="cartItems"
      @close="isCartDrawerOpen = false"
      @remove-item="removeCartItem"
      @clear-cart="clearCart"
    />

    <BookingModal
      v-if="isServiceStore && tenant"
      :is-open="isBookingOpen"
      :tenant="tenant"
      :initial-service="selectedBookingService"
      @close="isBookingOpen = false"
    />

    <StoreReviewsModal
      v-if="tenant.reviews"
      :is-open="isReviewsOpen"
      :reviews="tenant.reviews"
      @close="isReviewsOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTenant } from '~/composables/useTenant'
import { useTenantTheme } from '~/composables/useTenantTheme'
import { useOpeningHours } from '~/composables/useOpeningHours'
import { useProductSearch } from '~/composables/useProductSearch'
import { useCart } from '~/composables/useCart'
import { formatCurrency } from '~/utils/formatters'
import { handleImageError } from '~/utils/images'
import ProductSearchInput from '~/components/ProductSearchInput.vue'
import BookingModal from '~/components/BookingModal.vue'
import {
  Phone,
  MapPin,
  Truck,
  Clock,
  Star,
  ShoppingCart,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Share2,
  Calendar,
  Search
} from 'lucide-vue-next'
import type { Product, CartItem, BookingService, Tenant } from '~/types'

// 1. Resolução do Tenant Atual (Retorna referências reativas síncronas)
const { tenant, slug } = useTenant()

// 2. Tema Dinâmico
const { themeClasses } = useTenantTheme(tenant)

// 3. Horário de Funcionamento (Aberto / Fechado com Badge Dinâmico)
const { isOpen, statusText, ariaLabel: openingAriaLabel } = useOpeningHours(tenant)

// 4. Compartilhamento e Toast
const isCopied = ref(false)
function shareStore() {
  if (typeof navigator !== 'undefined' && navigator.share) {
    navigator.share({
      title: tenant.value?.name,
      text: tenant.value?.description,
      url: window.location.href
    }).catch(() => {})
  } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2500)
  }
}

// 5. Busca de Produtos em Tempo Real (useProductSearch)
const {
  searchQuery,
  isSearching,
  filteredCategories,
  totalResultsCount,
  hasResults,
  clearSearch
} = useProductSearch(computed(() => tenant?.value?.categories || []))

// 6. Carrinho Persistente Multi-Tenant via LocalStorage (useCart)
const {
  items: cartItems,
  addItem: addToCart,
  removeItem: removeCartItem,
  clearCart,
  totalItemsCount,
  cartSubtotal
} = useCart(tenant)

// 7. SEO & OpenGraph Dinâmico com Guardas Defensivas de SSR
useSeoMeta({
  title: () => tenant?.value ? `${tenant.value.name} — Vitrine & Pedidos Online` : 'Alaska Local',
  description: () => tenant?.value?.description || 'Faça seu pedido ou agende seu horário online de forma rápida pelo WhatsApp.',
  ogTitle: () => tenant?.value?.name || 'Alaska Local',
  ogDescription: () => tenant?.value?.description || 'Atendimento digital via WhatsApp.',
  ogImage: () => tenant?.value?.banner || tenant?.value?.logo || '/og-image.png',
  twitterCard: 'summary_large_image'
})

// 8. Estados de Modais
const isReviewsOpen = ref(false)
const isInfoOpen = ref(false)
const isCartDrawerOpen = ref(false)
const selectedProduct = ref<Product | null>(null)

// Estados do Módulo de Agendamento (Alaska Hub & Pro)
const isBookingOpen = ref(false)
const selectedBookingService = ref<BookingService | null>(null)

const isServiceStore = computed(() => {
  if (!tenant?.value) return false
  const cat = (tenant.value as any).businessCategory || (tenant.value as any).category || (tenant.value as any).template
  return cat === 'hub' || cat === 'pro' || tenant.value.slug === 'barbearia-style' || tenant.value.slug === 'clinica-sorriso'
})

function handleProductClick(product: Product) {
  if (isServiceStore.value) {
    selectedBookingService.value = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      durationMinutes: product.durationMinutes || 35,
      professionalIds: [],
    }
    isBookingOpen.value = true
  } else {
    selectedProduct.value = product
  }
}

function openBookingModal() {
  selectedBookingService.value = null
  isBookingOpen.value = true
}

function closeProductModal() {
  selectedProduct.value = null
}

function handleAddProductToCart(item: CartItem) {
  if (typeof addToCart === 'function') {
    addToCart(item)
  }
  closeProductModal()
}

// 9. Destaques Dinâmicos com iterador seguro
const featuredProducts = computed(() => {
  if (!tenant?.value?.categories || !Array.isArray(tenant.value.categories)) return []
  const all: Product[] = []
  for (const cat of tenant.value.categories) {
    if (cat && Array.isArray(cat.products)) {
      all.push(...cat.products)
    }
  }
  return all.slice(0, 6)
})

// 10. Controle de Rolagem Horizontal do Carrossel
const carouselRef = ref<HTMLElement | null>(null)

function scrollCarousel(direction: 'left' | 'right') {
  if (!carouselRef.value) return
  const offset = direction === 'left' ? -280 : 280
  carouselRef.value.scrollBy({ left: offset, behavior: 'smooth' })
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

.no-scrollbar {
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
}
</style>
